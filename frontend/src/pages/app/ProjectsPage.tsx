import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useWorkspace } from '../../context/WorkspaceContext'
import { useToast } from '../../context/ToastContext'
import { GlassCard, GlassPanel, GlassButton, GlassTable, ConfirmDialog, GlassBadge, Skeleton } from '../../components/ui/GlassComponents'
import { PlusCircle, Edit, Trash2, FolderKanban, Database, Clock, ChevronRight } from 'lucide-react'
import { formatDateTime } from '../../utils/helpers'

export function ProjectsPage() {
  const { projects, createProject, updateProject, deleteProject, currentProjectId, setCurrentProject } = useWorkspace()
  const { showToast } = useToast()
  const [editingProject, setEditingProject] = useState<{ id: string; name: string; description: string } | null>(null)
  const [newProject, setNewProject] = useState<{ name: string; description: string }>({ name: '', description: '' })
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newProject.name.trim()) return
    try {
      await createProject({ name: newProject.name.trim(), description: newProject.description.trim() })
      setNewProject({ name: '', description: '' })
      setShowCreateForm(false)
      showToast({ type: 'success', title: 'Project Created', message: 'Project has been created successfully.' })
    } catch (err) {
      showToast({ type: 'error', title: 'Error', message: 'Failed to create project.' })
    }
  }

  const handleSaveEdit = async () => {
    if (!editingProject) return
    try {
      await updateProject(editingProject.id, { name: editingProject.name, description: editingProject.description })
      setEditingProject(null)
      showToast({ type: 'success', title: 'Project Updated', message: 'Project has been updated.' })
    } catch (err) {
      showToast({ type: 'error', title: 'Error', message: 'Failed to update project.' })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteProject(id)
      showToast({ type: 'success', title: 'Project Deleted', message: 'Project has been deleted.' })
    } catch (err) {
      showToast({ type: 'error', title: 'Error', message: 'Failed to delete project.' })
    }
  }

  return (
    <GlassPanel padding="lg">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary mb-1">Projects</h1>
          <p className="text-text-secondary">Manage your reconciliation projects.</p>
        </div>
        <GlassButton variant="primary" onClick={() => setShowCreateForm(true)}>
          <PlusCircle className="w-4 h-4 mr-2" /> New Project
        </GlassButton>
      </div>

      {showCreateForm && (
        <GlassCard padding="lg" className="mb-6">
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="input-label">Project Name</label>
                <input
                  type="text"
                  className="input-field w-full"
                  value={newProject.name}
                  onChange={e => setNewProject({ ...newProject, name: e.target.value })}
                  placeholder="e.g. Q4 Financial Migration"
                  required
                />
              </div>
              <div>
                <label className="input-label">Description</label>
                <input
                  type="text"
                  className="input-field w-full"
                  value={newProject.description}
                  onChange={e => setNewProject({ ...newProject, description: e.target.value })}
                  placeholder="Describe this project..."
                />
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <GlassButton type="submit" variant="primary">Create Project</GlassButton>
              <GlassButton variant="ghost" onClick={() => setShowCreateForm(false)}>Cancel</GlassButton>
            </div>
          </form>
        </GlassCard>
      )}

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-20">
          <div className="glass-primary w-16 h-16 flex items-center justify-center rounded-full mb-4">
            <FolderKanban className="w-8 h-8 text-text-muted" />
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-2">No projects yet</h2>
          <p className="text-text-secondary mb-6">Create your first project to organize reconciliation sessions.</p>
          <GlassButton variant="primary" onClick={() => setShowCreateForm(true)}>
            <PlusCircle className="w-4 h-4 mr-2" /> Create Project
          </GlassButton>
        </div>
      ) : (
        <GlassTable
          columns={[
            { key: 'name', header: 'Project Name', className: 'w-1/3' },
            { key: 'description', header: 'Description', className: 'w-1/3' },
            { key: 'sessions', header: 'Sessions', className: 'w-1/6' },
            { key: 'activity', header: 'Last Activity', className: 'w-1/6' },
          ]}
          data={projects}
          keyExtractor={row => row.id}
          onRowClick={row => setCurrentProject(row.id)}
          cellRender={(row: any, key: string) => {
            if (key === 'name') return <span className="font-medium text-text-primary">{row.name}</span>
            if (key === 'description') return <span className="text-text-secondary text-sm">{row.description || '—'}</span>
            if (key === 'sessions') return <span className="tabular-nums text-text-primary">{row.sessionCount}</span>
            if (key === 'activity') return <span className="text-xs text-text-muted">{row.lastActivity ? formatDateTime(row.lastActivity) : '—'}</span>
            return null
          }}
          emptyMessage="No projects found"
        />
      )}

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={() => { handleDelete(deletingId!); setDeleteConfirmOpen(false); setDeletingId(null) }}
        title="Delete Project"
        message="This will also delete all reconciliation sessions associated with this project. This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
      />
    </GlassPanel>
  )
}
