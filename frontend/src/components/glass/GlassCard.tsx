import React from "react";
import { clsx } from "clsx";
import { GlassLevel } from "./GlassPanel";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  level?: GlassLevel;
  padding?: "sm" | "md" | "lg";
  className?: string;
  children?: React.ReactNode;
}

const paddingClassMap: Record<string, string> = {
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export const GlassCard: React.FC<GlassCardProps> = ({
  level = 2,
  padding = "md",
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={clsx(
        "rounded-[22px] border shadow-[0_2px_10px_rgba(17,17,17,0.03)]",
        "relative overflow-hidden transition-all duration-200",
        paddingClassMap[padding],
        className
      )}
      style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)", color: "var(--text-primary)" }}
      {...props}
    >
      {children}
    </div>
  );
};
