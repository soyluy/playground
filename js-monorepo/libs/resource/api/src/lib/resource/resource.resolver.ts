import { Args, ArgsType, Field, Int, Mutation, ObjectType, Query, Resolver } from '@nestjs/graphql';

import { CreateResourceInput } from './dto/create-resource.input';
import { GetResourcesArgs } from './dto/get-resources.args';
import { UpdateResourceInput } from './dto/update-resource.input';
import { ResourceService } from './resource.service';
import { Resource } from '../schemas/resource.schema';

@ObjectType()
class PaginatedResources {
  @Field(() => [Resource])
  data!: Resource[];

  @Field(() => Int)
  total!: number;

  @Field(() => Int)
  limit!: number;

  @Field(() => Int)
  offset!: number;
}

@ArgsType()
class GetResourceArgs {
  @Field()
  id!: string;
}

@ArgsType()
class UpdateResourceArgs {
  @Field()
  id!: string;

  @Field(() => UpdateResourceInput)
  input!: UpdateResourceInput;
}

@ArgsType()
class DeleteResourceArgs {
  @Field()
  id!: string;
}

@ArgsType()
class UpdateResourceTagsArgs {
  @Field()
  id!: string;

  @Field(() => [String])
  tags!: string[];
}

@ArgsType()
class CreateResourceArgs {
  @Field(() => CreateResourceInput)
  input!: CreateResourceInput;
}

@Resolver(() => Resource)
export class ResourceResolver {
  constructor(private readonly _resourceService: ResourceService) {}

  @Query(() => Resource, { name: 'resource', nullable: true })
  async getResource(@Args() args: GetResourceArgs): Promise<Resource | null> {
    return this._resourceService.getResource(args.id);
  }

  @Query(() => PaginatedResources, { name: 'resources' })
  async getResources(@Args() args: GetResourcesArgs): Promise<PaginatedResources> {
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
