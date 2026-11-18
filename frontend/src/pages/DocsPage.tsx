import React from 'react'
import { Link } from 'react-router-dom'
import { GlassPanel } from '../components/ui/GlassComponents'

export function DocsPage() {
  return (
    <div className="min-h-screen pt-16">
      <div className="max-w-3xl mx-auto px-4 md:px-6 lg:px-8 py-12">
        <nav className="mb-8">
          <Link to="/" className="text-sm text-text-secondary hover:text-text-primary">
            ← Back to homepage
          </Link>
        </nav>

        <GlassPanel padding="lg">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-text-primary mb-6">Documentation</h1>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="glass-secondary p-6 rounded-glass-sm">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Getting Started</h3>
              <ul className="space-y-3 text-text-secondary">
                <li><Link to="/app/reconcile/new" className="text-electric-blue hover:underline">Create your first reconciliation</Link></li>
                <li><Link to="/app/projects" className="text-electric-blue hover:underline">Manage projects</Link></li>
                <li className="text-sm text-text-muted">Sample CSV files available in the repo</li>
              </ul>
            </div>
            <div className="glass-secondary p-6 rounded-glass-sm">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Backend API</h3>
              <ul className="space-y-3 text-text-secondary">
                <li><a href="/api/docs" className="text-electric-blue hover:underline" target="_blank" rel="noopener">OpenAPI docs (Swagger)</a></li>
                <li><a href="/api/health" className="text-electric-blue hover:underline">Health endpoint</a></li>
              </ul>
            </div>
          </div>
        </GlassPanel>
      </div>
    </div>
  )
}