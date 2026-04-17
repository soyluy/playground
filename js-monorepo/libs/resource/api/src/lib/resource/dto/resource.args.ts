import { ArgsType, Field } from '@nestjs/graphql';
import { IsString } from 'class-validator';

import { UpdateResourceInput } from './update-resource.input';
import { CreateResourceInput } from './create-resource.input';

@ArgsType()
export class GetResourceArgs {
  @Field()
  @IsString()
  id!: string;
}

@ArgsType()
export class CreateResourceArgs {
  @Field(() => CreateResourceInput)
  input!: CreateResourceInput;
}

@ArgsType()
export class UpdateResourceArgs {
  @Field()
  @IsString()
  id!: string;

  @Field(() => UpdateResourceInput)
  input!: UpdateResourceInput;
}

@ArgsType()
export class DeleteResourceArgs {
  @Field()
  @IsString()
  id!: string;
}

@ArgsType()
export class UpdateResourceTagsArgs {
  @Field()
  @IsString()
  id!: string;

  @Field(() => [String])
  tags!: string[];
}
