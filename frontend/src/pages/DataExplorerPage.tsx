import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Database,
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";
import { workspaceRepo } from "../db/dexieRepository";
import { useWorkspace } from "../context/WorkspaceContext";
import { ReconciliationSession } from "../types/reconciliation";
import { DatasetPreview, DatasetSide } from "../types/dataset";
import { GlassPanel } from "../components/glass/GlassPanel";
import { GlassCard } from "../components/glass/GlassCard";
import { GlassSelect } from "../components/glass/GlassSelect";
import { GlassInput } from "../components/glass/GlassInput";
import { GlassButton } from "../components/glass/GlassButton";
import { GlassStatusBadge } from "../components/glass/GlassStatusBadge";

export const DataExplorerPage: React.FC = () => {
  const { settings, notify, refreshCounter } = useWorkspace();

  const [sessions, setSessions] = useState<ReconciliationSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  const [activeSide, setActiveSide] = useState<DatasetSide>("source");
  const [preview, setPreview] = useState<DatasetPreview | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortColumn, setSortColumn] = useState<string>("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(settings.defaultPageSize || 25);

  useEffect(() => {
    setPageSize(settings.defaultPageSize || 25);
  }, [settings.defaultPageSize]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    workspaceRepo
      .listSessions()
      .then((list) => {
        if (!active) return;
        setSessions(list);
        if (list.length > 0) {
          setSelectedSessionId((prev) => prev || list[0].id);
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
      setPreview(null);
      return;
    }
    let active = true;
    setLoading(true);
    workspaceRepo
      .getDatasetPreview(selectedSessionId, activeSide)
      .then((data) => {
        if (!active) return;
        setPreview(data ?? null);
        setSortColumn("");
        setPage(1);
      })
      .catch((err) => {
        if (!active) return;
        notify(
          "error",
          "Failed to load dataset preview",
          err instanceof Error ? err.message : "Storage error."
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [selectedSessionId, activeSide, refreshCounter, notify]);

  const filteredRows = useMemo(() => {
    if (!preview) return [];
    const q = searchQuery.trim().toLowerCase();
    let rows = preview.sampleRows;

    if (q) {
      rows = rows.filter((row) =>
        preview.headers.some((h) =>
          String(row[h] ?? "")
            .toLowerCase()
            .includes(q)
        )
      );
    }

    if (sortColumn) {
      rows = [...rows].sort((a, b) => {
        const av = String(a[sortColumn] ?? "");
        const bv = String(b[sortColumn] ?? "");
        const cmp = av.localeCompare(bv, undefined, { numeric: true });
        return sortDir === "asc" ? cmp : -cmp;
      });
    }

    return rows;
  }, [preview, searchQuery, sortColumn, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedRows = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, safePage, pageSize]);

  const handleToggleSort = (col: string) => {
    if (sortColumn === col) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(col);
      setSortDir("asc");
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
            Data Explorer
          </h2>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Inspect read-only source and destination dataset rows, missing counts, and column profiles stored locally.
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
              backgroundColor: "rgba(115, 221, 245, 0.14)",
              color: "var(--accent-cyan)",
            }}
          >
            <Database className="h-6 w-6" aria-hidden="true" />
          </div>
          <h3
            className="text-lg font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            No dataset previews available
          </h3>
          <p
            className="mx-auto max-w-md text-sm"
            style={{ color: "var(--text-secondary)" }}
          >
            Upload CSV files in a reconciliation session to inspect their structure, row values, and column statistics here.
          </p>
          <Link to="/app/reconcile/new">
            <GlassButton variant="primary">Start Reconciliation</GlassButton>
          </Link>
        </GlassPanel>
      ) : (
        <>
          {/* Session Selector & Dataset Side Tabs */}
          <GlassCard level={2} padding="md" className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:items-end">
              <div className="md:col-span-7">
                <GlassSelect
                  label="Reconciliation Session"
                  value={selectedSessionId}
                  onChange={(e) => setSelectedSessionId(e.target.value)}
                  options={sessions.map((s) => ({
                    value: s.id,
                    label: `${s.name} (${s.sourceSystem} → ${s.destinationSystem})`,
                  }))}
                />
              </div>

              <div className="md:col-span-5 flex items-center gap-2">
                <GlassButton
                  variant={activeSide === "source" ? "primary" : "secondary"}
                  className="flex-1"
                  onClick={() => setActiveSide("source")}
                >
                  Source Dataset
                </GlassButton>
                <GlassButton
                  variant={activeSide === "destination" ? "primary" : "secondary"}
                  className="flex-1"
                  onClick={() => setActiveSide("destination")}
                >
                  Destination Dataset
                </GlassButton>
              </div>
            </div>

            {preview && (
              <div
                className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t text-xs tabular-nums"
                style={{
                  borderColor: "var(--glass-2-border)",
                  color: "var(--text-secondary)",
                }}
              >
                <div>
                  <strong style={{ color: "var(--text-primary)" }}>
                    File:
                  </strong>{" "}
                  <span className="font-mono">{preview.fileName}</span>
                </div>
                <div>
                  <strong style={{ color: "var(--text-primary)" }}>
                    Total Rows:
                  </strong>{" "}
                  {preview.rowCount.toLocaleString()} (showing{" "}
                  {preview.sampleRows.length} cached sample rows)
                </div>
                <div>
                  <strong style={{ color: "var(--text-primary)" }}>
                    Columns:
                  </strong>{" "}
                  {preview.headers.length}
                </div>
              </div>
            )}
          </GlassCard>

          {preview ? (
            <>
              {/* Column Information & Missing Value Stats */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                {preview.columnStats.map((col) => (
                  <GlassCard key={col.column} level={2} padding="sm" className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className="text-xs font-mono font-semibold truncate"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {col.column}
                      </span>
                      <GlassStatusBadge
                        label={col.inferredType}
                        tone="info"
                        icon="none"
                      />
                    </div>
                    <div
                      className="text-[11px] tabular-nums"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Missing:{" "}
                      <strong
                        style={{
                          color:
                            col.missingCount > 0
                              ? "var(--status-warning)"
                              : "var(--status-success)",
                        }}
                      >
                        {col.missingCount}
                      </strong>{" "}
                      • Distinct: {col.uniqueCount}
                    </div>
                  </GlassCard>
                ))}
              </div>

              {/* Search & Filter Row */}
              <GlassCard level={2} padding="sm">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
                  <div className="sm:col-span-9">
                    <GlassInput
                      placeholder="Search across all columns in this dataset..."
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
                      ]}
                    />
                  </div>
                </div>
              </GlassCard>

              {/* Read-Only Row Table */}
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
                        <th className="px-3 py-3 w-12">#</th>
                        {preview.headers.map((h) => (
                          <th key={h} className="px-4 py-3 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleToggleSort(h)}
                              className="inline-flex items-center gap-1 font-mono hover:opacity-90"
                              style={{
                                color:
                                  sortColumn === h
                                    ? "var(--accent-cyan)"
                                    : "var(--text-muted)",
                              }}
                            >
                              <span>{h}</span>
                              <ArrowUpDown
                                className="h-3.5 w-3.5 opacity-60"
                                aria-hidden="true"
                              />
                            </button>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody
                      className="divide-y"
                      style={{ borderColor: "var(--glass-2-border)" }}
                    >
                      {paginatedRows.map((row, rIdx) => (
                        <tr key={rIdx}>
                          <td
                            className="px-3 py-2.5 text-xs tabular-nums"
                            style={{ color: "var(--text-muted)" }}
                          >
                            {(safePage - 1) * pageSize + rIdx + 1}
                          </td>
                          {preview.headers.map((h) => (
                            <td
                              key={h}
                              className="px-4 py-2.5 font-mono whitespace-nowrap"
                              style={{ color: "var(--text-primary)" }}
                            >
                              {row[h] ?? ""}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Bar */}
                <div
                  className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t text-xs tabular-nums"
                  style={{
                    borderColor: "var(--glass-2-border)",
                    color: "var(--text-secondary)",
                  }}
                >
                  <span>
                    Showing {paginatedRows.length} of {filteredRows.length}{" "}
                    rows (Page {safePage} of {totalPages})
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
                        <ChevronRight
                          className="h-3.5 w-3.5"
                          aria-hidden="true"
                        />
                      }
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                    >
                      Next
                    </GlassButton>
                  </div>
                </div>
              </GlassPanel>
            </>
          ) : (
            <GlassPanel level={1} className="p-8 text-center text-sm">
              No {activeSide} preview cached for this session.
            </GlassPanel>
          )}
        </>
      )}
    </div>
  );
};
