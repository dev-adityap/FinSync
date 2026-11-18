import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useWorkspace } from '../../context/WorkspaceContext'
import { useToast } from '../../context/ToastContext'
import { GlassCard, GlassPanel, GlassButton, GlassStepper, GlassUploadZone, GlassSelect, GlassInput, GlassCheckbox, GlassModal, ConfirmDialog } from '../../components/ui/GlassComponents'
import { PlusCircle, ArrowRight, ArrowLeft, FileText, ChevronRight, Download, Upload, CheckCircle } from 'lucide-react'
import { formatFileSize, parseCSV } from '../../utils/helpers'
import { runReconciliation } from '../../services/api'

const STEPS = [
  { id: 'create', label: 'Create Session', description: 'Session name, project, and systems' },
  { id: 'upload', label: 'Upload Files', description: 'Source and destination CSV files' },
  { id: 'mapping', label: 'Column Mapping', description: 'Map source to destination fields' },
  { id: 'config', label: 'Validation Config', description: 'Configure comparison rules' },
  { id: 'review', label: 'Review', description: 'Review and run reconciliation' },
  { id: 'results', label: 'Results', description: 'View reconciliation results' },
]

const DEFAULT_VALIDATION_CONFIG = {
  caseInsensitive: true,
  trimWhitespace: true,
  normalizeNumbers: true,
  normalizeDates: false,
  numericTolerance: 0.01,
  detectMissing: true,
  detectUnexpected: true,
  detectDuplicates: true,
  requiredFields: [] as string[],
  emptyValues: ['', 'null', 'NULL', 'N/A', 'n/a'],
  validateEmails: false,
  dateFormat: '' as string | undefined,
}

export function NewReconciliationPage() {
  const { createSession, projects } = useWorkspace()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [step, setStep] = useState(0)
  const [sessionData, setSessionData] = useState({
    name: '',
    projectId: '' as string,
    description: '',
    sourceSystem: '',
    destinationSystem: '',
  })
  const [sourceFile, setSourceFile] = useState<File | null>(null)
  const [destinationFile, setDestinationFile] = useState<File | null>(null)
  const [sourcePreview, setSourcePreview] = useState<{ headers: string[]; rows: any[]; rowCount: number } | null>(null)
  const [destinationPreview, setDestinationPreview] = useState<{ headers: string[]; rows: any[]; rowCount: number } | null>(null)
  const [mappings, setMappings] = useState<any[]>([])
  const [uniqueIdentifier, setUniqueIdentifier] = useState('')
  const [validationConfig, setValidationConfig] = useState(DEFAULT_VALIDATION_CONFIG)
  const [running, setRunning] = useState(false)
  const [autoMappings, setAutoMappings] = useState<any[]>([])

  const isLastStep = step === STEPS.length - 1
  const completedSteps = Array.from({ length: step }, (_, i) => i)

  const handleFileUpload = async (type: 'source' | 'destination', file: File) => {
    if (type === 'source') {
      setSourceFile(file)
      try {
        const content = await file.text()
        const { headers, rows } = parseCSV(content)
        setSourcePreview({ headers, rows: rows.slice(0, 10), rowCount: rows.length })
      } catch (err) {
        showToast({ type: 'error', title: 'Invalid CSV', message: 'Could not parse the source CSV file.' })
      }
    } else {
      setDestinationFile(file)
      try {
        const content = await file.text()
        const { headers, rows } = parseCSV(content)
        setDestinationPreview({ headers, rows: rows.slice(0, 10), rowCount: rows.length })
      } catch (err) {
        showToast({ type: 'error', title: 'Invalid CSV', message: 'Could not parse the destination CSV file.' })
      }
    }
    updateMappings()
  }

  const removeFile = (type: 'source' | 'destination') => {
    if (type === 'source') {
      setSourceFile(null)
      setSourcePreview(null)
    } else {
      setDestinationFile(null)
      setDestinationPreview(null)
    }
    setMappings([])
    setUniqueIdentifier('')
  }

  const updateMappings = () => {
    if (!sourcePreview || !destinationPreview) return
    const newMappings = sourcePreview.headers.map((col, i) => {
      const match = destinationPreview.headers.find(destCol =>
        destCol.toLowerCase() === col.toLowerCase() ||
        destCol.toLowerCase().replace(/_/g, '') === col.toLowerCase().replace(/_/g, '')
      )
      return {
        id: i,
        sourceColumn: col,
        destinationColumn: match || '',
        dataType: 'string' as const,
        isUniqueIdentifier: false,
        isRequired: false,
      }
    })
    setMappings(newMappings)
    setAutoMappings(newMappings)
  }

  const handleNext = () => {
    if (step === 0) {
      if (!sessionData.name || !sessionData.sourceSystem || !sessionData.destinationSystem) {
        showToast({ type: 'error', title: 'Validation Error', message: 'Please fill in all required fields.' })
        return
      }
    }
    if (step === 1) {
      if (!sourceFile || !destinationFile) {
        showToast({ type: 'error', title: 'Validation Error', message: 'Please upload both source and destination files.' })
        return
      }
    }
    if (step === 2) {
      if (!uniqueIdentifier) {
        showToast({ type: 'error', title: 'Validation Error', message: 'Please select a unique identifier.' })
        return
      }
      const hasUnmappedRequired = mappings.some(m => m.isRequired && !m.destinationColumn)
      if (hasUnmappedRequired) {
        showToast({ type: 'error', title: 'Validation Error', message: 'Please map all required fields.' })
        return
      }
    }
    setStep(prev => prev + 1)
  }

  const handlePrev = () => setStep(prev => prev - 1)

  const handleRunReconciliation = async () => {
    if (!sourceFile || !destinationFile) return
    setRunning(true)
    try {
      const config = {
        columnMappings: mappings,
        uniqueIdentifier,
        validation: validationConfig,
      }

      const response = await runReconciliation({ sourceFile, destinationFile, config })
      const { results } = response

      const session = await createSession({
        projectId: sessionData.projectId || '',
        name: sessionData.name,
        description: sessionData.description,
        sourceSystem: sessionData.sourceSystem,
        destinationSystem: sessionData.destinationSystem,
        status: 'completed',
        config,
        results,
        sourceFile: null,
        destinationFile: null,
        completedAt: new Date().toISOString(),
      })

      showToast({ type: 'success', title: 'Reconciliation Complete', message: 'Your reconciliation has been completed successfully.' })
      navigate(`/app/reconcile/${session.id}`)
    } catch (err: any) {
      showToast({ type: 'error', title: 'Error', message: err.message || 'Failed to run reconciliation.' })
    } finally {
      setRunning(false)
    }
  }

  return (
    <GlassPanel padding="lg">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary mb-1">New Reconciliation</h1>
        <p className="text-text-secondary">Guided workflow to validate your data migration.</p>
      </div>

      <GlassStepper
        steps={STEPS}
        activeStep={step}
        completedSteps={completedSteps}
        onStepClick={idx => { if (idx <= step) setStep(idx) }}
      />

      <div className="mt-8">
        {step === 0 && (
          <GlassCard padding="lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="input-label">Session Name</label>
                <GlassInput
                  value={sessionData.name}
                  onChange={e => setSessionData({ ...sessionData, name: e.target.value })}
                  placeholder="e.g. November Financial Migration"
                  required
                />
              </div>
              <div>
                <label className="input-label">Project</label>
                <GlassSelect
                  options={projects.map(p => ({ value: p.id, label: p.name }))}
                  value={sessionData.projectId}
                  onChange={e => setSessionData({ ...sessionData, projectId: e.target.value })}
                  placeholder="Select project (optional)"
                />
              </div>
              <div className="md:col-span-2">
                <label className="input-label">Description</label>
                <GlassInput
                  value={sessionData.description}
                  onChange={e => setSessionData({ ...sessionData, description: e.target.value })}
                  placeholder="Describe this reconciliation session..."
                />
              </div>
              <div>
                <label className="input-label">Source System</label>
                <GlassInput
                  value={sessionData.sourceSystem}
                  onChange={e => setSessionData({ ...sessionData, sourceSystem: e.target.value })}
                  placeholder="e.g. Legacy ERP"
                  required
                />
              </div>
              <div>
                <label className="input-label">Destination System</label>
                <GlassInput
                  value={sessionData.destinationSystem}
                  onChange={e => setSessionData({ ...sessionData, destinationSystem: e.target.value })}
                  placeholder="e.g. New ERP"
                  required
                />
              </div>
            </div>
          </GlassCard>
        )}

        {step === 1 && (
          <GlassCard padding="lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-4">Source Dataset</h3>
                <GlassUploadZone
                  onFileSelect={file => handleFileUpload('source', file)}
                  currentFile={sourceFile}
                  onRemove={() => removeFile('source')}
                  label="Upload Source CSV"
                  description="Drag and drop or click to browse"
                />
                {sourcePreview && (
                  <div className="mt-4 glass-secondary p-4 rounded-glass-sm">
                    <p className="text-xs font-medium text-text-secondary mb-2">Preview ({sourcePreview.rowCount} rows)</p>
                    <table className="w-full text-xs">
                      <thead>
                        <tr>
                          {sourcePreview.headers.map(h => <th key={h} className="px-2 py-1 text-left text-text-muted">{h}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {sourcePreview.rows.map((row, i) => (
                          <tr key={i} className="border-b border-white/5">
                            {sourcePreview.headers.map(h => (
                              <td key={h} className="px-2 py-1 text-text-secondary truncate max-w-[100px]">{String(row[h] || '').slice(0, 30)}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-4">Destination Dataset</h3>
                <GlassUploadZone
                  onFileSelect={file => handleFileUpload('destination', file)}
                  currentFile={destinationFile}
                  onRemove={() => removeFile('destination')}
                  label="Upload Destination CSV"
                  description="Drag and drop or click to browse"
                />
                {destinationPreview && (
                  <div className="mt-4 glass-secondary p-4 rounded-glass-sm">
                    <p className="text-xs font-medium text-text-secondary mb-2">Preview ({destinationPreview.rowCount} rows)</p>
                    <table className="w-full text-xs">
                      <thead>
                        <tr>
                          {destinationPreview.headers.map(h => <th key={h} className="px-2 py-1 text-left text-text-muted">{h}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {destinationPreview.rows.map((row, i) => (
                          <tr key={i} className="border-b border-white/5">
                            {destinationPreview.headers.map(h => (
                              <td key={h} className="px-2 py-1 text-text-secondary truncate max-w-[100px]">{String(row[h] || '').slice(0, 30)}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </GlassCard>
        )}

        {step === 2 && (
          <GlassCard padding="lg">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-text-primary mb-2">Column Mapping</h3>
              <p className="text-text-secondary text-sm">Map source columns to destination columns. Select the unique identifier for matching.</p>
            </div>
            <div className="space-y-3">
              {mappings.map(mapping => (
                <div key={mapping.id} className="glass-secondary p-3 rounded-glass-sm flex items-center gap-4">
                  <span className="w-20 text-sm font-medium text-text-secondary">{mapping.sourceColumn}</span>
                  <GlassSelect
                    options={[...new Set(['', ...(destinationPreview?.headers || [])])].map(h => ({ value: h, label: h }))}
                    value={mapping.destinationColumn}
                    onChange={e => {
                      const newMappings = [...mappings]
                      newMappings[mapping.id].destinationColumn = e.target.value
                      setMappings(newMappings)
                    }}
                    className="flex-1 max-w-xs"
                    placeholder="Select destination"
                  />
                  <GlassCheckbox
                    checked={mapping.isUniqueIdentifier}
                    onChange={() => {
                      const newMappings = mappings.map(m => ({ ...m, isUniqueIdentifier: m.id === mapping.id ? !m.isUniqueIdentifier : false }))
                      setMappings(newMappings)
                      setUniqueIdentifier(newMappings.find(m => m.isUniqueIdentifier)?.sourceColumn || '')
                    }}
                    label="Unique identifier"
                  />
                  <GlassCheckbox
                    checked={mapping.isRequired}
                    onChange={() => {
                      const newMappings = [...mappings]
                      newMappings[mapping.id].isRequired = !newMappings[mapping.id].isRequired
                      setMappings(newMappings)
                    }}
                    label="Required"
                  />
                </div>
              ))}
              <div className="pt-4">
                <GlassButton variant="ghost" onClick={() => {
                  setMappings(autoMappings)
                  showToast({ type: 'info', title: 'Auto-Mapping', message: 'Column mappings have been reset to automatic suggestions.' })
                }}>
                <Upload className="w-4 h-4 mr-2" /> Reset to Auto-Mapping
                </GlassButton>
              </div>
            </div>
            <div className="mt-4 p-3 glass-secondary rounded-glass-sm border border-white/10">
              <p className="text-xs text-text-secondary mb-2">Selected unique identifier: <span className="font-medium text-text-primary">{uniqueIdentifier || 'None selected'}</span></p>
            </div>
          </GlassCard>
        )}

        {step === 3 && (
          <GlassCard padding="lg">
            <div className="space-y-6">
              <div className="glass-secondary p-4 rounded-glass-sm">
                <h3 className="text-lg font-semibold text-text-primary mb-4">Validation Configuration</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 glass-primary rounded-glass-sm">
                    <div>
                      <p className="font-medium text-text-primary">Numeric Tolerance</p>
                      <p className="text-xs text-text-secondary">Maximum allowed difference for numeric fields</p>
                    </div>
                    <GlassInput
                      type="number"
                      value={validationConfig.numericTolerance.toString()}
                      onChange={e => setValidationConfig({ ...validationConfig, numericTolerance: parseFloat(e.target.value) || 0 })}
                      className="w-24"
                    />
                  </div>
                  <GlassCheckbox
                    checked={validationConfig.caseInsensitive}
                    onChange={() => setValidationConfig({ ...validationConfig, caseInsensitive: !validationConfig.caseInsensitive })}
                    label="Case-insensitive text comparison"
                    description="Ignore case differences when comparing text values"
                  />
                  <GlassCheckbox
                    checked={validationConfig.trimWhitespace}
                    onChange={() => setValidationConfig({ ...validationConfig, trimWhitespace: !validationConfig.trimWhitespace })}
                    label="Whitespace normalization"
                    description="Trim leading/trailing whitespace before comparison"
                  />
                  <GlassCheckbox
                    checked={validationConfig.normalizeNumbers}
                    onChange={() => setValidationConfig({ ...validationConfig, normalizeNumbers: !validationConfig.normalizeNumbers })}
                    label="Numeric normalization"
                    description="Handle currency symbols and formatting differences"
                  />
                  <GlassCheckbox
                    checked={validationConfig.detectMissing}
                    onChange={() => setValidationConfig({ ...validationConfig, detectMissing: !validationConfig.detectMissing })}
                    label="Missing record detection"
                    description="Flag records in source that are missing from destination"
                  />
                  <GlassCheckbox
                    checked={validationConfig.detectUnexpected}
                    onChange={() => setValidationConfig({ ...validationConfig, detectUnexpected: !validationConfig.detectUnexpected })}
                    label="Unexpected record detection"
                    description="Flag records in destination that are not in source"
                  />
                  <GlassCheckbox
                    checked={validationConfig.detectDuplicates}
                    onChange={() => setValidationConfig({ ...validationConfig, detectDuplicates: !validationConfig.detectDuplicates })}
                    label="Duplicate record detection"
                    description="Identify duplicate identifiers in both datasets"
                  />
                </div>
              </div>
            </div>
          </GlassCard>
        )}

        {step === 4 && (
          <GlassCard padding="lg">
            <div className="space-y-6">
              <div className="glass-secondary p-4 rounded-glass-sm">
                <h3 className="text-lg font-semibold text-text-primary mb-4">Review Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">Session Name</p>
                    <p className="text-text-primary">{sessionData.name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">Source System</p>
                    <p className="text-text-primary">{sessionData.sourceSystem}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">Destination System</p>
                    <p className="text-text-primary">{sessionData.destinationSystem}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">Unique Identifier</p>
                    <p className="text-text-primary">{uniqueIdentifier || 'None'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">Source Records</p>
                    <p className="text-text-primary tabular-nums">{sourcePreview?.rowCount || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">Destination Records</p>
                    <p className="text-text-primary tabular-nums">{destinationPreview?.rowCount || 0}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">Column Mappings</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {mappings.map(m => (
                        <span key={m.id} className="glass-primary px-2 py-1 rounded-glass-sm text-xs text-text-secondary">
                          {m.sourceColumn} → {m.destinationColumn || 'unmapped'}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-error/10 border border-error/20 rounded-glass-sm p-4">
                <p className="text-sm text-text-secondary">
                  Running reconciliation will process your files and compare records. This may take a moment depending on file size.
                </p>
              </div>
            </div>
            <div className="flex gap-4 mt-8">
              <GlassButton variant="ghost" onClick={handlePrev}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </GlassButton>
              <GlassButton variant="primary" onClick={handleRunReconciliation} loading={running} disabled={running}>
                Run Reconciliation
                <CheckCircle className="w-4 h-4 ml-2" />
              </GlassButton>
            </div>
          </GlassCard>
        )}

        <div className="flex gap-4 mt-8 justify-between">
          {step > 0 && (
            <GlassButton variant="ghost" onClick={handlePrev} disabled={step === 0}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </GlassButton>
          )}
          {step < STEPS.length - 1 && (
            <GlassButton variant="primary" onClick={handleNext}>
              Next <ArrowRight className="w-4 h-4 ml-2" />
            </GlassButton>
          )}
        </div>
      </div>
    </GlassPanel>
  )
}
