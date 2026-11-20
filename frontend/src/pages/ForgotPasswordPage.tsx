import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Layers, Mail, ArrowLeft, ArrowRight, Info } from "lucide-react";
import { AmbientBackground } from "../components/glass/AmbientBackground";
import { GlassPanel } from "../components/glass/GlassPanel";
import { GlassInput } from "../components/glass/GlassInput";
import { GlassButton } from "../components/glass/GlassButton";

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.");
      setNotice(null);
      return;
    }
    setError(null);
    setNotice(
      "Account recovery is not enabled yet because authentication is disabled in this release. No reset email was sent."
    );
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between px-4 py-8 sm:px-6">
      <AmbientBackground />

      <div className="mx-auto w-full max-w-md">
        <Link to="/login">
          <GlassButton
            variant="ghost"
            size="sm"
            leftIcon={<ArrowLeft className="h-4 w-4" aria-hidden="true" />}
          >
            Back to Sign In
          </GlassButton>
        </Link>
      </div>

      <main className="mx-auto my-8 w-full max-w-md">
        <GlassPanel level={1} className="p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-2">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <span
                className="flex h-10 w-10 items-center justify-center rounded-xl shadow-md"
                style={{
                  background:
                    "linear-gradient(135deg, var(--accent-blue), var(--accent-violet))",
                }}
              >
                <Layers className="h-5 w-5 text-white" aria-hidden="true" />
              </span>
              <span
                className="text-xl font-bold tracking-tight"
                style={{ color: "var(--text-primary)" }}
              >
                FinSync
              </span>
            </Link>

            <h1
              className="text-xl sm:text-2xl font-bold pt-1"
              style={{ color: "var(--text-primary)" }}
            >
              Reset password
            </h1>
            <p className="text-xs sm:text-sm" style={{ color: "var(--text-secondary)" }}>
              Account recovery UI placeholder. Authentication will be enabled in a future release.
            </p>
          </div>

          {notice && (
            <div
              role="status"
              className="rounded-xl border p-3.5 text-xs leading-relaxed flex items-start gap-2.5"
              style={{
                borderColor: "rgba(115, 221, 245, 0.4)",
                backgroundColor: "rgba(115, 221, 245, 0.1)",
                color: "var(--text-primary)",
              }}
            >
              <Info
                className="h-4 w-4 shrink-0 mt-0.5"
                style={{ color: "var(--accent-cyan)" }}
                aria-hidden="true"
              />
              <span>{notice}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <GlassInput
              label="Account Email"
              type="email"
              autoComplete="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="h-4 w-4" aria-hidden="true" />}
              error={error ?? undefined}
            />

            <GlassButton type="submit" variant="primary" size="lg" className="w-full">
              Send Reset Link
            </GlassButton>
          </form>

          <div
            className="pt-4 border-t space-y-3"
            style={{ borderColor: "var(--glass-2-border)" }}
          >
            <GlassButton
              type="button"
              variant="secondary"
              size="lg"
              className="w-full"
              rightIcon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}
              onClick={() => navigate("/app")}
            >
              Explore Demo Workspace
            </GlassButton>
          </div>
        </GlassPanel>
      </main>

      <footer
        className="text-center text-xs"
        style={{ color: "var(--text-muted)" }}
      >
        FinSync Local-First Workspace
      </footer>
    </div>
  );
};
