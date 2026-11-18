import React from 'react'
import { Link, useLocation, Outlet } from 'react-router-dom'
import { GlassButton, GlassCard } from '../ui/GlassComponents'
import { cn } from '../../utils/helpers'
import {
  Menu, X, Sun, Moon, ChevronDown, LogIn, User, Settings, HelpCircle,
  LayoutDashboard, FolderKanban, PlusCircle, History, Database, FileText, Cog,
} from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { useWorkspace } from '../../context/WorkspaceContext'
import { useAuth } from '../../context/AuthContext'

interface NavbarProps {
  onMenuClick: () => void
  className?: string
}

export function Navbar({ onMenuClick, className }: NavbarProps) {
  const { mode, toggleTheme } = useTheme()
  const { settings } = useWorkspace()
  const { isAuthenticated, login, logout } = useAuth()
  const location = useLocation()

  const navItems = [
    { href: '/', label: 'Product' },
    { href: '/features', label: 'Features' },
    { href: '/how-it-works', label: 'How It Works' },
    { href: '/use-cases', label: 'Use Cases' },
    { href: '/docs', label: 'Documentation' },
  ]

  const isAppRoute = location.pathname.startsWith('/app')

  return (
    <header className={cn('fixed top-0 left-0 right-0 z-40 glass-secondary border-b border-white/10 backdrop-blur-[32px]', className)}>
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <button
            onClick={onMenuClick}
            className="md:hidden glass-secondary p-2 rounded-glass-sm text-text-secondary hover:text-text-primary hover:bg-white/10 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link to={isAppRoute ? '/app' : '/'} className="flex items-center gap-2" aria-label="FinSync Home">
            <div className="glass-primary p-2 rounded-glass-sm">
              <svg className="w-6 h-6 text-electric-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-display font-semibold text-xl text-text-primary hidden sm:block">FinSync</span>
          </Link>

          {!isAppRoute && (
            <nav className="hidden md:flex items-center gap-1" role="navigation" aria-label="Main navigation">
              {navItems.map(item => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'px-3 py-2 rounded-glass-sm text-sm font-medium transition-all duration-200',
                    location.pathname === item.href
                      ? 'text-text-primary bg-white/5'
                      : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="glass-secondary p-2 rounded-glass-sm text-text-secondary hover:text-text-primary hover:bg-white/10 transition-colors"
            aria-label={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {mode === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {isAppRoute ? (
            <div className="flex items-center gap-2">
              <Link to="/app/settings" className="glass-secondary p-2 rounded-glass-sm text-text-secondary hover:text-text-primary hover:bg-white/10 transition-colors" aria-label="Settings">
                <Settings className="w-5 h-5" />
              </Link>
              <div className="relative">
                <button className="flex items-center gap-2 glass-secondary px-3 py-2 rounded-glass-sm hover:bg-white/10 transition-colors">
                  <div className="glass-primary w-8 h-8 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-text-secondary" />
                  </div>
                  <span className="text-sm font-medium text-text-primary hidden sm:block">{settings.workspaceLabel}</span>
                  <ChevronDown className="w-4 h-4 text-text-muted hidden sm:block" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="btn-ghost">
                <LogIn className="w-4 h-4 mr-2" /> Sign In
              </Link>
              <Link to="/register" className="btn-primary">
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  className?: string
}

export function Sidebar({ isOpen, onClose, className }: SidebarProps) {
  const location = useLocation()
  const { currentProjectId } = useWorkspace()

  const navSections = [
    {
      title: 'Main',
      items: [
        { href: '/app', label: 'Overview', icon: LayoutDashboard },
        { href: '/app/projects', label: 'Projects', icon: FolderKanban },
        { href: '/app/reconcile/new', label: 'New Reconciliation', icon: PlusCircle },
      ],
    },
    {
      title: 'Data',
      items: [
        { href: '/app/history', label: 'Reconciliation History', icon: History },
        { href: '/app/data-explorer', label: 'Data Explorer', icon: Database },
        { href: '/app/reports', label: 'Reports', icon: FileText },
      ],
    },
    {
      title: 'Settings',
      items: [
        { href: '/app/settings', label: 'Settings', icon: Cog },
      ],
    },
  ]

  return (
    <>
      <div
        className={cn('fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity', isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none')}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={cn(
          'fixed left-0 top-16 bottom-0 z-50 w-72 glass-secondary border-r border-white/10 flex flex-col transition-transform duration-300 ease-glass',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          className
        )}
        role="navigation"
        aria-label="Application navigation"
      >
        <div className="p-4 border-b border-white/10">
          <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Navigation</h3>
        </div>
        <nav className="flex-1 p-4 space-y-6 overflow-auto">
          {navSections.map(section => (
            <div key={section.title}>
              <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">{section.title}</h4>
              <ul className="space-y-1" role="list">
                {section.items.map(item => {
                  const isActive = location.pathname === item.href ||
                    (item.href !== '/app' && location.pathname.startsWith(item.href))
                  const Icon = item.icon
                  return (
                    <li key={item.href}>
                      <Link
                        to={item.href}
                        onClick={onClose}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2.5 rounded-glass-sm text-sm font-medium transition-all duration-200',
                          isActive
                            ? 'glass-primary text-text-primary'
                            : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                        )}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                        {item.label}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <div className="glass-secondary p-4 rounded-glass-sm">
            <p className="text-sm text-text-secondary mb-2">Workspace</p>
            <p className="text-sm font-medium text-text-primary truncate">{currentProjectId ? 'Active Project' : 'No project selected'}</p>
            <Link to="/app/projects" className="text-sm text-electric-blue hover:underline mt-2 inline-block">Manage Projects</Link>
          </div>
        </div>
      </aside>
    </>
  )
}

interface AppShellProps {}

export function AppShell(): JSX.Element {
  const [sidebarOpen, setSidebarOpen] = React.useState(false)
  const location = useLocation()
  const isAppRoute = location.pathname.startsWith('/app')

  if (!isAppRoute) {
    return <Outlet />
  }

  return (
    <div className="min-h-screen">
      <Navbar onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="pt-16 md:pl-72 min-h-screen transition-all duration-300">
        <div className="max-w-[1400px] mx-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}