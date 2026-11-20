import React, { useEffect, useId } from "react";
import { clsx } from "clsx";
import { X } from "lucide-react";
import { GlassPanel } from "./GlassPanel";

interface GlassDrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  side?: "right" | "left";
  widthClass?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const GlassDrawer: React.FC<GlassDrawerProps> = ({
  open,
  onClose,
  title,
  subtitle,
  side = "right",
  widthClass = "w-full sm:max-w-xl",
  children,
  footer,
}) => {
  const titleId = useId();

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
      className="fixed inset-0 z-50 flex"
    >
      <div
        onClick={onClose}
        aria-hidden="true"
        className="fixed inset-0 bg-black/55 backdrop-blur-xs transition-opacity"
      />

      <div
        className={clsx(
          "relative z-10 flex h-full",
          side === "right" ? "ml-auto" : "mr-auto",
          widthClass
        )}
      >
        <GlassPanel
          level={3}
          className={clsx(
            "flex h-full w-full flex-col",
            side === "right" ? "rounded-r-none" : "rounded-l-none"
          )}
        >
          <div
            className="flex items-start justify-between gap-4 px-5 py-4 border-b shrink-0"
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
              {subtitle && (
                <p
                  className="mt-0.5 text-xs sm:text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {subtitle}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close drawer"
              className="rounded-lg p-1.5 transition-colors hover:bg-white/10"
              style={{ color: "var(--text-secondary)" }}
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {children}
          </div>

          {footer && (
            <div
              className="flex items-center justify-end gap-2.5 px-5 py-3.5 border-t shrink-0"
              style={{ borderColor: "var(--glass-2-border)" }}
            >
              {footer}
            </div>
          )}
        </GlassPanel>
      </div>
    </div>
  );
};