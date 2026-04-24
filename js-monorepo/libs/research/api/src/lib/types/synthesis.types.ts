export type ReportSection = {
  subtopicLabel: string;
  summary: string;
  sources: string[];
  hasContradictions: boolean;
};

export type ResearchReport = {
  title: string;
  sections: ReportSection[];
};
