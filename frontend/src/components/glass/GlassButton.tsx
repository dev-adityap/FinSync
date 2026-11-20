import React from "react";
import { clsx } from "clsx";

export type GlassButtonVariant = "primary" | "secondary" | "ghost" | "danger";

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: GlassButtonVariant;
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
  className?: string;
}

const variantClassMap: Record<GlassButtonVariant, string> = {
  primary: "bg-[#111111] text-white rounded-full hover:bg-[#111111]/90",
  secondary: "bg-white border border-[#E5E7EB] text-[#111111] rounded-full hover:bg-[#F4F5F7]",
  ghost: "text-[#6B7280] hover:text-[#111111]",
  danger: "bg-[#FEF2F2] text-[#DC2626] rounded-full hover:bg-[#FECACA]",
};

const sizeClassMap: Record<string, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-base",
};

export const GlassButton: React.FC<GlassButtonProps> = ({
  variant = "primary",
  size = "md",
  loading = false,
  leftIcon,
  rightIcon,
  rightElement,
  className,
  disabled,
  children,
  ...props
}) => {
  return (
    <button
      disabled={loading || disabled}
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
        sizeClassMap[size],
        variantClassMap[variant],
        className
      )}
      {...props}
    >
      {loading ? (
        <span className="flex h-4 w-4 items-center justify-center">
          <svg
            className="animate-spin h-full w-full"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </span>
      ) : leftIcon ? (
        <span className="flex items-center">{leftIcon}</span>
      ) : null}
      {children}
      {(rightIcon ?? rightElement) && (
        <span className="flex items-center">{rightIcon ?? rightElement}</span>
      )}
    </button>
  );
};
