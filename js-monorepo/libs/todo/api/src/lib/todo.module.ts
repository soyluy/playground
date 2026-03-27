import { Module } from '@nestjs/common';
import { TodoController } from './todo.controller';
import { TodoService } from './todo.service';
import { PrismaModule } from '@hub/prisma';

@Module({
  controllers: [TodoController],
  providers: [TodoService],
  imports: [PrismaModule],
})
export class TodoModule {}
