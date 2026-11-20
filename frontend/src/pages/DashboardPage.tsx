import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  GitCompareArrows,
  Plus,
  Play,
} from "lucide-react";
import { workspaceRepo } from "../db/dexieRepository";
import { useWorkspace } from "../context/WorkspaceContext";
import { ProjectSummary } from "../types/project";
import {
  ReconciliationConfig,
  ReconciliationSession,
} from "../types/reconciliation";

import { previewCsvFile } from "../services/csvService";
import { suggestColumnMappings } from "../services/mappingService";
import { executeReconciliation } from "../services/reconciliationService";
import { GlassCard } from "../components/glass/GlassCard";
import { GlassButton } from "../components/glass/GlassButton";

const SAMPLE_SOURCE_CSV = `ID,Name,Email,Amount,Status
101,Rahul Sharma,rahul@example.com,5000,Active
102,Amit Das,amit@example.com,2500,Active
103,Priya Sen,priya@example.com,8000,Active
104,Ankit Roy,ankit@example.com,3200,Active
105,Neha Das,neha@example.com,4500,Inactive`;

const SAMPLE_DESTINATION_CSV = `customer_id,customer_name,email,amount,status
101,Rahul Sharma,rahul@example.com,5000,Active
102,Amit Das,amit@example.com,2500,Active
103,Priya Sen,priya@example.com,800,Active
105,Neha Das,neha@example.com,4500,Inactive
106,Sourav Pal,sourav@example.com,6000,Active`;

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { settings, notify, refreshCounter, bumpRefresh } = useWorkspace();

  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [sessions, setSessions] = useState<ReconciliationSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningSample, setRunningSample] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([
      workspaceRepo.listProjectsWithSummary(),
      workspaceRepo.listSessions(),
    ])
      .then(([projList, sessList]) => {
        if (!active) return;
        setProjects(projList);
        setSessions(sessList);
      })
      .catch((err) => {
        if (!active) return;
        notify("error", "Failed to load workspace", err instanceof Error ? err.message : "IndexedDB read error.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [refreshCounter, notify]);

  const metrics = useMemo(() => {
    const completed = sessions.filter((s) => s.status === "COMPLETED");
    const recordsProcessed = completed.reduce((sum, s) => sum + s.sourceRowCount, 0);
    const matchedRecords = completed.reduce((sum, s) => sum + s.matchedCount, 0);
    const discrepancies = completed.reduce((sum, s) => sum + s.mismatchedCount + s.duplicateCount + s.invalidCount, 0);
    const missingRecords = completed.reduce((sum, s) => sum + s.missingCount, 0);
    return { projectCount: projects.length, totalReconciliations: sessions.length, recordsProcessed, matchedRecords, discrepancies, missingRecords };
  }, [projects, sessions]);

  const activitySeries = useMemo(() => {
    const map = new Map<string, { date: string; sessions: number; matched: number; issues: number }>();
    const chronological = [...sessions].reverse();
    for (const s of chronological) {
      const day = new Date(s.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" });
      const existing = map.get(day) ?? { date: day, sessions: 0, matched: 0, issues: 0 };
      existing.sessions += 1;
      existing.matched += s.matchedCount;
      existing.issues += s.totalIssues;
      map.set(day, existing);
    }
    return Array.from(map.values());
  }, [sessions]);

  const handleTrySampleReconciliation = async () => {
    if (runningSample) return;
    setRunningSample(true);
    try {
      let targetProject = projects[0];
      if (!targetProject) {
        const created = await workspaceRepo.createProject({
          name: "ERP Customer & Balance Migration",
          description: "Sample reconciliation workspace comparing Legacy ERP and New ERP CSV exports.",
        });
        targetProject = { ...created, sessionCount: 0 };
      }
      const sessionId = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `sample-${Date.now()}`;
      const sourceFile = new File([SAMPLE_SOURCE_CSV], "sample_source.csv", { type: "text/csv" });
      const destFile = new File([SAMPLE_DESTINATION_CSV], "sample_destination.csv", { type: "text/csv" });
      const [sourcePreview, destPreview] = await Promise.all([
        previewCsvFile(sourceFile, sessionId, "source", 10),
        previewCsvFile(destFile, sessionId, "destination", 10),
      ]);
      await Promise.all([workspaceRepo.saveDatasetPreview(sourcePreview), workspaceRepo.saveDatasetPreview(destPreview)]);
      const suggestedMappings = suggestColumnMappings(sourcePreview.headers, destPreview.headers);
      const config: ReconciliationConfig = {
        sessionId,
        uniqueKeySource: "ID",
        uniqueKeyDestination: "customer_id",
        fieldMappings: suggestedMappings,
        validationOptions: {
          caseInsensitive: settings.defaultCaseInsensitive,
          trimWhitespace: settings.defaultTrimWhitespace,
          normalizeNumbers: true,
          normalizeDates: false,
          dateFormat: "%Y-%m-%d",
          numericTolerance: settings.defaultNumericTolerance || "0.01",
          detectMissing: true,
          detectUnexpected: true,
          detectDuplicates: true,
          validateRequired: true,
          validateNonEmpty: true,
          validateNumeric: true,
          validateEmail: true,
        },
      };
      await workspaceRepo.saveConfig(config);
      const draftSession: ReconciliationSession = {
        id: sessionId,
        projectId: targetProject.id,
        projectName: targetProject.name,
        name: "Sample ERP Financial Migration",
        description: "Automated sample run verifying customer records and balances.",
        sourceSystem: "Legacy ERP",
        destinationSystem: "New ERP",
        status: "RUNNING",
        matchPercentage: 0,
        sourceRowCount: sourcePreview.rowCount,
        destinationRowCount: destPreview.rowCount,
        matchedCount: 0,
        mismatchedCount: 0,
        missingCount: 0,
        unexpectedCount: 0,
        duplicateCount: 0,
        invalidCount: 0,
        totalIssues: 0,
        durationMs: 0,
        createdAt: new Date().toISOString(),
      };
      const { completedSession, records } = await executeReconciliation({ session: draftSession, config, sourceFile, destinationFile: destFile });
      await workspaceRepo.saveReconciliationOutcome(completedSession, records);
      bumpRefresh();
      notify("success", "Sample Reconciliation Completed", `Processed ${completedSession.sourceRowCount} source records via the FastAPI engine.`);
      navigate(`/app/reconcile/${sessionId}`);
    } catch (err) {
      notify("error", "Sample Reconciliation Failed", err instanceof Error ? err.message : "Ensure the FastAPI backend is running on port 8000.");
    } finally {
      setRunningSample(false);
    }
  };

  const passed = sessions.filter((s) => s.overallValidationStatus === "PASSED");
  const warnings = sessions.filter((s) => s.overallValidationStatus === "PASSED_WITH_WARNINGS");
  const failed = sessions.filter((s) => s.overallValidationStatus === "FAILED");
  const recent = [...sessions].slice(0, 4);
  const featured = warnings[0] || failed[0] || sessions[0];

  const renderSessionCard = (s: ReconciliationSession, inverted = false) => (
    <div
      key={s.id}
      className={`rounded-[20px] p-4 border ${inverted ? "bg-[#141312] text-white border-white/10" : "bg-white border-[#EAECEF]"}`}
    >
      <div className={`text-sm font-semibold ${inverted ? "text-white" : "text-[var(--text-primary)]"}`}>{s.name}</div>
      <div className={`text-xs mt-1 ${inverted ? "text-[#A1A1AA]" : "text-[#6B7280]"}`}>{s.description || "Reconciliation session"}</div>
      <div className="mt-3 flex items-center justify-between">
        <span className={`text-xs ${inverted ? "text-[#A1A1AA]" : "text-[#6B7280]"}`}>Match rate</span>
        <span className={`text-sm font-bold tabular-nums ${inverted ? "text-white" : "text-[var(--text-primary)]"}`}>{s.matchPercentage.toFixed(1)}%</span>
      </div>
      <div className="mt-2 h-1.5 rounded-full bg-[#F3F4F6] overflow-hidden">
        <div className="h-full bg-[#2563EB]" style={{ width: `${Math.min(100, s.matchPercentage)}%` }} />
      </div>
    </div>
  );

  if (loading) {
    return <div className="text-sm text-[#6B7280]">Loading workspace…</div>;
  }

  if (sessions.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">Good afternoon.</h2>
            <p className="mt-1 text-sm sm:text-base text-[#6B7280]">Your data integrity, at a glance.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <GlassButton variant="secondary" loading={runningSample} leftIcon={<Play className="h-4 w-4" />} onClick={() => void handleTrySampleReconciliation()}>
              Try Sample Reconciliation
            </GlassButton>
            <Link to="/app/projects"><GlassButton variant="primary" leftIcon={<Plus className="h-4 w-4" />}>New Reconciliation</GlassButton></Link>
          </div>
        </div>
        <GlassCard padding="lg" className="text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EFF6FF] text-[#2563EB]">
            <GitCompareArrows className="h-6 w-6" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-[var(--text-primary)]">No reconciliations in this browser yet</h3>
          <p className="mx-auto max-w-lg text-sm leading-relaxed text-[#6B7280]">
            All metrics on this dashboard are computed from actual stored reconciliation sessions.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <GlassButton variant="primary" loading={runningSample} leftIcon={<Play className="h-4 w-4" />} onClick={() => void handleTrySampleReconciliation()}>
              Try Sample Reconciliation
            </GlassButton>
            <Link to="/app/projects"><GlassButton variant="secondary">Create a Project</GlassButton></Link>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">Good afternoon.</h2>
          <p className="mt-1 text-sm sm:text-base text-[#6B7280]">Your data integrity, at a glance.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <GlassButton variant="secondary" loading={runningSample} leftIcon={<Play className="h-4 w-4" />} onClick={() => void handleTrySampleReconciliation()}>
            Try Sample Reconciliation
          </GlassButton>
          <Link to="/app/reconcile/new"><GlassButton variant="primary" leftIcon={<Plus className="h-4 w-4" />}>New Reconciliation</GlassButton></Link>
        </div>
      </div>

      {/* Hero row */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <GlassCard padding="md" className="xl:col-span-8 space-y-3">
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Reconciliation Pipeline</h3>
            <p className="text-xs text-[#9CA3AF]">Matched records vs. total issues across session dates</p>
          </div>
          <div className="relative h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activitySeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EAECEF" />
                <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: "#FFFFFF", borderColor: "#EAECEF", borderRadius: "12px", color: "#111111" }} />
                <Area type="monotone" dataKey="matched" name="Matched" stroke="#2563EB" fill="#93C5FD" fillOpacity={0.4} />
                <Area type="monotone" dataKey="issues" name="Issues" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
            <div className="absolute top-2 right-2 bg-white rounded-full shadow px-3 py-1 text-xs font-semibold text-[#2563EB]">
              {(metrics.matchedRecords / Math.max(1, metrics.recordsProcessed) * 100).toFixed(0)}%
            </div>
          </div>
        </GlassCard>

        <GlassCard padding="md" className="xl:col-span-4 space-y-3">
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Priority Audits</h3>
            <p className="text-xs text-[#9CA3AF]">Discrepancies requiring attention</p>
          </div>
          <div className="text-3xl font-bold tabular-nums text-[var(--text-primary)]">{metrics.discrepancies}</div>
          <div className="space-y-3 mt-2">
            {[
              { label: "Mismatched", value: metrics.discrepancies },
              { label: "Missing", value: metrics.missingRecords },
              { label: "Records Processed", value: metrics.recordsProcessed },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between text-xs text-[#6B7280] mb-1">
                  <span>{item.label}</span>
                  <span className="tabular-nums text-[var(--text-primary)] font-medium">{item.value}</span>
                </div>
                <div className="h-1.5 rounded-full bg-[#F3F4F6] overflow-hidden">
                  <div className="h-full bg-[#2563EB]" style={{ width: `${Math.min(100, (item.value / Math.max(1, metrics.recordsProcessed)) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Status board */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {[
          { title: "Passed", items: passed },
          { title: "Warnings", items: warnings },
          { title: "Failed", items: failed },
          { title: "Recent Runs", items: recent },
        ].map((col) => (
          <div key={col.title} className="space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">{col.title}</div>
            {col.items.length === 0 ? (
              <div className="text-xs text-[#9CA3AF]">None</div>
            ) : (
              col.items.map((s) => renderSessionCard(s, s.id === featured?.id && col.title === "Warnings"))
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

