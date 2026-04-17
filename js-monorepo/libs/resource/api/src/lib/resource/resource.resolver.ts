import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { PaginatedResources, Resource } from '../schemas/resource.schema';
import {
  CreateResourceArgs,
  DeleteResourceArgs,
  GetResourceArgs,
  UpdateResourceArgs,
  UpdateResourceTagsArgs,
} from './dto/resource.args';
import { GetResourcesArgs } from './dto/get-resources.args';
import { ResourceService } from './resource.service';

@Resolver(() => Resource)
export class ResourceResolver {
  constructor(private readonly _resourceService: ResourceService) {}

  @Query(() => Resource, { name: 'resource', nullable: true })
  async getResource(@Args() args: GetResourceArgs): Promise<Resource | null> {
    return this._resourceService.getResource(args.id);
  }

  @Query(() => PaginatedResources, { name: 'resources' })
  async getResources(
    @Args() args: GetResourcesArgs,
  ): Promise<PaginatedResources> {
    return this._resourceService.getResources(args);
  }

  @Mutation(() => Resource, { name: 'createResource' })
  async createResource(@Args() args: CreateResourceArgs): Promise<Resource> {
    return this._resourceService.createResource(args.input);
  }

  @Mutation(() => Resource, { name: 'updateResource' })
  async updateResource(@Args() args: UpdateResourceArgs): Promise<Resource> {
    return this._resourceService.updateResource(args.id, args.input);
  }

  @Mutation(() => Boolean, { name: 'deleteResource' })
  async deleteResource(@Args() args: DeleteResourceArgs): Promise<boolean> {
    return this._resourceService.deleteResource(args.id);
  }

  @Mutation(() => Resource, { name: 'addTags' })
  async addTags(@Args() args: UpdateResourceTagsArgs): Promise<Resource> {
    return this._resourceService.addTags(args.id, args.tags);
  }

  @Mutation(() => Resource, { name: 'removeTags' })
  async removeTags(@Args() args: UpdateResourceTagsArgs): Promise<Resource> {
    return this._resourceService.removeTags(args.id, args.tags);
  }
}
