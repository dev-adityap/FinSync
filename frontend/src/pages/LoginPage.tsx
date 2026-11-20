import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Layers,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowRight,
  Info,
} from "lucide-react";
import { AmbientBackground } from "../components/glass/AmbientBackground";
import { GlassPanel } from "../components/glass/GlassPanel";
import { GlassInput } from "../components/glass/GlassInput";
import { GlassButton } from "../components/glass/GlassButton";

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!email.trim() || !email.includes("@")) {
      setFormError("Please enter a valid email address.");
      setPassword("");
      return;
    }

    // Never transmit, store, or log credentials; clear password immediately
    setPassword("");
    setStatusNotice(
      "Authentication is not enabled yet. Account functionality will be available in a future release. No credentials were sent or stored."
    );
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between px-4 py-8 sm:px-6">
      <AmbientBackground />

      <div className="mx-auto w-full max-w-md">
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

      <main className="mx-auto my-8 w-full max-w-md">
        <GlassPanel level={1} className="p-6 sm:p-8 space-y-6">
          {/* Header */}
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
              Sign in to FinSync
            </h1>
            <p className="text-xs sm:text-sm" style={{ color: "var(--text-secondary)" }}>
              Account authentication is currently in preview. Use Guest Workspace below for immediate access.
            </p>
          </div>

          {/* Transparent Auth-Disabled Notice */}
          {statusNotice && (
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
              <span>{statusNotice}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <GlassInput
              label="Email Address"
              type="email"
              autoComplete="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="h-4 w-4" aria-hidden="true" />}
              error={formError ?? undefined}
            />

            <GlassInput
              label="Password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="h-4 w-4" aria-hidden="true" />}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="rounded-md p-1 hover:bg-white/10"
                  style={{ color: "var(--text-muted)" }}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              }
            />

            <div className="flex items-center justify-between text-xs">
              <label
                className="inline-flex items-center gap-2 cursor-pointer select-none"
                style={{ color: "var(--text-secondary)" }}
              >
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-white/20 bg-transparent"
                />
                <span>Remember me (UI preview)</span>
              </label>

              <Link
                to="/forgot-password"
                className="font-medium hover:underline"
                style={{ color: "var(--accent-cyan)" }}
              >
                Forgot password?
              </Link>
            </div>

            <GlassButton type="submit" variant="primary" size="lg" className="w-full">
              Sign In
            </GlassButton>
          </form>

          {/* Direct Anonymous Workspace Action */}
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
              Continue without an account
            </GlassButton>

            <p
              className="text-center text-xs"
              style={{ color: "var(--text-secondary)" }}
            >
              Don&apos;t have an account?{" "}
              <Link
                to="/register"
                className="font-semibold hover:underline"
                style={{ color: "var(--accent-cyan)" }}
              >
                Create an account
              </Link>
            </p>
          </div>
        </GlassPanel>
      </main>

      <footer
        className="text-center text-xs"
        style={{ color: "var(--text-muted)" }}
      >
        FinSync Local-First Workspace • No credentials are transmitted or stored
      </footer>
    </div>
  );
};
