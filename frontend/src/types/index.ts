/* Core Types */
export interface Project {
  id: string
  name: string
  description: string
  createdAt: string
  updatedAt: string
  sessionCount: number
  lastActivity: string | null
}

export interface Session {
  id: string
  projectId: string
  name: string
  description: string
  sourceSystem: string
  destinationSystem: string
  status: SessionStatus
  config: ReconciliationConfig
  results: ReconciliationResults | null
  sourceFile: FileMetadata | null
  destinationFile: FileMetadata | null
  createdAt: string
  updatedAt: string
  completedAt: string | null
}

export type SessionStatus = 'draft' | 'processing' | 'completed' | 'failed'

export interface FileMetadata {
  name: string
  size: number
  rowCount: number
  headers: string[]
  preview: Record<string, unknown>[]
  encoding: string
}

export interface ColumnMapping {
  sourceColumn: string
  destinationColumn: string
  dataType: DataType
  isUniqueIdentifier: boolean
  isRequired: boolean
}

export type DataType = 'string' | 'number' | 'date' | 'email' | 'boolean'

export interface ValidationConfig {
  caseInsensitive: boolean
  trimWhitespace: boolean
  normalizeNumbers: boolean
  normalizeDates: boolean
  numericTolerance: number
  detectMissing: boolean
  detectUnexpected: boolean
  detectDuplicates: boolean
  requiredFields: string[]
  emptyValues: string[]
  validateEmails: boolean
  dateFormat?: string
}

export interface ReconciliationConfig {
  columnMappings: ColumnMapping[]
  uniqueIdentifier: string
  validation: ValidationConfig
}

export interface ReconciliationResults {
  metrics: ReconciliationMetrics
  records: ReconciliationRecord[]
  issues: ValidationIssue[]
  duration: number
  status: OverallStatus
}

export type OverallStatus = 'PASSED' | 'PASSED_WITH_WARNINGS' | 'FAILED'

export interface ReconciliationMetrics {
  sourceRows: number
  destinationRows: number
  matched: number
  mismatched: number
  missing: number
  unexpected: number
  duplicate: number
  invalid: number
  totalIssues: number
  matchPercentage: number
}

export interface ReconciliationRecord {
  id: string
  recordId: string
  primaryStatus: RecordStatus
  issueCount: number
  sourceData: Record<string, unknown>
  destinationData: Record<string, unknown>
  normalizedSource: Record<string, unknown>
  normalizedDestination: Record<string, unknown>
  fieldComparisons: FieldComparison[]
  issues: ValidationIssue[]
}

export type RecordStatus = 'MATCHED' | 'MISMATCHED' | 'MISSING_IN_DESTINATION' | 'UNEXPECTED_IN_DESTINATION' | 'DUPLICATE' | 'INVALID'

export interface FieldComparison {
  field: string
  sourceValue: unknown
  destinationValue: unknown
  normalizedSource: unknown
  normalizedDestination: unknown
  match: boolean
  difference?: number
}

export interface ValidationIssue {
  id: string
  recordId: string
  field: string
  type: IssueType
  severity: 'error' | 'warning' | 'info'
  message: string
  sourceValue?: unknown
  destinationValue?: unknown
}

export type IssueType = 'MISMATCH' | 'MISSING_IN_DESTINATION' | 'UNEXPECTED_IN_DESTINATION' | 'DUPLICATE' | 'INVALID_IDENTIFIER' | 'INVALID_NUMERIC' | 'INVALID_DATE' | 'INVALID_EMAIL' | 'MISSING_REQUIRED' | 'DATA_TYPE_MISMATCH'

/* UI Types */
export interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
}

export interface Theme {
  mode: 'dark' | 'light'
}

export interface WorkspaceState {
  projects: Project[]
  sessions: Session[]
  currentProjectId: string | null
  currentSessionId: string | null
  settings: UserSettings
}

export interface UserSettings {
  theme: 'dark' | 'light'
  workspaceLabel: string
  defaultNumericTolerance: number
  defaultCaseInsensitive: boolean
  defaultTrimWhitespace: boolean
  defaultPageSize: number
  validationDefaults: Partial<ValidationConfig>
}

/* API Types */
export interface CSVPreviewRequest {
  file: File
}

export interface CSVPreviewResponse {
  headers: string[]
  preview: Record<string, unknown>[]
  rowCount: number
  encoding: string
  errors: string[]
}

export interface ReconciliationRunRequest {
  sourceFile: File
  destinationFile: File
  config: ReconciliationConfig
}

export interface ReconciliationRunResponse {
  results: ReconciliationResults
  sessionId: string
}

export interface ReportRequest {
  sessionId: string
  reportType: ReportType
}

export type ReportType = 'complete' | 'mismatches' | 'missing' | 'unexpected' | 'duplicates' | 'invalid' | 'summary'

export interface HealthResponse {
  status: 'healthy' | 'degraded'
  version: string
  timestamp: string
}