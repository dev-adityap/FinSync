import React from 'react'
import { Link } from 'react-router-dom'
import { useToast } from '../../context/ToastContext'
import { GlassCard, GlassButton } from '../../components/ui/GlassComponents'

export function ForgotPasswordPage() {
  const { showToast } = useToast()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    ;(e.currentTarget as HTMLFormElement).reset()

    showToast({
      type: 'info',
      title: 'Password Recovery Not Available',
      message: 'Password reset emails are not sent. Account recovery is not enabled yet.',
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
          <h2 className="text-2xl font-bold text-text-primary mb-2">Forgot password?</h2>
          <p className="text-text-secondary">Reset your FinSync account password</p>
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

          <GlassButton type="submit" variant="primary" className="w-full">
            Send reset link
          </GlassButton>

          <div className="mt-6 flex items-center justify-center gap-2">
            <p className="text-sm text-text-secondary">Remember your password?</p>
            <Link to="/login" className="text-sm text-electric-blue font-medium hover:underline">Sign in</Link>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-white/10">
          <div className="bg-error/10 border border-error/20 rounded-glass-sm p-4 text-sm">
            <p className="text-error font-medium mb-2">Password Recovery Not Enabled</p>
            <p className="text-text-secondary">
              Password reset functionality is not available yet. No reset emails are sent. Use "Continue without an account" to explore FinSync without authentication.
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link to="/" className="text-sm text-text-muted hover:text-text-secondary transition-colors">
            ← Back to homepage
          </Link>
        </div>
      </GlassCard>
    </div>
  )
}
