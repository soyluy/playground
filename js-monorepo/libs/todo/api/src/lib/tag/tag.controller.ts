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

@Controller('tag')
export class TagController {
  @Inject(TagService)
  private readonly _tagService!: TagService;

  @Get()
  getTags(): Promise<TodoTag[]> {
    return this._tagService.getTags();
  }

  @Post()
  createTag(
    @Body() createTagDto: CreateTodoTagDto,
  ): Promise<CreateTodoTagResponse> {
    return this._tagService.createTag(createTagDto);
  }

  @Patch(':id')
  updateTag(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTagDto: UpdateTodoTagDto,
  ): Promise<UpdateTodoTagResponse> {
    return this._tagService.updateTag(id, updateTagDto);
  }

  @Delete(':id')
  deleteTag(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<DeleteTodoTagResponse> {
    return this._tagService.deleteTag(id);
  }
}
