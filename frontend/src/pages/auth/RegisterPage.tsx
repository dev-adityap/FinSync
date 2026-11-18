import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useToast } from '../../context/ToastContext'
import { GlassCard, GlassButton } from '../../components/ui/GlassComponents'
import { ArrowRight, User } from 'lucide-react'

export function RegisterPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.currentTarget as HTMLFormElement
    ;(form.elements.namedItem('password') as HTMLInputElement).value = ''
    ;(form.elements.namedItem('confirmPassword') as HTMLInputElement).value = ''

    showToast({
      type: 'info',
      title: 'Authentication Not Available',
      message: 'Account registration is not enabled yet. Account functionality will be available in a future release.',
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
          <h2 className="text-2xl font-bold text-text-primary mb-2">Create an account</h2>
          <p className="text-text-secondary">Join FinSync to start validating your data migrations</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Full name</label>
            <input
              type="text"
              name="fullName"
              required
              className="input-field w-full"
              placeholder="John Doe"
              autoComplete="name"
            />
          </div>

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
              minLength={8}
              className="input-field w-full pr-10"
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-text-secondary mb-2">Confirm password</label>
            <input
              type="password"
              name="confirmPassword"
              required
              className="input-field w-full pr-10"
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </div>

          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="terms"
              required
              className="w-4 h-4 rounded border-white/20 bg-transparent text-electric-blue focus:ring-electric-blue mt-0.5"
            />
            <label htmlFor="terms" className="text-sm text-text-secondary leading-6">
              I agree to the <Link to="/terms" className="text-electric-blue hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-electric-blue hover:underline">Privacy Policy</Link>
            </label>
          </div>

          <GlassButton type="submit" variant="primary" className="w-full">
            Create account
            <ArrowRight className="w-4 h-4 ml-2" />
          </GlassButton>

          <div className="mt-6 flex items-center justify-center gap-2">
            <p className="text-sm text-text-secondary">Already have an account?</p>
            <Link to="/login" className="text-sm text-electric-blue font-medium hover:underline">Sign in</Link>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-center gap-2">
            <GlassButton variant="ghost" onClick={() => navigate('/app', { replace: true })} className="w-full">
              <span className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Explore demo
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
            <p className="text-error font-medium mb-2">Registration Not Enabled</p>
            <p className="text-text-secondary">
              Account creation is not available yet. No user accounts are created or stored. Use "Explore demo" to try FinSync without an account.
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}
