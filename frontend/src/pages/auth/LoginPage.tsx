import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useToast } from '../../context/ToastContext'
import { GlassCard, GlassButton } from '../../components/ui/GlassComponents'
import { ArrowRight, Lock, User } from 'lucide-react'

export function LoginPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.currentTarget as HTMLFormElement
    ;(form.elements.namedItem('password') as HTMLInputElement).value = ''

    showToast({
      type: 'info',
      title: 'Authentication Not Available',
      message: 'Authentication is not enabled yet. No credentials were sent or stored. Use "Continue without an account" to explore FinSync.',
      duration: 8000,
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <GlassCard className="w-full max-w-md p-8 mx-auto">
        <div className="text-center mb-8">
          <div className="glass-primary w-12 h-12 flex items-center justify-center rounded-glass-sm mx-auto mb-4">
            <svg className="w-6 h-6 text-electric-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-text-primary mb-2">Welcome back</h2>
          <p className="text-text-secondary">Sign in to your FinSync account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Email address</label>
            <input
              type="email"
              name="email"
              required
              className="input-field w-full"
              placeholder="you@company.com"
              autoComplete="email"
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-text-secondary mb-2">Password</label>
            <input
              type="password"
              name="password"
              required
              className="input-field w-full pr-10"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 rounded border-white/20 bg-transparent text-electric-blue focus:ring-electric-blue"
              />
              <label htmlFor="remember" className="text-sm text-text-secondary">Remember me</label>
            </div>
            <Link to="/forgot-password" className="text-sm text-electric-blue hover:underline">Forgot password?</Link>
          </div>

          <GlassButton type="submit" variant="primary" className="w-full">
            Sign in
            <ArrowRight className="w-4 h-4 ml-2" />
          </GlassButton>

          <div className="mt-6 flex items-center justify-center gap-2">
            <p className="text-sm text-text-secondary">Don't have an account?</p>
            <Link to="/register" className="text-sm text-electric-blue font-medium hover:underline">Create account</Link>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-center gap-2">
            <GlassButton variant="ghost" onClick={() => navigate('/app', { replace: true })} className="w-full">
              <span className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Continue without account
              </span>
            </GlassButton>
          </div>

          <div className="mt-6 text-center">
            <Link to="/" className="text-sm text-text-muted hover:text-text-secondary transition-colors">
              ← Back to homepage
            </Link>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-white/10">
          <div className="bg-error/10 border border-error/20 rounded-glass-sm p-4 text-sm">
            <p className="text-error font-medium mb-2">Authentication Not Enabled</p>
            <p className="text-text-secondary">
              Login and registration are UI placeholders. No credentials are sent, stored, or processed. Use "Continue without an account" to explore FinSync in anonymous workspace mode.
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}
