import React from "react";
import { clsx } from "clsx";
import { CheckCircle2, AlertTriangle, FileSpreadsheet } from "lucide-react";
import { ReconciliationRecordResult } from "../../types/reconciliation";
import { GlassDrawer } from "../glass/GlassDrawer";
import { GlassStatusBadge } from "../glass/GlassStatusBadge";
import { GlassCard } from "../glass/GlassCard";
import { GlassButton } from "../glass/GlassButton";

interface RecordInspectionDrawerProps {
  record: ReconciliationRecordResult | null;
  onClose: () => void;
}

export const RecordInspectionDrawer: React.FC<RecordInspectionDrawerProps> = ({
  record,
  onClose,
}) => {
  return (
    <GlassDrawer
      open={Boolean(record)}
      onClose={onClose}
      title={record ? `Record ID: ${record.recordId}` : "Record Inspection"}
      subtitle={
        record
          ? `${record.issueCount} ${
              record.issueCount === 1 ? "issue" : "issues"
            } detected • Primary Status: ${record.primaryStatus}`
          : undefined
      }
      widthClass="w-full sm:max-w-2xl"
      footer={
        <GlassButton variant="primary" onClick={onClose}>
          Close Drawer
        </GlassButton>
      }
    >
      {record && (
        <div className="space-y-5">
          {/* Primary Status & Issue Types */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <GlassStatusBadge label={record.primaryStatus} />
            <div className="flex flex-wrap gap-1.5">
              {record.issueTypes.length > 0 ? (
                record.issueTypes.map((issueType) => (
                  <span
                    key={issueType}
                    className="rounded-md border px-2 py-0.5 text-[11px] font-mono"
                    style={{
                      borderColor: "rgba(255, 196, 119, 0.35)",
                      backgroundColor: "rgba(255, 196, 119, 0.1)",
                      color: "var(--status-warning)",
                    }}
                  >
                    {issueType}
                  </span>
                ))
              ) : (
                <span
                  className="inline-flex items-center gap-1 text-xs"
                  style={{ color: "var(--status-success)" }}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                  No issues flagged
                </span>
              )}
            </div>
          </div>

          {/* Validation Reasons */}
          {record.validationReasons.length > 0 && (
            <GlassCard
              level={2}
              padding="sm"
              className="space-y-1.5 border-[var(--status-warning)]/40"
            >
              <div
                className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider"
                style={{ color: "var(--status-warning)" }}
              >
                <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Validation &amp; Discrepancy Reasons</span>
              </div>
              <ul
                className="list-disc pl-5 space-y-1 text-xs"
                style={{ color: "var(--text-primary)" }}
              >
                {record.validationReasons.map((reason, idx) => (
                  <li key={idx}>{reason}</li>
                ))}
              </ul>
            </GlassCard>
          )}

          {/* Field-by-Field Comparison */}
          <div className="space-y-2.5">
            <h3
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: "var(--text-secondary)" }}
            >
              Field-by-Field Comparison
            </h3>

            {record.fieldComparisons.length === 0 ? (
              <GlassCard level={2} padding="sm">
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  No mapped field comparisons available for this record (e.g., missing or unexpected record).
                </p>
              </GlassCard>
            ) : (
              <div className="space-y-2.5">
                {record.fieldComparisons.map((fc, idx) => (
                  <GlassCard
                    key={`${fc.fieldLabel}-${idx}`}
                    level={2}
                    padding="sm"
                    className={clsx(
                      "space-y-2",
                      !fc.matched && "border-[var(--status-warning)]/50"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-mono text-xs sm:text-sm font-semibold">
                        {fc.fieldLabel}{" "}
                        <span
                          className="text-[11px] font-normal"
                          style={{ color: "var(--text-muted)" }}
                        >
                          ({fc.sourceColumn} → {fc.destinationColumn})
                        </span>
                      </div>

                      <GlassStatusBadge
                        label={fc.matched ? "MATCH" : "DIFF"}
                        tone={fc.matched ? "success" : "warning"}
                        icon="none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs tabular-nums">
                      <div
                        className="rounded-lg p-2.5 border"
                        style={{
                          borderColor: "var(--glass-2-border)",
                          backgroundColor: "rgba(255,255,255,0.02)",
                        }}
                      >
                        <div
                          className="text-[10px] uppercase tracking-wider"
                          style={{ color: "var(--text-muted)" }}
                        >
                          Source Raw
                        </div>
                        <div
                          className="mt-0.5 font-mono break-all"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {fc.sourceRaw ?? "—"}
                        </div>
                        {fc.sourceNormalized !== null &&
                          fc.sourceNormalized !== fc.sourceRaw && (
                            <div
                              className="mt-1 text-[11px] font-mono"
                              style={{ color: "var(--accent-cyan)" }}
                            >
                              Norm: {fc.sourceNormalized}
                            </div>
                          )}
                      </div>

                      <div
                        className="rounded-lg p-2.5 border"
                        style={{
                          borderColor: "var(--glass-2-border)",
                          backgroundColor: "rgba(255,255,255,0.02)",
                        }}
                      >
                        <div
                          className="text-[10px] uppercase tracking-wider"
                          style={{ color: "var(--text-muted)" }}
                        >
                          Destination Raw
                        </div>
                        <div
                          className="mt-0.5 font-mono break-all"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {fc.destinationRaw ?? "—"}
                        </div>
                        {fc.destinationNormalized !== null &&
                          fc.destinationNormalized !== fc.destinationRaw && (
                            <div
                              className="mt-1 text-[11px] font-mono"
                              style={{ color: "var(--accent-cyan)" }}
                            >
                              Norm: {fc.destinationNormalized}
                            </div>
                          )}
                      </div>
                    </div>

                    {fc.difference !== null && fc.difference !== "" && (
                      <div
                        className="text-xs font-mono font-semibold tabular-nums"
                        style={{ color: "var(--status-warning)" }}
                      >
                        Difference: {fc.difference}
                      </div>
                    )}

                    {fc.issues.length > 0 && (
                      <ul
                        className="text-xs space-y-0.5"
                        style={{ color: "var(--status-error)" }}
                      >
                        {fc.issues.map((iss, i) => (
                          <li key={i}>• {iss}</li>
                        ))}
                      </ul>
                    )}
                  </GlassCard>
                ))}
              </div>
            )}
          </div>

          {/* Raw Source & Destination Payloads */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <GlassCard level={2} padding="sm" className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
                <FileSpreadsheet className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Source Values</span>
              </div>
              <pre
                className="overflow-x-auto rounded-lg p-2.5 text-[11px] font-mono"
                style={{
                  backgroundColor: "rgba(0,0,0,0.25)",
                  color: "var(--text-primary)",
                }}
              >
                {JSON.stringify(record.sourceValues, null, 2)}
              </pre>
            </GlassCard>

            <GlassCard level={2} padding="sm" className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
                <FileSpreadsheet className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Destination Values</span>
              </div>
              <pre
                className="overflow-x-auto rounded-lg p-2.5 text-[11px] font-mono"
                style={{
                  backgroundColor: "rgba(0,0,0,0.25)",
                  color: "var(--text-primary)",
                }}
              >
                {JSON.stringify(record.destinationValues, null, 2)}
              </pre>
            </GlassCard>
          </div>
        </div>
      )}
    </GlassDrawer>
  );
};