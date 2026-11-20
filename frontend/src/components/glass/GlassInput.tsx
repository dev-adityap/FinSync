import React, { useId } from "react";
import { clsx } from "clsx";

interface GlassInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const GlassInput: React.FC<GlassInputProps> = ({
  label,
  helperText,
  error,
  leftIcon,
  rightElement,
  id,
  className,
  ...props
}) => {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-medium tracking-wide uppercase"
          style={{ color: "var(--text-secondary)" }}
        >
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {leftIcon && (
          <span
            className="pointer-events-none absolute left-3.5 flex items-center"
            style={{ color: "var(--text-muted)" }}
          >
            {leftIcon}
          </span>
        )}

        <input
          id={inputId}
          aria-invalid={Boolean(error)}
          className={clsx(
            "w-full h-10 text-sm rounded-xl border transition-colors",
            "placeholder:text-[#9CA3AF] focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]",
            leftIcon ? "pl-10" : "pl-3.5",
            rightElement ? "pr-11" : "pr-3.5",
            error && "border-[#DC2626] ring-2 ring-rose-500/15",
            className
          )}
          style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)" }}
          {...props}
        />

        {rightElement && (
          <div className="absolute right-2.5 flex items-center">
            {rightElement}
          </div>
        )}
      </div>

      {error ? (
        <p
          role="alert"
          className="text-xs font-medium"
          style={{ color: "var(--status-error)" }}
        >
          {error}
        </p>
      ) : (
        helperText && (
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            {helperText}
          </p>
        )
      )}
    </div>
  );
};