interface Props {
  message?: string
}

export default function LoadingSpinner({ message = 'Procesando...' }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      {/* DNA-inspired spinner */}
      <div className="relative w-14 h-14">
        <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 animate-spin" />
        <div className="absolute inset-2 rounded-full border-4 border-transparent border-b-blue-300 animate-spin"
          style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}
        />
      </div>
      <div className="text-center">
        <p className="text-base font-semibold text-gray-700">{message}</p>
        <p className="text-sm text-gray-400 mt-1">
          Ejecutando inferencia con XGBoost...
        </p>
      </div>
    </div>
  )
}
