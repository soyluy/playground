import { Module } from '@nestjs/common';
import { TodoModule } from '@hub/todo-api';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@hub/auth';
import { ApiInfraModule } from '@hub/api-infra';
import { GraphQLModule } from '@nestjs/graphql';
import { ResourceModule } from '@hub/resource-api';

@Module({
  imports: [
    TodoModule,
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    ApiInfraModule,
    GraphQLModule.forRoot({
      autoSchemaFile: true,
    }),
    ResourceModule,
  ],
})
export class AppModule {}
