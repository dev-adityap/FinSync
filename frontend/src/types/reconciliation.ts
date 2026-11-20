import { FieldMappingItem } from "./dataset";

export type SessionRunStatus = "DRAFT" | "RUNNING" | "COMPLETED" | "FAILED";

export type OverallValidationStatus = "PASSED" | "PASSED_WITH_WARNINGS" | "FAILED";

export type RecordPrimaryStatus =
  | "MATCHED"
  | "MISMATCHED"
  | "MISSING_IN_DESTINATION"
  | "UNEXPECTED_IN_DESTINATION"
  | "DUPLICATE"
  | "INVALID";

export interface ValidationOptions {
  caseInsensitive: boolean;
  trimWhitespace: boolean;
  normalizeNumbers: boolean;
  normalizeDates: boolean;
  dateFormat: string;
  numericTolerance: string;
  detectMissing: boolean;
  detectUnexpected: boolean;
  detectDuplicates: boolean;
  validateRequired: boolean;
  validateNonEmpty: boolean;
  validateNumeric: boolean;
  validateEmail: boolean;
}

export interface ReconciliationConfig {
  sessionId: string;
  uniqueKeySource: string;
  uniqueKeyDestination: string;
  fieldMappings: FieldMappingItem[];
  validationOptions: ValidationOptions;
}

export interface FieldComparison {
  fieldLabel: string;
  sourceColumn: string;
  destinationColumn: string;
  sourceRaw: string | null;
  destinationRaw: string | null;
  sourceNormalized: string | null;
  destinationNormalized: string | null;
  difference: string | null;
  matched: boolean;
  issues: string[];
}

export interface ReconciliationRecordResult {
  id: string;
  sessionId: string;
  recordId: string;
  primaryStatus: RecordPrimaryStatus;
  issueCount: number;
  issueTypes: string[];
  sourceSummary: string;
  destinationSummary: string;
  sourceValues: Record<string, string | null>;
  destinationValues: Record<string, string | null>;
  fieldComparisons: FieldComparison[];
  validationReasons: string[];
}

export interface ReconciliationSession {
  id: string;
  projectId: string;
  projectName: string;
  name: string;
  description: string;
  sourceSystem: string;
  destinationSystem: string;
  status: SessionRunStatus;
  overallValidationStatus?: OverallValidationStatus;
  matchPercentage: number;
  sourceRowCount: number;
  destinationRowCount: number;
  matchedCount: number;
  mismatchedCount: number;
  missingCount: number;
  unexpectedCount: number;
  duplicateCount: number;
  invalidCount: number;
  totalIssues: number;
  durationMs: number;
  createdAt: string;
  completedAt?: string;
}