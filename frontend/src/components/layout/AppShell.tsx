import React, { useEffect, useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { clsx } from "clsx";
import {
  LayoutDashboard,
  FolderKanban,
  GitCompareArrows,
  History,
  Database,
  FileSpreadsheet,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  Plus,
  Layers,
} from "lucide-react";
import { Topbar } from "./Topbar";
import { BackToTop } from "../glass/BackToTop";
import { HelpFab } from "../glass/HelpFab";
import { workspaceRepo } from "../../db/dexieRepository";
import type { ProjectSummary } from "../../types/project";

const NAV_ITEMS = [
  { to: "/app", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> , end: true },
  { to: "/app/projects", label: "Projects", icon: <FolderKanban className="h-4 w-4" /> },
  { to: "/app/reconcile/new", label: "New Reconciliation", icon: <GitCompareArrows className="h-4 w-4" /> },
  { to: "/app/data-explorer", label: "Data Explorer", icon: <Database className="h-4 w-4" /> },
  { to: "/app/reports", label: "Reports", icon: <FileSpreadsheet className="h-4 w-4" /> },
  { to: "/app/history", label: "History", icon: <History className="h-4 w-4" /> },
  { to: "/app/settings", label: "Settings", icon: <Settings className="h-4 w-4" /> },
];

export const AppShell: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);

  useEffect(() => {
    let active = true;
    workspaceRepo.listProjectsWithSummary().then((list) => {
      if (active) setProjects(list.slice(0, 4));
    }).catch(() => {});
    return () => { active = false; };
  }, []);

  const renderNav = (onNavigate?: () => void) => (
    <nav className="flex-1 px-3 py-4 space-y-1">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={onNavigate}
          className={({ isActive }) =>
            clsx(
              "flex items-center gap-3 rounded-full px-3 py-2 text-sm font-medium transition-colors",
              isActive ? "bg-[#1F1E1D] text-white" : "text-[#A1A1AA] hover:text-white hover:bg-[#1F1E1D]/60"
            )
          }
        >
          {item.icon}
          {!collapsed && <span className="truncate">{item.label}</span>}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-[#121110] p-2 sm:p-3 flex">
      {/* Sidebar */}
      <aside
        className={clsx(
          "hidden lg:flex flex-col bg-[#121110] border border-white/10 rounded-[22px] transition-all",
          collapsed ? "w-16" : "w-[240px]"
        )}
      >
        <div className="flex items-center justify-between px-4 h-14">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-[#121110]">
              <Layers className="h-4 w-4" />
            </span>
            {!collapsed && <span className="text-white font-bold tracking-tight">FinSync</span>}
          </Link>
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="text-[#A1A1AA] hover:text-white p-1"
            aria-label="Toggle sidebar"
          >
            {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
        </div>

        {renderNav()}

        <div className="px-3 pb-2">
          {!collapsed && (
            <div className="flex items-center justify-between px-2 py-2 text-xs text-[#A1A1AA]">
              <span>Projects</span>
              <Link to="/app/projects" className="hover:text-white"><Plus className="h-3.5 w-3.5" /></Link>
            </div>
          )}
          <div className="space-y-1">
            {projects.map((p) => (
              <Link
                key={p.id}
                to="/app/projects"
                className="block truncate text-xs text-[#A1A1AA] hover:text-white px-2 py-1 rounded-full hover:bg-[#1F1E1D]"
              >
                {!collapsed && p.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-auto p-3 border-t border-white/10">
          <div className="text-xs text-[#A1A1AA]">
            {!collapsed && (
              <>
                <div className="font-medium text-white">Guest Workspace</div>
                <div>Local IndexedDB</div>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="relative z-10 w-72 max-w-[82vw] bg-[#121110] flex flex-col rounded-r-[22px]">
            <div className="flex items-center justify-between px-4 h-14">
              <span className="text-white font-bold">FinSync</span>
              <button onClick={() => setMobileOpen(false)} className="text-[#A1A1AA]"><X className="h-5 w-5" /></button>
            </div>
            {renderNav(() => setMobileOpen(false))}
          </aside>
        </div>
      )}

      {/* Main canvas */}
      <div className="flex-1 flex flex-col min-w-0 ml-2 sm:ml-3">
        <div className="rounded-[28px] flex-1 flex flex-col overflow-hidden" style={{ backgroundColor: "var(--canvas-bg)" }}>
          <Topbar onOpenMobileMenu={() => setMobileOpen(true)} />
          <main id="main-content" className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <Outlet />
          </main>
        </div>
      </div>
<BackToTop />
      <HelpFab />
    </div>
  );
};
