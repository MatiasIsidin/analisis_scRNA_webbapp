// Iconos SVG inline para evitar dependencias extra
import { Timer, FileType2, BarChart2, Microscope } from 'lucide-react'

export function Clock() {
  return <Timer className="w-5 h-5" />
}

export function Cells() {
  return <Microscope className="w-5 h-5" />
}

export function BarChart3() {
  return <BarChart2 className="w-5 h-5" />
}

export function FileType() {
  return <FileType2 className="w-5 h-5" />
}
