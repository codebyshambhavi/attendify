import {
  AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';
import { EmptyState } from '../ui';
import { CalendarCheck } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="card !p-2.5 text-xs shadow-card-md">
      <p className="font-semibold mb-0.5">{label}</p>
      <p className={payload[0].value ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}>
        {payload[0].value ? 'Present' : 'Absent'}
      </p>
    </div>
  );
};

export default function AttendanceChart({ records = [], height = 200 }) {
  const chartData = [...records]
    .reverse()
    .slice(0, 14)
    .map((r) => ({
      date:  format(new Date(r.date), 'MMM d'),
      value: r.status === 'present' || r.status === 'late' ? 1 : 0,
    }));

  if (!chartData.length) {
    return (
      <EmptyState
        icon={CalendarCheck}
        title="No data yet"
        description="Your attendance chart will appear after your first record."
      />
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -28 }}>
        <defs>
          <linearGradient id="aGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}    />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,.08)" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          ticks={[0, 1]}
          tickFormatter={(v) => (v ? 'P' : 'A')}
          tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="value"
          stroke="#6366f1"
          fill="url(#aGrad)"
          strokeWidth={2.5}
          dot={{ r: 3, fill: '#6366f1', strokeWidth: 0 }}
          activeDot={{ r: 5, fill: '#6366f1' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
