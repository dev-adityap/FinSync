import React from "react";
import { Link } from "react-router-dom";
import { Layers } from "lucide-react";

export const MarketingFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="border-t mt-20"
      style={{
        borderColor: "var(--glass-2-border)",
        backgroundColor: "rgba(8, 13, 28, 0.72)",
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-3">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <span
                className="flex h-8 w-8 items-center justify-center rounded-xl"
                style={{
                  background:
                    "linear-gradient(135deg, var(--accent-blue), var(--accent-violet))",
                }}
              >
                <Layers className="h-4 w-4 text-white" aria-hidden="true" />
              </span>
              <span
                className="text-base font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                FinSync
              </span>
            </Link>

            <p
              className="text-sm max-w-md leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              Intelligent Data Integration &amp; Migration Validator. Compare
              source and destination CSV exports, detect financial discrepancies,
              and verify every migration record before sign-off.
            </p>

            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Public Release Note: Runs in anonymous local-first browser mode
              (IndexedDB). Do not upload regulated or confidential enterprise
              production records in this public release.
            </p>
          </div>

          {/* Product Links */}
          <div className="space-y-2.5">
            <h3
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: "var(--text-primary)" }}
            >
              Product
            </h3>
            <ul className="space-y-2 text-sm" style={{ color: "var(--text-secondary)" }}>
              <li>
                <Link to="/app" className="hover:underline">
                  Workspace Dashboard
                </Link>
              </li>
              <li>
                <Link to="/app/reconcile/new" className="hover:underline">
                  New Reconciliation
                </Link>
              </li>
              <li>
                <a href="/#features" className="hover:underline">
                  Capabilities
                </a>
              </li>
              <li>
                <a href="/#faq" className="hover:underline">
                  Documentation &amp; FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Governance & Contact Placeholder */}
          <div className="space-y-2.5">
            <h3
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: "var(--text-primary)" }}
            >
              Data &amp; Governance
            </h3>
            <ul className="space-y-2 text-sm" style={{ color: "var(--text-secondary)" }}>
              <li>
                <Link to="/privacy" className="hover:underline">
                  Privacy &amp; Data Handling
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:underline">
                  Terms of Use
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:underline">
                  Account Portal (Preview)
                </Link>
              </li>
              <li className="text-xs pt-1" style={{ color: "var(--text-muted)" }}>
                Support Contact: Available via repository documentation
              </li>
            </ul>
          </div>
        </div>

        <div
          className="mt-10 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-xs"
          style={{
            borderColor: "var(--glass-2-border)",
            color: "var(--text-muted)",
          }}
        >
          <p>&copy; {currentYear} FinSync. Every Record. Every Field. Every Detail. In Sync.</p>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="hover:underline">
              Privacy
            </Link>
            <Link to="/terms" className="hover:underline">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};