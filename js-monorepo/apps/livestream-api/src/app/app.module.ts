import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FfmpegService } from './services/ffmpeg.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, FfmpegService],
})
export class AppModule {}
