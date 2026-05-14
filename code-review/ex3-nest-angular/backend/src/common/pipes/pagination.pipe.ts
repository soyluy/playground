import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

type PaginationInput = {
  limit?: string | number;
  offset?: string | number;
};

type PaginationOutput = {
  limit: number;
  offset: number;
};

@Injectable()
export class PaginationPipe implements PipeTransform<PaginationInput, PaginationOutput> {
  transform(value: PaginationInput): PaginationOutput {
    const rawLimit = Number(value?.limit ?? 20);
    const rawOffset = Number(value?.offset ?? 0);

    if (!Number.isFinite(rawLimit) || !Number.isInteger(rawLimit)) {
      throw new BadRequestException('limit must be an integer');
    }

    if (!Number.isFinite(rawOffset) || !Number.isInteger(rawOffset)) {
      throw new BadRequestException('offset must be an integer');
    }

    if (rawLimit < 1 || rawLimit > 100) {
      throw new BadRequestException('limit must be between 1 and 100');
    }

    if (rawOffset < 0) {
      throw new BadRequestException('offset must be greater than or equal to 0');
    }

    return {
      limit: rawLimit,
      offset: rawOffset,
    };
  }
}
