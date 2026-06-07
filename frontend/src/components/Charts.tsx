import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'

interface Props {
  summary: Record<string, number>
  summaryPercentage: Record<string, number>
}

// Updated Palette to match the dashboard theme
const PALETTE = [
  '#3b82f6', // blue  - B
  '#10b981', // emerald - T
  '#8b5cf6', // violet - NK
  '#f59e0b', // amber - MNP
  '#ec4899', // pink  - pDC
  '#f43f5e', // rose   - mast
]

const CLASS_ORDER = ['B', 'T', 'NK', 'MNP', 'pDC', 'mast']

function sortedEntries(summary: Record<string, number>) {
  const entries = Object.entries(summary)
  entries.sort((a, b) => {
    const ia = CLASS_ORDER.indexOf(a[0])
    const ib = CLASS_ORDER.indexOf(b[0])
    if (ia === -1 && ib === -1) return b[1] - a[1]
    if (ia === -1) return 1
    if (ib === -1) return -1
    return ia - ib
  })
  return entries
}

function getColor(cls: string, idx: number): string {
  const i = CLASS_ORDER.indexOf(cls)
  if (i !== -1) return PALETTE[i]
  return PALETTE[idx % PALETTE.length]
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-xl p-3 text-white">
        <p className="font-semibold text-sm mb-1">{label}</p>
        <p className="text-primary-400 font-medium">{payload[0].value.toLocaleString()} células</p>
      </div>
    )
  }
  return null
}

const PieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-xl p-3 text-white">
        <p className="font-semibold text-sm mb-1">{payload[0].name}</p>
        <p style={{ color: payload[0].payload.fill }} className="font-medium">
          {payload[0].value.toLocaleString()} ({payload[0].payload.pct}%)
        </p>
      </div>
    )
  }
  return null
}

export default function Charts({ summary, summaryPercentage }: Props) {
  const entries = sortedEntries(summary)

  const barData = entries.map(([cls, count], idx) => ({
    name: cls,
    count,
    fill: getColor(cls, idx),
  }))

  const pieData = entries.map(([cls, count], idx) => ({
    name: cls,
    value: count,
    pct: summaryPercentage[cls]?.toFixed(1) ?? '0',
    fill: getColor(cls, idx),
  }))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Gráfico de barras */}
      <div className="card border-0 shadow-sm ring-1 ring-slate-200 bg-white">
        <div className="border-b border-slate-100 pb-4 mb-4">
          <h3 className="text-base font-semibold text-slate-800">
            Distribución de Tipos Celulares
          </h3>
          <p className="text-xs text-slate-500">Recuento absoluto de células por tipo detectado</p>
        </div>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={barData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
              axisLine={{ stroke: '#e2e8f0' }}
              tickLine={false}
              dy={10}
            />
            <YAxis
              tick={{ fill: '#64748b', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={60}>
              {barData.map((entry) => (
                <Cell key={entry.name} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfico circular */}
      <div className="card border-0 shadow-sm ring-1 ring-slate-200 bg-white">
         <div className="border-b border-slate-100 pb-4 mb-4">
          <h3 className="text-base font-semibold text-slate-800">
            Composición Celular
          </h3>
          <p className="text-xs text-slate-500">Porcentaje relativo de cada tipo celular</p>
        </div>
        <ResponsiveContainer width="100%" height={320}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="45%"
              innerRadius={70}
              outerRadius={110}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
            >
              {pieData.map((entry) => (
                <Cell key={entry.name} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip content={<PieTooltip />} />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: '12px', color: '#475569' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
