export interface CellPrediction {
  cell_id: string
  predicted_class: string
  confidence: number | null
}

export interface PredictionResponse {
  total_cells: number
  predictions: CellPrediction[]
  summary: Record<string, number>
  summary_percentage: Record<string, number>
  processing_time_seconds: number
  input_format: string
}

export interface ModelInfo {
  model: string
  accuracy: number
  f1_macro: number
  classes: string[]
  n_features: number
  status: string
  description: string
  model_file_found?: boolean
  encoder_file_found?: boolean
}

export interface HealthStatus {
  status: string
  model_loaded: boolean
  version: string
}

export type AppStatus = 'idle' | 'loading' | 'success' | 'error'
