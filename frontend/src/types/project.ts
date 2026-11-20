export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectSummary extends Project {
  sessionCount: number;
  latestActivityAt?: string;
}