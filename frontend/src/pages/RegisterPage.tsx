import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Layers,
  User,
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

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};

    if (!fullName.trim()) {
      nextErrors.fullName = "Full name is required.";
    }
    if (!email.trim() || !email.includes("@")) {
      nextErrors.email = "Enter a valid email address.";
    }
    if (password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters.";
    }
    if (password !== confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }
    if (!acceptedTerms) {
      nextErrors.terms = "Please acknowledge the Terms of Use and Privacy notice.";
    }

    // Clear password fields immediately regardless of validation outcome
    setPassword("");
    setConfirmPassword("");

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setStatusNotice(null);
      return;
    }

    setErrors({});
    setStatusNotice(
      "Authentication is not enabled yet. Account functionality will be available in a future release. No account was created and no credentials were stored."
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
              Create your account
            </h1>
            <p className="text-xs sm:text-sm" style={{ color: "var(--text-secondary)" }}>
              Registration UI preview. Start reconciling right away in your browser without an account.
            </p>
          </div>

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
              label="Full Name"
              type="text"
              autoComplete="name"
              placeholder="Alex Morgan"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              leftIcon={<User className="h-4 w-4" aria-hidden="true" />}
              error={errors.fullName}
            />

            <GlassInput
              label="Work Email"
              type="email"
              autoComplete="email"
              placeholder="alex@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="h-4 w-4" aria-hidden="true" />}
              error={errors.email}
            />

            <GlassInput
              label="Password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Minimum 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="h-4 w-4" aria-hidden="true" />}
              error={errors.password}
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

            <GlassInput
              label="Confirm Password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              leftIcon={<Lock className="h-4 w-4" aria-hidden="true" />}
              error={errors.confirmPassword}
            />

            <div className="space-y-1">
              <label
                className="flex items-start gap-2.5 text-xs cursor-pointer select-none"
                style={{ color: "var(--text-secondary)" }}
              >
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-0.5 rounded border-white/20 bg-transparent"
                />
                <span>
                  I acknowledge the{" "}
                  <Link to="/terms" className="underline" style={{ color: "var(--accent-cyan)" }}>
                    Terms of Use
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="underline" style={{ color: "var(--accent-cyan)" }}>
                    Privacy &amp; Data Handling
                  </Link>{" "}
                  notice.
                </span>
              </label>
              {errors.terms && (
                <p
                  role="alert"
                  className="text-xs font-medium"
                  style={{ color: "var(--status-error)" }}
                >
                  {errors.terms}
                </p>
              )}
            </div>

            <GlassButton type="submit" variant="primary" size="lg" className="w-full">
              Create Account
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
              Continue without an account
            </GlassButton>

            <p
              className="text-center text-xs"
              style={{ color: "var(--text-secondary)" }}
            >
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold hover:underline"
                style={{ color: "var(--accent-cyan)" }}
              >
                Sign in
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
