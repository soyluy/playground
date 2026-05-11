import { Inject, Injectable } from '@nestjs/common';
import {
  CreateResearchableItem,
  ResearchableItem,
  ResearchEvent,
} from '@hub/research-data';
import { SubtopicGenerationService } from './services/pipeline/subtopic-generation.service';
import { WebSearchService } from './services/pipeline/web-search.service';
import { SourceAnalysisService } from './services/pipeline/source-analysis.service';
import {
  SubtopicFindings,
  VerificationService,
} from './services/pipeline/verification.service';
import { SynthesisService } from './services/pipeline/synthesis.service';
import {
  ResearchReport,
  Source,
  SourceAnalysisResult,
  SynthesisInput,
} from './types';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { ResearchStreamService } from './services/research-stream.service';
import { Subject } from 'rxjs';
import { WebSearchResult } from './types/web-search.types';
import { Subtopic } from './types/subtopic.types';
import { InjectModel } from '@nestjs/mongoose';
import {
  Research,
  ResearchDocument,
  ResearchResult,
} from './schemas/research-result.schema';
import { Model } from 'mongoose';

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
    @InjectModel(Research.name)
    private readonly _researchModel: Model<ResearchDocument>,
  ) {}

  async research(item: CreateResearchableItem): Promise<string> {
    this._logger.info('research_started', { topic: item.topic });
    const research = await this._researchModel.create({
      todoId: item.todoId,
      topic: item.topic,
      status: 'pending',
    });
    const subject = this._streamService.create(research._id.toString());
    const researchableItem: ResearchableItem = {
      ...item,
      id: research._id.toString(),
      status: 'pending',
    };

    this.executePipeline(research, researchableItem, subject);
    return research._id.toString();
  }

  private async executePipeline(
    research: ResearchDocument,
    item: ResearchableItem,
    subject: Subject<ResearchEvent>,
  ): Promise<ResearchReport> {
    subject.next({ type: 'start', item });

    try {
      const subtopics = await this._generateSubtopics(item, subject);
      const searchResults = await this._runWebSearch(subtopics, subject);
      const subtopicFindings = await this._analyzeSources(
        item,
        searchResults,
        subject,
      );
      const sections = await this._verifyAndSynthesize(
        item,
        subtopicFindings,
        subject,
      );
      const result: ResearchResult = {
        summary: item.topic,
        subtopics: sections.map((section) => {
          return {
            title: section.subtopicLabel,
            explanation: section.summary,
          };
        }),
      };
      research.result = result;
      research.status = 'done';
      await research.save();

      subject.next({ type: 'complete' });
      this._logger.info('research_complete', {
        topic: item.topic,
        sectionCount: sections.length,
      });

      return { title: item.topic, sections };
    } catch (error) {
      this._logger.error('research_error', { error });
      research.status = 'error';
      await research.save();
      throw error;
    } finally {
      this._streamService.delete(research._id.toString());
    }
  }

  private async _generateSubtopics(
    item: ResearchableItem,
    stream: Subject<ResearchEvent>,
  ): Promise<Subtopic[]> {
    stream.next({ type: 'progress', step: 'subtopics', status: 'running' });
    const { subtopics } =
      await this._subtopicGeneration.generateSubtopics(item);
    stream.next({ type: 'progress', step: 'subtopics', status: 'done' });
    this._logger.info('subtopics_generated', {
      subtopics: subtopics.map((s) => s.label),
    });
    return subtopics;
  }

  private async _runWebSearch(
    subtopics: Subtopic[],
    stream: Subject<ResearchEvent>,
  ): Promise<WebSearchResult[]> {
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
    return searchResults;
  }

  private async _analyzeSingleSource(
    source: Source,
    url: string,
    subtopicLabel: string,
  ): Promise<SourceAnalysisResult> {
    this._logger.info('source_analysis_started', {
      subtopic: subtopicLabel,
      url,
    });
    const result = await this._sourceAnalysis.analyzeSource(source);
    this._logger.info('source_analysis_complete', {
      subtopic: subtopicLabel,
      url,
      status: result.status,
    });
    await new Promise((resolve) => setTimeout(resolve, 15000));
    return result;
  }

  private async _analyzeSubtopicSources(
    item: ResearchableItem,
    { subtopic, results }: WebSearchResult,
  ): Promise<SubtopicFindings> {
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
      const result = await this._analyzeSingleSource(
        source,
        results[analysisResults.length].url,
        subtopic.label,
      );
      analysisResults.push(result);
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
  }

  private async _analyzeSources(
    item: ResearchableItem,
    searchResults: WebSearchResult[],
    stream: Subject<ResearchEvent>,
  ): Promise<SubtopicFindings[]> {
    stream.next({
      type: 'progress',
      step: 'source_analysis',
      status: 'running',
    });
    const subtopicFindings = await Promise.all(
      searchResults.map((searchResult) =>
        this._analyzeSubtopicSources(item, searchResult),
      ),
    );
    stream.next({ type: 'progress', step: 'source_analysis', status: 'done' });
    return subtopicFindings;
  }

  private async _verifySubtopic(s: SubtopicFindings) {
    this._logger.info('verification_started', { subtopic: s.subtopic.label });
    const verification = await this._verification.verify(s);
    this._logger.info('verification_complete', {
      subtopic: s.subtopic.label,
      corroborated: verification.findings.filter((f) => f.corroborated).length,
      contradictions: verification.findings.filter(
        (f) => f.contradictions.length > 0,
      ).length,
    });

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

    return { subtopic: s.subtopic, findings: mergedFindings };
  }

  private async _synthesizeSubtopic(item: ResearchableItem, s: SynthesisInput) {
    this._logger.info('synthesis_started', { subtopic: s.subtopic.label });
    const section = await this._synthesis.synthesize(item, s);
    this._logger.info('synthesis_complete', { subtopic: s.subtopic.label });
    return section;
  }

  private async _verifyAndSynthesize(
    item: ResearchableItem,
    subtopicFindings: SubtopicFindings[],
    stream: Subject<ResearchEvent>,
  ) {
    const populated = subtopicFindings.filter((s) => s.findings.length > 0);
    this._logger.info('subtopics_with_findings', { count: populated.length });

    stream.next({ type: 'progress', step: 'verification', status: 'running' });
    const verified = [];
    for (const s of populated) {
      verified.push(await this._verifySubtopic(s));
    }
    stream.next({ type: 'progress', step: 'verification', status: 'done' });

    stream.next({ type: 'progress', step: 'synthesis', status: 'running' });
    const sections = [];
    for (const s of verified) {
      sections.push(await this._synthesizeSubtopic(item, s));
    }
    stream.next({ type: 'progress', step: 'synthesis', status: 'done' });

    return sections;
  }
}
