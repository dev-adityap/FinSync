import React, { useEffect, useRef, useState } from "react";
import {
  Download,
  Upload,
  Trash2,
  HardDrive,
  Sliders,
  Palette,
  Info,
} from "lucide-react";
import { workspaceRepo } from "../db/dexieRepository";
import {
  parseBackupFile,
  triggerBackupDownload,
} from "../db/backup";
import { useWorkspace } from "../context/WorkspaceContext";
import { GlassTheme } from "../types/workspace";
import { ReconciliationSession } from "../types/reconciliation";
import { GlassPanel } from "../components/glass/GlassPanel";
import { GlassCard } from "../components/glass/GlassCard";
import { GlassInput } from "../components/glass/GlassInput";
import { GlassSelect } from "../components/glass/GlassSelect";
import { GlassButton } from "../components/glass/GlassButton";
import { GlassModal } from "../components/glass/GlassModal";

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, notify, refreshCounter, bumpRefresh } =
    useWorkspace();

  const [workspaceLabel, setWorkspaceLabel] = useState(
    settings.workspaceLabel
  );
  const [theme, setTheme] = useState<GlassTheme>(settings.theme);
  const [numericTolerance, setNumericTolerance] = useState(
    settings.defaultNumericTolerance
  );
  const [caseInsensitive, setCaseInsensitive] = useState(
    settings.defaultCaseInsensitive
  );
  const [trimWhitespace, setTrimWhitespace] = useState(
    settings.defaultTrimWhitespace
  );
  const [pageSize, setPageSize] = useState(String(settings.defaultPageSize));
  const [savingPrefs, setSavingPrefs] = useState(false);

  const [sessions, setSessions] = useState<ReconciliationSession[]>([]);
  const [storageStats, setStorageStats] = useState<{
    usageBytes: number | null;
    quotaBytes: number | null;
  }>({ usageBytes: null, quotaBytes: null });

  const restoreInputRef = useRef<HTMLInputElement | null>(null);
  const [restoring, setRestoring] = useState(false);
  const [clearAllModalOpen, setClearAllModalOpen] = useState(false);
  const [clearingAll, setClearingAll] = useState(false);

  useEffect(() => {
    setWorkspaceLabel(settings.workspaceLabel);
    setTheme(settings.theme);
    setNumericTolerance(settings.defaultNumericTolerance);
    setCaseInsensitive(settings.defaultCaseInsensitive);
    setTrimWhitespace(settings.defaultTrimWhitespace);
    setPageSize(String(settings.defaultPageSize));
  }, [settings]);

  useEffect(() => {
    let active = true;
    Promise.all([
      workspaceRepo.listSessions(),
      workspaceRepo.estimateStorageUsage(),
    ])
      .then(([sessList, usage]) => {
        if (!active) return;
        setSessions(sessList);
        setStorageStats(usage);
      })
      .catch(() => {
        // Ignore storage read error on mount
      });
    return () => {
      active = false;
    };
  }, [refreshCounter]);

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    const tolNum = Number(numericTolerance);
    if (numericTolerance.trim() === "" || Number.isNaN(tolNum) || tolNum < 0) {
      notify(
        "error",
        "Invalid Tolerance",
        "Default numeric tolerance must be a non-negative number."
      );
      return;
    }

    setSavingPrefs(true);
    try {
      await updateSettings({
        workspaceLabel: workspaceLabel.trim() || "Guest Workspace",
        theme,
        defaultNumericTolerance: numericTolerance.trim(),
        defaultCaseInsensitive: caseInsensitive,
        defaultTrimWhitespace: trimWhitespace,
        defaultPageSize: Number(pageSize) || 25,
      });
      notify("success", "Settings Saved", "Workspace preferences persisted to IndexedDB.");
    } finally {
      setSavingPrefs(false);
    }
  };

  const handleExportBackup = async () => {
    try {
      const payload = await workspaceRepo.exportWorkspaceBackup();
      triggerBackupDownload(payload);
      notify(
        "success",
        "Backup Exported",
        "Downloaded FinSync workspace JSON backup."
      );
    } catch (err) {
      notify(
        "error",
        "Backup Failed",
        err instanceof Error ? err.message : "Could not export workspace."
      );
    }
  };

  const handleRestoreFile = async (file: File) => {
    setRestoring(true);
    try {
      const parsed = await parseBackupFile(file);
      await workspaceRepo.importWorkspaceBackup(parsed);
      bumpRefresh();
      notify(
        "success",
        "Workspace Restored",
        "Restored projects, sessions, and settings from backup."
      );
    } catch (err) {
      notify(
        "error",
        "Restore Failed",
        err instanceof Error ? err.message : "Invalid backup file."
      );
    } finally {
      setRestoring(false);
    }
  };

  const handleDeleteOneSession = async (session: ReconciliationSession) => {
    try {
      await workspaceRepo.deleteSession(session.id);
      bumpRefresh();
      notify("info", "Session Deleted", `Removed "${session.name}".`);
    } catch (err) {
      notify(
        "error",
        "Delete Failed",
        err instanceof Error ? err.message : "Could not delete session."
      );
    }
  };

  const handleClearAllWorkspace = async () => {
    setClearingAll(true);
    try {
      await workspaceRepo.clearAllWorkspaceData();
      setClearAllModalOpen(false);
      bumpRefresh();
      notify(
        "info",
        "Local Workspace Cleared",
        "All IndexedDB projects, sessions, results, and activity logs were reset."
      );
    } catch (err) {
      notify(
        "error",
        "Reset Failed",
        err instanceof Error ? err.message : "Could not clear workspace data."
      );
    } finally {
      setClearingAll(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2
          className="text-2xl font-bold tracking-tight"
          style={{ color: "var(--text-primary)" }}
        >
          Workspace Settings
        </h2>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          Configure appearance, default validation rules, and local browser storage (IndexedDB).
        </p>
      </div>

      {/* Transparent Local-Storage Disclosure */}
      <GlassPanel level={2} className="p-4 flex items-start gap-3 text-xs sm:text-sm">
        <Info
          className="h-5 w-5 shrink-0 mt-0.5"
          style={{ color: "var(--accent-cyan)" }}
          aria-hidden="true"
        />
        <div className="space-y-1" style={{ color: "var(--text-secondary)" }}>
          <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
            Stored Locally in This Browser Only
          </p>
          <p>
            FinSync stores projects, sessions, configurations, and reconciliation results in your current browser&apos;s IndexedDB. Authentication and cross-device cloud sync are not enabled in this release.
          </p>
        </div>
      </GlassPanel>

      <form onSubmit={(e) => void handleSavePreferences(e)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* General & Appearance */}
          <GlassCard level={2} padding="md" className="space-y-4">
            <div className="flex items-center gap-2">
              <Palette
                className="h-4 w-4"
                style={{ color: "var(--accent-cyan)" }}
                aria-hidden="true"
              />
              <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
                General &amp; Appearance
              </h3>
            </div>

            <GlassInput
              label="Workspace Label"
              value={workspaceLabel}
              onChange={(e) => setWorkspaceLabel(e.target.value)}
              helperText="Displayed in the top bar for your anonymous browser session."
            />

            <GlassSelect
              label="Liquid Glass Theme"
              value={theme}
              onChange={(e) => setTheme(e.target.value as GlassTheme)}
              options={[
                { value: "dark-glass", label: "Dark Liquid Glass (Default)" },
                { value: "light-glass", label: "Light Liquid Glass" },
              ]}
            />

            <GlassSelect
              label="Default Pagination Size"
              value={pageSize}
              onChange={(e) => setPageSize(e.target.value)}
              options={[
                { value: "10", label: "10 rows per page" },
                { value: "25", label: "25 rows per page" },
                { value: "50", label: "50 rows per page" },
                { value: "100", label: "100 rows per page" },
              ]}
            />
          </GlassCard>

          {/* Validation Defaults */}
          <GlassCard level={2} padding="md" className="space-y-4">
            <div className="flex items-center gap-2">
              <Sliders
                className="h-4 w-4"
                style={{ color: "var(--accent-violet)" }}
                aria-hidden="true"
              />
              <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
                Validation Defaults
              </h3>
            </div>

            <GlassInput
              label="Default Numeric Tolerance"
              value={numericTolerance}
              onChange={(e) => setNumericTolerance(e.target.value)}
              helperText="Default decimal tolerance used when creating new reconciliation sessions."
            />

            <label className="glass-level-2 flex items-start gap-3 p-3 rounded-xl cursor-pointer">
              <input
                type="checkbox"
                checked={trimWhitespace}
                onChange={(e) => setTrimWhitespace(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-white/20"
              />
              <div>
                <div className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                  Trim Whitespace by Default
                </div>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Strip leading/trailing spaces during comparisons unless overridden.
                </p>
              </div>
            </label>

            <label className="glass-level-2 flex items-start gap-3 p-3 rounded-xl cursor-pointer">
              <input
                type="checkbox"
                checked={caseInsensitive}
                onChange={(e) => setCaseInsensitive(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-white/20"
              />
              <div>
                <div className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                  Case-Insensitive Text by Default
                </div>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Ignore text casing differences in new sessions unless disabled.
                </p>
              </div>
            </label>
          </GlassCard>
        </div>

        <div className="flex justify-end">
          <GlassButton type="submit" variant="primary" loading={savingPrefs}>
            Save Preferences
          </GlassButton>
        </div>
      </form>

      {/* Local Data Management: Backup, Restore, Session Removal, Reset */}
      <GlassCard level={2} padding="md" className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <HardDrive
              className="h-4 w-4"
              style={{ color: "var(--accent-cyan)" }}
              aria-hidden="true"
            />
            <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
              Local Data Management (IndexedDB)
            </h3>
          </div>

          <div className="text-xs tabular-nums" style={{ color: "var(--text-secondary)" }}>
            <strong>{sessions.length}</strong> stored{" "}
            {sessions.length === 1 ? "session" : "sessions"}
            {typeof storageStats.usageBytes === "number" && (
              <>
                {" "}
                •{" "}
                <strong>
                  {(storageStats.usageBytes / (1024 * 1024)).toFixed(2)} MB
                </strong>{" "}
                used
              </>
            )}
          </div>
        </div>

        <input
          ref={restoreInputRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            if (f) void handleRestoreFile(f);
          }}
        />

        <div className="flex flex-wrap items-center gap-3">
          <GlassButton
            variant="secondary"
            leftIcon={<Download className="h-4 w-4" aria-hidden="true" />}
            onClick={() => void handleExportBackup()}
          >
            Export Workspace Backup
          </GlassButton>

          <GlassButton
            variant="secondary"
            loading={restoring}
            leftIcon={<Upload className="h-4 w-4" aria-hidden="true" />}
            onClick={() => restoreInputRef.current?.click()}
          >
            Import Workspace Backup
          </GlassButton>

          {sessions.length > 0 && (
            <GlassButton
              variant="danger"
              leftIcon={<Trash2 className="h-4 w-4" aria-hidden="true" />}
              onClick={() => setClearAllModalOpen(true)}
            >
              Clear All Local Data
            </GlassButton>
          )}
        </div>

        {/* Individual Session Delete List */}
        {sessions.length > 0 && (
          <div
            className="pt-4 border-t space-y-2"
            style={{ borderColor: "var(--glass-2-border)" }}
          >
            <h4
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: "var(--text-muted)" }}
            >
              Stored Sessions
            </h4>
            <div className="divide-y rounded-xl border" style={{ borderColor: "var(--glass-2-border)" }}>
              {sessions.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between gap-3 px-4 py-2.5 text-xs sm:text-sm"
                >
                  <div className="min-w-0">
                    <span className="font-medium truncate block" style={{ color: "var(--text-primary)" }}>
                      {s.name}
                    </span>
                    <span className="text-xs tabular-nums" style={{ color: "var(--text-muted)" }}>
                      {s.projectName} • {new Date(s.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <GlassButton
                    size="sm"
                    variant="ghost"
                    aria-label={`Delete session ${s.name}`}
                    onClick={() => void handleDeleteOneSession(s)}
                  >
                    <Trash2
                      className="h-4 w-4"
                      style={{ color: "var(--status-error)" }}
                      aria-hidden="true"
                    />
                  </GlassButton>
                </div>
              ))}
            </div>
          </div>
        )}
      </GlassCard>

      {/* Clear All Local Data Confirmation */}
      <GlassModal
        open={clearAllModalOpen}
        onClose={() => setClearAllModalOpen(false)}
        title="Clear All Local Workspace Data?"
        description="This permanently deletes all projects, sessions, configs, record results, dataset previews, and activity logs stored in this browser."
        size="sm"
        footer={
          <>
            <GlassButton
              variant="ghost"
              onClick={() => setClearAllModalOpen(false)}
            >
              Cancel
            </GlassButton>
            <GlassButton
              variant="danger"
              loading={clearingAll}
              onClick={() => void handleClearAllWorkspace()}
            >
              Yes, Clear Everything
            </GlassButton>
          </>
        }
      >
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Consider exporting a JSON backup first if you want to keep a copy of your local workspace.
        </p>
      </GlassModal>
    </div>
  );
};