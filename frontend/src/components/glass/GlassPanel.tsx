import React from "react";
import { clsx } from "clsx";

export type GlassLevel = 1 | 2 | 3;

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  level?: GlassLevel;
  interactive?: boolean;
}

export const GlassPanel: React.FC<GlassPanelProps> = ({
  level = 1,
  interactive = false,
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={clsx(
        "rounded-[22px] border shadow-[0_2px_10px_rgba(17,17,17,0.03)]",
        "relative overflow-hidden transition-all duration-200",
        interactive && "hover:-translate-y-0.5 hover:border-[#2563EB]/40",
        className
      )}
      style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)", color: "var(--text-primary)" }}
      {...props}
    >
      {/* Subtle top specular highlight edge */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-60"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)",
        }}
      />
      {children}
    </div>
  );
};