import { Controller, Param, Sse } from '@nestjs/common';
import { ResearchStreamService } from './services/research-stream.service';
import { map } from 'rxjs';
import { PublicRoute } from '@hub/auth-api';

@Controller('research')
export class ResearchController {
  constructor(private readonly _researchService: ResearchStreamService) {}

  @PublicRoute()
  @Sse(':id')
  researchStream(@Param('id') id: string) {
    return this._researchService.getOrThrow(id).pipe(
      map((event) => ({
        data: event,
      })),
    );
  }
}
