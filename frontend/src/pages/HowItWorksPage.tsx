import React from 'react'
import { Link } from 'react-router-dom'
import { GlassCard, GlassButton } from '../components/ui/GlassComponents'
import { ChevronRight, ArrowRight, GitCompare, Settings } from 'lucide-react'

const steps = [
  { number: '01', title: 'Upload Your Data', description: 'Drag and drop source and destination CSV files. Preview first 10 rows instantly. Supports files up to 20MB.' },
  { number: '02', title: 'Map Your Fields', description: 'Match columns between datasets. Auto-suggestions with manual override. Select unique identifier.' },
  { number: '03', title: 'Configure Validation', description: 'Set numeric tolerance, case sensitivity, whitespace handling, date formats, and detection rules.' },
  { number: '04', title: 'Run Reconciliation', description: 'Execute the comparison engine. Real-time progress with detailed processing metrics.' },
  { number: '05', title: 'Review Discrepancies', description: 'Interactive results dashboard with filtering, drill-down, and field-level comparison.' },
  { number: '06', title: 'Export Results', description: 'Download complete reports, mismatch summaries, missing records, and audit trails.' },
]

export function HowItWorksPage() {
  return (
    <div className="min-h-screen pt-16">
      <section className="py-20 md:py-28 px-4 md:px-6 lg:px-8">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-20">
            <span className="glass-secondary px-4 py-1.5 rounded-full text-sm font-medium text-electric-blue border border-electric-blue/30 mb-4 inline-block">
              Simple, guided workflow
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-text-primary mb-6">How It Works</h1>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto">From raw CSV files to audit-ready reports in six guided steps.</p>
          </div>

          <div className="space-y-16">
            {steps.map((step, i) => (
              <div key={step.number} className={cn('flex gap-8 items-start md:gap-12', i % 2 === 0 ? '' : 'flex-row-reverse')}>
                <div className="flex-1 glass-panel p-6 md:p-8">
                  <div className={cn(
                    'inline-flex items-center justify-center w-12 h-12 rounded-glass-sm flex-shrink-0 mb-4 font-bold text-2xl text-electric-blue',
                    i % 2 === 0 ? 'mr-4' : 'ml-4'
                  )}>
                    {step.number}
                  </div>
                  <h3 className="text-xl font-semibold text-text-primary mb-2">{step.title}</h3>
                  <p className="text-text-secondary">{step.description}</p>
                </div>
                <div className="flex-1 flex items-center justify-center">
                  <div className="glass-secondary p-6 rounded-glass-lg text-center max-w-sm">
                    <div className={cn(
                      'w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-electric-blue',
                      i % 2 === 0 ? 'mr-4' : 'ml-4'
                    )}>
                      <ArrowRight className="w-8 h-8" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-20 rounded-glass-lg glass-primary overflow-hidden border border-white/10">
            <div className="p-8 md:p-12">
              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <div className="glass-secondary p-3 rounded-glass-sm w-12 h-12 flex items-center justify-center mb-4">
                    <Upload className="w-6 h-6 text-electric-blue" />
                  </div>
                  <h4 className="font-semibold text-text-primary mb-2">Upload</h4>
                  <p className="text-sm text-text-secondary">CSV source and destination datasets</p>
                </div>
                <div>
                  <div className="glass-secondary p-3 rounded-glass-sm w-12 h-12 flex items-center justify-center mb-4">
                    <GitCompare className="w-6 h-6 text-electric-blue" />
                  </div>
                  <h4 className="font-semibold text-text-primary mb-2">Map</h4>
                  <p className="text-sm text-text-secondary">Columns across different schemas</p>
                </div>
                <div>
                  <div className="glass-secondary p-3 rounded-glass-sm w-12 h-12 flex items-center justify-center mb-4">
                    <Settings className="w-6 h-6 text-electric-blue" />
                  </div>
                  <h4 className="font-semibold text-text-primary mb-2">Validate</h4>
                  <p className="text-sm text-text-secondary">Rules and tolerance thresholds</p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-20">
            <Link to="/app/reconcile/new" className="btn-primary inline-flex items-center gap-2">
              Start Your First Reconciliation
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ')
}

function Upload({ className }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
}