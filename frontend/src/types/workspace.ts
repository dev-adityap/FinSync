export type GlassTheme = "dark-glass" | "light-glass";

export type ActivityType =
  | "PROJECT_CREATED"
  | "PROJECT_UPDATED"
  | "PROJECT_DELETED"
  | "FILE_UPLOADED"
  | "MAPPING_SAVED"
  | "RECONCILIATION_RUN"
  | "REPORT_EXPORTED"
  | "WORKSPACE_RESTORED";

export interface ActivityItem {
  id: string;
  type: ActivityType;
  projectId?: string;
  sessionId?: string;
  summary: string;
  createdAt: string;
}

export interface WorkspaceSettings {
  key: "workspace_settings";
  workspaceLabel: string;
  theme: GlassTheme;
  defaultNumericTolerance: string;
  defaultCaseInsensitive: boolean;
  defaultTrimWhitespace: boolean;
  defaultPageSize: number;
  hasSeenFirstRunNotice: boolean;
}

export interface WorkspaceBackupPayload {
  app: "FinSync";
  schemaVersion: number;
  exportedAt: string;
  data: {
    projects: unknown[];
    sessions: unknown[];
    reconciliationConfigs: unknown[];
    reconciliationResults: unknown[];
    datasetPreviews: unknown[];
    activities: unknown[];
    settings: WorkspaceSettings;
  };
}