import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FileSpreadsheet,
  Download,
  CheckCircle2,
  Plus,
} from "lucide-react";
import { workspaceRepo } from "../db/dexieRepository";
import { useWorkspace } from "../context/WorkspaceContext";
import {
  ReconciliationRecordResult,
  ReconciliationSession,
} from "../types/reconciliation";
import { ReportType } from "../types/report";
import {
  downloadCsvContent,
  exportReconciliationReport,
} from "../services/reportService";
import { GlassPanel } from "../components/glass/GlassPanel";
import { GlassCard } from "../components/glass/GlassCard";
import { GlassSelect } from "../components/glass/GlassSelect";
import { GlassButton } from "../components/glass/GlassButton";

interface ReportDefinition {
  type: ReportType;
  title: string;
  description: string;
  countForSession: (s: ReconciliationSession) => string;
}

const REPORT_CARDS: ReportDefinition[] = [
  {
    type: "complete",
    title: "Complete Reconciliation Report",
    description:
      "Every evaluated record with primary status, issue count, summaries, field differences, and validation reasons.",
    countForSession: (s) => `${s.sourceRowCount + s.unexpectedCount} total entries`,
  },
  {
    type: "mismatches",
    title: "Mismatch Report",
    description:
      "Records where mapped fields or financial values diverged outside configured tolerance.",
    countForSession: (s) => `${s.mismatchedCount} mismatched`,
  },
  {
    type: "missing",
    title: "Missing Destination Records",
    description:
      "Source records absent from the destination dataset (MISSING_IN_DESTINATION).",
    countForSession: (s) => `${s.missingCount} missing`,
  },
  {
    type: "unexpected",
    title: "Unexpected Destination Records",
    description:
      "Destination records not present in the source dataset (UNEXPECTED_IN_DESTINATION).",
    countForSession: (s) => `${s.unexpectedCount} unexpected`,
  },
  {
    type: "duplicates",
    title: "Duplicate Records",
    description:
      "Records flagged with duplicate unique identifiers during independent dataset checks.",
    countForSession: (s) => `${s.duplicateCount} duplicates`,
  },
  {
    type: "invalid",
    title: "Invalid Records",
    description:
      "Records failing required field, numeric, date, email, or non-empty validation checks.",
    countForSession: (s) => `${s.invalidCount} invalid`,
  },
  {
    type: "summary",
    title: "Executive Summary Report",
    description:
      "High-level KPI table including match rate, system names, validation status, and issue totals.",
    countForSession: (s) => `${s.matchPercentage.toFixed(1)}% match rate`,
  },
];

export const ReportsPage: React.FC = () => {
  const { notify, refreshCounter, bumpRefresh } = useWorkspace();

  const [sessions, setSessions] = useState<ReconciliationSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  const [records, setRecords] = useState<ReconciliationRecordResult[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [exportingType, setExportingType] = useState<ReportType | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    workspaceRepo
      .listSessions()
      .then((list) => {
        if (!active) return;
        const completed = list.filter((s) => s.status === "COMPLETED");
        setSessions(completed);
        if (completed.length > 0) {
          setSelectedSessionId((prev) => prev || completed[0].id);
        }
      })
      .catch((err) => {
        if (!active) return;
        notify(
          "error",
          "Failed to load sessions",
          err instanceof Error ? err.message : "Storage error."
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [refreshCounter, notify]);

  useEffect(() => {
    if (!selectedSessionId) {
      setRecords([]);
      return;
    }
    let active = true;
    workspaceRepo
      .listSessionResults(selectedSessionId, "ALL")
      .then((res) => {
        if (active) setRecords(res);
      })
      .catch(() => {
        if (active) setRecords([]);
      });
    return () => {
      active = false;
    };
  }, [selectedSessionId]);

  const activeSession =
    sessions.find((s) => s.id === selectedSessionId) ?? null;

  const handleDownloadReport = async (reportType: ReportType) => {
    if (!activeSession || exportingType) return;
    setExportingType(reportType);

    try {
      const csvText = await exportReconciliationReport({
        reportType,
        session: activeSession,
        records,
      });

      const safeSlug = activeSession.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      const filename = `finsync-${safeSlug || "session"}-${reportType}.csv`;

      downloadCsvContent(csvText, filename);

      await workspaceRepo.recordActivity(
        "REPORT_EXPORTED",
        `Exported ${reportType} CSV report for "${activeSession.name}"`,
        {
          projectId: activeSession.projectId,
          sessionId: activeSession.id,
        }
      );
      bumpRefresh();

      notify(
        "success",
        "Report Downloaded",
        `Generated ${filename} with CSV formula-injection protection.`
      );
    } catch (err) {
      notify(
        "error",
        "Export Failed",
        err instanceof Error ? err.message : "Could not generate report."
      );
    } finally {
      setExportingType(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2
            className="text-2xl font-bold tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            Report Center
          </h2>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Generate and download structured, formula-safe CSV audit exports from saved reconciliation runs.
          </p>
        </div>

        <Link to="/app/reconcile/new">
          <GlassButton
            variant="primary"
            leftIcon={<Plus className="h-4 w-4" aria-hidden="true" />}
          >
            New Reconciliation
          </GlassButton>
        </Link>
      </div>

      {!loading && sessions.length === 0 ? (
        <GlassPanel level={1} className="p-10 text-center space-y-4">
          <div
            className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl"
            style={{
              backgroundColor: "rgba(110, 219, 164, 0.14)",
              color: "var(--status-success)",
            }}
          >
            <FileSpreadsheet className="h-6 w-6" aria-hidden="true" />
          </div>
          <h3
            className="text-lg font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            No completed reconciliations to export
          </h3>
          <p
            className="mx-auto max-w-md text-sm"
            style={{ color: "var(--text-secondary)" }}
          >
            Complete a reconciliation session first, then return here to download full, mismatch, missing, duplicate, invalid, or summary reports.
          </p>
          <Link to="/app/reconcile/new">
            <GlassButton variant="primary">Run a Reconciliation</GlassButton>
          </Link>
        </GlassPanel>
      ) : (
        <>
          {activeSession && (
            <GlassCard level={2} padding="md">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:items-end">
                <div className="md:col-span-8">
                  <GlassSelect
                    label="Select Completed Session"
                    value={selectedSessionId}
                    onChange={(e) => setSelectedSessionId(e.target.value)}
                    options={sessions.map((s) => ({
                      value: s.id,
                      label: `${s.name} — ${new Date(
                        s.createdAt
                      ).toLocaleDateString()} (${s.matchPercentage.toFixed(1)}% match)`,
                    }))}
                  />
                </div>
                <div
                  className="md:col-span-4 flex items-center gap-2 text-xs"
                  style={{ color: "var(--status-success)" }}
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>
                    CSV cells starting with =, +, -, @, TAB, or CR are escaped automatically.
                  </span>
                </div>
              </div>
            </GlassCard>
          )}

          {activeSession && (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {REPORT_CARDS.map((rep) => (
                <GlassCard
                  key={rep.type}
                  level={2}
                  padding="md"
                  className="flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <h3
                        className="text-base font-semibold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {rep.title}
                      </h3>
                      <FileSpreadsheet
                        className="h-4 w-4 shrink-0"
                        style={{ color: "var(--accent-cyan)" }}
                        aria-hidden="true"
                      />
                    </div>
                    <p
                      className="text-xs sm:text-sm leading-relaxed"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {rep.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-2 border-t" style={{ borderColor: "var(--glass-2-border)" }}>
                    <span
                      className="text-xs font-medium tabular-nums"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {rep.countForSession(activeSession)}
                    </span>

                    <GlassButton
                      size="sm"
                      variant="primary"
                      loading={exportingType === rep.type}
                      leftIcon={
                        <Download className="h-3.5 w-3.5" aria-hidden="true" />
                      }
                      onClick={() => void handleDownloadReport(rep.type)}
                    >
                      Download CSV
                    </GlassButton>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
