import { apiClient, extractApiErrorMessage } from "./apiClient";
import { ColumnStats, DatasetPreview, DatasetSide } from "../types/dataset";

export const MAX_CSV_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB

export interface CsvPreviewApiResponse {
  file_name: string;
  file_size_bytes: number;
  row_count: number;
  headers: string[];
  sample_rows: Record<string, string>[];
  column_stats: {
    column: string;
    missing_count: number;
    unique_count: number;
    inferred_type: ColumnStats["inferredType"];
    sample_values: string[];
  }[];
  encoding_used: string;
}

export interface CsvValidationApiResponse {
  valid: boolean;
  file_name: string;
  file_size_bytes: number;
  row_count: number;
  headers: string[];
  warnings: string[];
  errors: string[];
}

export function validateClientCsvFile(file: File): string | null {
  if (!file) {
    return "No file selected.";
  }
  const lower = file.name.toLowerCase();
  if (!lower.endsWith(".csv")) {
    return "Unsupported file format. Please upload a .csv file.";
  }
  if (file.size === 0) {
    return "The selected CSV file is empty (0 bytes).";
  }
  if (file.size > MAX_CSV_SIZE_BYTES) {
    return `File exceeds the 20 MB limit (${(file.size / (1024 * 1024)).toFixed(2)} MB).`;
  }
  return null;
}

export async function previewCsvFile(
  file: File,
  sessionId: string,
  side: DatasetSide,
  previewLimit = 10
): Promise<DatasetPreview> {
  const clientError = validateClientCsvFile(file);
  if (clientError) {
    throw new Error(clientError);
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("preview_limit", String(previewLimit));

  try {
    const { data } = await apiClient.post<CsvPreviewApiResponse>("/csv/preview", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return {
      id: `${sessionId}:${side}`,
      sessionId,
      side,
      fileName: data.file_name,
      fileSizeBytes: data.file_size_bytes,
      rowCount: data.row_count,
      headers: data.headers,
      sampleRows: data.sample_rows,
      columnStats: data.column_stats.map((c: CsvPreviewApiResponse["column_stats"][number]) => ({
        column: c.column,
        missingCount: c.missing_count,
        uniqueCount: c.unique_count,
        inferredType: c.inferred_type,
        sampleValues: c.sample_values,
      })),
      createdAt: new Date().toISOString(),
    };
  } catch (err) {
    throw new Error(extractApiErrorMessage(err, "Failed to parse CSV file."));
  }
}

export async function validateCsvFileOnServer(file: File): Promise<CsvValidationApiResponse> {
  const clientError = validateClientCsvFile(file);
  if (clientError) {
    throw new Error(clientError);
  }

  const formData = new FormData();
  formData.append("file", file);

  try {
    const { data } = await apiClient.post<CsvValidationApiResponse>("/csv/validate", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  } catch (err) {
    throw new Error(extractApiErrorMessage(err, "CSV validation failed."));
  }
}