import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Menu, Bell, Search, Plus, Sun, Moon } from "lucide-react";
import { useWorkspace } from "../../context/WorkspaceContext";
import { workspaceRepo } from "../../db/dexieRepository";
import { ActivityItem } from "../../types/workspace";
import { GlassPanel } from "../glass/GlassPanel";

interface TopbarProps {
  onOpenMobileMenu: () => void;
}

const ROUTE_TITLES: Record<string, string> = {
  "/app": "Overview",
  "/app/projects": "Projects",
  "/app/reconcile/new": "New Reconciliation",
  "/app/history": "Reconciliation History",
  "/app/data-explorer": "Data Explorer",
  "/app/reports": "Reports",
  "/app/settings": "Settings",
};

function resolvePageTitle(pathname: string): string {
  if (ROUTE_TITLES[pathname]) return ROUTE_TITLES[pathname];
  if (pathname.startsWith("/app/reconcile/")) return "Reconciliation Results";
  return "Workspace";
}

export const Topbar: React.FC<TopbarProps> = ({ onOpenMobileMenu }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { refreshCounter, toggleTheme, settings } = useWorkspace();
  const [activityOpen, setActivityOpen] = useState(false);
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  const pageTitle = resolvePageTitle(location.pathname);

  useEffect(() => {
    let active = true;
    workspaceRepo.listActivities(8).then((items) => {
      if (active) setActivities(items);
    }).catch(() => { if (active) setActivities([]); });
    return () => { active = false; };
  }, [refreshCounter, activityOpen]);

  return (
    <header className="sticky top-0 z-30 px-4 sm:px-6 lg:px-8 py-4" style={{ backgroundColor: "var(--canvas-bg)" }}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            aria-label="Open navigation menu"
            className="lg:hidden rounded-xl p-2 hover:bg-white transition-colors text-[#111111]"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold text-[#111111] truncate">{pageTitle}</h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:flex items-center gap-2 rounded-full bg-white border border-[#EAECEF] px-4 py-2 w-64">
            <Search className="h-4 w-4 text-[#9CA3AF]" />
            <input
              placeholder="Search..."
              className="bg-transparent outline-none text-sm text-[#111111] placeholder:text-[#9CA3AF] w-full"
            />
          </div>

          <button
            type="button"
            onClick={() => navigate("/app/reconcile/new")}
            className="inline-flex items-center gap-2 rounded-full bg-[#111111] text-white px-4 py-2 text-sm font-medium hover:bg-[#111111]/90"
          >
            <Plus className="h-4 w-4" />
            New Reconciliation
          </button>

<div className="relative">
            <button
              type="button"
              onClick={() => void toggleTheme()}
              aria-label="Toggle theme"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              {settings.theme === "dark-glass" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setActivityOpen((p) => !p)}
              aria-label="Recent workspace activity"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white border border-[#EAECEF] text-[#6B7280] hover:text-[#111111]"
            >
              <Bell className="h-4 w-4" />
            </button>
            {activityOpen && (
              <>
                <div onClick={() => setActivityOpen(false)} className="fixed inset-0 z-30" aria-hidden="true" />
                <GlassPanel className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] z-40 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">Recent Activity</span>
                    <button onClick={() => setActivityOpen(false)} className="text-xs text-[#2563EB] hover:underline">Close</button>
                  </div>
                  {activities.length === 0 ? (
                    <p className="text-xs py-4 text-center text-[#9CA3AF]">No local workspace activity recorded yet.</p>
                  ) : (
                    <ul className="space-y-2.5 max-h-64 overflow-y-auto">
                      {activities.map((act) => (
                        <li key={act.id} className="rounded-lg border border-[#EAECEF] p-2.5 text-xs bg-white">
                          <p className="text-[#111111]">{act.summary}</p>
                          <p className="mt-1 text-[11px] tabular-nums text-[#9CA3AF]">{new Date(act.createdAt).toLocaleString()}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </GlassPanel>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
