import { registerEnumType } from '@nestjs/graphql';

export enum ResourceStatus {
  WANT_TO_CONSUME = 'WANT_TO_CONSUME',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

registerEnumType(ResourceStatus, {
  name: 'ResourceStatus',
});
