import { PrismaService } from '@hub/prisma';
import {
  CreateTodoTagDto,
  CreateTodoTagResponse,
  DeleteTodoTagResponse,
  TodoTag,
  UpdateTodoTagDto,
  UpdateTodoTagResponse,
} from '@hub/todo-data';
import { User } from '@hub/user-api';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class TagService {
  @Inject(PrismaService)
  private readonly _prismaService!: PrismaService;

  public async getTags(user: User): Promise<TodoTag[]> {
    const tags = await this._prismaService.tag.findMany({
      where: {
        ownerId: user.id,
      },
    });
    return tags;
  }

  public createTag(
    user: User,
    createTagDto: CreateTodoTagDto,
  ): Promise<CreateTodoTagResponse> {
    return this._prismaService.tag.create({
      data: {
        ...createTagDto,
        ownerId: user.id,
      },
    });
  }

  public deleteTag(user: User, id: number): Promise<DeleteTodoTagResponse> {
    return this._prismaService.tag.delete({
      where: {
        id,
        ownerId: user.id,
      },
    });
  }

  public updateTag(
    user: User,
    id: number,
    updateTagDto: UpdateTodoTagDto,
  ): Promise<UpdateTodoTagResponse> {
    return this._prismaService.tag.update({
      where: { id, ownerId: user.id },
      data: {
        name: updateTagDto.name ?? undefined,
        colorHex: updateTagDto.colorHex ?? undefined,
      },
    });
  }
}
