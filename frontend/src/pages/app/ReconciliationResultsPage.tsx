import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useWorkspace } from '../../context/WorkspaceContext'
import { useToast } from '../../context/ToastContext'
import { GlassCard, GlassPanel, GlassButton, GlassTable, GlassBadge, StatCard, Skeleton, GlassDrawer, GlassSelect } from '../../components/ui/GlassComponents'
import { ChevronRight, Download, Search, Filter, BarChart2, PieChart, Clock, FileText, ArrowLeft, Eye } from 'lucide-react'
import { formatNumber, formatPercentage, formatDateTime, getStatusColor, getStatusLabel } from '../../utils/helpers'

export function ReconciliationResultsPage() {
  const { sessionId } = useParams()
  const { sessions, getSession } = useWorkspace()
  const { showToast } = useToast()
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<any>(null)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const loadSession = async () => {
      if (sessionId) {
        const s = await getSession(sessionId)
        setSession(s || null)
      }
      setLoading(false)
    }
    loadSession()
  }, [sessionId, getSession])

  if (loading) {
    return (
      <GlassPanel padding="lg">
        <h1 className="text-2xl font-bold text-text-primary mb-6">Reconciliation Results</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1,2,3,4,5,6,7,8].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
      </GlassPanel>
    )
  }

  if (!session) {
    return (
      <GlassPanel padding="lg">
        <div className="flex flex-col items-center justify-center text-center py-20">
          <h2 className="text-xl font-bold text-text-primary mb-2">Session Not Found</h2>
          <p className="text-text-secondary mb-6">The reconciliation session could not be found.</p>
          <Link to="/app/history" className="btn-primary">Back to History</Link>
        </div>
      </GlassPanel>
    )
  }

  const results = session.results
  const filteredRecords = results.records.filter((r: any) => {
    const matchFilter = filter === 'all' || r.primaryStatus === filter
    const matchSearch = search === '' || r.recordId.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  const statusColorMap: Record<string, string> = {
    MATCHED: 'success',
    MISMATCHED: 'error',
    MISSING_IN_DESTINATION: 'warning',
    UNEXPECTED_IN_DESTINATION: 'violet',
    DUPLICATE: 'cyan',
    INVALID: 'error',
  }

  return (
    <GlassPanel padding="lg">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link to="/app/history" className="btn-ghost mb-4 inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to History
          </Link>
          <h1 className="text-2xl font-bold text-text-primary mb-1">{session.name}</h1>
          <p className="text-text-secondary">{session.sourceSystem} → {session.destinationSystem}</p>
        </div>
        <div className="flex gap-3">
          <Link to={`/app/data-explorer?session=${sessionId}`} className="btn-ghost">
            <FileText className="w-4 h-4 mr-2" /> Data Explorer
          </Link>
          <GlassButton variant="ghost" onClick={() => showToast({ type: 'info', title: 'Export', message: 'Export functionality available in Reports section.' })}>
            <Download className="w-4 h-4" />
          </GlassButton>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard title="Source Records" value={formatNumber(results.metrics.sourceRows)} />
        <StatCard title="Destination Records" value={formatNumber(results.metrics.destinationRows)} />
        <StatCard title="Matched" value={formatNumber(results.metrics.matched)} change={{ value: results.metrics.matchPercentage, label: 'match rate' }} />
        <StatCard title="Mismatched" value={formatNumber(results.metrics.mismatched)} trend="down" />
        <StatCard title="Missing" value={formatNumber(results.metrics.missing)} trend="down" />
        <StatCard title="Unexpected" value={formatNumber(results.metrics.unexpected)} trend="down" />
        <StatCard title="Duplicate" value={formatNumber(results.metrics.duplicate)} trend="down" />
        <StatCard title="Invalid" value={formatNumber(results.metrics.invalid)} trend="down" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <GlassCard padding="lg">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Validation Distribution</h3>
          <div className="space-y-4">
            {[
              { label: 'Matched', value: results.metrics.matched, color: 'text-success', status: 'MATCHED' },
              { label: 'Mismatched', value: results.metrics.mismatched, color: 'text-error', status: 'MISMATCHED' },
              { label: 'Missing', value: results.metrics.missing, color: 'text-warning', status: 'MISSING_IN_DESTINATION' },
              { label: 'Unexpected', value: results.metrics.unexpected, color: 'text-violet', status: 'UNEXPECTED_IN_DESTINATION' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div className="flex items-center gap-2">
                  <GlassBadge variant={item.color === 'text-success' ? 'success' : item.color === 'text-error' ? 'error' : 'warning'} size="sm">{item.label}</GlassBadge>
                </div>
                <span className="tabular-nums text-text-primary">{formatNumber(item.value)}</span>
              </div>
            ))}
          </div>
        </GlassCard>
        <GlassCard padding="lg">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-text-secondary">Match Percentage</span>
              <span className="tabular-nums font-medium text-text-primary">{results.metrics.matchPercentage.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Total Issues</span>
              <span className="tabular-nums font-medium text-text-primary">{results.metrics.totalIssues}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Processing Duration</span>
              <span className="tabular-nums font-medium text-text-primary">{results.duration}ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Status</span>
              <GlassBadge variant={results.status === 'PASSED' ? 'success' : results.status === 'PASSED_WITH_WARNINGS' ? 'warning' : 'error'} size="sm">
                {results.status}
              </GlassBadge>
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              className="input-field pl-9 pr-4 py-2 w-64"
              placeholder="Search records..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <GlassSelect
            options={[
              { value: 'all', label: 'All' },
              { value: 'MATCHED', label: 'Matched' },
              { value: 'MISMATCHED', label: 'Mismatched' },
              { value: 'MISSING_IN_DESTINATION', label: 'Missing' },
              { value: 'UNEXPECTED_IN_DESTINATION', label: 'Unexpected' },
              { value: 'DUPLICATE', label: 'Duplicate' },
              { value: 'INVALID', label: 'Invalid' },
            ]}
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="w-48"
          />
        </div>
        <span className="text-sm text-text-muted">
          {filteredRecords.length} of {results.records.length} records
        </span>
      </div>

        <GlassTable
          columns={[
            { key: 'recordId', header: 'Record ID', className: 'w-1/5' },
            { key: 'status', header: 'Status', className: 'w-1/5' },
            { key: 'issues', header: 'Issues', className: 'w-1/5' },
            { key: 'action', header: 'Action', className: 'w-1/5' },
          ]}
          data={filteredRecords}
          keyExtractor={(row: any) => row.id}
          cellRender={(row: any, key: string) => {
          if (key === 'recordId') return <span className="font-mono text-text-primary">{row.recordId}</span>
          if (key === 'status') return <GlassBadge variant={(statusColorMap[row.primaryStatus] || 'default') as any} size="sm">{getStatusLabel(row.primaryStatus)}</GlassBadge>
          if (key === 'issues') return <span className="tabular-nums text-text-primary">{row.issueCount}</span>
          if (key === 'action') return <GlassButton variant="ghost" size="sm" onClick={() => { setSelectedRecord(row); setDrawerOpen(true) }}><Eye className="w-4 h-4" /></GlassButton>
          return null
        }}
        emptyMessage="No records match your filters"
      />

      <GlassDrawer
        isOpen={drawerOpen}
        onClose={() => { setDrawerOpen(false); setSelectedRecord(null) }}
        title={`Record Details: ${selectedRecord?.recordId}`}
        size="lg"
      >
        {selectedRecord && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">Record ID</p>
                <p className="text-text-primary font-mono">{selectedRecord.recordId}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">Primary Status</p>
                <GlassBadge variant={(statusColorMap[selectedRecord.primaryStatus] || 'default') as any}>{getStatusLabel(selectedRecord.primaryStatus)}</GlassBadge>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-2">Field Comparisons</p>
              <div className="space-y-3">
                {selectedRecord.fieldComparisons.map((fc: any, i: number) => (
                  <div key={i} className="glass-secondary p-3 rounded-glass-sm">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-text-primary">{fc.field}</span>
                      <GlassBadge variant={fc.match ? 'success' : 'error'} size="sm">{fc.match ? 'Matched' : 'Mismatched'}</GlassBadge>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <p className="text-xs text-text-muted">Source</p>
                        <p className="text-sm text-text-primary break-all">{String(fc.sourceValue)}</p>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-text-muted">Destination</p>
                        <p className="text-sm text-text-primary break-all">{String(fc.destinationValue)}</p>
                      </div>
                    </div>
                    {fc.difference !== undefined && (
                      <p className="text-xs text-error mt-1">Difference: {fc.difference}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-2">Detected Issues</p>
              <div className="space-y-2">
                {selectedRecord.issues.map((issue: any, i: number) => (
                  <div key={i} className="flex items-start gap-2 p-2 glass-primary rounded-glass-sm">
                    <span className="text-xs text-error">{issue.type}</span>
                    <p className="text-xs text-text-secondary">{issue.message}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </GlassDrawer>
    </GlassPanel>
  )
}
