import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ResourceResolver } from './resource/resource.resolver';
import { ResourceService } from './resource/resource.service';
import { Resource, ResourceSchema } from './schemas/resource.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Resource.name,
        schema: ResourceSchema,
      },
    ]),
  ],
  providers: [ResourceResolver, ResourceService],
})
export class ResourceModule {}
