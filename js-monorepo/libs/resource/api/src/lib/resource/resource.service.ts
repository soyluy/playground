import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { QueryFilter, Model, SortOrder, Types, UpdateQuery } from 'mongoose';

import { ResourceDocument } from '../schemas/resource.schema';
import { CreateResourceInput } from './dto/create-resource.input';
import { GetResourcesArgs } from './dto/get-resources.args';
import { UpdateResourceInput } from './dto/update-resource.input';
import { ResourceStatus } from './enums/resource-status.enum';

export type GetResourcesResult = {
  data: ResourceDocument[];
  total: number;
  limit: number;
  offset: number;
};

@Injectable()
export class ResourceService {
  constructor(
    @InjectModel('Resource')
    private readonly _resourceModel: Model<ResourceDocument>,
  ) {}

  async getResource(id: string): Promise<ResourceDocument | null> {
    const idFilter = this.buildIdFilter(id);
    return this._resourceModel.findOne(idFilter).exec();
  }

  async getResources(args: GetResourcesArgs): Promise<GetResourcesResult> {
    const filter = this.buildResourcesFilter(args);
    const sort = this.buildResourcesSort();

    const [data, total] = await Promise.all([
      this._resourceModel
        .find(filter)
        .sort(sort)
        .skip(args.offset)
        .limit(args.limit)
        .exec(),
      this._resourceModel.countDocuments(filter).exec(),
    ]);

    return {
      data,
      total,
      limit: args.limit,
      offset: args.offset,
    };
  }

  async createResource(input: CreateResourceInput): Promise<ResourceDocument> {
    const payload = this.buildCreatePayload(input);
    const createdResource = new this._resourceModel(payload);
    return createdResource.save();
  }

  async updateResource(
    id: string,
    input: UpdateResourceInput,
  ): Promise<ResourceDocument> {
    const idFilter = this.buildIdFilter(id);
    const updatePayload = this.buildUpdatePayload(input);

    if (Object.keys(updatePayload).length === 0) {
      throw new BadRequestException(
        'At least one field must be provided for update',
      );
    }

    const updatedResource = await this._resourceModel
      .findOneAndUpdate(
        idFilter,
        { $set: updatePayload },
        { new: true, runValidators: true },
      )
      .exec();

    if (!updatedResource) {
      throw new NotFoundException('Resource not found');
    }

    return updatedResource;
  }

  async deleteResource(id: string): Promise<boolean> {
    const idFilter = this.buildIdFilter(id);
    const deletionResult = await this._resourceModel.deleteOne(idFilter).exec();
    return deletionResult.deletedCount === 1;
  }

  async addTags(id: string, tags: string[]): Promise<ResourceDocument> {
    const idFilter = this.buildIdFilter(id);
    const normalizedTags = this.normalizeTags(tags);

    if (normalizedTags.length === 0) {
      throw new BadRequestException(
        'At least one non-empty tag must be provided',
      );
    }

    const update = this.buildAddTagsUpdate(normalizedTags);
    const updatedResource = await this._resourceModel
      .findOneAndUpdate(idFilter, update, { new: true, runValidators: true })
      .exec();

    if (!updatedResource) {
      throw new NotFoundException('Resource not found');
    }

    return updatedResource;
  }

  async removeTags(id: string, tags: string[]): Promise<ResourceDocument> {
    const idFilter = this.buildIdFilter(id);
    const normalizedTags = this.normalizeTags(tags);

    if (normalizedTags.length === 0) {
      throw new BadRequestException(
        'At least one non-empty tag must be provided',
      );
    }

    const update = this.buildRemoveTagsUpdate(normalizedTags);
    const updatedResource = await this._resourceModel
      .findOneAndUpdate(idFilter, update, { new: true, runValidators: true })
      .exec();

    if (!updatedResource) {
      throw new NotFoundException('Resource not found');
    }

    return updatedResource;
  }

  private buildIdFilter(id: string): QueryFilter<ResourceDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid resource id');
    }

    return { _id: new Types.ObjectId(id) };
  }

  private buildResourcesFilter(
    args: GetResourcesArgs,
  ): QueryFilter<ResourceDocument> {
    const filter: QueryFilter<ResourceDocument> = {};

    if (args.type) {
      filter.type = args.type;
    }

    if (args.status) {
      filter.status = args.status;
    }

    if (args.category) {
      filter.category = args.category;
    }

    if (args.tags?.length) {
      filter.tags = { $in: this.normalizeTags(args.tags) };
    }

    return filter;
  }

  private buildResourcesSort(): Record<string, SortOrder> {
    return {
      createdAt: -1,
    };
  }

  private buildCreatePayload(
    input: CreateResourceInput,
  ): Partial<ResourceDocument> {
    return {
      title: input.title,
      url: input.url,
      description: input.description,
      tags: this.normalizeTags(input.tags),
      category: input.category,
      type: input.type,
      status: input.status ?? ResourceStatus.WANT_TO_CONSUME,
      metadata: input.metadata,
    };
  }

  private buildUpdatePayload(
    input: UpdateResourceInput,
  ): Partial<ResourceDocument> {
    const payload: Partial<ResourceDocument> = {};

    if (input.title !== undefined) {
      payload.title = input.title;
    }

    if (input.url !== undefined) {
      payload.url = input.url;
    }

    if (input.description !== undefined) {
      payload.description = input.description;
    }

    if (input.tags !== undefined) {
      payload.tags = this.normalizeTags(input.tags);
    }

    if (input.category !== undefined) {
      payload.category = input.category;
    }

    if (input.type !== undefined) {
      payload.type = input.type;
    }

    if (input.status !== undefined) {
      payload.status = input.status;
    }

    if (input.metadata !== undefined) {
      payload.metadata = input.metadata;
    }

    return payload;
  }

  private buildAddTagsUpdate(tags: string[]): UpdateQuery<ResourceDocument> {
    return {
      $addToSet: { tags: { $each: tags } },
    };
  }

  private buildRemoveTagsUpdate(tags: string[]): UpdateQuery<ResourceDocument> {
    return {
      $pull: { tags: { $in: tags } },
    };
  }

  private normalizeTags(tags: string[]): string[] {
    return [
      ...new Set(tags.map((tag) => tag.trim()).filter((tag) => tag.length > 0)),
    ];
  }
}
