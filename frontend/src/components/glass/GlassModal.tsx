import React, { useEffect, useId } from "react";
import { clsx } from "clsx";
import { X } from "lucide-react";
import { GlassPanel } from "./GlassPanel";

interface GlassModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const sizeMap = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
};

export const GlassModal: React.FC<GlassModalProps> = ({
  open,
  onClose,
  title,
  description,
  size = "md",
  children,
  footer,
}) => {
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      <div
        onClick={onClose}
        aria-hidden="true"
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      <GlassPanel
        level={3}
        className={clsx(
          "relative z-10 w-full max-h-[90vh] flex flex-col",
          sizeMap[size]
        )}
      >
        <div
          className="flex items-start justify-between gap-4 px-6 py-4 border-b"
          style={{ borderColor: "var(--glass-2-border)" }}
        >
          <div>
            <h2
              id={titleId}
              className="text-base sm:text-lg font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              {title}
            </h2>
            {description && (
              <p
                id={descId}
                className="mt-1 text-xs sm:text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-lg p-1.5 transition-colors hover:bg-white/10"
            style={{ color: "var(--text-secondary)" }}
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5 space-y-4">{children}</div>

        {footer && (
          <div
            className="flex flex-wrap items-center justify-end gap-2.5 px-6 py-4 border-t"
            style={{ borderColor: "var(--glass-2-border)" }}
          >
            {footer}
          </div>
        )}
      </GlassPanel>
    </div>
  );
};