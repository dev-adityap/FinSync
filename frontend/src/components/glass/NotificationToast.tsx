import React, { useEffect } from "react";
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react";
import { GlassPanel } from "./GlassPanel";

export type ToastType = "success" | "warning" | "error" | "info";

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface NotificationToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
  durationMs?: number;
}

const SingleToast: React.FC<{
  toast: ToastMessage;
  onDismiss: (id: string) => void;
  durationMs: number;
}> = ({ toast, onDismiss, durationMs }) => {
  useEffect(() => {
    const timer = window.setTimeout(() => onDismiss(toast.id), durationMs);
    return () => window.clearTimeout(timer);
  }, [toast.id, onDismiss, durationMs]);

  const iconMap: Record<ToastType, React.ReactNode> = {
    success: (
      <CheckCircle2
        className="h-4 w-4 shrink-0 mt-0.5"
        style={{ color: "var(--status-success)" }}
        aria-hidden="true"
      />
    ),
    warning: (
      <AlertTriangle
        className="h-4 w-4 shrink-0 mt-0.5"
        style={{ color: "var(--status-warning)" }}
        aria-hidden="true"
      />
    ),
    error: (
      <XCircle
        className="h-4 w-4 shrink-0 mt-0.5"
        style={{ color: "var(--status-error)" }}
        aria-hidden="true"
      />
    ),
    info: (
      <Info
        className="h-4 w-4 shrink-0 mt-0.5"
        style={{ color: "var(--accent-cyan)" }}
        aria-hidden="true"
      />
    ),
  };

  return (
    <GlassPanel
      level={3}
      role="status"
      aria-live="polite"
      className="flex items-start justify-between gap-3 px-4 py-3 w-80 max-w-[calc(100vw-2rem)]"
    >
      <div className="flex items-start gap-2.5 min-w-0">
        {iconMap[toast.type]}
        <div className="min-w-0">
          <p
            className="text-xs sm:text-sm font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            {toast.title}
          </p>
          {toast.message && (
            <p
              className="mt-0.5 text-xs"
              style={{ color: "var(--text-secondary)" }}
            >
              {toast.message}
            </p>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
        className="rounded-md p-1 hover:bg-white/10 shrink-0"
        style={{ color: "var(--text-muted)" }}
      >
        <X className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </GlassPanel>
  );
};

export const NotificationToast: React.FC<NotificationToastProps> = ({
  toasts,
  onDismiss,
  durationMs = 4500,
}) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2.5 pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <SingleToast toast={t} onDismiss={onDismiss} durationMs={durationMs} />
        </div>
      ))}
    </div>
  );
};