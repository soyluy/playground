import { InternalServerErrorException } from '@nestjs/common';

export class MalformedResponseException extends InternalServerErrorException {
  constructor(response: string, expected: string) {
    super(`Malformed response: ${response}. Expected: ${expected}`);
  }
}
