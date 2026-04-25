import { Module } from '@nestjs/common';
import { LoggerModule } from './logging/logger.module';

@Module({
  imports: [LoggerModule],
  exports: [LoggerModule],
})
export class ApiInfraModule {}
