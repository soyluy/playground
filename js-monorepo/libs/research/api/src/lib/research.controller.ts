import { Controller, Get, NotFoundException, Param, Sse } from '@nestjs/common';
import { ResearchStreamService } from './services/research-stream.service';
import { map } from 'rxjs';
import { PublicRoute } from '@hub/auth-api';
import { InjectModel } from '@nestjs/mongoose';
import { Research, ResearchDocument } from './schemas/research-result.schema';
import { Model } from 'mongoose';

@Controller('research')
export class ResearchController {
  constructor(
    private readonly _streamService: ResearchStreamService,
    @InjectModel(Research.name)
    private readonly _researchModel: Model<ResearchDocument>,
  ) {}

  @PublicRoute()
  @Sse(':id/stream')
  async streamResearch(@Param('id') id: string) {
    return this._streamService.getOrThrow(id).pipe(
      map((event) => ({
        data: event,
      })),
    );
  }

  @PublicRoute()
  @Get(':id')
  async getResearch(@Param('id') id: string) {
    const research = await this._researchModel.findById(id).exec();
    if (!research) {
      throw new NotFoundException(`Research ${id} not found`);
    }
    return { status: research.status, result: research.result };
  }
}
