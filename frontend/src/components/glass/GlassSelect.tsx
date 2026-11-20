import React, { useId } from "react";
import { clsx } from "clsx";
import { ChevronDown } from "lucide-react";

export interface GlassSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface GlassSelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  label?: string;
  helperText?: string;
  error?: string;
  options: GlassSelectOption[];
  placeholder?: string;
}

export const GlassSelect: React.FC<GlassSelectProps> = ({
  label,
  helperText,
  error,
  options,
  placeholder,
  id,
  className,
  ...props
}) => {
  const generatedId = useId();
  const selectId = id ?? generatedId;

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs font-medium tracking-wide uppercase"
          style={{ color: "var(--text-secondary)" }}
        >
          {label}
        </label>
      )}

      <div className="relative">
        <select
          id={selectId}
          aria-invalid={Boolean(error)}
          className={clsx(
            "w-full h-10 appearance-none pl-3.5 pr-9 text-sm rounded-xl border transition-colors [color-scheme:light]",
            "focus:border-[#2563EB] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
            error && "border-[#DC2626] ring-2 ring-rose-500/15",
            className
          )}
          style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)", colorScheme: "light" }}
          {...props}
        >
          {placeholder && (
            <option value="" disabled={props.required} className="bg-white text-[#111111]">
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
              disabled={opt.disabled}
              className="bg-white text-[#111111]"
            >
              {opt.label}
            </option>
          ))}
        </select>

        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2"
          style={{ color: "var(--text-muted)" }}
        />
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