import React, { useState } from 'react'
import { GlassCard, GlassPanel, GlassButton, GlassTable, GlassBadge, Skeleton } from '../../components/ui/GlassComponents'
import { Download, FileText, ChevronRight } from 'lucide-react'
import { formatDateTime, formatNumber } from '../../utils/helpers'

const reportTypes = [
  { id: 'complete', label: 'Complete Reconciliation Report', description: 'Full reconciliation results with all records and issues.' },
  { id: 'mismatches', label: 'Mismatch Report', description: 'Records with field-level value mismatches.' },
  { id: 'missing', label: 'Missing Destination Records', description: 'Records in source but missing from destination.' },
  { id: 'unexpected', label: 'Unexpected Destination Records', description: 'Records in destination but not in source.' },
  { id: 'duplicates', label: 'Duplicate Records', description: 'Duplicate identifiers found in datasets.' },
  { id: 'invalid', label: 'Invalid Records', description: 'Records with invalid identifiers, required fields, or data types.' },
  { id: 'summary', label: 'Summary Report', description: 'High-level metrics and KPIs.' },
]

export function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState('')
  const [generating, setGenerating] = useState(false)

  const handleDownload = async () => {
    if (!sessionId || !selectedReport) return
    setGenerating(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      const blob = new Blob(['id,status,value\n1,MATCHED,100\n'], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${selectedReport}-report.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      alert('Failed to generate report')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <GlassPanel padding="lg">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary mb-1">Reports</h1>
        <p className="text-text-secondary">Generate and download reconciliation reports.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {reportTypes.map(report => (
          <GlassCard key={report.id} padding="lg" hover onClick={() => setSelectedReport(report.id)}>
            <div className="glass-primary p-3 rounded-glass-sm w-12 h-12 flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-electric-blue" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">{report.label}</h3>
            <p className="text-text-secondary text-sm mb-4">{report.description}</p>
            {selectedReport === report.id && (
              <div className="glass-secondary p-2 rounded-glass-sm">
                <p className="text-xs text-electric-blue">Selected</p>
              </div>
            )}
          </GlassCard>
        ))}
      </div>

      {selectedReport && (
        <GlassCard padding="lg">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-1">Generate {reportTypes.find(r => r.id === selectedReport)?.label}</h3>
              <p className="text-text-secondary text-sm">Select a session to generate the report for.</p>
            </div>
          </div>
          <div className="glass-secondary p-6 rounded-glass-sm space-y-4">
            <div>
              <label className="input-label">Session</label>
              <input
                type="text"
                className="input-field w-full"
                placeholder="Enter session ID"
                value={sessionId}
                onChange={e => setSessionId(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <GlassButton variant="primary" onClick={handleDownload} loading={generating} disabled={generating || !sessionId}>
                <Download className="w-4 h-4 mr-2" /> Download CSV Report
              </GlassButton>
              <GlassButton variant="ghost" onClick={() => alert('PDF export coming soon')}>
                <FileText className="w-4 h-4 mr-2" /> Download PDF
              </GlassButton>
            </div>
          </div>
        </GlassCard>
      )}
    </GlassPanel>
  )
}
