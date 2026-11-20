import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { AmbientBackground } from "../components/glass/AmbientBackground";
import { MarketingNavbar } from "../components/layout/MarketingNavbar";
import { MarketingFooter } from "../components/layout/MarketingFooter";
import { GlassPanel } from "../components/glass/GlassPanel";
import { GlassButton } from "../components/glass/GlassButton";

export const PrivacyPage: React.FC = () => {
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
                backgroundColor: "rgba(115, 221, 245, 0.14)",
                color: "var(--accent-cyan)",
              }}
            >
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h1
                className="text-2xl sm:text-3xl font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                Privacy &amp; Data Handling
              </h1>
              <p className="text-xs sm:text-sm" style={{ color: "var(--text-muted)" }}>
                Transparent documentation of how FinSync processes and stores workspace data
              </p>
            </div>
          </div>

          <section className="space-y-2 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
              1. Local-First Browser Persistence (IndexedDB)
            </h2>
            <p>
              FinSync operates in an anonymous, local-first workspace mode. Projects,
              reconciliation configurations, session metadata, validation results, and
              dataset previews are stored locally inside your current browser&apos;s
              IndexedDB storage. Data is not synchronized across different browsers or
              devices.
            </p>
          </section>

          <section className="space-y-2 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
              2. Ephemeral Backend Processing
            </h2>
            <p>
              When you upload CSV files to preview columns or execute a reconciliation,
              the FastAPI backend processes those files in memory or randomized
              temporary files solely to complete the request. Temporary processing files
              are removed immediately after execution completes or fails, and uploaded
              datasets are never retained permanently on the server.
            </p>
          </section>

          <section className="space-y-2 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
              3. Authentication Status &amp; Credential Handling
            </h2>
            <p>
              User account authentication is not enabled in this release. The Sign In,
              Registration, and Forgot Password screens are user interface placeholders
              only. FinSync never transmits, logs, or stores passwords or account
              credentials.
            </p>
          </section>

          <section className="space-y-2 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
              4. Suitable Dataset Scope
            </h2>
            <p>
              Because this initial public deployment runs in anonymous browser mode
              without authenticated access controls, it is intended for non-confidential
              validation workflows, testing, and sample datasets—not regulated or
              confidential enterprise financial records.
            </p>
          </section>

          <section className="space-y-2 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
              5. User Control &amp; Data Deletion
            </h2>
            <p>
              You retain full control over your local workspace. At any time, you can
              export a JSON backup, delete individual reconciliation sessions, or clear
              all locally stored IndexedDB records from the Settings screen.
            </p>
          </section>
        </GlassPanel>
      </main>

      <MarketingFooter />
    </div>
  );
};
