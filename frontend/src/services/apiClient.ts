import axios, { AxiosError } from "axios";

const rawBaseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "";
const normalizedBase = rawBaseUrl.replace(/\/+$/, "");

export const apiClient = axios.create({
  baseURL: normalizedBase ? `${normalizedBase}/api` : "/api",
  timeout: 60000,
  headers: {
    Accept: "application/json",
  },
});

export interface ApiErrorDetail {
  message: string;
  code?: string;
  status?: number;
}

export function extractApiErrorMessage(err: unknown, fallback = "Request failed"): string {
  if (axios.isAxiosError(err)) {
    const axErr = err as AxiosError<{ detail?: string | { message?: string }; message?: string }>;
    if (!axErr.response) {
      return "Unable to reach the FinSync reconciliation server. Check your connection or backend service.";
    }
    const data = axErr.response.data;
    if (typeof data?.detail === "string" && data.detail.trim()) {
      return data.detail;
    }
    if (typeof data?.detail === "object" && data.detail?.message) {
      return data.detail.message;
    }
    if (typeof data?.message === "string" && data.message.trim()) {
      return data.message;
    }
    return `Server error (${axErr.response.status}). Please verify your input and try again.`;
  }
  if (err instanceof Error && err.message) {
    return err.message;
  }
  return fallback;
}