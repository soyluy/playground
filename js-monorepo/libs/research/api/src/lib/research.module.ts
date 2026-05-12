import { Module } from '@nestjs/common';
import { ResearchService } from './research.service';
import { SubtopicGenerationService } from './services/pipeline/subtopic-generation.service';
import { WebSearchService } from './services/pipeline/web-search.service';
import { SourceAnalysisService } from './services/pipeline/source-analysis.service';
import { VerificationService } from './services/pipeline/verification.service';
import { SynthesisService } from './services/pipeline/synthesis.service';
import { LLMModule } from '@hub/llm-api';
import { ResearchStreamService } from './services/research-stream.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Research, ResearchSchema } from './schemas/research-result.schema';
import { ResearchController } from './research.controller';

@Module({
  imports: [
    LLMModule,
    MongooseModule.forFeature([
      {
        name: Research.name,
        schema: ResearchSchema,
      },
    ]),
  ],
  controllers: [ResearchController],
  providers: [
    ResearchService,
    SubtopicGenerationService,
    WebSearchService,
    SourceAnalysisService,
    VerificationService,
    SynthesisService,
    ResearchStreamService,
  ],
  exports: [ResearchService, ResearchStreamService],
})
export class ResearchModule {}
