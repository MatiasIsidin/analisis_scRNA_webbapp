import { useState, useEffect, useCallback } from 'react'
import { Play, RefreshCw, UploadCloud, ChevronRight, FileText } from 'lucide-react'

import { api } from '../services/api'
import type { PredictionResponse, ModelInfo, HealthStatus } from '../types'

import DashboardLayout from '../components/DashboardLayout'
import FileUpload from '../components/FileUpload'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorAlert from '../components/ErrorAlert'
import SummaryCards from '../components/SummaryCards'
import Charts from '../components/Charts'
import ResultsTable from '../components/ResultsTable'
import ExportButtons from '../components/ExportButtons'

export default function HomePage() {
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null)
  const [health, setHealth]       = useState<HealthStatus | null>(null)
  const [infoLoading, setInfoLoading] = useState(true)

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [predicting, setPredicting]     = useState(false)
  const [result, setResult]             = useState<PredictionResponse | null>(null)
  const [error, setError]               = useState<string | null>(null)

  const fetchModelInfo = useCallback(async () => {
    setInfoLoading(true)
    try {
      const [h, m] = await Promise.all([api.getHealth(), api.getModelInfo()])
      setHealth(h)
      setModelInfo(m)
    } catch (e) {
      console.warn('No se pudo obtener info del modelo:', api.extractErrorMessage(e))
    } finally {
      setInfoLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchModelInfo()
  }, [fetchModelInfo])

  const handlePredict = async () => {
    if (!selectedFile) return
    setError(null)
    setPredicting(true)
    setResult(null)
    try {
      const res = await api.predict(selectedFile)
      setResult(res)
    } catch (e) {
      setError(api.extractErrorMessage(e))
    } finally {
      setPredicting(false)
    }
  }

  const handleReset = () => {
    setResult(null)
    setSelectedFile(null)
    setError(null)
  }

  return (
    <DashboardLayout modelInfo={modelInfo} health={health}>
      
      {/* ─── Breadcrumbs & Header ─── */}
      <div className="flex items-center text-sm text-slate-500 mb-2">
        <span className="font-medium">scRNA Analysis</span>
        <ChevronRight className="w-4 h-4 mx-1" />
        <span className={result ? "text-slate-500" : "text-primary-600 font-semibold"}>Data Input</span>
        {result && (
          <>
            <ChevronRight className="w-4 h-4 mx-1" />
            <span className="text-primary-600 font-semibold">Results Dashboard</span>
          </>
        )}
      </div>

      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {result ? 'Resultados del Análisis' : 'Nueva Clasificación Celular'}
          </h1>
          <p className="text-slate-500 mt-1">
            {result 
              ? 'Explora las métricas y distribuciones de tipos celulares inferidas.'
              : 'Sube una matriz de recuentos o un objeto anndata para comenzar.'}
          </p>
        </div>
        {result && (
          <button onClick={handleReset} className="btn-secondary text-sm h-10">
            <RefreshCw className="w-4 h-4" />
            Nuevo Análisis
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6">
          <ErrorAlert message={error} onDismiss={() => setError(null)} />
        </div>
      )}

      {/* ─── Pantalla de Carga de Datos (Input Mode) ─── */}
      {!result && !predicting && (
        <div className="grid lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 flex flex-col h-full">
            <div className="card flex-1 flex flex-col justify-center items-center border-dashed border-2 border-slate-300 hover:border-primary-400 bg-white shadow-sm transition-all p-10 min-h-[400px]">
              <FileUpload onFileSelect={setSelectedFile} disabled={predicting} />
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={handlePredict}
                disabled={!selectedFile || predicting}
                className="btn-primary text-base px-8 py-3 w-full sm:w-auto shadow-md shadow-primary-500/20"
              >
                <Play className="w-5 h-5" />
                Ejecutar Clasificación
              </button>
            </div>
          </div>

          {/* Side panel for instructions */}
          <div className="space-y-6">
            <div className="card bg-slate-50 border-none shadow-sm">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-primary-500" />
                Instrucciones
              </h3>
              <ul className="text-sm text-slate-600 space-y-3 list-disc list-inside">
                <li>Sube un archivo <strong className="text-slate-800">CSV</strong> que contenga las columnas de componentes principales (PC1 a PC50).</li>
                <li>Sube un archivo <strong className="text-slate-800">H5AD</strong> donde la matriz de dimensionalidad se encuentre en <code>obsm['X_pca']</code>.</li>
                <li>El modelo asignará cada célula a uno de los 6 tipos celulares conocidos.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ─── Loading State ─── */}
      {predicting && (
        <div className="card flex flex-col items-center justify-center min-h-[400px]">
          <LoadingSpinner message="Analizando matriz scRNA-seq con XGBoost..." />
          <p className="text-slate-500 text-sm mt-4">Esto puede tomar unos segundos dependiendo del tamaño del archivo.</p>
        </div>
      )}

      {/* ─── Dashboard de Resultados (Results Mode) ─── */}
      {result && !predicting && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Tarjetas de Resumen KPI */}
          <SummaryCards result={result} />

          {/* Gráficos Principal */}
          <div className="grid grid-cols-1 gap-6">
            <Charts 
              summary={result.summary} 
              summaryPercentage={result.summary_percentage} 
            />
          </div>

          {/* Fila Inferior: Tabla y Acciones */}
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 card">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-slate-900 text-lg">Muestra de Predicciones</h3>
              </div>
              <ResultsTable predictions={result.predictions} />
            </div>
            
            <div className="card flex flex-col">
              <h3 className="font-semibold text-slate-900 text-lg mb-4">Exportar y Descargar</h3>
              <p className="text-sm text-slate-500 mb-6 flex-1">
                Descarga las anotaciones generadas para incluirlas en tu pipeline de Seurat o Scanpy, o el reporte ejecutivo en formato legible.
              </p>
              <ExportButtons />
            </div>
          </div>

        </div>
      )}
    </DashboardLayout>
  )
}
