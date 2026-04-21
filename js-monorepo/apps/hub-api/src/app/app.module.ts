import { Module } from '@nestjs/common';
import { TodoModule } from '@hub/todo-api';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@hub/auth-api';
import { ApiInfraModule } from '@hub/api-infra';
import { GraphQLModule } from '@nestjs/graphql';
import { ResourceModule } from '@hub/resource-api';
import { MongooseModule } from '@nestjs/mongoose';
import { getMongoDbName, getMongoUrl } from '../util/get-mongo-env-vars.util';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ExpenseModule } from '@hub/expense-api';

@Module({
  imports: [
    TodoModule,
    ExpenseModule,
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    ApiInfraModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      path: '/api/graphql',
      context: ({ req }: { req: Request }) => ({ req }),
    }),
    ResourceModule,
    MongooseModule.forRoot(getMongoUrl(), {
      dbName: getMongoDbName(),
    }),
  ],
})
export class AppModule {}
