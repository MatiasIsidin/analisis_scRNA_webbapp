import type { PredictionResponse } from '../types'
import { Clock, Cells, BarChart3, FileType } from './icons'

interface Props {
  result: PredictionResponse
}

const CLASS_COLORS: Record<string, string> = {
  B:    'bg-blue-50 border-blue-200 text-blue-700',
  T:    'bg-emerald-50 border-emerald-200 text-emerald-700',
  NK:   'bg-violet-50 border-violet-200 text-violet-700',
  MNP:  'bg-amber-50 border-amber-200 text-amber-700',
  pDC:  'bg-pink-50 border-pink-200 text-pink-700',
  mast: 'bg-rose-50 border-rose-200 text-rose-700',
}

const CLASS_ORDER = ['B', 'T', 'NK', 'MNP', 'pDC', 'mast']

export default function SummaryCards({ result }: Props) {
  const sortedClasses = Object.entries(result.summary).sort((a, b) => {
    const ia = CLASS_ORDER.indexOf(a[0])
    const ib = CLASS_ORDER.indexOf(b[0])
    if (ia === -1 && ib === -1) return b[1] - a[1]
    if (ia === -1) return 1
    if (ib === -1) return -1
    return ia - ib
  })

  return (
    <div className="space-y-6">
      {/* Stats generales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <StatCard
          icon={<Cells />}
          label="Total Células"
          value={result.total_cells.toLocaleString()}
          sub="Procesadas exitosamente"
        />
        <StatCard
          icon={<BarChart3 />}
          label="Tipos Celulares"
          value={String(Object.keys(result.summary).length)}
          sub="Detectados en la muestra"
        />
        <StatCard
          icon={<Clock />}
          label="Tiempo de Inferencia"
          value={`${result.processing_time_seconds.toFixed(3)}s`}
          sub="Acelerado por XGBoost"
        />
        <StatCard
          icon={<FileType />}
          label="Formato de Entrada"
          value={result.input_format}
          sub="Dimensión validada"
        />
      </div>

      {/* Conteo por clase */}
      <div className="card bg-white shadow-sm">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-100 pb-3">
          Distribución de Anotaciones Celulares
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {sortedClasses.map(([cls, count]) => {
            const pct = result.summary_percentage[cls] ?? 0
            return (
              <div
                key={cls}
                className={`border rounded-xl p-5 text-center flex flex-col justify-center items-center transition-transform hover:scale-105 duration-200 ${
                  CLASS_COLORS[cls] ?? 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <p className="text-3xl font-bold tracking-tight">{count.toLocaleString()}</p>
                <p className="text-sm font-bold mt-2 tracking-wide">{cls}</p>
                <p className="text-xs font-medium opacity-80 mt-1">{pct.toFixed(1)}%</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function StatCard({
  icon, label, value, sub,
}: {
  icon: React.ReactNode
  label: string
  value: string
  sub: string
}) {
  return (
    <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5 flex flex-col relative overflow-hidden group hover:border-primary-300 transition-colors">
      <div className="text-primary-500 bg-primary-50 p-2.5 rounded-lg w-fit mb-4 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <p className="text-2xl font-bold text-slate-800 tracking-tight">{value}</p>
      <p className="text-sm font-semibold text-slate-600 mt-1">{label}</p>
      <p className="text-xs text-slate-400 mt-1.5">{sub}</p>
    </div>
  )
}
