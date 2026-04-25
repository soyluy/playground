import { Injectable } from '@nestjs/common';
import { ResearchableItem } from '@hub/research-data';
import { SubtopicGenerationService } from './services/subtopic-generation.service';
import { WebSearchService } from './services/web-search.service';
import { SourceAnalysisService } from './services/source-analysis.service';
import { VerificationService } from './services/verification.service';
import { SynthesisService } from './services/synthesis.service';
import { ResearchReport, Source, SourceAnalysisResult } from './types';

@Injectable()
export class ResearchService {
  constructor(
    private readonly _subtopicGeneration: SubtopicGenerationService,
    private readonly _webSearch: WebSearchService,
    private readonly _sourceAnalysis: SourceAnalysisService,
    private readonly _verification: VerificationService,
    private readonly _synthesis: SynthesisService,
  ) {}

  async research(item: ResearchableItem): Promise<ResearchReport> {
    const { subtopics } =
      await this._subtopicGeneration.generateSubtopics(item);

    const searchResults = await Promise.all(
      subtopics.map((subtopic) => this._webSearch.searchWeb(subtopic)),
    );

    const subtopicFindings = await Promise.all(
      searchResults.map(async ({ subtopic, results }) => {
        const sources: Source[] = results.map((result) => ({
          content: result.content,
          topic: item.topic,
          subtopic,
          tags: item.tags ?? [],
          notes: item.notes ?? '',
          instructions: item.instructions ?? '',
        }));

        const analysisResults: SourceAnalysisResult[] = [];

        for (const source of sources) {
          const res = await this._sourceAnalysis.analyzeSource(source);
          await new Promise((resolve) => {
            setTimeout(resolve, 15000); // To avoid hitting rate limits
          });
          analysisResults.push(res);
        }

        const findings = analysisResults.flatMap((result, i) =>
          result.status === 'accepted'
            ? [{ content: result.content, sourceUrl: results[i].url }]
            : [],
        );

        return { subtopic, findings };
      }),
    );

    const populated = subtopicFindings.filter((s) => s.findings.length > 0);
    const verified = await this._verification.verify(populated);
    return this._synthesis.synthesize(item, verified);
  }
}
