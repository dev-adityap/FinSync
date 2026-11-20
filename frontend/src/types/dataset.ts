export type DatasetSide = "source" | "destination";

export type MappedFieldType = "string" | "number" | "currency" | "date" | "email" | "boolean";

export interface ColumnStats {
  column: string;
  missingCount: number;
  uniqueCount: number;
  inferredType: MappedFieldType;
  sampleValues: string[];
}

export interface DatasetPreview {
  id: string;
  sessionId: string;
  side: DatasetSide;
  fileName: string;
  fileSizeBytes: number;
  rowCount: number;
  headers: string[];
  sampleRows: Record<string, string>[];
  columnStats: ColumnStats[];
  createdAt: string;
}

export interface FieldMappingItem {
  id: string;
  sourceColumn: string;
  destinationColumn: string;
  dataType: MappedFieldType;
  required: boolean;
  isUniqueKey?: boolean;
}