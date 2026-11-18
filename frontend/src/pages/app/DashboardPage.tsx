import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useWorkspace } from '../../context/WorkspaceContext'
import { useToast } from '../../context/ToastContext'
import { GlassCard, GlassPanel, GlassButton, StatCard, GlassBadge, Skeleton } from '../../components/ui/GlassComponents'
import { useTheme } from '../../context/ThemeContext'
import {
  LayoutDashboard, FolderKanban, PlusCircle, Database, FileText,
  BarChart2, PieChart, TrendingUp, ArrowRight, Clock, CheckCircle,
  XCircle, AlertCircle, ChevronRight,
} from 'lucide-react'
import { formatNumber, formatPercentage, formatDateTime } from '../../utils/helpers'

export function DashboardPage() {
  const { projects, sessions, currentProjectId, setCurrentProject, setCurrentSession, settings } = useWorkspace()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setTimeout(() => setLoading(false), 500)
  }, [])

  const totalReconciliations = sessions.length
  const completedSessions = sessions.filter(s => s.status === 'completed')
  const totalRecords = completedSessions.reduce((sum, s) => sum + (s.results?.metrics.sourceRows || 0), 0)
  const totalMatched = completedSessions.reduce((sum, s) => sum + (s.results?.metrics.matched || 0), 0)
  const totalIssues = completedSessions.reduce((sum, s) => sum + (s.results?.metrics.totalIssues || 0), 0)
  const matchPercentage = totalRecords > 0 ? (totalMatched / totalRecords * 100) : 0

  const recentSessions = completedSessions.slice(0, 5)

  if (loading) {
    return (
      <GlassPanel padding="lg">
        <h1 className="text-2xl font-bold text-text-primary mb-6">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1,2,3,4,5,6].map(i => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="flex gap-4 h-12">
              <Skeleton className="w-24 h-full rounded-glass-sm" />
              <Skeleton className="flex-1 h-full rounded-glass-sm" />
            </div>
          ))}
        </div>
      </GlassPanel>
    )
  }

  if (projects.length === 0 && sessions.length === 0) {
    return (
      <GlassPanel padding="lg">
        <div className="flex flex-col items-center justify-center text-center py-20">
          <div className="glass-primary w-16 h-16 flex items-center justify-center rounded-full mb-4">
            <LayoutDashboard className="w-8 h-8 text-text-muted" />
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-2">Welcome to FinSync</h2>
          <p className="text-text-secondary mb-8 max-w-sm">Your workspace is empty. Start by creating a project or running a sample reconciliation.</p>
          <div className="flex gap-4 justify-center">
            <GlassButton variant="primary" onClick={() => setCurrentProject(null)}>
              New Reconciliation
            </GlassButton>
            <GlassButton variant="ghost" asChild>
              <a href="/app/projects">Create Project</a>
            </GlassButton>
          </div>
        </div>
      </GlassPanel>
    )
  }

  return (
    <GlassPanel padding="lg">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary mb-1">Dashboard</h1>
          <p className="text-text-secondary">Your data integrity, at a glance.</p>
        </div>
        <GlassButton variant="primary" asChild>
          <Link to="/app/reconcile/new">
            <PlusCircle className="w-4 h-4 mr-2" /> New Reconciliation
          </Link>
        </GlassButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard title="Projects" value={projects.length} />
        <StatCard title="Total Reconciliations" value={totalReconciliations} />
        <StatCard title="Records Processed" value={formatNumber(totalRecords)} />
        <StatCard title="Matched Records" value={formatNumber(totalMatched)} change={{ value: matchPercentage, label: 'match rate' }} />
        <StatCard title="Discrepancies" value={formatNumber(totalIssues)} change={{ value: totalIssues, label: 'total issues' }} trend="down" />
        <StatCard title="Match Percentage" value={matchPercentage.toFixed(1)} change={{ value: matchPercentage, label: 'overall' }} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <GlassCard padding="lg">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Reconciliation Activity</h3>
          <div className="h-48 flex items-end gap-2">
            {completedSessions.slice(-7).map((session, i) => (
              <div key={i} className="flex-1 bg-white/5 rounded-t-glass-sm flex items-end justify-center" style={{ minHeight: '40%' }}>
                <div className="bg-electric-blue/50 w-full rounded-b-glass-sm h-[60%]" />
              </div>
            ))}
          </div>
        </GlassCard>
        <GlassCard padding="lg">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Validation Status</h3>
          <div className="space-y-3">
            {[
              { label: 'Matched', value: totalMatched, color: 'text-success', status: 'MATCHED' },
              { label: 'Mismatched', value: completedSessions.reduce((s, x) => s + (x.results?.metrics.mismatched || 0), 0), color: 'text-error', status: 'MISMATCHED' },
              { label: 'Missing', value: completedSessions.reduce((s, x) => s + (x.results?.metrics.missing || 0), 0), color: 'text-warning', status: 'MISSING' },
              { label: 'Unexpected', value: completedSessions.reduce((s, x) => s + (x.results?.metrics.unexpected || 0), 0), color: 'text-violet', status: 'UNEXPECTED' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <span className="text-sm text-text-secondary">{item.label}</span>
                <div className="flex items-center gap-2">
                  <GlassBadge variant={item.color === 'text-success' ? 'success' : item.color === 'text-error' ? 'error' : 'warning'} size="sm">
                    {formatNumber(item.value)}
                  </GlassBadge>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard padding="lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text-primary">Recent Sessions</h3>
            <Link to="/app/history" className="text-sm text-electric-blue hover:underline">View all</Link>
          </div>
          <div className="space-y-4">
            {recentSessions.length > 0 ? recentSessions.map(session => (
              <div key={session.id} className="flex items-center justify-between p-3 glass-secondary rounded-glass-sm hover:bg-white/5 cursor-pointer transition-colors group">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{session.name}</p>
                  <p className="text-xs text-text-secondary truncate">{session.sourceSystem} → {session.destinationSystem}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-medium tabular-nums">{session.results?.metrics.matchPercentage.toFixed(1)}%</span>
                    <GlassBadge variant="default" size="sm">{getStatusLabel(session.status)}</GlassBadge>
                  </div>
                </div>
                <GlassButton variant="ghost" size="sm" onClick={() => setCurrentSession(session.id)}>
                  <ChevronRight className="w-4 h-4 text-text-muted" />
                </GlassButton>
              </div>
            )) : (
              <p className="text-text-muted text-sm">No recent sessions.</p>
            )}
          </div>
        </GlassCard>
        <GlassCard padding="lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text-primary">Recent Activity</h3>
          </div>
          <div className="space-y-4">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="flex items-start gap-3 p-3 glass-secondary rounded-glass-sm">
                <div className="glass-primary w-8 h-8 flex items-center justify-center rounded-glass-sm flex-shrink-0">
                  <Database className="w-4 h-4 text-electric-blue" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary">Project created</p>
                  <p className="text-xs text-text-muted">{formatDateTime(new Date().toISOString())}</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </GlassPanel>
  )
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    completed: 'Completed',
    processing: 'Processing',
    draft: 'Draft',
    failed: 'Failed',
  }
  return labels[status] || status
}
