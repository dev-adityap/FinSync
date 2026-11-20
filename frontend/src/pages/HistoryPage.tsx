import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  History,
  Search,
  Trash2,
  ArrowUpRight,
  Plus,
} from "lucide-react";
import { workspaceRepo } from "../db/dexieRepository";
import { useWorkspace } from "../context/WorkspaceContext";
import { ReconciliationSession } from "../types/reconciliation";
import { GlassPanel } from "../components/glass/GlassPanel";
import { GlassCard } from "../components/glass/GlassCard";
import { GlassInput } from "../components/glass/GlassInput";
import { GlassSelect } from "../components/glass/GlassSelect";
import { GlassButton } from "../components/glass/GlassButton";
import { GlassStatusBadge } from "../components/glass/GlassStatusBadge";
import { GlassModal } from "../components/glass/GlassModal";

export const HistoryPage: React.FC = () => {
  const { notify, refreshCounter, bumpRefresh } = useWorkspace();

  const [sessions, setSessions] = useState<ReconciliationSession[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "matchDesc" | "recordsDesc">("newest");

  const [sessionToDelete, setSessionToDelete] =
    useState<ReconciliationSession | null>(null);
  const [clearAllOpen, setClearAllOpen] = useState<boolean>(false);
  const [busyDelete, setBusyDelete] = useState<boolean>(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    workspaceRepo
      .listSessions()
      .then((list) => {
        if (active) setSessions(list);
      })
      .catch((err) => {
        if (!active) return;
        notify(
          "error",
          "Failed to load history",
          err instanceof Error ? err.message : "IndexedDB read error."
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [refreshCounter, notify]);

  const filteredSessions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const list = sessions.filter((s) => {
      const effectiveStatus = s.overallValidationStatus ?? s.status;
      if (statusFilter !== "ALL" && effectiveStatus !== statusFilter) {
        return false;
      }

      if (dateFrom) {
        const fromTs = new Date(`${dateFrom}T00:00:00`).getTime();
        if (new Date(s.createdAt).getTime() < fromTs) return false;
      }

      if (dateTo) {
        const toTs = new Date(`${dateTo}T23:59:59.999`).getTime();
        if (new Date(s.createdAt).getTime() > toTs) return false;
      }

      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        s.projectName.toLowerCase().includes(q) ||
        s.sourceSystem.toLowerCase().includes(q) ||
        s.destinationSystem.toLowerCase().includes(q)
      );
    });

    return list.sort((a, b) => {
      if (sortBy === "oldest") return a.createdAt.localeCompare(b.createdAt);
      if (sortBy === "matchDesc") return b.matchPercentage - a.matchPercentage;
      if (sortBy === "recordsDesc") return b.sourceRowCount - a.sourceRowCount;
      return b.createdAt.localeCompare(a.createdAt);
    });
  }, [sessions, searchQuery, statusFilter, dateFrom, dateTo, sortBy]);

  const handleDeleteSingle = async () => {
    if (!sessionToDelete) return;
    setBusyDelete(true);
    try {
      await workspaceRepo.deleteSession(sessionToDelete.id);
      notify(
        "info",
        "Session Deleted",
        `Removed "${sessionToDelete.name}" from local history.`
      );
      setSessionToDelete(null);
      bumpRefresh();
    } catch (err) {
      notify(
        "error",
        "Delete Failed",
        err instanceof Error ? err.message : "Could not delete session."
      );
    } finally {
      setBusyDelete(false);
    }
  };

  const handleClearAllHistory = async () => {
    setBusyDelete(true);
    try {
      await workspaceRepo.clearAllSessions();
      notify(
        "info",
        "History Cleared",
        "All locally stored reconciliation sessions and results were cleared."
      );
      setClearAllOpen(false);
      bumpRefresh();
    } catch (err) {
      notify(
        "error",
        "Clear Failed",
        err instanceof Error ? err.message : "Could not clear history."
      );
    } finally {
      setBusyDelete(false);
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
            Reconciliation History
          </h2>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Browse, filter, and revisit sessions saved in your browser&apos;s IndexedDB workspace across reloads.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {sessions.length > 0 && (
            <GlassButton
              variant="danger"
              leftIcon={<Trash2 className="h-4 w-4" aria-hidden="true" />}
              onClick={() => setClearAllOpen(true)}
            >
              Clear History
            </GlassButton>
          )}
          <Link to="/app/reconcile/new">
            <GlassButton
              variant="primary"
              leftIcon={<Plus className="h-4 w-4" aria-hidden="true" />}
            >
              New Reconciliation
            </GlassButton>
          </Link>
        </div>
      </div>

      {/* Filters Toolbar */}
      <GlassCard level={2} padding="md" className="space-y-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
          <div className="md:col-span-5">
            <GlassInput
              placeholder="Search session, project, or system..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="h-4 w-4" aria-hidden="true" />}
            />
          </div>

          <div className="md:col-span-3">
            <GlassSelect
              aria-label="Filter by status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: "ALL", label: "All Statuses" },
                { value: "PASSED", label: "Passed" },
                { value: "PASSED_WITH_WARNINGS", label: "Passed with Warnings" },
                { value: "FAILED", label: "Failed" },
              ]}
            />
          </div>

          <div className="md:col-span-4">
            <GlassSelect
              aria-label="Sort sessions"
              value={sortBy}
              onChange={(e) =>
                setSortBy(
                  e.target.value as
                    | "newest"
                    | "oldest"
                    | "matchDesc"
                    | "recordsDesc"
                )
              }
              options={[
                { value: "newest", label: "Sort: Newest First" },
                { value: "oldest", label: "Sort: Oldest First" },
                { value: "matchDesc", label: "Sort: Highest Match %" },
                { value: "recordsDesc", label: "Sort: Most Records" },
              ]}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <GlassInput
            label="From Date"
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
          <GlassInput
            label="To Date"
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>
      </GlassCard>

      {/* Sessions Table or Empty State */}
      {!loading && filteredSessions.length === 0 ? (
        <GlassPanel level={1} className="p-10 text-center space-y-4">
          <div
            className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl"
            style={{
              backgroundColor: "rgba(99, 139, 255, 0.16)",
              color: "var(--accent-blue)",
            }}
          >
            <History className="h-6 w-6" aria-hidden="true" />
          </div>
          <h3
            className="text-lg font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            {sessions.length === 0
              ? "No reconciliation history yet"
              : "No sessions match your active filters"}
          </h3>
          <p
            className="mx-auto max-w-md text-sm"
            style={{ color: "var(--text-secondary)" }}
          >
            {sessions.length === 0
              ? "Run a reconciliation session to save its summary, KPIs, and record-level audit results here."
              : "Adjust your search query, status filter, or date range to see matching sessions."}
          </p>
          <Link to="/app/reconcile/new">
            <GlassButton variant="primary">Start Reconciliation</GlassButton>
          </Link>
        </GlassPanel>
      ) : (
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
                  <th className="px-4 py-3">Session</th>
                  <th className="px-4 py-3">Project</th>
                  <th className="px-4 py-3">Source → Dest</th>
                  <th className="px-4 py-3 text-right">Records</th>
                  <th className="px-4 py-3 text-right">Match %</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Completed</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody
                className="divide-y"
                style={{ borderColor: "var(--glass-2-border)" }}
              >
                {filteredSessions.map((s) => (
                  <tr key={s.id}>
                    <td
                      className="px-4 py-3 font-semibold whitespace-nowrap"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {s.name}
                    </td>
                    <td
                      className="px-4 py-3 whitespace-nowrap"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {s.projectName}
                    </td>
                    <td
                      className="px-4 py-3 whitespace-nowrap"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {s.sourceSystem} → {s.destinationSystem}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {s.sourceRowCount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums font-semibold">
                      {s.matchPercentage.toFixed(1)}%
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <GlassStatusBadge
                        label={s.overallValidationStatus ?? s.status}
                      />
                    </td>
                    <td
                      className="px-4 py-3 whitespace-nowrap text-xs tabular-nums"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {new Date(s.createdAt).toLocaleString()}
                    </td>
                    <td
                      className="px-4 py-3 whitespace-nowrap text-xs tabular-nums"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {s.completedAt
                        ? new Date(s.completedAt).toLocaleString()
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <Link to={`/app/reconcile/${s.id}`}>
                          <GlassButton
                            size="sm"
                            variant="secondary"
                            rightIcon={
                              <ArrowUpRight
                                className="h-3.5 w-3.5"
                                aria-hidden="true"
                              />
                            }
                          >
                            View
                          </GlassButton>
                        </Link>
                        <GlassButton
                          size="sm"
                          variant="ghost"
                          aria-label={`Delete ${s.name}`}
                          onClick={() => setSessionToDelete(s)}
                        >
                          <Trash2
                            className="h-4 w-4"
                            style={{ color: "var(--status-error)" }}
                            aria-hidden="true"
                          />
                        </GlassButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassPanel>
      )}

      {/* Single Session Delete Confirmation */}
      <GlassModal
        open={Boolean(sessionToDelete)}
        onClose={() => setSessionToDelete(null)}
        title="Delete Session?"
        description="This removes the selected session, its record-level results, and cached dataset previews from IndexedDB."
        size="sm"
        footer={
          <>
            <GlassButton
              variant="ghost"
              onClick={() => setSessionToDelete(null)}
            >
              Cancel
            </GlassButton>
            <GlassButton
              variant="danger"
              loading={busyDelete}
              onClick={() => void handleDeleteSingle()}
            >
              Delete Session
            </GlassButton>
          </>
        }
      >
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Delete{" "}
          <strong style={{ color: "var(--text-primary)" }}>
            {sessionToDelete?.name}
          </strong>
          ?
        </p>
      </GlassModal>

      {/* Clear All History Confirmation */}
      <GlassModal
        open={clearAllOpen}
        onClose={() => setClearAllOpen(false)}
        title="Clear All Reconciliation History?"
        description="This permanently deletes all saved sessions, reconciliation results, and dataset previews in this browser."
        size="sm"
        footer={
          <>
            <GlassButton variant="ghost" onClick={() => setClearAllOpen(false)}>
              Cancel
            </GlassButton>
            <GlassButton
              variant="danger"
              loading={busyDelete}
              onClick={() => void handleClearAllHistory()}
            >
              Clear All History
            </GlassButton>
          </>
        }
      >
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Are you sure you want to clear all{" "}
          <strong style={{ color: "var(--text-primary)" }}>
            {sessions.length}
          </strong>{" "}
          stored sessions?
        </p>
      </GlassModal>
    </div>
  );
};
