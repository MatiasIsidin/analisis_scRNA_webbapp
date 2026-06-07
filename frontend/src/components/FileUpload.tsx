import { useRef, useState, useCallback } from 'react'
import { UploadCloud, FileText, X, AlertCircle } from 'lucide-react'

interface Props {
  onFileSelect: (file: File) => void
  disabled?: boolean
}

const MAX_SIZE_MB = 500
const ALLOWED_TYPES = ['.csv', '.h5ad']

export default function FileUpload({ onFileSelect, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  const validateAndSet = useCallback((file: File) => {
    setValidationError(null)
    const ext = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!ALLOWED_TYPES.includes(ext)) {
      setValidationError(`Formato no soportado. Usa: ${ALLOWED_TYPES.join(', ')}`)
      return
    }
    const sizeMB = file.size / (1024 * 1024)
    if (sizeMB > MAX_SIZE_MB) {
      setValidationError(`Archivo demasiado grande: ${sizeMB.toFixed(1)} MB. Máximo: ${MAX_SIZE_MB} MB.`)
      return
    }
    setSelectedFile(file)
    onFileSelect(file)
  }, [onFileSelect])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (disabled) return
    const file = e.dataTransfer.files[0]
    if (file) validateAndSet(file)
  }, [disabled, validateAndSet])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) validateAndSet(file)
  }

  const clearFile = () => {
    setSelectedFile(null)
    setValidationError(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="w-full">
      <div
        className={`
          relative rounded-xl p-10 text-center flex flex-col items-center justify-center
          transition-all duration-200 cursor-pointer outline-none w-full
          ${dragOver
            ? 'bg-primary-50 ring-4 ring-primary-500/20 ring-inset'
            : validationError
              ? 'bg-red-50 ring-2 ring-red-300 ring-inset'
              : selectedFile
                ? 'bg-emerald-50 ring-2 ring-emerald-300 ring-inset'
                : 'hover:bg-slate-50'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        role="button"
        aria-label="Zona de carga de archivos"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => e.key === 'Enter' && !disabled && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.h5ad"
          className="hidden"
          onChange={handleChange}
          disabled={disabled}
          aria-label="Seleccionar archivo"
        />

        {selectedFile ? (
          <div className="flex flex-col items-center gap-3 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-2">
              <FileText className="w-8 h-8 text-emerald-600" />
            </div>
            <p className="font-semibold text-emerald-800 text-lg">{selectedFile.name}</p>
            <p className="text-sm font-medium text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full">
              {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
            </p>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); clearFile() }}
              className="mt-4 flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors"
              aria-label="Eliminar archivo seleccionado"
            >
              <X className="w-4 h-4" /> Quitar archivo
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-colors duration-200 ${dragOver ? 'bg-primary-100' : 'bg-slate-100'}`}>
              <UploadCloud className={`w-10 h-10 ${dragOver ? 'text-primary-600' : 'text-slate-400'}`} />
            </div>
            <div>
              <p className="text-xl font-semibold text-slate-800">
                Arrastra tu archivo aquí o{' '}
                <span className="text-primary-600 hover:text-primary-700 transition-colors">selecciona uno</span>
              </p>
              <p className="text-slate-500 mt-2">
                Soporta matrices en formato <span className="font-medium text-slate-700">.csv</span> o <span className="font-medium text-slate-700">.h5ad</span>
              </p>
            </div>
            <div className="flex gap-2 text-xs font-medium text-slate-500 mt-2">
              <span className="bg-white border border-slate-200 shadow-sm px-2.5 py-1 rounded-md">Max {MAX_SIZE_MB} MB</span>
            </div>
          </div>
        )}
      </div>

      {validationError && (
        <div className="mt-4 flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 animate-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="font-medium">{validationError}</span>
        </div>
      )}
    </div>
  )
}
