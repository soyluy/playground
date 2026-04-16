import { registerEnumType } from '@nestjs/graphql';

export enum ResourceType {
  ARTICLE = 'ARTICLE',
  BOOK = 'BOOK',
  PAPER = 'PAPER',
  VIDEO = 'VIDEO',
  LINK = 'LINK',
  NOTE = 'NOTE',
}

registerEnumType(ResourceType, {
  name: 'ResourceType',
});
