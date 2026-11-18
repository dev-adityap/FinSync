import React from 'react'
import { Link } from 'react-router-dom'
import { GlassButton, GlassCard, StatCard } from '../components/ui/GlassComponents'
import { cn } from '../utils/helpers'
import {
  ArrowRight, CheckCircle, Shield, Zap, Search, BarChart2, FileText,
  Database, GitCompare, ArrowUpRight, Globe, Lock, Users, Cpu, Target,
  ChevronRight, Star, Layers, RefreshCw, Download, Upload, Settings,
} from 'lucide-react'

const features = [
  {
    icon: GitCompare,
    title: 'Smart Data Mapping',
    description: 'Intelligently map columns between source and destination datasets with automatic suggestions and manual override.',
  },
  {
    icon: Search,
    title: 'Financial Reconciliation',
    description: 'Compare numerical values with configurable tolerance, detect discrepancies down to the penny.',
  },
  {
    icon: Database,
    title: 'Missing Record Detection',
    description: 'Identify records present in source but missing from destination, and vice versa.',
  },
  {
    icon: RefreshCw,
    title: 'Duplicate Detection',
    description: 'Find duplicate identifiers in both datasets before they corrupt your migration.',
  },
  {
    icon: Target,
    title: 'Migration Validation',
    description: 'End-to-end validation pipeline with configurable rules for data types, formats, and constraints.',
  },
  {
    icon: FileText,
    title: 'Exportable Reports',
    description: 'Generate detailed CSV and PDF reports for auditors, stakeholders, and compliance.',
  },
]

const steps = [
  { number: '01', title: 'Upload Your Data', description: 'Drag and drop source and destination CSV files. Preview first 10 rows instantly.', icon: Upload },
  { number: '02', title: 'Map Your Fields', description: 'Match columns between datasets. Auto-suggestions with manual override. Select unique identifier.', icon: GitCompare },
  { number: '03', title: 'Configure Validation', description: 'Set numeric tolerance, case sensitivity, whitespace handling, date formats, and detection rules.', icon: Settings },
  { number: '04', title: 'Run Reconciliation', description: 'Execute the comparison engine. Real-time progress with detailed processing metrics.', icon: Zap },
  { number: '05', title: 'Review Discrepancies', description: 'Interactive results dashboard with filtering, drill-down, and field-level comparison.', icon: Search },
  { number: '06', title: 'Export Results', description: 'Download complete reports, mismatch summaries, missing records, and audit trails.', icon: Download },
]

const useCases = [
  { icon: Cpu, title: 'ERP Migration', description: 'Validate data integrity when migrating from legacy ERP to modern platforms like SAP, Oracle, or NetSuite.' },
  { icon: BarChart2, title: 'Accounting Data Migration', description: 'Reconcile general ledger, accounts payable, and receivable between accounting systems.' },
  { icon: Users, title: 'Customer Data Migration', description: 'Ensure CRM migrations preserve every customer record, contact, and interaction history.' },
  { icon: DollarSign, title: 'Financial Reconciliation', description: 'Match transactions, invoices, and payments across banking and financial systems.' },
  { icon: Globe, title: 'SaaS Integrations', description: 'Validate data sync between SaaS platforms and internal databases.' },
  { icon: Database, title: 'Database Synchronization', description: 'Verify operational database migrations and replication accuracy.' },
]

const stats = [
  { label: 'Records Processed', value: '10M+', icon: Database },
  { label: 'Discrepancies Found', value: '2.3M+', icon: Search },
  { label: 'Migrations Validated', value: '500+', icon: CheckCircle },
  { label: 'Hours Saved', value: '50K+', icon: Clock },
]

function DollarSign({ className }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
}

function Clock({ className }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
}

export function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(99,139,255,0.15)_0%,transparent_50%),radial-gradient(ellipse_at_80%_0%,rgba(155,140,255,0.12)_0%,transparent_50%),radial-gradient(ellipse_at_50%_100%,rgba(115,221,245,0.08)_0%,transparent_40%)]" />
        <div className="relative max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <div className="glass-secondary inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 animate-fade-in">
              <span className="text-xs font-medium text-electric-blue">New: Liquid Glass Interface</span>
              <span className="w-2 h-2 bg-electric-blue rounded-full animate-pulse" />
            </div>
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold text-text-primary mb-8 leading-tight text-balance">
              Your Data Migration.<br />
              <span className="text-electric-blue">Verified.</span>
            </h1>
            <p className="text-lg md:text-xl text-text-secondary mb-10 max-w-2xl mx-auto leading-relaxed">
              Compare, validate, and reconcile data between systems with confidence. Find discrepancies, catch missing records, and ensure every migration tells the right story.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link to="/app/reconcile/new" className="btn-primary group w-full sm:w-auto">
                <span className="flex items-center gap-2">
                  Start Reconciliation
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
              <Link to="/app" className="btn-secondary w-full sm:w-auto">
                Explore Demo
              </Link>
            </div>
            <div className="flex items-center justify-center gap-8 text-sm text-text-muted">
              <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-success" /> No account required</span>
              <span className="flex items-center gap-1"><Lock className="w-4 h-4 text-warning" /> Local-first privacy</span>
              <span className="flex items-center gap-1"><Download className="w-4 h-4 text-cyan" /> Export anytime</span>
            </div>
          </div>

          {/* Product Preview */}
          <div className="mt-16 relative animate-slide-in-right">
            <div className="glass-primary rounded-glass-lg overflow-hidden shadow-floating border border-white/10">
              <div className="glass-secondary px-4 py-3 border-b border-white/10 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-error/60" />
                  <div className="w-3 h-3 rounded-full bg-warning/60" />
                  <div className="w-3 h-3 rounded-full bg-success/60" />
                </div>
                <div className="glass-primary flex-1 px-4 py-1.5 rounded-glass-sm text-center text-xs text-text-muted font-mono">
                  reconciliation-results-november-migration.csv
                </div>
              </div>
              <div className="p-6 md:p-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {[
                    { label: 'Source Records', value: '12,847', color: 'text-electric-blue' },
                    { label: 'Matched', value: '11,923', color: 'text-success' },
                    { label: 'Mismatched', value: '642', color: 'text-error' },
                    { label: 'Missing', value: '282', color: 'text-warning' },
                  ].map((stat, i) => (
                    <div key={i} className="glass-secondary p-4 rounded-glass-sm">
                      <p className="text-xs font-medium text-text-muted uppercase tracking-wider">{stat.label}</p>
                      <p className="text-3xl font-bold tabular-nums {stat.color} mt-1">{stat.value}</p>
                    </div>
                  ))}
                </div>
                <div className="glass-secondary rounded-glass-sm overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="px-4 py-3 text-left font-medium text-text-secondary">Record ID</th>
                        <th className="px-4 py-3 text-left font-medium text-text-secondary">Status</th>
                        <th className="px-4 py-3 text-left font-medium text-text-secondary">Source Amount</th>
                        <th className="px-4 py-3 text-left font-medium text-text-secondary">Dest Amount</th>
                        <th className="px-4 py-3 text-left font-medium text-text-secondary">Difference</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { id: 'INV-2024-001', status: 'MATCHED', source: '$12,450.00', dest: '$12,450.00', diff: '$0.00', statusColor: 'status-matched' },
                        { id: 'INV-2024-002', status: 'MISMATCHED', source: '$8,900.00', dest: '$8,900.00', diff: '$0.00', statusColor: 'status-mismatched' },
                        { id: 'INV-2024-003', status: 'MISMATCHED', source: '$15,200.00', dest: '$15,200.00', diff: '$0.00', statusColor: 'status-mismatched' },
                        { id: 'INV-2024-004', status: 'MISSING', source: '$3,400.00', dest: '—', diff: '—', statusColor: 'status-missing' },
                        { id: 'INV-2024-005', status: 'UNEXPECTED', source: '—', dest: '$7,100.00', diff: '—', statusColor: 'status-unexpected' },
                      ].map((row, i) => (
                        <tr key={i} className="border-b border-white/5 hover:bg-white/3">
                          <td className="px-4 py-3 font-mono text-text-primary">{row.id}</td>
                          <td className="px-4 py-3"><span className={`status-badge ${row.statusColor}`}>{row.status}</span></td>
                          <td className="px-4 py-3 tabular-nums">{row.source}</td>
                          <td className="px-4 py-3 tabular-nums">{row.dest}</td>
                          <td className="px-4 py-3 tabular-nums text-error">{row.diff}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust/Value Props */}
      <section className="py-20 md:py-28 px-4 md:px-6 lg:px-8 bg-deep-indigo/50 border-y border-white/5">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-text-primary mb-4">Why FinSync?</h2>
            <p className="text-text-secondary max-w-2xl mx-auto">Built for data engineers, migration specialists, and financial teams who demand accuracy.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: Shield, title: 'Accurate Comparison', desc: 'Row-level, field-level precision with configurable tolerance for financial data.' },
              { icon: Search, title: 'Discrepancy Detection', desc: 'Catch mismatches, missing records, duplicates, and invalid data automatically.' },
              { icon: Zap, title: 'Automated Validation', desc: 'Rule-based validation engine with customizable rules for any data type.' },
              { icon: FileText, title: 'Transparent Reports', desc: 'Audit-ready exports with full lineage from source to destination.' },
            ].map((item, i) => (
              <GlassCard key={i} className="h-full" padding="lg">
                <div className="glass-primary p-3 rounded-glass-sm w-12 h-12 flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-electric-blue" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">{item.title}</h3>
                <p className="text-text-secondary text-sm">{item.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 md:py-28 px-4 md:px-6 lg:px-8">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-text-primary mb-4">Core Features</h2>
            <p className="text-text-secondary max-w-2xl mx-auto">Everything you need to validate migrations with confidence.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <GlassCard key={i} className="h-full" padding="lg" hover>
                <div className="glass-primary p-3 rounded-glass-sm w-12 h-12 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-electric-blue" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">{feature.title}</h3>
                <p className="text-text-secondary text-sm">{feature.description}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 md:py-28 px-4 md:px-6 lg:px-8 bg-deep-indigo/50 border-y border-white/5">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-text-primary mb-4">How It Works</h2>
            <p className="text-text-secondary max-w-2xl mx-auto">A guided workflow from upload to audit-ready reports in six steps.</p>
          </div>
          <div className="space-y-8">
            {steps.map((step, i) => (
              <div key={i} className="flex gap-6 md:gap-8" style={{ flexDirection: i % 2 === 0 ? 'row' : 'row-reverse' }}>
                <div className={cn('flex-1 glass-panel p-6 md:p-8', i % 2 === 0 ? 'md:pr-12' : 'md:pl-12')}>
                  <div className="glass-primary w-16 h-16 flex items-center justify-center rounded-glass-sm mb-4 text-2xl font-bold text-electric-blue">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-semibold text-text-primary mb-2">{step.title}</h3>
                  <p className="text-text-secondary">{step.description}</p>
                </div>
                <div className="flex-1 flex items-center justify-center">
                  <div className="glass-secondary p-8 rounded-glass-lg text-center max-w-sm">
                    <div className="text-6xl font-display font-bold text-electric-blue/20">{step.number}</div>
                    <div className="mt-4 space-y-2">
                      {steps[i].icon && <StepIcon icon={steps[i].icon} />}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 md:py-28 px-4 md:px-6 lg:px-8">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-text-primary mb-4">Use Cases</h2>
            <p className="text-text-secondary max-w-2xl mx-auto">FinSync handles the migrations that matter most.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {useCases.map((useCase, i) => (
              <GlassCard key={i} className="h-full" padding="lg" hover>
                <div className="glass-primary p-3 rounded-glass-sm w-12 h-12 flex items-center justify-center mb-4">
                  <useCase.icon className="w-6 h-6 text-electric-blue" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">{useCase.title}</h3>
                <p className="text-text-secondary text-sm">{useCase.description}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Product Preview */}
      <section className="py-20 md:py-28 px-4 md:px-6 lg:px-8 bg-deep-indigo/50 border-y border-white/5">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-text-primary mb-4">Product Preview</h2>
            <p className="text-text-secondary max-w-2xl mx-auto">Screens from the actual application interface.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { title: 'Dashboard', desc: 'Real-time KPIs, activity charts, and recent sessions from your local workspace.', icon: BarChart2 },
              { title: 'Column Mapping', desc: 'Intelligent field matching with auto-suggestions and manual override.', icon: GitCompare },
              { title: 'Reconciliation Results', desc: 'Interactive discrepancy explorer with drill-down field comparison.', icon: Search },
              { title: 'Analytics', desc: 'Visual insights into match rates, issue distributions, and trends.', icon: BarChart2 },
            ].map((preview, i) => (
              <GlassCard key={i} className="h-full" padding="lg">
                <div className="glass-secondary aspect-video rounded-glass-sm mb-4 flex items-center justify-center">
                  <div className="text-center">
                    <div className="glass-primary p-3 rounded-glass-sm w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                      <preview.icon className="w-8 h-8 text-electric-blue" />
                    </div>
                    <p className="text-text-muted">{preview.title} Preview</p>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">{preview.title}</h3>
                <p className="text-text-secondary text-sm mb-4">{preview.desc}</p>
                <Link to="/app" className="text-sm text-electric-blue hover:underline flex items-center gap-1">
                  View in App <ChevronRight className="w-4 h-4" />
                </Link>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 md:py-28 px-4 md:px-6 lg:px-8">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-text-primary mb-4">Frequently Asked Questions</h2>
          </div>
          <div className="max-w-3xl mx-auto space-y-4">
            {[
              { q: 'What is FinSync?', a: 'FinSync is a data integration and migration validation platform that compares datasets from two systems to detect discrepancies before accepting a migration.' },
              { q: 'Which file formats are supported?', a: 'Currently CSV files up to 20MB. Support for Excel, Parquet, and JSON is planned.' },
              { q: 'How does reconciliation work?', a: 'FinSync matches records using a unique identifier you select, then compares mapped fields with configurable validation rules including numeric tolerance, case sensitivity, and whitespace handling.' },
              { q: 'Can source and destination columns have different names?', a: 'Yes. The column mapping step lets you match any source column to any destination column regardless of naming differences.' },
              { q: 'Does FinSync detect missing records?', a: 'Yes. Records in source but not in destination are flagged as MISSING_IN_DESTINATION. Records in destination but not in source are flagged as UNEXPECTED_IN_DESTINATION.' },
              { q: 'Can I export reconciliation results?', a: 'Yes. Export complete reports, mismatch summaries, missing records, unexpected records, duplicates, invalid records, and summary reports as CSV.' },
              { q: 'Where is uploaded data stored?', a: 'Data is processed in-memory on the backend and never permanently stored. Your workspace (projects, sessions, results) persists locally in your browser using IndexedDB.' },
              { q: 'Does FinSync require an account?', a: 'No. FinSync works completely without authentication. Your workspace is stored locally in this browser. Account functionality is planned for a future release.' },
            ].map((faq, i) => (
              <details key={i} className="glass-secondary group">
                <summary className="flex items-center justify-between p-4 cursor-pointer list-none">
                  <span className="font-medium text-text-primary">{faq.q}</span>
                  <ChevronRight className="w-5 h-5 text-text-muted transition-transform group-open:rotate-90" />
                </summary>
                <div className="px-4 pb-4 text-text-secondary border-t border-white/10">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 md:py-28 px-4 md:px-6 lg:px-8 bg-deep-indigo/50 border-y border-white/5">
        <div className="max-w-[1400px] mx-auto text-center">
          <div className="glass-primary rounded-glass-lg p-8 md:p-12 lg:p-16">
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary mb-4">Make Every Migration Count</h2>
            <p className="text-text-secondary text-lg mb-8 max-w-2xl mx-auto">Stop guessing. Start verifying. Join teams who trust FinSync for their critical data migrations.</p>
            <Link to="/app/reconcile/new" className="btn-primary inline-flex items-center gap-2">
              Start Your First Reconciliation
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 md:px-6 lg:px-8 border-t border-white/10">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <Link to="/" className="flex items-center gap-2 mb-4" aria-label="FinSync Home">
                <div className="glass-primary p-2 rounded-glass-sm">
                  <svg className="w-6 h-6 text-electric-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="font-display font-semibold text-xl text-text-primary">FinSync</span>
              </Link>
              <p className="text-text-secondary text-sm max-w-xs">Intelligent Data Integration & Migration Validator. Every Record. Every Field. Every Detail. In Sync.</p>
            </div>
            <div>
              <h4 className="font-medium text-text-primary mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li><Link to="/features" className="hover:text-text-primary transition-colors">Features</Link></li>
                <li><Link to="/how-it-works" className="hover:text-text-primary transition-colors">How It Works</Link></li>
                <li><Link to="/use-cases" className="hover:text-text-primary transition-colors">Use Cases</Link></li>
                <li><Link to="/docs" className="hover:text-text-primary transition-colors">Documentation</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-text-primary mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li><Link to="/privacy" className="hover:text-text-primary transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-text-primary transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-text-muted">© {new Date().getFullYear()} FinSync. All rights reserved.</p>
            <p className="text-sm text-text-muted">Local-first anonymous workspace. Not an authenticated account system.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function StepIcon({ icon: Icon }: { icon: React.ComponentType<any> }) {
  return (
    <div className="glass-primary p-4 rounded-glass-sm inline-block">
      <Icon className="w-8 h-8 text-electric-blue" />
    </div>
  )
}