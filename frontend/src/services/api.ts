import axios, { AxiosError } from 'axios'
import type { PredictionResponse, ModelInfo, HealthStatus } from '../types'

const API_BASE = 'http://localhost:8000'

const client = axios.create({
  baseURL: API_BASE,
  timeout: 120_000, // 2 min para archivos grandes
})

// Manejo centralizado de errores
function extractErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data
    if (typeof data?.detail === 'string') return data.detail
    if (typeof data?.error === 'string') return data.error
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      return 'No se puede conectar al servidor. Asegúrate de que el backend esté corriendo en localhost:8000.'
    }
    if (error.response?.status === 413) return 'Archivo demasiado grande.'
    if (error.response?.status === 422) return data?.detail ?? 'Datos inválidos.'
    return `Error ${error.response?.status ?? 'de red'}: ${error.message}`
  }
  if (error instanceof Error) return error.message
  return 'Error desconocido.'
}

export const api = {
  async getHealth(): Promise<HealthStatus> {
    const { data } = await client.get<HealthStatus>('/health')
    return data
  },

  async getModelInfo(): Promise<ModelInfo> {
    const { data } = await client.get<ModelInfo>('/model-info')
    return data
  },

  async predict(file: File): Promise<PredictionResponse> {
    const form = new FormData()
    form.append('file', file)
    const { data } = await client.post<PredictionResponse>('/predict', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

  getExportResultsUrl(): string {
    return `${API_BASE}/export/results`
  },

  getExportSummaryUrl(): string {
    return `${API_BASE}/export/summary`
  },

  extractErrorMessage,
}
