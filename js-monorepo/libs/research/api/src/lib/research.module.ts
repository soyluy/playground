import { Module } from '@nestjs/common';
import { ResearchService } from './research.service';
import { SubtopicGenerationService } from './services/subtopic-generation.service';
import { WebSearchService } from './services/web-search.service';

@Module({
  controllers: [],
  providers: [ResearchService, SubtopicGenerationService, WebSearchService],
  exports: [ResearchService],
})
export class ResearchModule {}
