import React from "react";
import { clsx } from "clsx";
import { Check } from "lucide-react";

export interface StepItem {
  stepNumber: number;
  title: string;
  description?: string;
}

interface GlassStepperProps {
  steps: StepItem[];
  currentStep: number;
  onSelectStep?: (stepNumber: number) => void;
}

export const GlassStepper: React.FC<GlassStepperProps> = ({
  steps,
  currentStep,
  onSelectStep,
}) => {
  return (
    <nav aria-label="Reconciliation progress" className="w-full overflow-x-auto pb-1">
      <ol className="flex items-center justify-between gap-2 min-w-[640px]">
        {steps.map((step) => {
          const isCompleted = step.stepNumber < currentStep;
          const isCurrent = step.stepNumber === currentStep;
          const clickable = Boolean(onSelectStep && step.stepNumber <= currentStep);

          return (
            <li key={step.stepNumber} className="flex-1">
              <button
                type="button"
                disabled={!clickable}
                onClick={() => clickable && onSelectStep?.(step.stepNumber)}
                aria-current={isCurrent ? "step" : undefined}
                className={clsx(
                  "group flex w-full items-center gap-2.5 rounded-xl p-2.5 text-left transition-all",
                  isCurrent && "glass-level-2 border-[var(--accent-cyan)]/50",
                  clickable && !isCurrent && "hover:bg-white/[0.04] cursor-pointer",
                  !clickable && "cursor-default opacity-75"
                )}
              >
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold tabular-nums border"
                  style={
                    isCompleted
                      ? {
                          backgroundColor: "rgba(110, 219, 164, 0.18)",
                          borderColor: "var(--status-success)",
                          color: "var(--status-success)",
                        }
                      : isCurrent
                      ? {
                          background:
                            "linear-gradient(135deg, var(--accent-blue), var(--accent-violet))",
                          borderColor: "transparent",
                          color: "#ffffff",
                        }
                      : {
                          backgroundColor: "rgba(255, 255, 255, 0.04)",
                          borderColor: "var(--glass-2-border)",
                          color: "var(--text-muted)",
                        }
                  }
                >
                  {isCompleted ? (
                    <Check className="h-3.5 w-3.5" aria-hidden="true" />
                  ) : (
                    step.stepNumber
                  )}
                </span>

                <div className="min-w-0">
                  <div
                    className="text-xs font-semibold truncate"
                    style={{
                      color: isCurrent
                        ? "var(--text-primary)"
                        : isCompleted
                        ? "var(--text-secondary)"
                        : "var(--text-muted)",
                    }}
                  >
                    {step.title}
                  </div>
                  {step.description && (
                    <div
                      className="text-[11px] truncate"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {step.description}
                    </div>
                  )}
                </div>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};