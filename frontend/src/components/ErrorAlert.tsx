import { AlertCircle, X } from 'lucide-react'

interface Props {
  message: string
  onDismiss?: () => void
}

export default function ErrorAlert({ message, onDismiss }: Props) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700"
    >
      <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
      <p className="flex-1 text-sm font-medium">{message}</p>
      {onDismiss && (
        <button
          onClick={onDismiss}
          aria-label="Cerrar error"
          className="text-red-400 hover:text-red-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
