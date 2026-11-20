import { apiClient, extractApiErrorMessage } from "./apiClient";
import {
  OverallValidationStatus,
  ReconciliationConfig,
  ReconciliationRecordResult,
  ReconciliationSession,
  ValidationOptions,
} from "../types/reconciliation";

export interface RunReconciliationApiResponse {
  session_id: string;
  overall_validation_status: OverallValidationStatus;
  match_percentage: number;
  source_row_count: number;
  destination_row_count: number;
  matched_count: number;
  mismatched_count: number;
  missing_count: number;
  unexpected_count: number;
  duplicate_count: number;
  invalid_count: number;
  total_issues: number;
  duration_ms: number;
  records: {
    record_id: string;
    primary_status: ReconciliationRecordResult["primaryStatus"];
    issue_count: number;
    issue_types: string[];
    source_summary: string;
    destination_summary: string;
    source_values: Record<string, string | null>;
    destination_values: Record<string, string | null>;
    field_comparisons: {
      field_label: string;
      source_column: string;
      destination_column: string;
      source_raw: string | null;
      destination_raw: string | null;
      source_normalized: string | null;
      destination_normalized: string | null;
      difference: string | null;
      matched: boolean;
      issues: string[];
    }[];
    validation_reasons: string[];
  }[];
}

export async function validateReconciliationConfig(
  config: ReconciliationConfig
): Promise<{ valid: boolean; errors: string[]; warnings: string[] }> {
  try {
    const { data } = await apiClient.post("/reconciliation/validate-config", {
      unique_key_source: config.uniqueKeySource,
      unique_key_destination: config.uniqueKeyDestination,
      field_mappings: config.fieldMappings.map((m) => ({
        source_column: m.sourceColumn,
        destination_column: m.destinationColumn,
        data_type: m.dataType,
        required: m.required,
      })),
      validation_options: serializeValidationOptions(config.validationOptions),
    });
    return data;
  } catch (err) {
    throw new Error(extractApiErrorMessage(err, "Configuration validation failed."));
  }
}

function serializeValidationOptions(opts: ValidationOptions) {
  return {
    case_insensitive: opts.caseInsensitive,
    trim_whitespace: opts.trimWhitespace,
    normalize_numbers: opts.normalizeNumbers,
    normalize_dates: opts.normalizeDates,
    date_format: opts.dateFormat,
    numeric_tolerance: opts.numericTolerance,
    detect_missing: opts.detectMissing,
    detect_unexpected: opts.detectUnexpected,
    detect_duplicates: opts.detectDuplicates,
    validate_required: opts.validateRequired,
    validate_non_empty: opts.validateNonEmpty,
    validate_numeric: opts.validateNumeric,
    validate_email: opts.validateEmail,
  };
}

export async function executeReconciliation(params: {
  session: ReconciliationSession;
  config: ReconciliationConfig;
  sourceFile: File;
  destinationFile: File;
}): Promise<{
  completedSession: ReconciliationSession;
  records: ReconciliationRecordResult[];
}> {
  const { session, config, sourceFile, destinationFile } = params;

  const formData = new FormData();
  formData.append("source_file", sourceFile);
  formData.append("destination_file", destinationFile);
  formData.append("session_id", session.id);
  formData.append(
    "config_json",
    JSON.stringify({
      unique_key_source: config.uniqueKeySource,
      unique_key_destination: config.uniqueKeyDestination,
      field_mappings: config.fieldMappings.map((m) => ({
        source_column: m.sourceColumn,
        destination_column: m.destinationColumn,
        data_type: m.dataType,
        required: m.required,
      })),
      validation_options: serializeValidationOptions(config.validationOptions),
    })
  );

  try {
    const { data } = await apiClient.post<RunReconciliationApiResponse>(
      "/reconciliation/run",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    const completedAt = new Date().toISOString();

    const completedSession: ReconciliationSession = {
      ...session,
      status: "COMPLETED",
      overallValidationStatus: data.overall_validation_status,
      matchPercentage: data.match_percentage,
      sourceRowCount: data.source_row_count,
      destinationRowCount: data.destination_row_count,
      matchedCount: data.matched_count,
      mismatchedCount: data.mismatched_count,
      missingCount: data.missing_count,
      unexpectedCount: data.unexpected_count,
      duplicateCount: data.duplicate_count,
      invalidCount: data.invalid_count,
      totalIssues: data.total_issues,
      durationMs: data.duration_ms,
      completedAt,
    };

    const records: ReconciliationRecordResult[] = data.records.map((r: RunReconciliationApiResponse["records"][number], idx: number) => ({
      id: `${session.id}:${r.record_id}:${idx}`,
      sessionId: session.id,
      recordId: r.record_id,
      primaryStatus: r.primary_status,
      issueCount: r.issue_count,
      issueTypes: r.issue_types,
      sourceSummary: r.source_summary,
      destinationSummary: r.destination_summary,
      sourceValues: r.source_values,
      destinationValues: r.destination_values,
      fieldComparisons: r.field_comparisons.map((fc: RunReconciliationApiResponse["records"][number]["field_comparisons"][number]) => ({
        fieldLabel: fc.field_label,
        sourceColumn: fc.source_column,
        destinationColumn: fc.destination_column,
        sourceRaw: fc.source_raw,
        destinationRaw: fc.destination_raw,
        sourceNormalized: fc.source_normalized,
        destinationNormalized: fc.destination_normalized,
        difference: fc.difference,
        matched: fc.matched,
        issues: fc.issues,
      })),
      validationReasons: r.validation_reasons,
    }));

    return { completedSession, records };
  } catch (err) {
    throw new Error(extractApiErrorMessage(err, "Reconciliation execution failed."));
  }
}