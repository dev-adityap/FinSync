export type ReportType =
  | "complete"
  | "mismatches"
  | "missing"
  | "unexpected"
  | "duplicates"
  | "invalid"
  | "summary";

export interface ReportExportRequest {
  sessionId: string;
  reportType: ReportType;
}