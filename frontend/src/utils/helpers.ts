import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(num)
}

export function formatNumberFull(num: number): string {
  return new Intl.NumberFormat('en-US').format(num)
}

export function formatPercentage(num: number): string {
  return new Intl.NumberFormat('en-US', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(num / 100)
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  return `${(ms / 60000).toFixed(1)}m`
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
}

export function sanitizeForCSV(value: unknown): string {
  if (value === null || value === undefined) return ''
  const str = String(value)
  if (/^[=+\-@]/.test(str) || str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function parseCSV(content: string): { headers: string[]; rows: Record<string, unknown>[] } {
  const lines = content.trim().split('\n')
  if (lines.length === 0) return { headers: [], rows: [] }
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
  const rows = lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''))
    const row: Record<string, unknown> = {}
    headers.forEach((header, i) => {
      row[header] = values[i] ?? ''
    })
    return row
  })
  return { headers, rows }
}

export function debounce<T extends (...args: unknown[]) => unknown>(fn: T, delay: number): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    MATCHED: 'status-matched',
    MISMATCHED: 'status-mismatched',
    MISSING_IN_DESTINATION: 'status-missing',
    UNEXPECTED_IN_DESTINATION: 'status-unexpected',
    DUPLICATE: 'status-duplicate',
    INVALID: 'status-invalid',
    PASSED: 'status-passed',
    PASSED_WITH_WARNINGS: 'status-passed-warnings',
    FAILED: 'status-failed',
    completed: 'status-matched',
    processing: 'status-info',
    draft: 'status-muted',
    failed: 'status-failed',
  }
  return colors[status] || 'status-info'
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    MATCHED: 'Matched',
    MISMATCHED: 'Mismatched',
    MISSING_IN_DESTINATION: 'Missing in Destination',
    UNEXPECTED_IN_DESTINATION: 'Unexpected in Destination',
    DUPLICATE: 'Duplicate',
    INVALID: 'Invalid',
    PASSED: 'Passed',
    PASSED_WITH_WARNINGS: 'Passed with Warnings',
    FAILED: 'Failed',
    completed: 'Completed',
    processing: 'Processing',
    draft: 'Draft',
    failed: 'Failed',
  }
  return labels[status] || status
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}