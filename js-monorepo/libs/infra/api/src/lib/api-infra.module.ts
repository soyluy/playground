import { Module } from '@nestjs/common';
import { loggerProvider } from './util/logger-provider';

@Module({
  providers: [...loggerProvider()],
})
export class ApiInfraModule {}
