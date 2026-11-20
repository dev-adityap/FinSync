import { apiClient, extractApiErrorMessage } from "./apiClient";
import {
  ReconciliationRecordResult,
  ReconciliationSession,
} from "../types/reconciliation";
import { ReportType } from "../types/report";

const FORMULA_PREFIX_RE = /^[=+\-@\t\r]/;

/**
 * Prevents spreadsheet formula injection (CSV/Excel DDE/formula execution)
 * when exporting values into CSV cells.
 */
export function sanitizeCsvCell(value: unknown): string {
  const raw = value === null || value === undefined ? "" : String(value);
  const safe = FORMULA_PREFIX_RE.test(raw) ? `'${raw}` : raw;
  const escapedQuotes = safe.replace(/"/g, '""');
  return `"${escapedQuotes}"`;
}

export function buildLocalReportCsv(
  reportType: ReportType,
  session: ReconciliationSession,
  records: ReconciliationRecordResult[]
): string {
  const filtered = records.filter((r: ReconciliationRecordResult) => {
    switch (reportType) {
      case "mismatches":
        return r.primaryStatus === "MISMATCHED";
      case "missing":
        return r.primaryStatus === "MISSING_IN_DESTINATION";
      case "unexpected":
        return r.primaryStatus === "UNEXPECTED_IN_DESTINATION";
      case "duplicates":
        return r.primaryStatus === "DUPLICATE";
      case "invalid":
        return r.primaryStatus === "INVALID";
      case "summary":
      case "complete":
      default:
        return true;
    }
  });

  if (reportType === "summary") {
    const rows = [
      ["Metric", "Value"],
      ["Session Name", session.name],
      ["Project", session.projectName],
      ["Source System", session.sourceSystem],
      ["Destination System", session.destinationSystem],
      ["Overall Status", session.overallValidationStatus ?? "N/A"],
      ["Match Percentage", `${session.matchPercentage.toFixed(2)}%`],
      ["Source Rows", String(session.sourceRowCount)],
      ["Destination Rows", String(session.destinationRowCount)],
      ["Matched Records", String(session.matchedCount)],
      ["Mismatched Records", String(session.mismatchedCount)],
      ["Missing Records", String(session.missingCount)],
      ["Unexpected Records", String(session.unexpectedCount)],
      ["Duplicate Records", String(session.duplicateCount)],
      ["Invalid Records", String(session.invalidCount)],
      ["Total Issues", String(session.totalIssues)],
    ];
    return rows.map((row) => row.map(sanitizeCsvCell).join(",")).join("\n");
  }

  const headers = [
    "Record ID",
    "Primary Status",
    "Issue Count",
    "Issue Types",
    "Source Summary",
    "Destination Summary",
    "Field Differences",
    "Validation Reasons",
  ];

  const lines = [headers.map(sanitizeCsvCell).join(",")];

  for (const rec of filtered) {
    const diffs = rec.fieldComparisons
      .filter((fc: ReconciliationRecordResult["fieldComparisons"][number]) => !fc.matched || fc.difference !== null)
      .map(
        (fc: ReconciliationRecordResult["fieldComparisons"][number]) =>
          `${fc.fieldLabel}: src=${fc.sourceRaw ?? ""} dst=${fc.destinationRaw ?? ""}${
            fc.difference ? ` diff=${fc.difference}` : ""
          }`
      )
      .join(" | ");

    const row = [
      rec.recordId,
      rec.primaryStatus,
      String(rec.issueCount),
      rec.issueTypes.join("; "),
      rec.sourceSummary,
      rec.destinationSummary,
      diffs,
      rec.validationReasons.join(" | "),
    ];
    lines.push(row.map(sanitizeCsvCell).join(","));
  }

  return lines.join("\n");
}

export async function exportReconciliationReport(params: {
  reportType: ReportType;
  session: ReconciliationSession;
  records: ReconciliationRecordResult[];
}): Promise<string> {
  const { reportType, session, records } = params;

  const backendRouteMap: Partial<Record<ReportType, string>> = {
    complete: "/reports/complete",
    mismatches: "/reports/mismatches",
    missing: "/reports/missing",
    duplicates: "/reports/duplicates",
    invalid: "/reports/invalid",
  };

  const endpoint = backendRouteMap[reportType];
  if (endpoint) {
    try {
      const { data } = await apiClient.post<string>(
        endpoint,
        {
          session_name: session.name,
          records: records.map((r: ReconciliationRecordResult) => ({
            record_id: r.recordId,
            primary_status: r.primaryStatus,
            issue_count: r.issueCount,
            issue_types: r.issueTypes,
            source_summary: r.sourceSummary,
            destination_summary: r.destinationSummary,
            field_comparisons: r.fieldComparisons.map((fc: ReconciliationRecordResult["fieldComparisons"][number]) => ({
              field_label: fc.fieldLabel,
              source_raw: fc.sourceRaw,
              destination_raw: fc.destinationRaw,
              difference: fc.difference,
              matched: fc.matched,
            })),
            validation_reasons: r.validationReasons,
          })),
        },
        { responseType: "text" }
      );
      if (typeof data === "string" && data.length > 0) {
        return data;
      }
    } catch (err) {
      // Fall back to client-side CSV builder with formula sanitization if needed
      const msg = extractApiErrorMessage(err);
      console.warn("Backend report endpoint fallback:", msg);
    }
  }

  return buildLocalReportCsv(reportType, session, records);
}

export function downloadCsvContent(csvText: string, filename: string): void {
  const blob = new Blob([csvText], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}