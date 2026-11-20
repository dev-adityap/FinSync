import { Project, ProjectSummary } from "../types/project";
import {
  ReconciliationSession,
  ReconciliationConfig,
  ReconciliationRecordResult,
  RecordPrimaryStatus,
} from "../types/reconciliation";
import { DatasetPreview, DatasetSide } from "../types/dataset";
import {
  ActivityItem,
  ActivityType,
  WorkspaceBackupPayload,
  WorkspaceSettings,
} from "../types/workspace";

export interface WorkspaceRepository {
  // Settings & Activity
  getSettings(): Promise<WorkspaceSettings>;
  updateSettings(patch: Partial<WorkspaceSettings>): Promise<WorkspaceSettings>;
  recordActivity(
    type: ActivityType,
    summary: string,
    refs?: { projectId?: string; sessionId?: string }
  ): Promise<void>;
  listActivities(limit?: number): Promise<ActivityItem[]>;

  // Projects
  listProjectsWithSummary(): Promise<ProjectSummary[]>;
  getProject(projectId: string): Promise<Project | undefined>;
  createProject(input: { name: string; description: string }): Promise<Project>;
  updateProject(
    projectId: string,
    patch: { name: string; description: string }
  ): Promise<Project>;
  deleteProject(projectId: string): Promise<void>;

  // Sessions & Configs
  listSessions(): Promise<ReconciliationSession[]>;
  getSession(sessionId: string): Promise<ReconciliationSession | undefined>;
  upsertSession(session: ReconciliationSession): Promise<void>;
  deleteSession(sessionId: string): Promise<void>;
  clearAllSessions(): Promise<void>;

  getConfig(sessionId: string): Promise<ReconciliationConfig | undefined>;
  saveConfig(config: ReconciliationConfig): Promise<void>;

  // Results & Dataset Previews
  saveReconciliationOutcome(
    session: ReconciliationSession,
    records: ReconciliationRecordResult[]
  ): Promise<void>;
  listSessionResults(
    sessionId: string,
    filterStatus?: RecordPrimaryStatus | "ALL"
  ): Promise<ReconciliationRecordResult[]>;

  saveDatasetPreview(preview: DatasetPreview): Promise<void>;
  getDatasetPreview(sessionId: string, side: DatasetSide): Promise<DatasetPreview | undefined>;

  // Backup, Restore & Reset
  exportWorkspaceBackup(): Promise<WorkspaceBackupPayload>;
  importWorkspaceBackup(payload: WorkspaceBackupPayload): Promise<void>;
  clearAllWorkspaceData(): Promise<void>;
  estimateStorageUsage(): Promise<{ usageBytes: number | null; quotaBytes: number | null }>;
}