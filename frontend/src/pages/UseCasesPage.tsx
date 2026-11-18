import React from 'react'
import { Link } from 'react-router-dom'
import { GlassCard, GlassButton } from '../components/ui/GlassComponents'
import { ChevronRight, ArrowRight } from 'lucide-react'

const useCases = [
  { icon: 'CPU', title: 'ERP Migration', description: 'Validate data integrity when migrating from legacy ERP systems to modern platforms like SAP, Oracle, NetSuite, or Microsoft Dynamics. Ensure every financial record, transaction, and master data row survives the migration intact.' },
  { icon: 'Chart', title: 'Accounting Data Migration', description: 'Reconcile general ledger, accounts payable, accounts receivable, and financial statements between accounting software platforms (QuickBooks, Xero, Sage, etc.).' },
  { icon: 'Users', title: 'Customer Data Migration', description: 'Ensure CRM migrations preserve every customer record, contact, lead, opportunity, and interaction history when switching platforms.' },
  { icon: 'Dollar', title: 'Financial Reconciliation', description: 'Match transactions, invoices, and payments across banking and financial systems. Detect discrepancies down to the penny with configurable tolerance.' },
  { icon: 'Globe', title: 'SaaS Integrations', description: 'Validate data synchronization between SaaS platforms and internal databases. Catch sync failures before they impact operations.' },
  { icon: 'Database', title: 'Database Synchronization', description: 'Verify operational database migrations and replication accuracy. Confirm record counts, field values, and referential integrity.' },
]

export function UseCasesPage() {
  return (
    <div className="min-h-screen pt-16">
      <section className="py-20 md:py-28 px-4 md:px-6 lg:px-8">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-20">
            <span className="glass-secondary px-4 py-1.5 rounded-full text-sm font-medium text-electric-blue border border-electric-blue/30 mb-4 inline-block">
              Industry applications
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-text-primary mb-6">Use Cases</h1>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto">FinSync handles the data migrations that matter most to modern organizations.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {useCases.map((useCase, i) => (
              <GlassCard key={i} className="h-full" padding="lg" hover>
                <div className="glass-primary p-3 rounded-glass-sm w-12 h-12 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-electric-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {getIcon(useCase.icon)}
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">{useCase.title}</h3>
                <p className="text-text-secondary text-sm mb-6">{useCase.description}</p>
                <Link to="/app/reconcile/new" className="text-sm text-electric-blue hover:underline flex items-center gap-1">
                  Get Started <ChevronRight className="w-4 h-4" />
                </Link>
              </GlassCard>
            ))}
          </div>

          <section className="mt-20 rounded-glass-lg glass-primary overflow-hidden border border-white/10 p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-text-primary mb-4">Ready to validate your data?</h3>
                <p className="text-text-secondary mb-6">Start with sample data or upload your own CSV files. No account required.</p>
              </div>
              <div className="flex-1">
                <Link to="/app/reconcile/new" className="btn-primary w-full">
                  Start Reconciliation
                </Link>
              </div>
            </div>
          </section>
        </div>
      </section>
    </div>
  )
}

function getIcon(name: string): React.ReactNode {
  const icons: Record<string, React.ReactNode> = {
    CPU: (
      <svg width="18" height="12" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <rect width="18" height="12" x="3" y="4" rx="2" ry="2" fill="none" />
        <line x1="7.5" y1="8" x2="7.5" y2="12" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="16.5" y1="8" x2="16.5" y2="12" />
      </svg>
    ),
    Chart: (
      <svg width="18" height="20" fill="none" stroke="currentColor" strokeWidth={2}>
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
        <polyline points="18 14 12 10 6 14" fill="none" />
      </svg>
    ),
    Users: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" fill="none" />
        <circle cx="9" cy="7" r="4" fill="none" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" fill="none" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" fill="none" />
      </svg>
    ),
    Dollar: (
      <svg width="18" height="20" fill="none" stroke="currentColor" strokeWidth={2}>
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0-7M6 17l5-2 5 2" fill="none" />
      </svg>
    ),
    Globe: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={2}>
        <circle cx="12" cy="12" r="10" fill="none" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" fill="none" />
      </svg>
    ),
    Database: (
      <svg width="18" height="14" fill="none" stroke="currentColor" strokeWidth={2}>
        <ellipse cx="12" cy="5" rx="9" ry="3" fill="none" />
        <path d="M3 5v14c0 1.65 6.89 3 15 3s15-1.35 15-3V5c0-1.65-6.89-3-15-3S12 3.35 12 5z" fill="none" />
      </svg>
    ),
  }
  return icons[name] || <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 2L2 7l10 5 10-5-10-5z" /></svg>
}