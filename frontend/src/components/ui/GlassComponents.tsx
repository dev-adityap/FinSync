import React from 'react'
import { cn } from '../../utils/helpers'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  level?: 'primary' | 'secondary' | 'floating'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hover?: boolean
  onClick?: () => void
}

export function GlassCard({ children, className, level = 'primary', padding = 'md', hover = false, onClick }: GlassCardProps) {
  const levelClasses = {
    primary: 'glass-primary',
    secondary: 'glass-secondary',
    floating: 'glass-floating',
  }

  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }

  return (
    <div
      className={cn(
        'relative overflow-hidden glass-edge glass-highlight',
        levelClasses[level],
        paddingClasses[padding],
        hover && 'transition-all duration-300 ease-glass hover:shadow-glass-lg hover:border-white/15 cursor-pointer',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

interface GlassPanelProps {
  children: React.ReactNode
  className?: string
  header?: React.ReactNode
  footer?: React.ReactNode
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export function GlassPanel({ children, className, header, footer, padding = 'md' }: GlassPanelProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }

  return (
    <div className={cn('glass-panel flex flex-col', paddingClasses[padding], className)}>
      {header && (
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          {header}
        </div>
      )}
      <div className="flex-1 p-6 overflow-auto">{children}</div>
      {footer && (
        <div className="px-6 py-4 border-t border-white/10 flex items-center justify-end gap-3">
          {footer}
        </div>
      )}
    </div>
  )
}

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  asChild?: boolean
}

export function GlassButton({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  disabled,
  className,
  asChild = false,
  ...props
}: GlassButtonProps) {
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
    danger: 'btn-danger',
  }

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  }

  const Tag = asChild ? React.Children.only(children as React.ReactElement)?.type : 'button'

  if (asChild) {
    return React.cloneElement(children as React.ReactElement, {
      className: cn(
        variantClasses[variant],
        sizeClasses[size],
        className,
        (children as React.ReactElement).props.className
      ),
      ...props,
    })
  }

  return (
    <button
      className={cn(variantClasses[variant], sizeClasses[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : icon && iconPosition === 'left' ? (
        <span className="mr-2 flex items-center">{icon}</span>
      ) : null}
      {children}
      {icon && iconPosition === 'right' && <span className="ml-2 flex items-center">{icon}</span>}
    </button>
  )
}

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  icon?: React.ReactNode
}

export function GlassInput({ label, error, helperText, icon, className, id, ...props }: GlassInputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="w-full">
      {label && <label htmlFor={inputId} className="input-label">{label}</label>}
      <div className="relative">
        {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">{icon}</div>}
        <input
          id={inputId}
          className={cn('input-field', icon && 'pl-10', className)}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          {...props}
        />
      </div>
      {error && <p id={`${inputId}-error`} className="input-error" role="alert">{error}</p>}
      {helperText && !error && <p id={`${inputId}-helper`} className="text-sm text-text-muted mt-1">{helperText}</p>}
    </div>
  )
}

interface GlassSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
  placeholder?: string
}

export function GlassSelect({ label, error, options, placeholder, className, id, ...props }: GlassSelectProps) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="w-full">
      {label && <label htmlFor={selectId} className="input-label">{label}</label>}
      <select
        id={selectId}
        className={cn('select-field', className)}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${selectId}-error` : undefined}
        {...props}
      >
        {placeholder && <option value="" disabled>{placeholder}</option>}
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p id={`${selectId}-error`} className="input-error" role="alert">{error}</p>}
    </div>
  )
}

interface GlassTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
}

export function GlassTextarea({ label, error, helperText, className, id, ...props }: GlassTextareaProps) {
  const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="w-full">
      {label && <label htmlFor={textareaId} className="input-label">{label}</label>}
      <textarea
        id={textareaId}
        className={cn('input-field resize-y min-h-[100px]', className)}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined}
        {...props}
      />
      {error && <p id={`${textareaId}-error`} className="input-error" role="alert">{error}</p>}
      {helperText && !error && <p id={`${textareaId}-helper`} className="text-sm text-text-muted mt-1">{helperText}</p>}
    </div>
  )
}

interface GlassModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

export function GlassModal({ isOpen, onClose, title, description, children, footer, size = 'md' }: GlassModalProps) {
  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[90vw]',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={cn('glass-floating w-full glass-edge glass-highlight animate-scale-in', sizeClasses[size])}>
        <div className="px-6 py-4 border-b border-white/10 flex items-start justify-between gap-4">
          <div>
            <h2 id="modal-title" className="text-xl font-semibold text-text-primary">{title}</h2>
            {description && <p className="text-sm text-text-secondary mt-1">{description}</p>}
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors p-1 flex-shrink-0" aria-label="Close">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 max-h-[70vh] overflow-auto">{children}</div>
        {footer && (
          <div className="px-6 py-4 border-t border-white/10 flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

interface GlassDrawerProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  position?: 'right' | 'left'
  size?: 'sm' | 'md' | 'lg' | 'full'
}

export function GlassDrawer({ isOpen, onClose, title, children, position = 'right', size = 'md' }: GlassDrawerProps) {
  if (!isOpen) return null

  const sizeClasses = {
    sm: 'w-72',
    md: 'w-96',
    lg: 'w-[32rem]',
    full: 'w-[90vw]',
  }

  const positionClasses = position === 'left' ? 'left-0' : 'right-0'

  return (
    <div className="fixed inset-0 z-50 flex pointer-events-none" role="dialog" aria-modal="true" aria-labelledby="drawer-title">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto" onClick={onClose} />
      <div className={cn(
        'glass-floating h-full flex flex-col glass-edge glass-highlight animate-slide-in-right pointer-events-auto',
        sizeClasses[size],
        positionClasses
      )}>
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <h2 id="drawer-title" className="text-xl font-semibold text-text-primary">{title}</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors p-1" aria-label="Close">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 p-6 overflow-auto">{children}</div>
      </div>
    </div>
  )
}

interface GlassBadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'violet' | 'cyan'
  size?: 'sm' | 'md'
  dot?: boolean
}

export function GlassBadge({ children, variant = 'default', size = 'md', dot = false }: GlassBadgeProps) {
  const variantClasses = {
    default: 'bg-white/10 text-text-secondary border-white/10',
    success: 'status-matched',
    warning: 'status-warning',
    error: 'status-error',
    info: 'bg-electric-blue/20 text-electric-blue border-electric-blue/20',
    violet: 'status-unexpected',
    cyan: 'bg-cyan/20 text-cyan border-cyan/20',
  }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  }

  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full font-medium border', variantClasses[variant], sizeClasses[size])}>
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full', variant === 'success' && 'bg-success', variant === 'warning' && 'bg-warning', variant === 'error' && 'bg-error', variant === 'info' && 'bg-electric-blue', variant === 'violet' && 'bg-violet', variant === 'cyan' && 'bg-cyan', variant === 'default' && 'bg-text-muted')} />}
      {children}
    </span>
  )
}

interface GlassTabsProps {
  tabs: { id: string; label: string; icon?: React.ReactNode }[]
  activeTab: string
  onChange: (id: string) => void
  className?: string
}

export function GlassTabs({ tabs, activeTab, onChange, className }: GlassTabsProps) {
  return (
    <div className={cn('glass-secondary rounded-glass-sm p-1 flex gap-1', className)} role="tablist">
      {tabs.map(tab => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={activeTab === tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-glass-sm text-sm font-medium transition-all duration-200 ease-glass',
            activeTab === tab.id
              ? 'glass-primary text-text-primary shadow-glass'
              : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
          )}
        >
          {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
          {tab.label}
        </button>
      ))}
    </div>
  )
}

interface GlassStepperProps {
  steps: { id: string; label: string; description?: string }[]
  activeStep: number
  onStepClick?: (index: number) => void
  completedSteps?: number[]
  className?: string
}

export function GlassStepper({ steps, activeStep, onStepClick, completedSteps = [], className }: GlassStepperProps) {
  return (
    <div className={cn('flex items-center gap-4', className)} role="navigation" aria-label="Progress steps">
      {steps.map((step, index) => {
        const isActive = index === activeStep
        const isCompleted = completedSteps.includes(index)
        const isClickable = onStepClick && (isCompleted || index <= activeStep)

        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={() => isClickable && onStepClick!(index)}
                disabled={!isClickable}
                className={cn(
                  'relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ease-glass',
                  isActive
                    ? 'bg-electric-blue text-midnight font-semibold shadow-[0_0_20px_rgba(99,139,255,0.4)]'
                    : isCompleted
                    ? 'bg-success text-midnight font-semibold'
                    : 'bg-white/5 text-text-muted hover:bg-white/10'
                )}
                aria-current={isActive ? 'step' : undefined}
                aria-label={`Step ${index + 1}: ${step.label}`}
              >
                {isCompleted && !isActive && (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {!isCompleted && !isActive && <span className="text-sm font-medium">{index + 1}</span>}
              </button>
              <div className="mt-2 text-center w-max">
                <p className={cn('text-sm font-medium', isActive || isCompleted ? 'text-text-primary' : 'text-text-muted')}>
                  {step.label}
                </p>
                {step.description && (
                  <p className={cn('text-xs', isActive ? 'text-text-secondary' : 'text-text-muted')}>
                    {step.description}
                  </p>
                )}
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className={cn('flex-1 h-1 mx-2', isCompleted ? 'bg-success' : 'bg-white/10')} />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

interface GlassUploadZoneProps {
  onFileSelect: (file: File) => void
  acceptedTypes?: string[]
  maxSize?: number
  currentFile?: File | null
  onRemove?: () => void
  label?: string
  description?: string
  disabled?: boolean
  className?: string
}

export function GlassUploadZone({
  onFileSelect,
  acceptedTypes = ['.csv'],
  maxSize = 20 * 1024 * 1024,
  currentFile,
  onRemove,
  label = 'Upload CSV File',
  description = 'Drag and drop or click to browse',
  disabled = false,
  className,
}: GlassUploadZoneProps) {
  const [isDragActive, setIsDragActive] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true)
    } else if (e.type === 'dragleave') {
      setIsDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)
    if (e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]
      if (validateFile(file)) {
        onFileSelect(file)
      }
    }
  }

  const handleClick = () => {
    if (!disabled && !currentFile) {
      inputRef.current?.click()
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      const file = e.target.files[0]
      if (validateFile(file)) {
        onFileSelect(file)
      }
    }
    e.target.value = ''
  }

  const validateFile = (file: File): boolean => {
    if (file.size > maxSize) {
      alert(`File size exceeds ${maxSize / (1024 * 1024)}MB limit`)
      return false
    }
    const ext = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!acceptedTypes.includes(ext)) {
      alert(`File type ${ext} not supported. Accepted: ${acceptedTypes.join(', ')}`)
      return false
    }
    return true
  }

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
  }

  return (
    <div
      ref={el => { if (el) el.addEventListener('click', handleClick) }}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={cn(
        'glass-secondary border-2 border-dashed rounded-glass-sm transition-all duration-200 ease-glass relative overflow-hidden',
        currentFile ? 'border-success/50 bg-success/5' : isDragActive ? 'border-electric-blue bg-electric-blue/5' : 'border-white/10 hover:border-white/20',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      role="button"
      tabIndex={disabled ? -1 : 0}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleClick() }}
      aria-label={currentFile ? `File uploaded: ${currentFile.name}` : 'Upload zone'}
    >
      <input
        ref={inputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        onChange={handleFileChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        disabled={disabled || !!currentFile}
        aria-hidden="true"
      />

      {currentFile ? (
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="glass-primary p-3 rounded-glass-sm">
                <svg className="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-text-primary">{currentFile.name}</p>
                <p className="text-sm text-text-secondary">{formatSize(currentFile.size)}</p>
              </div>
            </div>
            {onRemove && (
              <button
                onClick={e => { e.stopPropagation(); onRemove() }}
                className="glass-secondary p-2 rounded-glass-sm text-text-muted hover:text-error hover:bg-error/10 transition-colors"
                aria-label="Remove file"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="p-12 text-center">
          <div className="glass-primary p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <p className="font-medium text-text-primary mb-1">{label}</p>
          <p className="text-text-secondary text-sm mb-4">{description}</p>
          <p className="text-xs text-text-muted">Max size: {formatSize(maxSize)} • Accepted: {acceptedTypes.join(', ')}</p>
        </div>
      )}
    </div>
  )
}

interface GlassTableProps<T> {
  columns: { key: string; header: string; render?: (row: T) => React.ReactNode; className?: string }[]
  data: T[]
  keyExtractor: (row: T) => string
  onRowClick?: (row: T) => void
  selectedKeys?: Set<string>
  onSelectionChange?: (keys: Set<string>) => void
  loading?: boolean
  emptyMessage?: string
  className?: string
  cellRender?: (row: T, key: string) => React.ReactNode | null
}

export function GlassTable<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  selectedKeys = new Set(),
  onSelectionChange,
  loading = false,
  emptyMessage = 'No data available',
  className,
  cellRender,
}: GlassTableProps<T>) {
  const [selectAll, setSelectAll] = React.useState(false)

  React.useEffect(() => {
    setSelectAll(data.length > 0 && data.every(row => selectedKeys.has(keyExtractor(row))))
  }, [data, selectedKeys, keyExtractor])

  const handleSelectAll = () => {
    if (selectAll) {
      onSelectionChange?.(new Set())
    } else {
      onSelectionChange?.(new Set(data.map(keyExtractor)))
    }
  }

  if (loading) {
    return (
      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="glass-table">
            <thead>
              <tr>
                {columns.map(col => (
                  <th key={col.key} className={cn('px-4 py-3', col.className)}>{col.header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {columns.map(col => (
                    <td key={col.key} className="px-4 py-3">
                      <div className="h-4 bg-white/5 rounded animate-pulse w-3/4" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="glass-panel flex items-center justify-center min-h-[200px]">
        <p className="text-text-muted">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className={cn('glass-panel overflow-hidden', className)}>
      <div className="overflow-x-auto">
        <table className="glass-table" role="grid">
          <thead>
            <tr>
              {onSelectionChange && (
                <th className="px-4 py-3 w-12">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-white/20 bg-transparent text-electric-blue focus:ring-electric-blue"
                    aria-label="Select all rows"
                  />
                </th>
              )}
              {columns.map(col => (
                <th key={col.key} className={cn('px-4 py-3', col.className)}>{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map(row => {
              const key = keyExtractor(row)
              const isSelected = selectedKeys.has(key)
              return (
                <tr
                  key={key}
                  className={cn(
                    onRowClick && 'cursor-pointer',
                    isSelected && 'bg-electric-blue/5'
                  )}
                  onClick={() => onRowClick?.(row)}
                  onDoubleClick={() => onRowClick?.(row)}
                >
                  {onSelectionChange && (
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={e => {
                          e.stopPropagation()
                          const newKeys = new Set(selectedKeys)
                          if (e.target.checked) newKeys.add(key)
                          else newKeys.delete(key)
                          onSelectionChange(newKeys)
                        }}
                        className="w-4 h-4 rounded border-white/20 bg-transparent text-electric-blue focus:ring-electric-blue"
                      />
                    </td>
                  )}
                  {columns.map(col => (
                    <td key={col.key} className={cn('px-4 py-3', col.className)}>
                      {cellRender ? cellRender(row, col.key) : col.render ? col.render(row) : (row as Record<string, unknown>)[col.key] as React.ReactNode}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string | number
  change?: { value: number; label: string }
  icon?: React.ReactNode
  trend?: 'up' | 'down' | 'neutral'
  className?: string
}

export function StatCard({ title, value, change, icon, trend = 'neutral', className }: StatCardProps) {
  return (
    <div className={cn('stat-card', className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-text-secondary mb-1">{title}</p>
          <p className="text-3xl font-bold text-text-primary tabular-nums">{value}</p>
          {change && (
            <p className={cn('text-sm font-medium mt-2 flex items-center gap-1',
              trend === 'up' ? 'text-success' : trend === 'down' ? 'text-error' : 'text-text-muted'
            )}>
              {trend === 'up' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>}
              {trend === 'down' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>}
              {trend === 'neutral' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" /></svg>}
              <span>{change.value > 0 ? '+' : ''}{change.value.toFixed(1)}%</span>
              <span className="text-text-muted">{change.label}</span>
            </p>
          )}
        </div>
        {icon && <div className="glass-secondary p-3 rounded-glass-sm text-text-secondary">{icon}</div>}
      </div>
    </div>
  )
}

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'primary'
  loading?: boolean
}

export function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', variant = 'primary', loading = false }: ConfirmDialogProps) {
  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <div className="flex w-full justify-end gap-3">
          <GlassButton variant="ghost" onClick={onClose} disabled={loading}>{cancelLabel}</GlassButton>
          <GlassButton variant={variant} onClick={onConfirm} loading={loading}>{confirmLabel}</GlassButton>
        </div>
      }
    >
      <p className="text-text-secondary">{message}</p>
    </GlassModal>
  )
}

interface GlassCheckboxProps {
  label: string
  description?: string
  checked: boolean
  onChange: () => void
  disabled?: boolean
}

export function GlassCheckbox({ label, description, checked, onChange, disabled }: GlassCheckboxProps) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="w-4 h-4 rounded border-white/20 bg-transparent text-electric-blue focus:ring-electric-blue accent-electric-blue"
      />
      <div>
        <p className="text-sm font-medium text-text-primary">{label}</p>
        {description && <p className="text-xs text-text-secondary">{description}</p>}
      </div>
    </label>
  )
}

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string
  height?: string
}

export function Skeleton({ className, variant = 'text', width, height }: SkeletonProps) {
  const baseStyles = 'bg-white/5 rounded animate-pulse'
  const variantStyles = {
    text: 'h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-glass-sm',
  }

  return (
    <div
      className={cn(baseStyles, variantStyles[variant], className)}
      style={{ width, height }}
      aria-hidden="true"
    />
  )
}