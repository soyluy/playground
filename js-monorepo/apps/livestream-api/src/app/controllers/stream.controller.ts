import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  Res,
  NotFoundException,
  ConflictException,
	Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { createReadStream, existsSync } from 'fs';
import { join } from 'path';
import { FfmpegService, HlsProcess } from '../services/ffmpeg.service';

const STREAMS_DIR = join(process.cwd(), 'tmp', 'streams');

@Controller('stream')
export class StreamController {
  // Tracks active HLS processes keyed by cameraId
  // One ffmpeg process per camera, shared across all viewers
  private readonly activeStreams = new Map<string, HlsProcess>();
	private readonly logger = new Logger(StreamController.name);

  constructor(private readonly ffmpeg: FfmpegService) {}

  /**
   * Start an HLS stream for a given camera.
   * In the real app, sourceUrl would come from a camera registry/database.
   * For the POC, we use a looped local video file.
   */
  @Post(':cameraId/start')
  start(@Param('cameraId') cameraId: string) {
    if (this.activeStreams.has(cameraId)) {
      throw new ConflictException(`Stream for camera ${cameraId} is already running`);
    }

    const outputDir = join(STREAMS_DIR, cameraId);

    // POC: hardcoded source — swap this for a real camera URL later
    const sourceUrl = join(process.cwd(), 'tmp', 'demo.mp4');
		this.logger.log(`Starting stream for camera ${cameraId} with source ${sourceUrl}`);


    // Example watermark — in the real app, this would include the user's identity
		const watermark = `drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf:text=CAM\\ ${cameraId}:fontcolor=white:fontsize=48:x=10:y=10`;
		
    const hlsProcess = this.ffmpeg.streamToHls(sourceUrl, outputDir, [watermark]);

    this.activeStreams.set(cameraId, hlsProcess);

    return { message: `Stream started for camera ${cameraId}` };
  }

  /**
   * Stop an active HLS stream.
   */
  @Delete(':cameraId/stop')
  stop(@Param('cameraId') cameraId: string) {
    const hlsProcess = this.activeStreams.get(cameraId);

    if (!hlsProcess) {
      throw new NotFoundException(`No active stream for camera ${cameraId}`);
    }

    hlsProcess.kill();
    this.activeStreams.delete(cameraId);

    return { message: `Stream stopped for camera ${cameraId}` };
  }

  /**
   * Serve the HLS playlist (.m3u8).
   * The client (hls.js) polls this endpoint to discover new segments.
   */
  @Get(':cameraId/index.m3u8')
  playlist(@Param('cameraId') cameraId: string, @Res() res: Response) {
    const playlistPath = join(STREAMS_DIR, cameraId, 'index.m3u8');

    if (!existsSync(playlistPath)) {
      throw new NotFoundException(`Stream for camera ${cameraId} is not ready yet`);
    }

    res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
    res.setHeader('Cache-Control', 'no-cache'); // playlist must never be cached
    createReadStream(playlistPath).pipe(res);
  }

  /**
   * Serve individual HLS segments (.ts files).
   */
  @Get(':cameraId/:segment')
  segment(
    @Param('cameraId') cameraId: string,
    @Param('segment') segment: string,
    @Res() res: Response,
  ) {
    // Basic path traversal guard — segment should only be a filename
    if (segment.includes('/') || segment.includes('..')) {
      throw new NotFoundException();
    }

    const segmentPath = join(STREAMS_DIR, cameraId, segment);

    if (!existsSync(segmentPath)) {
      throw new NotFoundException(`Segment ${segment} not found`);
    }

    res.setHeader('Content-Type', 'video/mp2t');
    createReadStream(segmentPath).pipe(res);
  }
}