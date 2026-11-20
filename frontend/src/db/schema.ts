import Dexie, { Table } from "dexie";
import { Project } from "../types/project";
import {
  ReconciliationSession,
  ReconciliationConfig,
  ReconciliationRecordResult,
} from "../types/reconciliation";
import { DatasetPreview } from "../types/dataset";
import { ActivityItem, WorkspaceSettings } from "../types/workspace";

export class FinSyncDatabase extends Dexie {
  projects!: Table<Project, string>;
  sessions!: Table<ReconciliationSession, string>;
  reconciliationConfigs!: Table<ReconciliationConfig, string>;
  reconciliationResults!: Table<ReconciliationRecordResult, string>;
  datasetPreviews!: Table<DatasetPreview, string>;
  activities!: Table<ActivityItem, string>;
  settings!: Table<WorkspaceSettings, string>;

  constructor() {
    super("FinSyncLocalDB");

    this.version(1).stores({
      projects: "&id, name, createdAt, updatedAt",
      sessions: "&id, projectId, status, overallValidationStatus, createdAt, completedAt",
      reconciliationConfigs: "&sessionId",
      reconciliationResults: "id, sessionId, primaryStatus, recordId, [sessionId+primaryStatus]",
      datasetPreviews: "&id, sessionId, side, [sessionId+side]",
      activities: "&id, type, projectId, sessionId, createdAt",
      settings: "&key",
    });

    this.on("versionchange", () => {
      this.close();
    });
  }
}

export const db = new FinSyncDatabase();