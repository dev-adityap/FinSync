import React from "react";
import { clsx } from "clsx";
import { GlassCard } from "./GlassCard";

interface GlassStatCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  icon?: React.ReactNode;
  accentColor?: string;
  className?: string;
}

export const GlassStatCard: React.FC<GlassStatCardProps> = ({
  label,
  value,
  sublabel,
  icon,
  accentColor = "var(--accent-cyan)",
  className,
}) => {
  return (
    <GlassCard level={2} padding="md" className={clsx("flex flex-col justify-between", className)}>
      <div className="flex items-center justify-between gap-3">
        <span
          className="text-xs font-medium uppercase tracking-wider"
          style={{ color: "var(--text-secondary)" }}
        >
          {label}
        </span>
        {icon && (
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/10"
            style={{
              color: accentColor,
              backgroundColor: "rgba(255, 255, 255, 0.04)",
            }}
          >
            {icon}
          </span>
        )}
      </div>

      <div className="mt-3">
        <div
          className="text-2xl sm:text-[26px] font-bold tracking-tight tabular-nums"
          style={{ color: "var(--text-primary)" }}
        >
          {value}
        </div>
        {sublabel && (
          <p
            className="mt-1 text-xs tabular-nums"
            style={{ color: "var(--text-muted)" }}
          >
            {sublabel}
          </p>
        )}
      </div>
    </GlassCard>
  );
};