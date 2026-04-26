import { Module } from '@nestjs/common';
import { ResearchService } from './research.service';
import { SubtopicGenerationService } from './services/subtopic-generation.service';
import { WebSearchService } from './services/web-search.service';
import { SourceAnalysisService } from './services/source-analysis.service';
import { VerificationService } from './services/verification.service';
import { SynthesisService } from './services/synthesis.service';
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
