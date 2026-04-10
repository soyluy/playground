import { Module } from '@nestjs/common';
import { TodoModule } from '@hub/todo-api';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@hub/auth';

@Module({
  imports: [TodoModule, ConfigModule.forRoot({ isGlobal: true }), AuthModule],
})
export class AppModule {}
