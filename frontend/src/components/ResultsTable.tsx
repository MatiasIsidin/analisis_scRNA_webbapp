import { useState } from 'react'
import { ChevronLeft, ChevronRight, Filter } from 'lucide-react'
import type { CellPrediction } from '../types'

interface Props {
  predictions: CellPrediction[]
}

const CLASS_COLORS: Record<string, string> = {
  B:    'bg-blue-50 text-blue-700 ring-blue-600/20',
  T:    'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  NK:   'bg-violet-50 text-violet-700 ring-violet-600/20',
  MNP:  'bg-amber-50 text-amber-700 ring-amber-600/20',
  pDC:  'bg-pink-50 text-pink-700 ring-pink-600/20',
  mast: 'bg-rose-50 text-rose-700 ring-rose-600/20',
}

const PAGE_SIZE = 50

export default function ResultsTable({ predictions }: Props) {
  const [page, setPage] = useState(0)
  const [filterClass, setFilterClass] = useState<string>('all')

  const classes = Array.from(new Set(predictions.map((p) => p.predicted_class))).sort()

  const filtered =
    filterClass === 'all'
      ? predictions
      : predictions.filter((p) => p.predicted_class === filterClass)

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const handleFilterChange = (cls: string) => {
    setFilterClass(cls)
    setPage(0)
  }

  return (
    <div className="space-y-4">
      {/* Filtro por clase */}
      <div className="flex flex-wrap gap-2 items-center bg-slate-50 p-2 rounded-lg border border-slate-200">
        <Filter className="w-4 h-4 text-slate-400 ml-2" />
        <span className="text-sm text-slate-600 font-medium mr-2">Filtro:</span>
        <button
          onClick={() => handleFilterChange('all')}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            filterClass === 'all'
              ? 'bg-white shadow-sm ring-1 ring-slate-200 text-slate-800'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
          }`}
        >
          Todas
        </button>
        <div className="w-px h-4 bg-slate-300 mx-1" />
        {classes.map((cls) => {
          const count = predictions.filter((p) => p.predicted_class === cls).length
          const isActive = filterClass === cls
          return (
            <button
              key={cls}
              onClick={() => handleFilterChange(cls)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                isActive
                  ? 'bg-white shadow-sm ring-1 ring-slate-200 text-slate-900'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${CLASS_COLORS[cls]?.split(' ')[1] || 'bg-slate-400'}`} />
              {cls} <span className="text-xs opacity-60">({count})</span>
            </button>
          )
        })}
      </div>

      {/* Tabla */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">#</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">ID Celular</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tipo Predicho</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Confianza</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginated.map((pred, idx) => (
                <tr key={pred.cell_id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-3 text-slate-400 font-mono text-xs w-16">
                    {page * PAGE_SIZE + idx + 1}
                  </td>
                  <td className="px-6 py-3 font-mono text-sm text-slate-600 group-hover:text-primary-600 transition-colors">
                    {pred.cell_id}
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ring-1 ring-inset ${
                        CLASS_COLORS[pred.predicted_class] ?? 'bg-slate-50 text-slate-700 ring-slate-500/20'
                      }`}
                    >
                      {pred.predicted_class}
                    </span>
                  </td>
                  <td className="px-6 py-3 w-48">
                    {pred.confidence != null ? (
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              pred.confidence > 0.9 ? 'bg-emerald-500' :
                              pred.confidence > 0.7 ? 'bg-amber-400' : 'bg-rose-500'
                            }`}
                            style={{ width: `${Math.max(5, pred.confidence * 100)}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-slate-600 tabular-nums w-10 text-right">
                          {(pred.confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-xs">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-slate-200 bg-slate-50">
            <span className="text-sm text-slate-500">
              Mostrando <span className="font-medium text-slate-700">{page * PAGE_SIZE + 1}</span> a{' '}
              <span className="font-medium text-slate-700">{Math.min((page + 1) * PAGE_SIZE, filtered.length)}</span> de{' '}
              <span className="font-medium text-slate-700">{filtered.length}</span> resultados
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-1.5 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed bg-white shadow-sm"
                aria-label="Página anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-1.5 text-sm font-medium text-slate-700">
                Página {page + 1} de {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="p-1.5 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed bg-white shadow-sm"
                aria-label="Página siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
