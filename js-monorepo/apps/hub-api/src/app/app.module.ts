import { Module } from '@nestjs/common';
import { TodoModule } from '@hub/todo-api';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@hub/auth';
import { ApiInfraModule } from '@hub/api-infra';
import { GraphQLModule } from '@nestjs/graphql';
import { ResourceModule } from '@hub/resource-api';
import { MongooseModule } from '@nestjs/mongoose';
import { getMongoDbName, getMongoUrl } from '../util/get-mongo-env-vars.util';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';

@Module({
  imports: [
    TodoModule,
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    ApiInfraModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
    }),
    ResourceModule,
    MongooseModule.forRoot(getMongoUrl(), {
      dbName: getMongoDbName(),
    }),
  ],
})
export class AppModule {}
