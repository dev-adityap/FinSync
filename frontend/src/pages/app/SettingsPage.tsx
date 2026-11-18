import React, { useState } from 'react'
import { useWorkspace } from '../../context/WorkspaceContext'
import { useTheme } from '../../context/ThemeContext'
import { GlassCard, GlassPanel, GlassButton, GlassSelect, GlassInput, ConfirmDialog, GlassBadge } from '../../components/ui/GlassComponents'
import { Sun, Moon, Palette, Save, Trash2, Upload, Download, Database, Settings } from 'lucide-react'

export function SettingsPage() {
  const { settings, updateSettings, exportWorkspace, importWorkspace, clearWorkspace, getStorageInfo } = useWorkspace()
  const { mode, toggleTheme, setTheme } = useTheme()
  const [theme, setThemeState] = useState(mode)
  const [workspaceLabel, setWorkspaceLabel] = useState(settings.workspaceLabel)
  const [numericTolerance, setNumericTolerance] = useState(String(settings.defaultNumericTolerance))
  const [caseInsensitive, setCaseInsensitive] = useState(settings.defaultCaseInsensitive)
  const [trimWhitespace, setTrimWhitespace] = useState(settings.defaultTrimWhitespace)
  const [pageSize, setPageSize] = useState(String(settings.defaultPageSize))
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false)
  const [storageInfo, setStorageInfo] = useState<{ sessions: number; projects: number; estimatedSize: string } | null>(null)

  const handleThemeChange = (val: string) => {
    setThemeState(val as 'dark' | 'light')
    setTheme(val as 'dark' | 'light')
  }

  const handleSave = async () => {
    await updateSettings({
      theme: theme as 'dark' | 'light',
      workspaceLabel,
      defaultNumericTolerance: parseFloat(numericTolerance) || 0.01,
      defaultCaseInsensitive: caseInsensitive,
      defaultTrimWhitespace: trimWhitespace,
      defaultPageSize: parseInt(pageSize) || 25,
    })
    alert('Settings saved successfully')
  }

  const handleExport = async () => {
    const json = await exportWorkspace()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `finsync-workspace-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async () => {
      try {
        await importWorkspace(reader.result as string)
        alert('Workspace imported successfully')
      } catch (err) {
        alert('Failed to import workspace')
      }
    }
    reader.readAsText(file)
  }

  const handleClear = async () => {
    await clearWorkspace()
    setClearConfirmOpen(false)
    alert('Workspace cleared')
  }

  const loadStorageInfo = async () => {
    const info = await getStorageInfo()
    setStorageInfo(info)
  }

  return (
    <GlassPanel padding="lg">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary mb-1">Settings</h1>
        <p className="text-text-secondary">Configure your FinSync workspace.</p>
      </div>

      <div className="space-y-8">
        {/* General */}
        <GlassCard padding="lg">
          <div className="flex items-center gap-3 mb-6">
            <Palette className="w-5 h-5 text-electric-blue" />
            <h2 className="text-lg font-semibold text-text-primary">General</h2>
          </div>
          <div className="space-y-6">
            <div>
              <label className="input-label">Workspace Label</label>
              <input
                type="text"
                className="input-field w-full"
                value={workspaceLabel}
                onChange={e => setWorkspaceLabel(e.target.value)}
                placeholder="Guest Workspace"
              />
              <p className="text-xs text-text-muted mt-1">Display name for your anonymous workspace.</p>
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-text-primary">
                <Sun className="w-4 h-4" /> {mode === 'dark' ? 'Light' : 'Dark'} Mode
                <GlassSelect
                  options={[
                    { value: 'dark', label: 'Dark Liquid Glass' },
                    { value: 'light', label: 'Light Liquid Glass' },
                  ]}
                  value={theme}
                  onChange={e => handleThemeChange(e.target.value)}
                  className="ml-4 w-48"
                />
              </label>
              <p className="text-xs text-text-muted mt-1">Your theme preference is saved in your browser.</p>
            </div>
          </div>
        </GlassCard>

        {/* Validation Defaults */}
        <GlassCard padding="lg">
          <div className="flex items-center gap-3 mb-6">
            <Settings className="w-5 h-5 text-electric-blue" />
            <h2 className="text-lg font-semibold text-text-primary">Validation Defaults</h2>
          </div>
          <div className="space-y-6">
            <div>
              <label className="input-label">Default Numeric Tolerance</label>
              <input
                type="number"
                step="0.01"
                className="input-field w-32"
                value={numericTolerance}
                onChange={e => setNumericTolerance(e.target.value)}
              />
              <p className="text-xs text-text-muted mt-1">Maximum allowed difference for numeric comparisons.</p>
            </div>
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={caseInsensitive}
                onChange={e => setCaseInsensitive(e.target.checked)}
                className="w-4 h-4 rounded border-white/20 bg-transparent text-electric-blue focus:ring-electric-blue mt-0.5"
              />
              <label className="text-sm text-text-primary">Case-insensitive comparison</label>
            </div>
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={trimWhitespace}
                onChange={e => setTrimWhitespace(e.target.checked)}
                className="w-4 h-4 rounded border-white/20 bg-transparent text-electric-blue focus:ring-electric-blue mt-0.5"
              />
              <label className="text-sm text-text-primary">Whitespace normalization</label>
            </div>
            <div>
              <label className="input-label">Default Page Size</label>
              <input
                type="number"
                className="input-field w-32"
                value={pageSize}
                onChange={e => setPageSize(e.target.value)}
              />
            </div>
          </div>
          <GlassButton variant="primary" onClick={handleSave}>Save Settings</GlassButton>
        </GlassCard>

        {/* Local Data Management */}
        <GlassCard padding="lg">
          <div className="flex items-center gap-3 mb-6">
            <Database className="w-5 h-5 text-electric-blue" />
            <h2 className="text-lg font-semibold text-text-primary">Local Data Management</h2>
          </div>
          <div className="space-y-6">
            <div className="glass-secondary p-4 rounded-glass-sm">
              <p className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-2">Storage Information</p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Stored Sessions</span>
                  <span className="tabular-nums text-text-primary">{storageInfo?.sessions || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Stored Projects</span>
                  <span className="tabular-nums text-text-primary">{storageInfo?.projects || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Estimated Storage</span>
                  <span className="tabular-nums text-text-primary">{storageInfo?.estimatedSize || '—'}</span>
                </div>
              </div>
              <p className="text-xs text-text-muted mt-3">
                All data is stored locally in your browser's IndexedDB. It does not sync across devices or browsers.
              </p>
            </div>
            <div className="flex gap-3">
              <GlassButton variant="ghost" onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" /> Export Backup
              </GlassButton>
              <div className="relative flex-1">
                <input
                  type="file"
                  accept=".json"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleImport}
                />
                <GlassButton variant="ghost" className="w-full">
                  <Upload className="w-4 h-4 mr-2" /> Import Backup
                </GlassButton>
              </div>
            </div>
          </div>
          <div className="bg-error/10 border border-error/20 rounded-glass-sm p-4">
            <p className="text-sm text-error font-medium mb-2">Danger Zone</p>
            <GlassButton variant="danger" onClick={() => setClearConfirmOpen(true)} className="w-full">
              <Trash2 className="w-4 h-4 mr-2" /> Clear All Local Data
            </GlassButton>
          </div>
        </GlassCard>

        <ConfirmDialog
          isOpen={clearConfirmOpen}
          onClose={() => setClearConfirmOpen(false)}
          onConfirm={handleClear}
          title="Clear All Local Data"
          message="This will permanently delete all projects, sessions, and results from your browser. This cannot be undone."
          confirmLabel="Clear All"
          variant="danger"
        />
      </div>
    </GlassPanel>
  )
}
