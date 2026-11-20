import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";
import { AmbientBackground } from "../components/glass/AmbientBackground";
import { MarketingNavbar } from "../components/layout/MarketingNavbar";
import { MarketingFooter } from "../components/layout/MarketingFooter";
import { GlassPanel } from "../components/glass/GlassPanel";
import { GlassButton } from "../components/glass/GlassButton";

export const TermsPage: React.FC = () => {
  return (
    <div className="relative min-h-screen flex flex-col">
      <AmbientBackground />
      <MarketingNavbar />

      <main className="flex-1 mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-6">
          <Link to="/">
            <GlassButton
              variant="ghost"
              size="sm"
              leftIcon={<ArrowLeft className="h-4 w-4" aria-hidden="true" />}
            >
              Back to Homepage
            </GlassButton>
          </Link>
        </div>

        <GlassPanel level={1} className="p-6 sm:p-10 space-y-6">
          <div className="flex items-center gap-3">
            <span
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{
                backgroundColor: "rgba(99, 139, 255, 0.16)",
                color: "var(--accent-blue)",
              }}
            >
              <FileText className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h1
                className="text-2xl sm:text-3xl font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                Terms of Use
              </h1>
              <p className="text-xs sm:text-sm" style={{ color: "var(--text-muted)" }}>
                Operational terms for the FinSync public migration validation workspace
              </p>
            </div>
          </div>

          <section className="space-y-2 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
              1. Service Purpose
            </h2>
            <p>
              FinSync is a CSV data integration and migration validation tool built to
              help teams compare source and destination records, detect mismatches,
              missing rows, duplicates, and schema anomalies, and export reconciliation
              reports.
            </p>
          </section>

          <section className="space-y-2 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
              2. Anonymous Workspace Responsibilities
            </h2>
            <p>
              Because FinSync currently operates without user accounts or server-side
              cloud persistence, clearing browser site data or switching browsers will
              remove local workspace records unless you export a workspace backup file
              beforehand.
            </p>
          </section>

          <section className="space-y-2 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
              3. Acceptable Uploads
            </h2>
            <p>
              Users must only upload valid CSV files within published file size limits
              (up to 20 MB per dataset) and must not upload confidential, regulated, or
              personally sensitive production data in this unauthenticated public release.
            </p>
          </section>

          <section className="space-y-2 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
              4. Verification &amp; Sign-Off
            </h2>
            <p>
              Reconciliation metrics, tolerance comparisons, and generated reports are
              provided as validation aids. Users remain responsible for reviewing
              flagged discrepancies before approving production database or ERP
              cutovers.
            </p>
          </section>
        </GlassPanel>
      </main>

      <MarketingFooter />
    </div>
  );
};
