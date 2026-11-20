import React, { useRef, useState } from "react";
import { clsx } from "clsx";
import { UploadCloud, FileSpreadsheet, Trash2, RefreshCw, CheckCircle2 } from "lucide-react";
import { GlassCard } from "./GlassCard";
import { GlassButton } from "./GlassButton";

interface GlassUploadZoneProps {
  title: string;
  subtitle: string;
  file: File | null;
  rowCount?: number;
  columnCount?: number;
  loading?: boolean;
  error?: string | null;
  onFileSelected: (file: File) => void;
  onRemoveFile: () => void;
  onLoadSample?: () => void;
  sampleLabel?: string;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export const GlassUploadZone: React.FC<GlassUploadZoneProps> = ({
  title,
  subtitle,
  file,
  rowCount,
  columnCount,
  loading = false,
  error,
  onFileSelected,
  onRemoveFile,
  onLoadSample,
  sampleLabel = "Load Sample CSV",
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    onFileSelected(files[0]);
  };

  return (
    <GlassCard level={2} padding="md" className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3
            className="text-sm sm:text-base font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            {title}
          </h3>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
            {subtitle}
          </p>
        </div>
        {onLoadSample && (
          <GlassButton
            size="sm"
            variant="ghost"
            onClick={onLoadSample}
            disabled={loading}
          >
            {sampleLabel}
          </GlassButton>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {!file ? (
        <div
          role="button"
          tabIndex={0}
          onClick={() => !loading && inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              if (!loading) inputRef.current?.click();
            }
          }}
          onDragOver={(e) => {
            e.preventDefault();
            if (!loading) setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (!loading) handleFiles(e.dataTransfer.files);
          }}
          className={clsx(
            "flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-8 text-center transition-all cursor-pointer",
            isDragging
              ? "border-[var(--accent-cyan)] bg-[var(--accent-cyan)]/10"
              : "border-white/15 hover:border-[var(--accent-blue)]/60 hover:bg-white/[0.03]"
          )}
        >
          <UploadCloud
            className="h-9 w-9 mb-2.5"
            style={{ color: "var(--accent-cyan)" }}
            aria-hidden="true"
          />
          <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
            {loading ? "Parsing & validating CSV..." : "Drag & drop CSV here, or click to browse"}
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
            CSV format only • Max 20 MB
          </p>
        </div>
      ) : (
        <div
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border p-4"
          style={{
            borderColor: "rgba(110, 219, 164, 0.35)",
            backgroundColor: "rgba(110, 219, 164, 0.06)",
          }}
        >
          <div className="flex items-start gap-3 min-w-0">
            <FileSpreadsheet
              className="h-6 w-6 shrink-0 mt-0.5"
              style={{ color: "var(--status-success)" }}
              aria-hidden="true"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p
                  className="text-sm font-semibold truncate"
                  style={{ color: "var(--text-primary)" }}
                >
                  {file.name}
                </p>
                <span
                  className="inline-flex items-center gap-1 text-xs font-medium shrink-0"
                  style={{ color: "var(--status-success)" }}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Ready
                </span>
              </div>
              <p
                className="text-xs mt-1 tabular-nums"
                style={{ color: "var(--text-secondary)" }}
              >
                {formatBytes(file.size)}
                {typeof rowCount === "number" ? ` • ${rowCount.toLocaleString()} rows` : ""}
                {typeof columnCount === "number" ? ` • ${columnCount} columns` : ""}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <GlassButton
              size="sm"
              variant="secondary"
              leftIcon={<RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />}
              onClick={() => inputRef.current?.click()}
              disabled={loading}
            >
              Replace
            </GlassButton>
            <GlassButton
              size="sm"
              variant="danger"
              leftIcon={<Trash2 className="h-3.5 w-3.5" aria-hidden="true" />}
              onClick={onRemoveFile}
              disabled={loading}
            >
              Remove
            </GlassButton>
          </div>
        </div>
      )}

      {error && (
        <p
          role="alert"
          className="text-xs font-medium"
          style={{ color: "var(--status-error)" }}
        >
          {error}
        </p>
      )}
    </GlassCard>
  );
};