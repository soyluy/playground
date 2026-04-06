import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import { Readable } from 'stream';
import { mkdirSync } from 'fs';
import { join } from 'path';
import ffmpegPath from 'ffmpeg-static';

export interface FfmpegProcess {
  stream: Readable;
  kill: () => void;
}

export interface HlsProcess {
  playlistPath: string; // absolute path to the .m3u8 file
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
      '-preset', 'ultrafast',
      '-tune', 'zerolatency',
      '-c:a', 'copy',
      '-f', 'mpegts',
      'pipe:1',
    ]);
  }

  /**
   * Stream a source to HLS format, writing segments + playlist to disk.
   *
   * @param sourceUrl  - input (local file, RTSP, HTTP)
   * @param outputDir  - directory where segments and playlist will be written
   * @param filters    - optional ffmpeg -vf filter strings (e.g. drawtext for watermark)
   *
   * Example without watermark:
   *   this.ffmpeg.streamToHls('video.mp4', '/tmp/streams/cam1')
   *
   * Example with watermark (composed by caller):
   *   const watermark = `drawtext=text='John Doe':fontcolor=white:fontsize=24:x=10:y=10`;
   *   this.ffmpeg.streamToHls('video.mp4', '/tmp/streams/cam1', [watermark])
   */
  streamToHls(sourceUrl: string, outputDir: string, filters?: string[]): HlsProcess {
    mkdirSync(outputDir, { recursive: true });

    const playlistPath = join(outputDir, 'index.m3u8');
    const segmentPattern = join(outputDir, 'segment%03d.ts');

    const hasFilters = filters && filters.length > 0;

    const args: string[] = [
      '-stream_loop', '-1',   // loop input indefinitely (for local files)
      '-re',
      '-i', sourceUrl,
    ];

    if (hasFilters) {
      args.push('-vf', filters.join(','));
      args.push('-c:v', 'libx264');
      args.push('-preset', 'ultrafast');
      args.push('-tune', 'zerolatency');
    } else {
      args.push('-c:v', 'copy');
    }

    args.push(
      '-c:a', 'copy',
      '-f', 'hls',
      '-hls_time', '4',
      '-hls_list_size', '5',
      '-hls_flags', 'delete_segments',
      '-hls_segment_filename', segmentPattern,
      playlistPath,
    );

    const { kill } = this.run(args);

    return { playlistPath, kill };
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