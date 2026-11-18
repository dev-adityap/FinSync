import React from 'react'
import { Link } from 'react-router-dom'
import { GlassCard } from '../components/ui/GlassComponents'

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <GlassCard className="w-full max-w-md p-12 text-center">
        <div className="glass-primary w-20 h-20 flex items-center justify-center rounded-full mx-auto mb-6">
          <svg className="w-10 h-10 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-text-primary mb-2">Page not found</h2>
        <p className="text-text-secondary mb-8">The page you're looking for doesn't exist.</p>
        <Link to="/" className="btn-primary inline-flex items-center gap-2">
          Back to homepage
        </Link>
      </GlassCard>
    </div>
  )
}