import { Inject, Injectable } from '@nestjs/common';
import { ResearchableItem, ResearchEvent } from '@hub/research-data';
import { SubtopicGenerationService } from './services/pipeline/subtopic-generation.service';
import { WebSearchService } from './services/pipeline/web-search.service';
import { SourceAnalysisService } from './services/pipeline/source-analysis.service';
import { VerificationService } from './services/pipeline/verification.service';
import { SynthesisService } from './services/pipeline/synthesis.service';
import { ResearchReport, Source, SourceAnalysisResult } from './types';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { ResearchStreamService } from './services/research-stream.service';
import { Subject } from 'rxjs';

@Injectable()
export class ResearchService {
  constructor(
    private readonly _subtopicGeneration: SubtopicGenerationService,
    private readonly _webSearch: WebSearchService,
    private readonly _sourceAnalysis: SourceAnalysisService,
    private readonly _verification: VerificationService,
    private readonly _synthesis: SynthesisService,
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly _logger: Logger,
    private readonly _streamService: ResearchStreamService,
  ) {}

  async research(item: ResearchableItem): Promise<ResearchReport> {
    this._logger.info('research_started', { topic: item.topic });
    const { subject: stream, id } = await this.startStream(item);

    stream.next({ type: 'progress', step: 'subtopics', status: 'running' });
    const { subtopics } =
      await this._subtopicGeneration.generateSubtopics(item);
    stream.next({ type: 'progress', step: 'subtopics', status: 'done' });
    this._logger.info('subtopics_generated', {
      subtopics: subtopics.map((s) => s.label),
    });

    stream.next({ type: 'progress', step: 'web_search', status: 'running' });
    const searchResults = await Promise.all(
      subtopics.map(async (subtopic) => {
        this._logger.info('web_search_started', { subtopic: subtopic.label });
        const results = await this._webSearch.searchWeb(subtopic);
        this._logger.info('web_search_complete', {
          subtopic: subtopic.label,
          resultCount: results.results.length,
          urls: results.results.map((r) => r.url),
        });
        return results;
      }),
    );

    stream.next({ type: 'progress', step: 'web_search', status: 'done' });
    stream.next({
      type: 'progress',
      step: 'source_analysis',
      status: 'running',
    });
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
          this._logger.info('source_analysis_started', {
            subtopic: subtopic.label,
            url: results[analysisResults.length].url,
          });
          const res = await this._sourceAnalysis.analyzeSource(source);
          this._logger.info('source_analysis_complete', {
            subtopic: subtopic.label,
            url: results[analysisResults.length].url,
            status: res.status,
          });
          await new Promise((resolve) => setTimeout(resolve, 15000));
          analysisResults.push(res);
        }

        const accepted = analysisResults.filter(
          (r) => r.status === 'accepted',
        ).length;
        const rejected = analysisResults.filter(
          (r) => r.status === 'rejected',
        ).length;
        this._logger.info('source_analysis_summary', {
          subtopic: subtopic.label,
          accepted,
          rejected,
        });

        const findings = analysisResults.flatMap((result, i) =>
          result.status === 'accepted'
            ? [{ content: result.content, sourceUrl: results[i].url }]
            : [],
        );

        return { subtopic, findings };
      }),
    );
    stream.next({ type: 'progress', step: 'source_analysis', status: 'done' });
    stream.next({ type: 'progress', step: 'verification', status: 'running' });
    const populated = subtopicFindings.filter((s) => s.findings.length > 0);
    this._logger.info('subtopics_with_findings', { count: populated.length });

    const sections = [];
    for (const s of populated) {
      this._logger.info('verification_started', { subtopic: s.subtopic.label });
      const verification = await this._verification.verify(s);
      this._logger.info('verification_complete', {
        subtopic: s.subtopic.label,
        corroborated: verification.findings.filter((f) => f.corroborated)
          .length,
        contradictions: verification.findings.filter(
          (f) => f.contradictions.length > 0,
        ).length,
      });
      stream.next({ type: 'progress', step: 'verification', status: 'done' });
      stream.next({ type: 'progress', step: 'synthesis', status: 'running' });
      const mergedFindings = s.findings.map((f) => {
        const v = verification.findings.find(
          (vf) => vf.sourceUrl === f.sourceUrl,
        );
        return {
          content: f.content,
          sourceUrl: f.sourceUrl,
          corroborated: v?.corroborated ?? false,
          contradictions: v?.contradictions ?? [],
        };
      });

      this._logger.info('synthesis_started', { subtopic: s.subtopic.label });
      const section = await this._synthesis.synthesize(item, {
        subtopic: s.subtopic,
        findings: mergedFindings,
      });
      this._logger.info('synthesis_complete', { subtopic: s.subtopic.label });
      stream.next({ type: 'progress', step: 'synthesis', status: 'done' });
      sections.push(section);
    }
    stream.next({ type: 'progress', step: 'synthesis', status: 'running' });
    this._logger.info('research_complete', {
      topic: item.topic,
      sectionCount: sections.length,
    });
    stream.next({ type: 'complete' });
    this._streamService.delete(id);
    return { title: item.topic, sections };
  }

  private async startStream(item: ResearchableItem): Promise<{
    subject: Subject<ResearchEvent>;
    id: string;
  }> {
    const id = this._streamService.create();
    const subject = this._streamService.getOrThrow(id);
    subject.next({ type: 'start', item });
    return { subject, id };
  }
}
