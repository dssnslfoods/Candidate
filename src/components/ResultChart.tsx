import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { SectionScore } from '@/lib/types'

interface ResultChartProps {
  data: SectionScore[]
}

export function ResultChart({ data }: ResultChartProps) {
  const chartData = data.map((s) => ({
    section: s.section,
    Earned: s.earned,
    Max: s.max,
  }))

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#efe1c9" />
          <XAxis
            dataKey="section"
            stroke="#807c74"
            tick={{ fontSize: 12 }}
            interval={0}
          />
          <YAxis stroke="#807c74" tick={{ fontSize: 12 }} allowDecimals={false} />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              borderColor: '#efe1c9',
              fontSize: 12,
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="Max" fill="#f5e7bd" radius={[6, 6, 0, 0]} />
          <Bar dataKey="Earned" fill="#c93962" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
