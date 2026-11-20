import React from "react";
import { clsx } from "clsx";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { GlassPanel } from "./GlassPanel";

export interface GlassTableColumn<T> {
  key: string;
  header: string;
  sortKey?: string;
  align?: "left" | "right" | "center";
  tabular?: boolean;
  className?: string;
  render: (row: T) => React.ReactNode;
}

interface GlassTableProps<T> {
  columns: GlassTableColumn<T>[];
  data: T[];
  getRowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  onSort?: (sortKey: string) => void;
  emptyState?: React.ReactNode;
  loading?: boolean;
}

export function GlassTable<T>({
  columns,
  data,
  getRowKey,
  onRowClick,
  sortBy,
  sortDirection,
  onSort,
  emptyState,
  loading = false,
}: GlassTableProps<T>) {
  if (loading) {
    return (
      <GlassPanel level={2} className="p-6 space-y-3">
        {[0, 1, 2, 3, 4].map((idx) => (
          <div
            key={idx}
            className="h-10 w-full animate-pulse rounded-lg bg-white/[0.06]"
          />
        ))}
      </GlassPanel>
    );
  }

  if (data.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <GlassPanel level={2} className="w-full overflow-hidden">
      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr
              className="border-b text-xs font-medium uppercase tracking-wider"
              style={{
                borderColor: "var(--glass-2-border)",
                color: "var(--text-muted)",
                backgroundColor: "rgba(255, 255, 255, 0.02)",
              }}
            >
              {columns.map((col) => {
                const isSorted = col.sortKey && sortBy === col.sortKey;
                const canSort = Boolean(col.sortKey && onSort);

                return (
                  <th
                    key={col.key}
                    className={clsx(
                      "px-4 py-3 whitespace-nowrap",
                      col.align === "right" && "text-right",
                      col.align === "center" && "text-center",
                      col.className
                    )}
                  >
                    {canSort && col.sortKey ? (
                      <button
                        type="button"
                        onClick={() => onSort?.(col.sortKey!)}
                        className={clsx(
                          "inline-flex items-center gap-1 hover:opacity-90 transition-opacity",
                          col.align === "right" && "ml-auto"
                        )}
                        style={{
                          color: isSorted
                            ? "var(--accent-cyan)"
                            : "var(--text-muted)",
                        }}
                      >
                        <span>{col.header}</span>
                        {isSorted ? (
                          sortDirection === "asc" ? (
                            <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
                          ) : (
                            <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
                          )
                        ) : (
                          <ArrowUpDown className="h-3.5 w-3.5 opacity-60" aria-hidden="true" />
                        )}
                      </button>
                    ) : (
                      <span>{col.header}</span>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody
            className="divide-y"
            style={{ borderColor: "var(--glass-2-border)" }}
          >
            {data.map((row) => (
              <tr
                key={getRowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={clsx(
                  "transition-colors",
                  onRowClick && "cursor-pointer hover:bg-white/[0.05]"
                )}
                style={{ color: "var(--text-primary)" }}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={clsx(
                      "px-4 py-3.5 align-middle",
                      col.align === "right" && "text-right",
                      col.align === "center" && "text-center",
                      col.tabular && "tabular-nums",
                      col.className
                    )}
                  >
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassPanel>
  );
}