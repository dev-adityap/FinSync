import React, { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useWorkspace } from '../../context/WorkspaceContext'
import { GlassCard, GlassPanel, GlassButton, GlassTable, GlassTabs, GlassBadge } from '../../components/ui/GlassComponents'
import { FileText, Search, Database } from 'lucide-react'
import { formatNumber } from '../../utils/helpers'

export function DataExplorerPage() {
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session')
  const { sessions, getSession } = useWorkspace()
  const [session, setSession] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('source')
  const [search, setSearch] = useState('')

  const tabs = [
    { id: 'source', label: 'Source Dataset', icon: <FileText className="w-4 h-4" /> },
    { id: 'destination', label: 'Destination Dataset', icon: <Database className="w-4 h-4" /> },
  ]

  const data = session?.sourceFile || session?.destinationFile || null
  const headers = data?.headers || []
  const rows = data?.preview || []

  const filteredRows = rows.filter((row: any) => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    return headers.some((h: string) => String(row[h] || '').toLowerCase().includes(searchLower))
  })

  return (
    <GlassPanel padding="lg">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary mb-1">Data Explorer</h1>
          <p className="text-text-secondary">Inspect your source and destination datasets.</p>
        </div>
      </div>

      {session ? (
        <>
          <GlassTabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
          <div className="mt-6">
            <div className="flex gap-4 mb-6">
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
              <span className="text-sm text-text-muted">{filteredRows.length} of {rows.length} records</span>
            </div>
            <GlassTable
              columns={[
                { key: 'id', header: 'Row #', className: 'w-1/10' },
                ...headers.map((h: string) => ({ key: h, header: h, className: 'w-auto' })),
              ]}
              data={filteredRows.map((row: any, i: number) => ({ id: i + 1, ...row }))}
              keyExtractor={(row: any) => row.id}
              emptyMessage="No records found"
            />
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center text-center py-20">
          <div className="glass-primary w-16 h-16 flex items-center justify-center rounded-full mb-4">
            <Database className="w-8 h-8 text-text-muted" />
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-2">No Data Available</h2>
          <p className="text-text-secondary mb-6">Complete a reconciliation session to view datasets here.</p>
          <GlassButton variant="primary" asChild>
            <a href="/app/reconcile/new">Start Reconciliation</a>
          </GlassButton>
        </div>
      )}
    </GlassPanel>
  )
}
