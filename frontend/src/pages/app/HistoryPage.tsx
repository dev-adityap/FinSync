import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useWorkspace } from '../../context/WorkspaceContext'
import { GlassCard, GlassPanel, GlassButton, GlassTable, GlassBadge, ConfirmDialog, Skeleton, GlassSelect } from '../../components/ui/GlassComponents'
import { Search, Filter, Calendar, Trash2, ChevronRight, Clock, RefreshCw } from 'lucide-react'
import { formatDateTime, formatNumber, formatPercentage, getStatusLabel } from '../../utils/helpers'

export function HistoryPage() {
  const { sessions, deleteSession, clearWorkspace } = useWorkspace()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false)

  const filtered = sessions.filter(s => {
    const matchSearch = search === '' || s.name.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || s.status === filter
    return matchSearch && matchFilter
  })

  return (
    <GlassPanel padding="lg">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary mb-1">Reconciliation History</h1>
          <p className="text-text-secondary">View and manage your reconciliation sessions.</p>
        </div>
        <GlassButton variant="ghost" onClick={() => { /* refresh */ }}>
          <RefreshCw className="w-4 h-4" />
        </GlassButton>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            className="input-field pl-9 pr-4 py-2 w-full"
            placeholder="Search sessions..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <GlassSelect
          options={[
            { value: 'all', label: 'All' },
            { value: 'completed', label: 'Completed' },
            { value: 'processing', label: 'Processing' },
            { value: 'draft', label: 'Draft' },
            { value: 'failed', label: 'Failed' },
          ]}
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="w-48"
        />
      </div>

      {sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-20">
          <div className="glass-primary w-16 h-16 flex items-center justify-center rounded-full mb-4">
            <Clock className="w-8 h-8 text-text-muted" />
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-2">No History Yet</h2>
          <p className="text-text-secondary mb-6">Complete your first reconciliation to see it here.</p>
          <GlassButton variant="primary" asChild>
            <Link to="/app/reconcile/new">
              <ChevronRight className="w-4 h-4 mr-2" /> Start Reconciliation
            </Link>
          </GlassButton>
        </div>
      ) : (
        <GlassTable
          columns={[
            { key: 'name', header: 'Session Name', className: 'w-1/5' },
            { key: 'systems', header: 'Systems', className: 'w-1/5' },
            { key: 'records', header: 'Records', className: 'w-1/10' },
            { key: 'match', header: 'Match %', className: 'w-1/10' },
            { key: 'status', header: 'Status', className: 'w-1/6' },
            { key: 'date', header: 'Completed', className: 'w-1/6' },
            { key: 'actions', header: 'Actions', className: 'w-1/6' },
          ]}
          data={filtered}
          keyExtractor={row => row.id}
          cellRender={(row: any, key: string) => {
            if (key === 'name') return <span className="font-medium text-text-primary">{row.name}</span>
            if (key === 'systems') return <span className="text-text-secondary text-sm">{row.sourceSystem} → {row.destinationSystem}</span>
            if (key === 'records') return <span className="tabular-nums text-text-primary">{row.results?.metrics?.sourceRows || 0}</span>
            if (key === 'match') return <span className="tabular-nums text-text-primary">{row.results?.metrics?.matchPercentage?.toFixed(1) || 0}%</span>
            if (key === 'status') return <GlassBadge variant="default" size="sm">{getStatusLabel(row.status)}</GlassBadge>
            if (key === 'date') return <span className="text-xs text-text-muted">{row.completedAt || row.updatedAt ? formatDateTime(row.completedAt || row.updatedAt) : '—'}</span>
            if (key === 'actions') return (
              <div className="flex gap-2">
                <Link to={`/app/reconcile/${row.id}`} className="btn-ghost px-3 py-1.5 text-sm">
                  View Results
                </Link>
                <button
                  onClick={() => { setDeletingId(row.id); setConfirmOpen(true) }}
                  className="text-error hover:bg-error/10 px-3 py-1.5 rounded-glass-sm text-sm transition-colors"
                >
                  Delete
                </button>
              </div>
            )
            return null
          }}
          emptyMessage="No sessions found"
        />
      )}

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => { deleteSession(deletingId!); setConfirmOpen(false); setDeletingId(null) }}
        title="Delete Session"
        message="This reconciliation session will be permanently deleted. This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
      />

      <ConfirmDialog
        isOpen={clearConfirmOpen}
        onClose={() => setClearConfirmOpen(false)}
        onConfirm={() => { clearWorkspace(); setClearConfirmOpen(false) }}
        title="Clear All History"
        message="This will delete all reconciliation sessions and projects. This action cannot be undone."
        confirmLabel="Clear All"
        variant="danger"
      />

      <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
        <GlassButton variant="ghost" onClick={() => setClearConfirmOpen(true)} disabled={sessions.length === 0}>
          <Trash2 className="w-4 h-4 mr-2" /> Clear All History
        </GlassButton>
        <span className="text-xs text-text-muted">{sessions.length} session{sessions.length !== 1 ? 's' : ''} stored locally</span>
      </div>
    </GlassPanel>
  )
}
