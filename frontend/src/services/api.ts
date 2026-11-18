import axios from 'axios'
import type {
  CSVPreviewResponse,
  ReconciliationRunRequest,
  ReconciliationRunResponse,
  ReportRequest,
  HealthResponse,
} from '../types'

const api = axios.create({
  baseURL: '/api',
  timeout: 120000,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      const message = error.response.data?.detail || error.response.data?.message || 'An error occurred'
      return Promise.reject(new Error(message))
    } else if (error.request) {
      return Promise.reject(new Error('Network error. Please check your connection.'))
    }
    return Promise.reject(error)
  }
)

export async function healthCheck(): Promise<HealthResponse> {
  const response = await api.get<HealthResponse>('/health')
  return response.data
}

export async function previewCSV(file: File): Promise<CSVPreviewResponse> {
  const formData = new FormData()
  formData.append('file', file)
  const response = await api.post<CSVPreviewResponse>('/csv/preview', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

export async function validateCSV(file: File): Promise<{ valid: boolean; errors: string[] }> {
  const formData = new FormData()
  formData.append('file', file)
  const response = await api.post<{ valid: boolean; errors: string[] }>('/csv/validate', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

export async function runReconciliation(request: ReconciliationRunRequest): Promise<ReconciliationRunResponse> {
  const formData = new FormData()
  formData.append('sourceFile', request.sourceFile)
  formData.append('destinationFile', request.destinationFile)
  formData.append('config', JSON.stringify(request.config))
  const response = await api.post<ReconciliationRunResponse>('/reconciliation/run', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 300000,
  })
  return response.data
}

export async function validateConfig(config: ReconciliationRunRequest['config']): Promise<{ valid: boolean; errors: string[] }> {
  const response = await api.post<{ valid: boolean; errors: string[] }>('/reconciliation/validate-config', config)
  return response.data
}

export async function generateReport(request: ReportRequest): Promise<Blob> {
  const response = await api.post(`/reports/${request.reportType}`, { sessionId: request.sessionId }, {
    responseType: 'blob',
  })
  return response.data
}

export default api