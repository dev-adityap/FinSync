import { WorkspaceBackupPayload } from "../types/workspace";

export function triggerBackupDownload(payload: WorkspaceBackupPayload): void {
  const jsonStr = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const link = document.createElement("a");
  link.href = url;
  link.download = `finsync-workspace-backup-${stamp}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function parseBackupFile(file: File): Promise<WorkspaceBackupPayload> {
  if (!file.name.toLowerCase().endsWith(".json")) {
    throw new Error("Please select a valid .json FinSync backup file.");
  }
  const text = await file.text();
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("Backup file contains invalid JSON.");
  }

  if (
    typeof parsed !== "object" ||
    parsed === null ||
    (parsed as WorkspaceBackupPayload).app !== "FinSync" ||
    typeof (parsed as WorkspaceBackupPayload).data !== "object" ||
    (parsed as WorkspaceBackupPayload).data === null
  ) {
    throw new Error("This JSON file is not a valid FinSync workspace backup.");
  }

  return parsed as WorkspaceBackupPayload;
}