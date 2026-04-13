import { Module } from '@nestjs/common';
import { TodoModule } from '@hub/todo-api';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@hub/auth';
import { ApiInfraModule } from '@hub/api-infra';

@Module({
  imports: [
    TodoModule,
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    ApiInfraModule,
  ],
})
export class AppModule {}
