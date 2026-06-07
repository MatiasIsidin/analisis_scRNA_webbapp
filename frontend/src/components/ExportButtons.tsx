import { Download, FileSpreadsheet } from 'lucide-react'
import { api } from '../services/api'

interface Props {
  disabled?: boolean
}

export default function ExportButtons({ disabled }: Props) {
  const download = (url: string, filename: string) => {
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <div className="flex flex-col gap-3 w-full">
      <button
        onClick={() => download(api.getExportResultsUrl(), 'resultados.csv')}
        disabled={disabled}
        className="btn-secondary w-full justify-start text-sm py-2.5 bg-white hover:bg-slate-50 border-slate-200 shadow-sm transition-all hover:shadow-md"
        aria-label="Descargar resultados CSV"
      >
        <div className="bg-slate-100 p-1.5 rounded-md mr-1">
          <Download className="w-4 h-4 text-slate-600" />
        </div>
        <div className="text-left flex-1">
          <div className="font-semibold text-slate-800">Resultados Completos</div>
          <div className="text-xs text-slate-500 font-normal">Predicciones célula por célula</div>
        </div>
      </button>

      <button
        onClick={() => download(api.getExportSummaryUrl(), 'reporte_resumen.csv')}
        disabled={disabled}
        className="btn-secondary w-full justify-start text-sm py-2.5 bg-white hover:bg-slate-50 border-slate-200 shadow-sm transition-all hover:shadow-md"
        aria-label="Descargar reporte resumen CSV"
      >
        <div className="bg-slate-100 p-1.5 rounded-md mr-1">
          <FileSpreadsheet className="w-4 h-4 text-slate-600" />
        </div>
        <div className="text-left flex-1">
          <div className="font-semibold text-slate-800">Reporte de Resumen</div>
          <div className="text-xs text-slate-500 font-normal">Métricas globales agrupadas</div>
        </div>
      </button>
    </div>
  )
}
