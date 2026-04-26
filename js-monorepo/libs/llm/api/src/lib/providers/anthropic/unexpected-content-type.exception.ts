import { Message } from '@anthropic-ai/sdk/resources';
import { InternalServerErrorException } from '@nestjs/common';

export class UnexpectedContentTypeException extends InternalServerErrorException {
  constructor(content: Message) {
    console.error(`Unexpected content type: ${content.content[0].type}`);
    console.error(content);
    super();
  }
}
