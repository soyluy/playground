import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import { Readable } from 'stream';
import ffmpegPath from 'ffmpeg-static';

export interface FfmpegProcess {
  stream: Readable;
  kill: () => void;
}

@Injectable()
export class FfmpegService implements OnModuleDestroy {
  private readonly logger = new Logger(FfmpegService.name);
  private readonly activeProcesses = new Set<ChildProcessWithoutNullStreams>();

  /**
   * Spawn ffmpeg with raw argv array.
   * The caller is responsible for including output flags (e.g. pipe:1).
   *
   * Example:
   *   this.ffmpeg.run(['-i', 'rtsp://...', '-f', 'mpegts', 'pipe:1'])
   */
  run(args: string[]): FfmpegProcess {
    this.logger.debug(`Spawning ffmpeg with args: ${args.join(' ')}`);

    const process = spawn(ffmpegPath as string, args, {
      stdio: ['ignore', 'pipe', 'pipe'],
    }) as unknown as ChildProcessWithoutNullStreams;

    this.activeProcesses.add(process);

    process.stderr.on('data', (chunk: Buffer) => {
      // ffmpeg writes its logs to stderr, not stdout — this is normal
      this.logger.verbose(`ffmpeg: ${chunk.toString()}`);
    });

    process.on('error', (err) => {
      this.logger.error(`ffmpeg process error: ${err.message}`);
    });

    process.on('close', (code) => {
      this.logger.debug(`ffmpeg exited with code ${code}`);
      this.activeProcesses.delete(process);
    });

    return {
      stream: process.stdout,
      kill: () => {
        if (!process.killed) {
          process.kill('SIGTERM');
        }
      },
    };
  }

  /**
   * Stream a source URL (RTSP, HTTP, local file) to MPEG-TS via stdout.
   * Suitable for piping directly to an HTTP response.
   */
  streamToMpegts(sourceUrl: string): FfmpegProcess {
    return this.run([
      '-i', sourceUrl,
      '-c:v', 'copy',   // no re-encoding — just remux
      '-c:a', 'copy',
      '-f', 'mpegts',
      'pipe:1',
    ]);
  }

  /**
   * Same as streamToMpegts but burns a visible text watermark onto the video.
   * Re-encoding is required for watermarking, so this is heavier than streamToMpegts.
   */
  streamWithWatermark(sourceUrl: string, watermarkText: string): FfmpegProcess {
    const escapedText = watermarkText.replace(/'/g, "\\'").replace(/:/g, '\\:');

    return this.run([
      '-i', sourceUrl,
      '-vf', `drawtext=text='${escapedText}':fontcolor=white:fontsize=24:x=10:y=10`,
      '-c:v', 'libx264',
      '-preset', 'ultrafast', // minimize encoding latency
      '-tune', 'zerolatency',
      '-c:a', 'copy',
      '-f', 'mpegts',
      'pipe:1',
    ]);
  }

  /**
   * Kill all active ffmpeg processes on module teardown.
   * Prevents zombie processes on app shutdown.
   */
  onModuleDestroy() {
    this.logger.log(`Killing ${this.activeProcesses.size} active ffmpeg process(es)`);
    for (const proc of this.activeProcesses) {
      if (!proc.killed) {
        proc.kill('SIGTERM');
      }
    }
    this.activeProcesses.clear();
  }
}