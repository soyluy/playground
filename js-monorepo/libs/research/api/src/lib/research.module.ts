import { Module } from '@nestjs/common';
import { ResearchService } from './research.service';
import { SubtopicGenerationService } from './services/pipeline/subtopic-generation.service';
import { WebSearchService } from './services/pipeline/web-search.service';
import { SourceAnalysisService } from './services/pipeline/source-analysis.service';
import { VerificationService } from './services/pipeline/verification.service';
import { SynthesisService } from './services/pipeline/synthesis.service';
import { LLMModule } from '@hub/llm-api';

@Module({
  imports: [LLMModule],
  providers: [
    ResearchService,
    SubtopicGenerationService,
    WebSearchService,
    SourceAnalysisService,
    VerificationService,
    SynthesisService,
  ],
  exports: [ResearchService],
})
export class ResearchModule {}
