import React from "react";
import { clsx } from "clsx";

export type GlassStatusBadgeVariant =
  | "matched"
  | "mismatched"
  | "missing"
  | "unexpected"
  | "duplicate"
  | "invalid"
  | "passed"
  | "failed"
  | "warning";

interface GlassStatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: GlassStatusBadgeVariant;
  tone?: string;
  label?: string;
  icon?: any;
  className?: string;
}

const variantColorMap: Record<GlassStatusBadgeVariant, string> = {
  matched: "var(--status-success)",
  mismatched: "var(--status-error)",
  missing: "var(--status-error)",
  unexpected: "var(--status-warning)",
  duplicate: "var(--status-warning)",
  invalid: "var(--status-error)",
  passed: "var(--status-success)",
  failed: "var(--status-error)",
  warning: "var(--status-warning)",
};

const toneColorMap: Record<string, string> = {
  warning: "var(--status-warning)",
  info: "var(--accent-cyan)",
  danger: "var(--status-error)",
  success: "var(--status-success)",
};

export const GlassStatusBadge: React.FC<GlassStatusBadgeProps> = ({
  variant = "matched",
  tone,
  label,
  icon,
  className,
  ...props
}) => {
  const color = tone ? (toneColorMap[tone] ?? variantColorMap[variant]) : variantColorMap[variant];

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full border",
        className
      )}
      style={{
        color,
        borderColor: `${color}4d`,
        backgroundColor: "rgba(255,255,255,0.04)",
      }}
      {...props}
    >
      {label}
    </span>
  );
};
