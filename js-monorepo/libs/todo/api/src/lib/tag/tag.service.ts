import { PrismaService } from '@hub/prisma';
import {
  CreateTodoTagDto,
  CreateTodoTagResponse,
  DeleteTodoTagResponse,
  TodoTag,
  UpdateTodoTagDto,
  UpdateTodoTagResponse,
} from '@hub/todo-data';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class TagService {
  @Inject(PrismaService)
  private readonly _prismaService!: PrismaService;

  public getTags(): Promise<TodoTag[]> {
    return this._prismaService.tag.findMany();
  }

  public createTag(
    createTagDto: CreateTodoTagDto,
  ): Promise<CreateTodoTagResponse> {
    return this._prismaService.tag.create({
      data: createTagDto,
    });
  }

  public deleteTag(id: number): Promise<DeleteTodoTagResponse> {
    return this._prismaService.tag.delete({
      where: { id },
    });
  }

  public updateTag(
    id: number,
    updateTagDto: UpdateTodoTagDto,
  ): Promise<UpdateTodoTagResponse> {
    return this._prismaService.tag.update({
      where: { id },
      data: updateTagDto,
    });
  }
}
