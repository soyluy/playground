import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { TagService } from './tag.service';
import {
  CreateTodoTagResponse,
  DeleteTodoTagResponse,
  TodoTag,
  UpdateTodoTagResponse,
} from '@hub/todo-data';
import { CreateTodoTagDto } from './dto/create-todo-tag.dto';
import { UpdateTodoTagDto } from './dto/update-todo-tag.dto';
import { User } from '@hub/user-api';
import { CurrentUser } from '@hub/auth';

@Controller('tag')
export class TagController {
  @Inject(TagService)
  private readonly _tagService!: TagService;

  @Get()
  getTags(@CurrentUser() user: User): Promise<TodoTag[]> {
    return this._tagService.getTags(user);
  }

  @Post()
  createTag(
    @Body() createTagDto: CreateTodoTagDto,
    @CurrentUser() user: User,
  ): Promise<CreateTodoTagResponse> {
    return this._tagService.createTag(user, createTagDto);
  }

  @Patch(':id')
  updateTag(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTagDto: UpdateTodoTagDto,
    @CurrentUser() user: User,
  ): Promise<UpdateTodoTagResponse> {
    return this._tagService.updateTag(user, id, updateTagDto);
  }

  @Delete(':id')
  deleteTag(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ): Promise<DeleteTodoTagResponse> {
    return this._tagService.deleteTag(user, id);
  }
}
