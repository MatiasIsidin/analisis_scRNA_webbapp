import { Activity, Brain, CheckCircle, AlertCircle } from 'lucide-react'
import type { ModelInfo, HealthStatus } from '../types'

interface Props {
  modelInfo: ModelInfo | null
  health: HealthStatus | null
  loading: boolean
}

const CLASS_COLORS: Record<string, string> = {
  B:    'bg-blue-100 text-blue-700',
  T:    'bg-green-100 text-green-700',
  NK:   'bg-purple-100 text-purple-700',
  MNP:  'bg-orange-100 text-orange-700',
  pDC:  'bg-pink-100 text-pink-700',
  mast: 'bg-red-100 text-red-700',
}

export default function ModelStatusCard({ modelInfo, health, loading }: Props) {
  const isLoaded = health?.model_loaded ?? false

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Brain className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Estado del Modelo</h2>
            <p className="text-sm text-gray-500">XGBoost · scRNA-seq Classifier</p>
          </div>
        </div>

        {!loading && (
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
            isLoaded
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
          }`}>
            {isLoaded
              ? <><CheckCircle className="w-4 h-4" /> Modelo cargado</>
              : <><AlertCircle className="w-4 h-4" /> Modo demo</>
            }
          </div>
        )}
      </div>

      {loading ? (
        <div className="space-y-3 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
      ) : modelInfo ? (
        <>
          {/* Métricas principales */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <MetricBlock
              icon={<Activity className="w-4 h-4" />}
              label="Accuracy"
              value={`${(modelInfo.accuracy * 100).toFixed(1)}%`}
              color="text-blue-600"
              bg="bg-blue-50"
            />
            <MetricBlock
              icon={<Activity className="w-4 h-4" />}
              label="F1 Macro"
              value={`${(modelInfo.f1_macro * 100).toFixed(0)}%`}
              color="text-green-600"
              bg="bg-green-50"
            />
            <MetricBlock
              icon={<Activity className="w-4 h-4" />}
              label="Features PCA"
              value={`${modelInfo.n_features}`}
              color="text-purple-600"
              bg="bg-purple-50"
            />
          </div>

          {/* Clases */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Tipos celulares clasificables
            </p>
            <div className="flex flex-wrap gap-2">
              {modelInfo.classes.map((cls) => (
                <span
                  key={cls}
                  className={`badge text-xs font-medium px-2.5 py-1 rounded-full ${
                    CLASS_COLORS[cls] ?? 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {cls}
                </span>
              ))}
            </div>
          </div>

          <p className="mt-3 text-xs text-gray-400">{modelInfo.description}</p>
        </>
      ) : (
        <p className="text-sm text-gray-500">No se pudo obtener información del modelo.</p>
      )}
    </div>
  )
}

function MetricBlock({
  icon, label, value, color, bg,
}: {
  icon: React.ReactNode
  label: string
  value: string
  color: string
  bg: string
}) {
  return (
    <div className={`${bg} rounded-lg p-3 text-center`}>
      <div className={`flex justify-center mb-1 ${color}`}>{icon}</div>
      <p className={`text-lg font-bold ${color}`}>{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  )
}
