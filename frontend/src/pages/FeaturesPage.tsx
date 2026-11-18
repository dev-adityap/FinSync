import React from 'react'
import { Link } from 'react-router-dom'
import { GlassCard, GlassButton } from '../components/ui/GlassComponents'
import { cn } from '../utils/helpers'
import {
  GitCompare, Search, Database, RefreshCw, Target, FileText,
  ChevronRight, Shield, Zap, Users, Globe, Cpu, BarChart2,
  ArrowRight, CheckCircle, Lock, Download, Upload, Settings,
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

const useCases = [
  { icon: Cpu, title: 'ERP Migration', description: 'Validate data integrity when migrating from legacy ERP to modern platforms like SAP, Oracle, or NetSuite.' },
  { icon: BarChart2, title: 'Accounting Data Migration', description: 'Reconcile general ledger, accounts payable, and receivable between accounting systems.' },
  { icon: Users, title: 'Customer Data Migration', description: 'Ensure CRM migrations preserve every customer record, contact, and interaction history.' },
  { icon: DollarSign, title: 'Financial Reconciliation', description: 'Match transactions, invoices, and payments across banking and financial systems.' },
  { icon: Globe, title: 'SaaS Integrations', description: 'Validate data sync between SaaS platforms and internal databases.' },
  { icon: Database, title: 'Database Synchronization', description: 'Verify operational database migrations and replication accuracy.' },
]

function DollarSign({ className }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
}

export function FeaturesPage() {
  return (
    <div className="min-h-screen pt-16">
      <section className="py-20 md:py-28 px-4 md:px-6 lg:px-8">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-16">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-text-primary mb-4">Core Features</h1>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto">Everything you need to validate migrations with confidence.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <GlassCard key={i} className="h-full" padding="lg" hover>
                <div className="glass-primary p-3 rounded-glass-sm w-12 h-12 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-electric-blue" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">{feature.title}</h3>
                <p className="text-text-secondary text-sm mb-6">{feature.description}</p>
                <Link to="/app/reconcile/new" className="text-sm text-electric-blue hover:underline flex items-center gap-1">
                  Try it <ChevronRight className="w-4 h-4" />
                </Link>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28 px-4 md:px-6 lg:px-8 bg-deep-indigo/50 border-y border-white/5">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-text-primary mb-4">Platform Capabilities</h2>
            <p className="text-text-secondary max-w-2xl mx-auto">Deep technical capabilities built for real-world data challenges.</p>
          </div>
          <div className="space-y-8">
            {[
              {
                title: 'Intelligent Column Mapping',
                description: 'Automatic field matching using name similarity, data type inference, and sample value analysis. Manual override for complete control.',
                icon: GitCompare,
              },
              {
                title: 'Configurable Validation Engine',
                description: 'Numeric tolerance, case sensitivity, whitespace normalization, date format parsing, email validation, required field enforcement.',
                icon: Settings,
              },
              {
                title: 'Duplicate Detection',
                description: 'Identifies duplicate identifiers in both source and destination before matching. Preserves all duplicates for review.',
                icon: RefreshCw,
              },
              {
                title: 'Financial-Grade Comparison',
                description: 'Decimal-precision arithmetic for monetary values. Configurable tolerance (default 0.01). Handles currency symbols, negatives, and formatting.',
                icon: DollarSign,
              },
              {
                title: 'Comprehensive Issue Classification',
                description: 'MATCHED, MISMATCHED, MISSING_IN_DESTINATION, UNEXPECTED_IN_DESTINATION, DUPLICATE, INVALID. Deterministic precedence.',
                icon: Shield,
              },
              {
                title: 'Audit-Ready Exports',
                description: 'CSV reports with formula-injection protection. Complete reconciliation, mismatches only, missing, unexpected, duplicates, invalid, and summary.',
                icon: FileText,
              },
            ].map((cap, i) => (
              <GlassCard key={i} padding="lg" className="flex gap-6">
                <div className="glass-primary p-3 rounded-glass-sm w-12 h-12 flex items-center justify-center flex-shrink-0">
                  <cap.icon className="w-6 h-6 text-electric-blue" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">{cap.title}</h3>
                  <p className="text-text-secondary">{cap.description}</p>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28 px-4 md:px-6 lg:px-8 text-center">
        <div className="max-w-[1400px] mx-auto">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-text-primary mb-4">Ready to Validate Your Migration?</h2>
          <p className="text-text-secondary text-lg mb-8 max-w-2xl mx-auto">Upload your CSV files and run your first reconciliation in minutes.</p>
          <Link to="/app/reconcile/new" className="btn-primary inline-flex items-center gap-2">
            Start Reconciliation
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  )
}