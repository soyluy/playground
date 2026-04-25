import { Module } from '@nestjs/common';
import { ResearchService } from './research.service';
import { SubtopicGenerationService } from './services/subtopic-generation.service';
import { WebSearchService } from './services/web-search.service';
import { SourceAnalysisService } from './services/source-analysis.service';
import { VerificationService } from './services/verification.service';
import { SynthesisService } from './services/synthesis.service';

@Module({
  controllers: [],
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
export class ResearchModule {
  constructor(private readonly researchService: ResearchService) {
    this.researchService
      .research({
        id: '1',
        topic: 'Understand how redis works',
        tags: ['databases', 'caching'],
        notes: '',
        instructions: '',
        status: 'pending',
        dueDate: new Date(),
      })
      .then((result) => {
        console.log(result);
      })
      .catch((error) => {
        console.error(error);
      });
  }
}
