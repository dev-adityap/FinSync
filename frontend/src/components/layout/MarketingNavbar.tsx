import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Layers, Menu, X, Sun, Moon, ArrowRight } from "lucide-react";
import { useWorkspace } from "../../context/WorkspaceContext";
import { GlassButton } from "../glass/GlassButton";

const NAV_SECTIONS = [
  { label: "Product", href: "/#product" },
  { label: "Features", href: "/#features" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Use Cases", href: "/#use-cases" },
  { label: "Documentation", href: "/#faq" },
];

export const MarketingNavbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { settings, toggleTheme } = useWorkspace();
  const location = useLocation();

  const handleSectionClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    setMobileMenuOpen(false);
    if (location.pathname === "/" && href.startsWith("/#")) {
      const targetId = href.slice(2);
      const el = document.getElementById(targetId);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <header
      className="sticky top-0 z-40 border-b backdrop-blur-xl transition-colors"
      style={{
        backgroundColor: "var(--card-bg)",
        borderColor: "var(--card-border)",
      }}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 shrink-0"
          aria-label="FinSync Homepage"
        >
          <span
            className="flex h-9 w-9 items-center justify-center rounded-xl shadow-md"
            style={{
              background:
                "linear-gradient(135deg, var(--accent-blue) 0%, var(--accent-violet) 100%)",
            }}
          >
            <Layers className="h-5 w-5 text-white" aria-hidden="true" />
          </span>
          <div>
            <span
              className="block text-base font-bold tracking-tight"
              style={{ color: "var(--text-primary)" }}
            >
              FinSync
            </span>
            <span
              className="hidden sm:block text-[10px] uppercase tracking-widest"
              style={{ color: "var(--accent-cyan)" }}
            >
              Data Validator
            </span>
          </div>
        </Link>

        {/* Desktop Section Navigation */}
        <nav
          aria-label="Primary marketing navigation"
          className="hidden lg:flex items-center gap-6"
        >
          {NAV_SECTIONS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={(e) => handleSectionClick(e, item.href)}
              className="text-sm font-medium transition-colors hover:opacity-100 opacity-85"
              style={{ color: "var(--text-secondary)" }}
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => void toggleTheme()}
            aria-label="Toggle Liquid Glass Theme"
            className="glass-level-2 flex h-9 w-9 items-center justify-center rounded-xl hover:border-[var(--accent-cyan)]/40 transition-colors"
            style={{ color: "var(--text-secondary)" }}
          >
            {settings.theme === "dark-glass" ? (
              <Sun className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Moon className="h-4 w-4" aria-hidden="true" />
            )}
          </button>

          <Link to="/login">
            <GlassButton variant="ghost" size="sm">
              Sign In
            </GlassButton>
          </Link>

          <Link to="/app">
            <GlassButton
              variant="primary"
              size="sm"
              rightIcon={<ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />}
            >
              Get Started
            </GlassButton>
          </Link>
        </div>

        {/* Mobile Controls */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={() => void toggleTheme()}
            aria-label="Toggle theme"
            className="glass-level-2 flex h-9 w-9 items-center justify-center rounded-xl"
            style={{ color: "var(--text-secondary)" }}
          >
            {settings.theme === "dark-glass" ? (
              <Sun className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Moon className="h-4 w-4" aria-hidden="true" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            className="glass-level-2 flex h-9 w-9 items-center justify-center rounded-xl"
            style={{ color: "var(--text-primary)" }}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Navigation */}
      {mobileMenuOpen && (
        <div
          className="md:hidden border-t px-4 py-4 space-y-3"
          style={{
            backgroundColor: "var(--card-bg)",
            borderColor: "var(--card-border)",
          }}
        >
          <nav className="flex flex-col space-y-2">
            {NAV_SECTIONS.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={(e) => handleSectionClick(e, item.href)}
                className="rounded-xl px-3 py-2 text-sm font-medium hover:bg-white/[0.06]"
                style={{ color: "var(--text-primary)" }}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div
            className="pt-3 border-t flex flex-col gap-2"
            style={{ borderColor: "var(--glass-2-border)" }}
          >
            <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
              <GlassButton variant="secondary" className="w-full">
                Sign In
              </GlassButton>
            </Link>
            <Link to="/app" onClick={() => setMobileMenuOpen(false)}>
              <GlassButton variant="primary" className="w-full">
                Get Started
              </GlassButton>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};