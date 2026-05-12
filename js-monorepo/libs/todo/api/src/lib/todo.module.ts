import { Module } from '@nestjs/common';
import { TodoController } from './todo/todo.controller';
import { TodoService } from './todo/todo.service';
import { PrismaModule } from '@hub/prisma';
import { TagController } from './tag/tag.controller';
import { TagService } from './tag/tag.service';
import { ResearchModule } from '@hub/research-api';
@Module({
  controllers: [TodoController, TagController],
  providers: [TodoService, TagService],
  imports: [PrismaModule, ResearchModule],
})
export class TodoModule {}
