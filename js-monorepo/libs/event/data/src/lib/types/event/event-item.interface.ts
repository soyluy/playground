export interface EventItem {
  id: string;
  title: string;
  description: string | null;
  startTime: Date;
  endTime: Date | null;
  researchId: string | null;
  createdAt: Date;
  updatedAt: Date;
}
