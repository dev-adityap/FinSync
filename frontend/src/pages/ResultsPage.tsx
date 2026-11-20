import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  ArrowLeft,
  Search,
  Download,
  Eye,
  ChevronLeft,
  ChevronRight,
  Clock,
  Layers,
} from "lucide-react";
import { workspaceRepo } from "../db/dexieRepository";
import { useWorkspace } from "../context/WorkspaceContext";
import {
  RecordPrimaryStatus,
  ReconciliationRecordResult,
  ReconciliationSession,
} from "../types/reconciliation";
import {
  downloadCsvContent,
  exportReconciliationReport,
} from "../services/reportService";
import { GlassPanel } from "../components/glass/GlassPanel";
import { GlassCard } from "../components/glass/GlassCard";
import { GlassStatCard } from "../components/glass/GlassStatCard";
import { GlassButton } from "../components/glass/GlassButton";
import { GlassInput } from "../components/glass/GlassInput";
import { GlassSelect } from "../components/glass/GlassSelect";
import { GlassStatusBadge } from "../components/glass/GlassStatusBadge";
import { RecordInspectionDrawer } from "../components/reconciliation/RecordInspectionDrawer";

type StatusFilterOption = "ALL" | RecordPrimaryStatus;

const STATUS_TABS: { key: StatusFilterOption; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "MATCHED", label: "Matched" },
  { key: "MISMATCHED", label: "Mismatched" },
  { key: "MISSING_IN_DESTINATION", label: "Missing" },
  { key: "UNEXPECTED_IN_DESTINATION", label: "Unexpected" },
  { key: "DUPLICATE", label: "Duplicate" },
  { key: "INVALID", label: "Invalid" },
];

export const ResultsPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { settings, notify, bumpRefresh } = useWorkspace();

  const [session, setSession] = useState<ReconciliationSession | null>(null);
  const [records, setRecords] = useState<ReconciliationRecordResult[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [notFound, setNotFound] = useState<boolean>(false);

  const [statusFilter, setStatusFilter] = useState<StatusFilterOption>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"recordId" | "issueCount" | "primaryStatus">("recordId");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(settings.defaultPageSize || 25);

  const [selectedRecord, setSelectedRecord] =
    useState<ReconciliationRecordResult | null>(null);
  const [exporting, setExporting] = useState<boolean>(false);

  useEffect(() => {
    setPageSize(settings.defaultPageSize || 25);
  }, [settings.defaultPageSize]);

  useEffect(() => {
    if (!sessionId) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    setNotFound(false);

    Promise.all([
      workspaceRepo.getSession(sessionId),
      workspaceRepo.listSessionResults(sessionId, "ALL"),
    ])
      .then(([sess, recs]) => {
        if (!active) return;
        if (!sess) {
          setNotFound(true);
        } else {
          setSession(sess);
          setRecords(recs);
        }
      })
      .catch((err) => {
        if (!active) return;
        notify(
          "error",
          "Failed to load results",
          err instanceof Error ? err.message : "Storage error."
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [sessionId, notify]);

  const filteredRecords = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const list = records.filter((rec) => {
      if (statusFilter !== "ALL" && rec.primaryStatus !== statusFilter) {
        return false;
      }
      if (!q) return true;
      return (
        rec.recordId.toLowerCase().includes(q) ||
        rec.primaryStatus.toLowerCase().includes(q) ||
        rec.sourceSummary.toLowerCase().includes(q) ||
        rec.destinationSummary.toLowerCase().includes(q) ||
        rec.validationReasons.some((r) => r.toLowerCase().includes(q))
      );
    });

    return list.sort((a, b) => {
      let cmp = 0;
      if (sortBy === "issueCount") {
        cmp = a.issueCount - b.issueCount;
      } else if (sortBy === "primaryStatus") {
        cmp = a.primaryStatus.localeCompare(b.primaryStatus);
      } else {
        cmp = a.recordId.localeCompare(b.recordId, undefined, { numeric: true });
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [records, statusFilter, searchQuery, sortBy, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedRecords = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, safePage, pageSize]);

  // Chart 1: Validation distribution
  const validationDistributionData = useMemo(() => {
    if (!session) return [];
    return [
      { name: "Matched", value: session.matchedCount, color: "#6EDBA4" },
      { name: "Mismatched", value: session.mismatchedCount, color: "#FFC477" },
      { name: "Missing", value: session.missingCount, color: "#FF7E86" },
      { name: "Unexpected", value: session.unexpectedCount, color: "#73DDF5" },
      { name: "Duplicate", value: session.duplicateCount, color: "#9B8CFF" },
      { name: "Invalid", value: session.invalidCount, color: "#FF5C6C" },
    ].filter((d) => d.value > 0);
  }, [session]);

  // Chart 2: Record comparison (Source vs Destination)
  const recordComparisonData = useMemo(() => {
    if (!session) return [];
    return [
      {
        label: "Row Counts",
        Source: session.sourceRowCount,
        Destination: session.destinationRowCount,
      },
      {
        label: "Matched vs Missing",
        Source: session.matchedCount + session.missingCount,
        Destination: session.matchedCount + session.unexpectedCount,
      },
    ];
  }, [session]);

  // Chart 3: Issues by type
  const issuesByTypeData = useMemo(() => {
    const map = new Map<string, number>();
    for (const rec of records) {
      for (const t of rec.issueTypes) {
        map.set(t, (map.get(t) ?? 0) + 1);
      }
    }
    return Array.from(map.entries()).map(([issueType, count]) => ({
      issueType,
      count,
    }));
  }, [records]);

  // Chart 4: Mismatch fields
  const mismatchFieldsData = useMemo(() => {
    const map = new Map<string, number>();
    for (const rec of records) {
      for (const fc of rec.fieldComparisons) {
        if (!fc.matched) {
          map.set(fc.fieldLabel, (map.get(fc.fieldLabel) ?? 0) + 1);
        }
      }
    }
    return Array.from(map.entries()).map(([field, mismatches]) => ({
      field,
      mismatches,
    }));
  }, [records]);

  const handleExportComplete = async () => {
    if (!session || exporting) return;
    setExporting(true);
    try {
      const csv = await exportReconciliationReport({
        reportType: "complete",
        session,
        records,
      });
      downloadCsvContent(csv, `finsync-${session.id}-complete.csv`);
      await workspaceRepo.recordActivity(
        "REPORT_EXPORTED",
        `Exported complete report for "${session.name}"`,
        { projectId: session.projectId, sessionId: session.id }
      );
      bumpRefresh();
      notify("success", "Report Exported", "Downloaded complete reconciliation CSV.");
    } catch (err) {
      notify(
        "error",
        "Export Failed",
        err instanceof Error ? err.message : "Could not export report."
      );
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="glass-level-1 h-32 animate-pulse rounded-3xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="glass-level-2 h-28 animate-pulse rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (notFound || !session) {
    return (
      <GlassPanel level={1} className="p-10 text-center space-y-4">
        <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
          Reconciliation Session Not Found
        </h2>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          This session may have been cleared from your browser&apos;s local IndexedDB storage.
        </p>
        <div className="flex justify-center gap-3">
          <Link to="/app/history">
            <GlassButton variant="secondary">Back to History</GlassButton>
          </Link>
          <Link to="/app/reconcile/new">
            <GlassButton variant="primary">New Reconciliation</GlassButton>
          </Link>
        </div>
      </GlassPanel>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to="/app/history">
          <GlassButton
            variant="ghost"
            size="sm"
            leftIcon={<ArrowLeft className="h-4 w-4" aria-hidden="true" />}
          >
            Back to History
          </GlassButton>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <Link to="/app/reports">
            <GlassButton variant="secondary" size="sm">
              Report Center
            </GlassButton>
          </Link>
          <GlassButton
            variant="primary"
            size="sm"
            loading={exporting}
            leftIcon={<Download className="h-3.5 w-3.5" aria-hidden="true" />}
            onClick={() => void handleExportComplete()}
          >
            Export Complete CSV
          </GlassButton>
        </div>
      </div>

      {/* Top Session Summary Header */}
      <GlassPanel level={1} className="p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2
                className="text-xl sm:text-2xl font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                {session.name}
              </h2>
              <GlassStatusBadge
                label={session.overallValidationStatus ?? session.status}
              />
            </div>
            <p className="text-xs sm:text-sm" style={{ color: "var(--text-secondary)" }}>
              Project: <strong>{session.projectName}</strong> •{" "}
              {session.sourceSystem} → {session.destinationSystem}
            </p>
            {session.description && (
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                {session.description}
              </p>
            )}
          </div>

          <div
            className="flex flex-wrap md:flex-col items-end gap-1.5 text-xs tabular-nums"
            style={{ color: "var(--text-secondary)" }}
          >
            <div className="inline-flex items-center gap-1.5 font-semibold" style={{ color: "var(--accent-cyan)" }}>
              <Layers className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Match Rate: {session.matchPercentage.toFixed(2)}%</span>
            </div>
            <div className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Duration: {session.durationMs.toFixed(0)} ms</span>
            </div>
            <div>
              Issues Flagged: <strong>{session.totalIssues}</strong>
            </div>
          </div>
        </div>
      </GlassPanel>

      {/* 8 KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-8">
        <GlassStatCard
          label="Source"
          value={session.sourceRowCount}
          accentColor="var(--accent-blue)"
        />
        <GlassStatCard
          label="Destination"
          value={session.destinationRowCount}
          accentColor="var(--accent-cyan)"
        />
        <GlassStatCard
          label="Matched"
          value={session.matchedCount}
          accentColor="var(--status-success)"
        />
        <GlassStatCard
          label="Mismatched"
          value={session.mismatchedCount}
          accentColor="var(--status-warning)"
        />
        <GlassStatCard
          label="Missing"
          value={session.missingCount}
          accentColor="var(--status-error)"
        />
        <GlassStatCard
          label="Unexpected"
          value={session.unexpectedCount}
          accentColor="var(--accent-cyan)"
        />
        <GlassStatCard
          label="Duplicate"
          value={session.duplicateCount}
          accentColor="var(--accent-violet)"
        />
        <GlassStatCard
          label="Invalid"
          value={session.invalidCount}
          accentColor="var(--status-error)"
        />
      </div>

      {/* 4 Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <GlassCard level={2} padding="md" className="space-y-3">
          <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Validation Distribution
          </h3>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={validationDistributionData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={78}
                  paddingAngle={3}
                >
                  {validationDistributionData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#101A33",
                    borderColor: "rgba(255,255,255,0.15)",
                    borderRadius: "12px",
                    color: "#F5F7FF",
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard level={2} padding="md" className="space-y-3">
          <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Record Comparison (Source vs. Destination)
          </h3>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={recordComparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="label" stroke="#78849F" fontSize={12} />
                <YAxis stroke="#78849F" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#101A33",
                    borderColor: "rgba(255,255,255,0.15)",
                    borderRadius: "12px",
                    color: "#F5F7FF",
                  }}
                />
                <Legend />
                <Bar dataKey="Source" fill="#638BFF" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Destination" fill="#73DDF5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard level={2} padding="md" className="space-y-3">
          <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Issues by Type
          </h3>
          <div className="h-60 w-full">
            {issuesByTypeData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-xs" style={{ color: "var(--text-muted)" }}>
                No issues detected in this session.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={issuesByTypeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="issueType" stroke="#78849F" fontSize={11} />
                  <YAxis stroke="#78849F" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#101A33",
                      borderColor: "rgba(255,255,255,0.15)",
                      borderRadius: "12px",
                      color: "#F5F7FF",
                    }}
                  />
                  <Bar dataKey="count" name="Occurrences" fill="#FFC477" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </GlassCard>

        <GlassCard level={2} padding="md" className="space-y-3">
          <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Mismatch Fields
          </h3>
          <div className="h-60 w-full">
            {mismatchFieldsData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-xs" style={{ color: "var(--text-muted)" }}>
                No field mismatches recorded.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mismatchFieldsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="field" stroke="#78849F" fontSize={11} />
                  <YAxis stroke="#78849F" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#101A33",
                      borderColor: "rgba(255,255,255,0.15)",
                      borderRadius: "12px",
                      color: "#F5F7FF",
                    }}
                  />
                  <Bar dataKey="mismatches" name="Mismatched Fields" fill="#FF7E86" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </GlassCard>
      </div>

      {/* Status Filter Pills + Search + Sort */}
      <GlassCard level={2} padding="md" className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {STATUS_TABS.map((tab) => (
            <GlassButton
              key={tab.key}
              size="sm"
              variant={statusFilter === tab.key ? "primary" : "secondary"}
              onClick={() => {
                setStatusFilter(tab.key);
                setPage(1);
              }}
            >
              {tab.label}
            </GlassButton>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
          <div className="sm:col-span-6">
            <GlassInput
              placeholder="Search Record ID, summary, or validation reason..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              leftIcon={<Search className="h-4 w-4" aria-hidden="true" />}
            />
          </div>

          <div className="sm:col-span-3">
            <GlassSelect
              aria-label="Sort records"
              value={`${sortBy}:${sortDir}`}
              onChange={(e) => {
                const [field, dir] = e.target.value.split(":");
                setSortBy(field as "recordId" | "issueCount" | "primaryStatus");
                setSortDir((dir as "asc" | "desc") || "asc");
              }}
              options={[
                { value: "recordId:asc", label: "Record ID (Asc)" },
                { value: "recordId:desc", label: "Record ID (Desc)" },
                { value: "issueCount:desc", label: "Most Issues First" },
                { value: "primaryStatus:asc", label: "Status (A–Z)" },
              ]}
            />
          </div>

          <div className="sm:col-span-3">
            <GlassSelect
              aria-label="Rows per page"
              value={String(pageSize)}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              options={[
                { value: "10", label: "10 rows / page" },
                { value: "25", label: "25 rows / page" },
                { value: "50", label: "50 rows / page" },
                { value: "100", label: "100 rows / page" },
              ]}
            />
          </div>
        </div>
      </GlassCard>

      {/* Detailed Record Table */}
      <GlassPanel level={2} className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr
                className="border-b text-xs uppercase"
                style={{
                  borderColor: "var(--glass-2-border)",
                  color: "var(--text-muted)",
                  backgroundColor: "rgba(255,255,255,0.03)",
                }}
              >
                <th className="px-4 py-3">Record ID</th>
                <th className="px-4 py-3">Primary Status</th>
                <th className="px-4 py-3 text-right">Issues</th>
                <th className="px-4 py-3">Source Summary</th>
                <th className="px-4 py-3">Destination Summary</th>
                <th className="px-4 py-3">Issue Types</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody
              className="divide-y"
              style={{ borderColor: "var(--glass-2-border)" }}
            >
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-sm"
                    style={{ color: "var(--text-muted)" }}
                  >
                    No records match the current filter or search criteria.
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((rec) => (
                  <tr
                    key={rec.id}
                    onClick={() => setSelectedRecord(rec)}
                    className="cursor-pointer hover:bg-white/[0.04] transition-colors"
                  >
                    <td
                      className="px-4 py-3 font-mono font-semibold whitespace-nowrap"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {rec.recordId || "(empty)"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <GlassStatusBadge label={rec.primaryStatus} />
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums font-semibold">
                      {rec.issueCount}
                    </td>
                    <td
                      className="px-4 py-3 max-w-[220px] truncate font-mono text-xs"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {rec.sourceSummary || "—"}
                    </td>
                    <td
                      className="px-4 py-3 max-w-[220px] truncate font-mono text-xs"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {rec.destinationSummary || "—"}
                    </td>
                    <td className="px-4 py-3 text-xs font-mono">
                      {rec.issueTypes.length > 0
                        ? rec.issueTypes.join(", ")
                        : "—"}
                    </td>
                    <td
                      className="px-4 py-3 text-right whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <GlassButton
                        size="sm"
                        variant="ghost"
                        leftIcon={
                          <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                        }
                        onClick={() => setSelectedRecord(rec)}
                      >
                        Inspect
                      </GlassButton>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div
          className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t text-xs tabular-nums"
          style={{
            borderColor: "var(--glass-2-border)",
            color: "var(--text-secondary)",
          }}
        >
          <span>
            Showing {paginatedRecords.length} of {filteredRecords.length}{" "}
            records (Page {safePage} of {totalPages})
          </span>
          <div className="flex items-center gap-2">
            <GlassButton
              size="sm"
              variant="secondary"
              disabled={safePage <= 1}
              leftIcon={
                <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
              }
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </GlassButton>
            <GlassButton
              size="sm"
              variant="secondary"
              disabled={safePage >= totalPages}
              rightIcon={
                <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
              }
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </GlassButton>
          </div>
        </div>
      </GlassPanel>

      {/* Record Inspection Drawer */}
      <RecordInspectionDrawer
        record={selectedRecord}
        onClose={() => setSelectedRecord(null)}
      />
    </div>
  );
};
