import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import Dexie, { Table } from 'dexie'
import type { Project, Session, UserSettings, WorkspaceState } from '../types'
import { generateId, formatDateTime } from '../utils/helpers'

/* IndexedDB Schema */
class FinSyncDB extends Dexie {
  projects!: Table<Project>
  sessions!: Table<Session>
  settings!: Table<UserSettings>

  constructor() {
    super('FinSyncDB')
    this.version(1).stores({
      projects: 'id, name, createdAt, updatedAt',
      sessions: 'id, projectId, name, status, createdAt, updatedAt, completedAt',
      settings: 'id',
    })
  }
}

export const db = new FinSyncDB()

const defaultSettings: UserSettings = {
  theme: 'dark',
  workspaceLabel: 'Guest Workspace',
  defaultNumericTolerance: 0.01,
  defaultCaseInsensitive: true,
  defaultTrimWhitespace: true,
  defaultPageSize: 25,
  validationDefaults: {
    caseInsensitive: true,
    trimWhitespace: true,
    normalizeNumbers: true,
    normalizeDates: true,
    numericTolerance: 0.01,
    detectMissing: true,
    detectUnexpected: true,
    detectDuplicates: true,
    requiredFields: [],
    emptyValues: ['', 'null', 'NULL', 'N/A', 'n/a'],
    validateEmails: false,
  },
}

interface WorkspaceContextType extends WorkspaceState {
  initialize: () => Promise<void>
  createProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'sessionCount' | 'lastActivity'>) => Promise<Project>
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>
  deleteProject: (id: string) => Promise<void>
  createSession: (session: Omit<Session, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Session>
  updateSession: (id: string, updates: Partial<Session>) => Promise<void>
  deleteSession: (id: string) => Promise<void>
  getSession: (id: string) => Promise<Session | undefined>
  getSessionsByProject: (projectId: string) => Promise<Session[]>
  setCurrentProject: (id: string | null) => void
  setCurrentSession: (id: string | null) => void
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>
  exportWorkspace: () => Promise<string>
  importWorkspace: (json: string) => Promise<void>
  clearWorkspace: () => Promise<void>
  getStorageInfo: () => Promise<{ sessions: number; projects: number; estimatedSize: string }>
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined)

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WorkspaceState>({
    projects: [],
    sessions: [],
    currentProjectId: null,
    currentSessionId: null,
    settings: defaultSettings,
  })
  const [initialized, setInitialized] = useState(false)

  const refreshState = useCallback(async () => {
    const [projects, sessions, settings] = await Promise.all([
      db.projects.toArray(),
      db.sessions.toArray(),
      db.settings.get('main'),
    ])
    setState(prev => ({
      ...prev,
      projects: projects.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
      sessions: sessions.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
      settings: settings || defaultSettings,
    }))
  }, [])

  const initialize = useCallback(async () => {
    await refreshState()
    setInitialized(true)
  }, [refreshState])

  useEffect(() => {
    initialize()
  }, [initialize])

  const createProject = useCallback(async (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'sessionCount' | 'lastActivity'>) => {
    const now = new Date().toISOString()
    const project: Project = {
      ...projectData,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
      sessionCount: 0,
      lastActivity: null,
    }
    await db.projects.add(project)
    await refreshState()
    return project
  }, [refreshState])

  const updateProject = useCallback(async (id: string, updates: Partial<Project>) => {
    await db.projects.update(id, { ...updates, updatedAt: new Date().toISOString() })
    await refreshState()
  }, [refreshState])

  const deleteProject = useCallback(async (id: string) => {
    await db.transaction('rw', [db.projects, db.sessions], async () => {
      await db.projects.delete(id)
      await db.sessions.where('projectId').equals(id).delete()
    })
    await refreshState()
  }, [refreshState])

  const createSession = useCallback(async (sessionData: Omit<Session, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString()
    const session: Session = {
      ...sessionData,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    }
    await db.sessions.add(session)
    if (session.projectId) {
      const project = await db.projects.get(session.projectId)
      if (project) {
        await db.projects.update(session.projectId, {
          sessionCount: project.sessionCount + 1,
          lastActivity: now,
          updatedAt: now,
        })
      }
    }
    await refreshState()
    return session
  }, [refreshState])

  const updateSession = useCallback(async (id: string, updates: Partial<Session>) => {
    await db.sessions.update(id, { ...updates, updatedAt: new Date().toISOString() })
    await refreshState()
  }, [refreshState])

  const deleteSession = useCallback(async (id: string) => {
    const session = await db.sessions.get(id)
    await db.sessions.delete(id)
    if (session?.projectId) {
      const project = await db.projects.get(session.projectId)
      if (project) {
        await db.projects.update(session.projectId, {
          sessionCount: Math.max(0, project.sessionCount - 1),
          updatedAt: new Date().toISOString(),
        })
      }
    }
    await refreshState()
  }, [refreshState])

  const getSession = useCallback(async (id: string) => {
    return db.sessions.get(id)
  }, [])

  const getSessionsByProject = useCallback(async (projectId: string) => {
    return db.sessions.where('projectId').equals(projectId).reverse().sortBy('updatedAt')
  }, [])

  const setCurrentProject = useCallback((id: string | null) => {
    setState(prev => ({ ...prev, currentProjectId: id }))
  }, [])

  const setCurrentSession = useCallback((id: string | null) => {
    setState(prev => ({ ...prev, currentSessionId: id }))
  }, [])

  const updateSettings = useCallback(async (settings: Partial<UserSettings>) => {
    const newSettings = { ...state.settings, ...settings }
    await (db.settings as any).put({ id: 'main', ...newSettings })
    setState(prev => ({ ...prev, settings: newSettings }))
  }, [state.settings])

  const exportWorkspace = useCallback(async () => {
    const [projects, sessions, settings] = await Promise.all([
      db.projects.toArray(),
      db.sessions.toArray(),
      db.settings.get('main'),
    ])
    const backup = {
      version: 1,
      exportedAt: new Date().toISOString(),
      projects,
      sessions,
      settings: settings || defaultSettings,
    }
    return JSON.stringify(backup, null, 2)
  }, [])

  const importWorkspace = useCallback(async (json: string) => {
    const backup = JSON.parse(json)
    if (!backup.projects || !backup.sessions) {
      throw new Error('Invalid backup format')
    }
    await db.transaction('rw', [db.projects, db.sessions, db.settings], async () => {
      await db.projects.clear()
      await db.sessions.clear()
      if (backup.projects.length) await db.projects.bulkAdd(backup.projects)
      if (backup.sessions.length) await db.sessions.bulkAdd(backup.sessions)
      if (backup.settings) await db.settings.put({ id: 'main', ...backup.settings })
    })
    await refreshState()
  }, [refreshState])

  const clearWorkspace = useCallback(async () => {
    await db.transaction('rw', [db.projects, db.sessions], async () => {
      await db.projects.clear()
      await db.sessions.clear()
    })
    await refreshState()
  }, [refreshState])

  const getStorageInfo = useCallback(async () => {
    const [projects, sessions] = await Promise.all([
      db.projects.count(),
      db.sessions.count(),
    ])
    let estimatedSize = '0 B'
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate()
        if (estimate.usage) {
          const bytes = estimate.usage
          const k = 1024
          const sizes = ['B', 'KB', 'MB', 'GB']
          const i = Math.floor(Math.log(bytes) / Math.log(k))
          estimatedSize = `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
        }
      }
    } catch {
      // Ignore storage estimate errors
    }
    return { sessions, projects, estimatedSize }
  }, [])

  return (
    <WorkspaceContext.Provider
      value={{
        ...state,
        initialize,
        createProject,
        updateProject,
        deleteProject,
        createSession,
        updateSession,
        deleteSession,
        getSession,
        getSessionsByProject,
        setCurrentProject,
        setCurrentSession,
        updateSettings,
        exportWorkspace,
        importWorkspace,
        clearWorkspace,
        getStorageInfo,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  )
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext)
  if (!context) throw new Error('useWorkspace must be used within WorkspaceProvider')
  return context
}