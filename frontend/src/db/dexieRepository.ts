import { db } from "./schema";
import { WorkspaceRepository } from "./repository";
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

export const DEFAULT_SETTINGS: WorkspaceSettings = {
  key: "workspace_settings",
  workspaceLabel: "Guest Workspace",
  theme: "dark-glass",
  defaultNumericTolerance: "0.01",
  defaultCaseInsensitive: false,
  defaultTrimWhitespace: true,
  defaultPageSize: 25,
  hasSeenFirstRunNotice: false,
};

function makeId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function formatStorageError(err: unknown): Error {
  const message = err instanceof Error ? err.message : String(err ?? "");
  if (message.includes("QuotaExceededError") || message.includes("quota")) {
    return new Error(
      "Browser storage quota exceeded. Export a backup or remove older reconciliation sessions in Settings."
    );
  }
  return new Error(
    message || "Unable to access local browser storage (IndexedDB). Check browser privacy settings."
  );
}

export class DexieWorkspaceRepository implements WorkspaceRepository {
  async getSettings(): Promise<WorkspaceSettings> {
    try {
      const existing = await db.settings.get("workspace_settings");
      if (existing) {
        return { ...DEFAULT_SETTINGS, ...existing };
      }
      await db.settings.put(DEFAULT_SETTINGS);
      return DEFAULT_SETTINGS;
    } catch (err) {
      throw formatStorageError(err);
    }
  }

  async updateSettings(patch: Partial<WorkspaceSettings>): Promise<WorkspaceSettings> {
    try {
      const current = await this.getSettings();
      const updated: WorkspaceSettings = {
        ...current,
        ...patch,
        key: "workspace_settings",
      };
      await db.settings.put(updated);
      return updated;
    } catch (err) {
      throw formatStorageError(err);
    }
  }

  async recordActivity(
    type: ActivityType,
    summary: string,
    refs?: { projectId?: string; sessionId?: string }
  ): Promise<void> {
    try {
      const item: ActivityItem = {
        id: makeId(),
        type,
        summary,
        projectId: refs?.projectId,
        sessionId: refs?.sessionId,
        createdAt: new Date().toISOString(),
      };
      await db.activities.add(item);
    } catch (err) {
      throw formatStorageError(err);
    }
  }

  async listActivities(limit = 30): Promise<ActivityItem[]> {
    try {
      const all = await db.activities.orderBy("createdAt").reverse().toArray();
      return all.slice(0, limit);
    } catch (err) {
      throw formatStorageError(err);
    }
  }

  async listProjectsWithSummary(): Promise<ProjectSummary[]> {
    try {
      const [projects, sessions] = await Promise.all([
        db.projects.orderBy("createdAt").reverse().toArray(),
        db.sessions.toArray(),
      ]);

      return projects.map((project) => {
        const linked = sessions.filter((s) => s.projectId === project.id);
        let latestActivityAt = project.updatedAt || project.createdAt;
        for (const s of linked) {
          const candidate = s.completedAt || s.createdAt;
          if (candidate > latestActivityAt) {
            latestActivityAt = candidate;
          }
        }
        return {
          ...project,
          sessionCount: linked.length,
          latestActivityAt,
        };
      });
    } catch (err) {
      throw formatStorageError(err);
    }
  }

  async getProject(projectId: string): Promise<Project | undefined> {
    try {
      return await db.projects.get(projectId);
    } catch (err) {
      throw formatStorageError(err);
    }
  }

  async createProject(input: { name: string; description: string }): Promise<Project> {
    try {
      const now = new Date().toISOString();
      const project: Project = {
        id: makeId(),
        name: input.name.trim(),
        description: input.description.trim(),
        createdAt: now,
        updatedAt: now,
      };
      await db.projects.add(project);
      await this.recordActivity("PROJECT_CREATED", `Created project "${project.name}"`, {
        projectId: project.id,
      });
      return project;
    } catch (err) {
      throw formatStorageError(err);
    }
  }

  async updateProject(
    projectId: string,
    patch: { name: string; description: string }
  ): Promise<Project> {
    try {
      const existing = await db.projects.get(projectId);
      if (!existing) {
        throw new Error("Project not found in local workspace.");
      }
      const updated: Project = {
        ...existing,
        name: patch.name.trim(),
        description: patch.description.trim(),
        updatedAt: new Date().toISOString(),
      };
      await db.projects.put(updated);
      await this.recordActivity("PROJECT_UPDATED", `Updated project "${updated.name}"`, {
        projectId: updated.id,
      });
      return updated;
    } catch (err) {
      throw formatStorageError(err);
    }
  }

  async deleteProject(projectId: string): Promise<void> {
    try {
      await db.transaction(
        "rw",
        [
          db.projects,
          db.sessions,
          db.reconciliationConfigs,
          db.reconciliationResults,
          db.datasetPreviews,
          db.activities,
        ],
        async () => {
          const existing = await db.projects.get(projectId);
          const sessions = await db.sessions.where("projectId").equals(projectId).toArray();
          const sessionIds = sessions.map((s) => s.id);

          if (sessionIds.length > 0) {
            await db.reconciliationResults.where("sessionId").anyOf(sessionIds).delete();
            await db.reconciliationConfigs.where("sessionId").anyOf(sessionIds).delete();
            await db.datasetPreviews.where("sessionId").anyOf(sessionIds).delete();
            await db.sessions.bulkDelete(sessionIds);
          }

          await db.projects.delete(projectId);
          if (existing) {
            await db.activities.add({
              id: makeId(),
              type: "PROJECT_DELETED",
              summary: `Deleted project "${existing.name}"`,
              projectId,
              createdAt: new Date().toISOString(),
            });
          }
        }
      );
    } catch (err) {
      throw formatStorageError(err);
    }
  }

  async listSessions(): Promise<ReconciliationSession[]> {
    try {
      return await db.sessions.orderBy("createdAt").reverse().toArray();
    } catch (err) {
      throw formatStorageError(err);
    }
  }

  async getSession(sessionId: string): Promise<ReconciliationSession | undefined> {
    try {
      return await db.sessions.get(sessionId);
    } catch (err) {
      throw formatStorageError(err);
    }
  }

  async upsertSession(session: ReconciliationSession): Promise<void> {
    try {
      await db.sessions.put(session);
    } catch (err) {
      throw formatStorageError(err);
    }
  }

  async deleteSession(sessionId: string): Promise<void> {
    try {
      await db.transaction(
        "rw",
        [db.sessions, db.reconciliationConfigs, db.reconciliationResults, db.datasetPreviews],
        async () => {
          await db.reconciliationResults.where("sessionId").equals(sessionId).delete();
          await db.reconciliationConfigs.delete(sessionId);
          await db.datasetPreviews.where("sessionId").equals(sessionId).delete();
          await db.sessions.delete(sessionId);
        }
      );
    } catch (err) {
      throw formatStorageError(err);
    }
  }

  async clearAllSessions(): Promise<void> {
    try {
      await db.transaction(
        "rw",
        [db.sessions, db.reconciliationConfigs, db.reconciliationResults, db.datasetPreviews],
        async () => {
          await db.reconciliationResults.clear();
          await db.reconciliationConfigs.clear();
          await db.datasetPreviews.clear();
          await db.sessions.clear();
        }
      );
    } catch (err) {
      throw formatStorageError(err);
    }
  }

  async getConfig(sessionId: string): Promise<ReconciliationConfig | undefined> {
    try {
      return await db.reconciliationConfigs.get(sessionId);
    } catch (err) {
      throw formatStorageError(err);
    }
  }

  async saveConfig(config: ReconciliationConfig): Promise<void> {
    try {
      await db.reconciliationConfigs.put(config);
    } catch (err) {
      throw formatStorageError(err);
    }
  }

  async saveReconciliationOutcome(
    session: ReconciliationSession,
    records: ReconciliationRecordResult[]
  ): Promise<void> {
    try {
      await db.transaction(
        "rw",
        [db.sessions, db.reconciliationResults, db.activities],
        async () => {
          await db.sessions.put(session);
          await db.reconciliationResults.where("sessionId").equals(session.id).delete();
          if (records.length > 0) {
            await db.reconciliationResults.bulkAdd(records);
          }
          await db.activities.add({
            id: makeId(),
            type: "RECONCILIATION_RUN",
            summary: `Completed reconciliation "${session.name}" (${session.matchPercentage.toFixed(1)}% matched)`,
            projectId: session.projectId,
            sessionId: session.id,
            createdAt: new Date().toISOString(),
          });
        }
      );
    } catch (err) {
      throw formatStorageError(err);
    }
  }

  async listSessionResults(
    sessionId: string,
    filterStatus: RecordPrimaryStatus | "ALL" = "ALL"
  ): Promise<ReconciliationRecordResult[]> {
    try {
      if (filterStatus === "ALL") {
        return await db.reconciliationResults.where("sessionId").equals(sessionId).toArray();
      }
      return await db.reconciliationResults
        .where("[sessionId+primaryStatus]")
        .equals([sessionId, filterStatus])
        .toArray();
    } catch (err) {
      throw formatStorageError(err);
    }
  }

  async saveDatasetPreview(preview: DatasetPreview): Promise<void> {
    try {
      await db.datasetPreviews.put(preview);
    } catch (err) {
      throw formatStorageError(err);
    }
  }

  async getDatasetPreview(
    sessionId: string,
    side: DatasetSide
  ): Promise<DatasetPreview | undefined> {
    try {
      return await db.datasetPreviews.get(`${sessionId}:${side}`);
    } catch (err) {
      throw formatStorageError(err);
    }
  }

  async exportWorkspaceBackup(): Promise<WorkspaceBackupPayload> {
    try {
      const [
        projects,
        sessions,
        reconciliationConfigs,
        reconciliationResults,
        datasetPreviews,
        activities,
        settings,
      ] = await Promise.all([
        db.projects.toArray(),
        db.sessions.toArray(),
        db.reconciliationConfigs.toArray(),
        db.reconciliationResults.toArray(),
        db.datasetPreviews.toArray(),
        db.activities.toArray(),
        this.getSettings(),
      ]);

      return {
        app: "FinSync",
        schemaVersion: 1,
        exportedAt: new Date().toISOString(),
        data: {
          projects,
          sessions,
          reconciliationConfigs,
          reconciliationResults,
          datasetPreviews,
          activities,
          settings,
        },
      };
    } catch (err) {
      throw formatStorageError(err);
    }
  }

  async importWorkspaceBackup(payload: WorkspaceBackupPayload): Promise<void> {
    if (!payload || payload.app !== "FinSync" || !payload.data) {
      throw new Error("Invalid or corrupted FinSync backup file.");
    }

    try {
      await db.transaction(
        "rw",
        [
          db.projects,
          db.sessions,
          db.reconciliationConfigs,
          db.reconciliationResults,
          db.datasetPreviews,
          db.activities,
          db.settings,
        ],
        async () => {
          await Promise.all([
            db.projects.clear(),
            db.sessions.clear(),
            db.reconciliationConfigs.clear(),
            db.reconciliationResults.clear(),
            db.datasetPreviews.clear(),
            db.activities.clear(),
          ]);

          const d = payload.data;
          if (Array.isArray(d.projects) && d.projects.length > 0) {
            await db.projects.bulkAdd(d.projects as Project[]);
          }
          if (Array.isArray(d.sessions) && d.sessions.length > 0) {
            await db.sessions.bulkAdd(d.sessions as ReconciliationSession[]);
          }
          if (Array.isArray(d.reconciliationConfigs) && d.reconciliationConfigs.length > 0) {
            await db.reconciliationConfigs.bulkAdd(
              d.reconciliationConfigs as ReconciliationConfig[]
            );
          }
          if (Array.isArray(d.reconciliationResults) && d.reconciliationResults.length > 0) {
            await db.reconciliationResults.bulkAdd(
              d.reconciliationResults as ReconciliationRecordResult[]
            );
          }
          if (Array.isArray(d.datasetPreviews) && d.datasetPreviews.length > 0) {
            await db.datasetPreviews.bulkAdd(d.datasetPreviews as DatasetPreview[]);
          }
          if (Array.isArray(d.activities) && d.activities.length > 0) {
            await db.activities.bulkAdd(d.activities as ActivityItem[]);
          }
          await db.settings.put({
            ...DEFAULT_SETTINGS,
            ...(d.settings || {}),
            key: "workspace_settings",
          });
          await db.activities.add({
            id: makeId(),
            type: "WORKSPACE_RESTORED",
            summary: "Restored workspace from backup file",
            createdAt: new Date().toISOString(),
          });
        }
      );
    } catch (err) {
      throw formatStorageError(err);
    }
  }

  async clearAllWorkspaceData(): Promise<void> {
    try {
      await db.transaction(
        "rw",
        [
          db.projects,
          db.sessions,
          db.reconciliationConfigs,
          db.reconciliationResults,
          db.datasetPreviews,
          db.activities,
          db.settings,
        ],
        async () => {
          await Promise.all([
            db.projects.clear(),
            db.sessions.clear(),
            db.reconciliationConfigs.clear(),
            db.reconciliationResults.clear(),
            db.datasetPreviews.clear(),
            db.activities.clear(),
          ]);
          await db.settings.put(DEFAULT_SETTINGS);
        }
      );
    } catch (err) {
      throw formatStorageError(err);
    }
  }

  async estimateStorageUsage(): Promise<{
    usageBytes: number | null;
    quotaBytes: number | null;
  }> {
    if (typeof navigator !== "undefined" && navigator.storage?.estimate) {
      try {
        const est = await navigator.storage.estimate();
        return {
          usageBytes: typeof est.usage === "number" ? est.usage : null,
          quotaBytes: typeof est.quota === "number" ? est.quota : null,
        };
      } catch {
        return { usageBytes: null, quotaBytes: null };
      }
    }
    return { usageBytes: null, quotaBytes: null };
  }
}

export const workspaceRepo: WorkspaceRepository = new DexieWorkspaceRepository();