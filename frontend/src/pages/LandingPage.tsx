import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Play,
  GitCompareArrows,
} from "lucide-react";
import { AmbientBackground } from "../components/glass/AmbientBackground";
import { MarketingNavbar } from "../components/layout/MarketingNavbar";
import { GlassPanel } from "../components/glass/GlassPanel";
import { GlassButton } from "../components/glass/GlassButton";
import { usePageMeta } from "../hooks/usePageMeta";
import { BackToTop } from "../components/glass/BackToTop";
import { GlassStatusBadge } from "../components/glass/GlassStatusBadge";

export const LandingPage: React.FC = () => {
  usePageMeta({ title: "FinSync — Deterministic Financial Reconciliation & Data Migration Validation", description: "Compare, validate, and reconcile data between systems with confidence." });
  const [showPrivacy, setShowPrivacy] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("finsync_privacy_notice_dismissed") !== "1";
  });
  const dismissPrivacy = () => {
    localStorage.setItem("finsync_privacy_notice_dismissed", "1");
    setShowPrivacy(false);
  };
  return (
    <div className="relative min-h-screen flex flex-col">
      <AmbientBackground />
      <MarketingNavbar />

      <main id="main-content" className="flex-1">
        {/* HERO SECTION */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 pb-16 sm:pt-20 sm:pb-24">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
            {/* Left Copy */}
            <div className="lg:col-span-6 space-y-6">
              <div
                className="inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium"
                style={{
                  borderColor: "rgba(115, 221, 245, 0.32)",
                  backgroundColor: "rgba(115, 221, 245, 0.08)",
                  color: "var(--accent-cyan)",
                }}
              >
                <GitCompareArrows className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Every Record. Every Field. Every Detail. In Sync.</span>
              </div>

              <h1
                className="text-3xl sm:text-5xl font-bold tracking-tight leading-[1.12]"
                style={{ color: "var(--text-primary)" }}
              >
                Your Data Migration.{" "}
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage:
                      "linear-gradient(135deg, var(--accent-cyan) 0%, var(--accent-blue) 55%, var(--accent-violet) 100%)",
                  }}
                >
                  Verified.
                </span>
              </h1>

              <p
                className="text-base sm:text-lg leading-relaxed max-w-xl"
                style={{ color: "var(--text-secondary)" }}
              >
                Compare, validate, and reconcile data between systems with
                confidence. Find discrepancies, catch missing records, and
                ensure every migration tells the right story.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link to="/app/reconcile/new">
                  <GlassButton
                    variant="primary"
                    size="lg"
                    rightIcon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}
                  >
                    Start Reconciliation
                  </GlassButton>
                </Link>

                <Link to="/app">
                  <GlassButton
                    variant="secondary"
                    size="lg"
                    leftIcon={<Play className="h-4 w-4" aria-hidden="true" />}
                  >
                    Explore Demo
                  </GlassButton>
                </Link>
              </div>

              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Instant local-first workspace • No account required • Built-in sample CSV datasets
              </p>
            </div>

            {/* Right Genuine Product Dashboard Preview */}
            <div className="lg:col-span-6">
              <GlassPanel level={1} className="p-4 sm:p-6 space-y-4">
                <div
                  className="flex items-center justify-between border-b pb-3"
                  style={{ borderColor: "var(--glass-2-border)" }}
                >
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#FF7E86]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#FFC477]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#6EDBA4]" />
                    <span
                      className="ml-2 text-xs font-medium"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Sample Migration: Legacy ERP → New ERP
                    </span>
                  </div>
                  <GlassStatusBadge label="PASSED WITH WARNINGS" variant="warning" />
                </div>

                {/* Mini KPI Strip matching actual sample dataset */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { label: "Source Rows", val: "5", color: "var(--text-primary)" },
                    { label: "Matched", val: "3", color: "var(--status-success)" },
                    { label: "Mismatched", val: "1", color: "var(--status-warning)" },
                    { label: "Missing / Extra", val: "2", color: "var(--status-error)" },
                  ].map((kpi) => (
                    <div
                      key={kpi.label}
                      className="glass-level-2 p-3 rounded-xl"
                    >
                      <div
                        className="text-[11px] uppercase tracking-wider"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {kpi.label}
                      </div>
                      <div
                        className="mt-1 text-lg font-bold tabular-nums"
                        style={{ color: kpi.color }}
                      >
                        {kpi.val}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Mini Authentic Comparison Table */}
                <div className="glass-level-2 overflow-hidden rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr
                        className="border-b"
                        style={{
                          borderColor: "var(--glass-2-border)",
                          color: "var(--text-muted)",
                        }}
                      >
                        <th className="px-3 py-2">ID</th>
                        <th className="px-3 py-2">Status</th>
                        <th className="px-3 py-2 text-right">Source</th>
                        <th className="px-3 py-2 text-right">Destination</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y"></tbody>
                  </table>
                </div>
              </GlassPanel>
            </div>
          </div>
          </section>
        </main>
{showPrivacy && (
        <div className="fixed bottom-4 left-4 z-40 max-w-sm bg-white border border-[#EAECEF] rounded-2xl shadow-lg p-4">
          <p className="text-xs text-[#6B7280]">
            FinSync stores workspace data locally in your browser's IndexedDB with zero-retention CSV processing. No tracking cookies.
          </p>
          <button onClick={dismissPrivacy} className="mt-2 text-xs font-medium text-[#2563EB]">Dismiss</button>
        </div>
      )}
      <BackToTop />
      </div>
    );
  };
