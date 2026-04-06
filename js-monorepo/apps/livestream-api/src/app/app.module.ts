import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FfmpegService } from './services/ffmpeg.service';
import { StreamController } from './controllers/stream.controller';

@Module({
  imports: [],
  controllers: [AppController, StreamController],
  providers: [AppService, FfmpegService],
})
export class AppModule {}
