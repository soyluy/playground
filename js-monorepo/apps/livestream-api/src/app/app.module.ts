import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FfmpegService } from './services/ffmpeg.service';
import { StreamController } from './controllers/stream.controller';
import { LoggingInterceptor } from './interceptors/logging.interceptor';

@Module({
  imports: [],
  controllers: [AppController, StreamController],
  providers: [
    AppService,
    FfmpegService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
