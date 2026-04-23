import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, CalendarCheck, TrendingUp, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { attendanceAPI, adminAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatCard, Card, Badge, Spinner, EmptyState } from '../components/ui';
import { formatDate, pctClass, currentMonth } from '../utils/helpers';

// ── Student Dashboard ─────────────────────────────────────────────────────────
function StudentDashboard() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    attendanceAPI.my(currentMonth())
      .then(({ data }) => setData(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Spinner size={28} className="text-brand-600" /></div>;

  const { stats = {}, records = [] } = data || {};

  // Build chart data from records (last 14)
  const chartData = [...records].reverse().slice(0, 14).map((r) => ({
    date: format(new Date(r.date), 'MMM d'),
    value: r.status === 'present' || r.status === 'late' ? 1 : 0,
  }));

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Present"    value={stats.present ?? 0}    icon={CheckCircle2} color="emerald" />
        <StatCard label="Absent"     value={stats.absent ?? 0}     icon={XCircle}      color="rose"    />
        <StatCard label="Late"       value={stats.late ?? 0}       icon={Clock}        color="amber"   />
        <StatCard
          label="Attendance %"
          value={`${stats.percentage ?? 0}%`}
          icon={TrendingUp}
          color={stats.percentage >= 75 ? 'emerald' : stats.percentage >= 50 ? 'amber' : 'rose'}
          trend={stats.percentage < 75 ? '⚠️ Below 75% threshold' : '✅ Good standing'}
        />
      </div>

      {/* Chart + Recent */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Area chart */}
        <Card className="lg:col-span-2">
          <h2 className="font-semibold mb-4">Attendance This Month</h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -25 }}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,.1)" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis ticks={[0, 1]} tickFormatter={(v) => v ? 'P' : 'A'} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [v ? 'Present' : 'Absent']} />
                <Area type="monotone" dataKey="value" stroke="#6366f1" fill="url(#grad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState icon={CalendarCheck} title="No data yet" description="Your attendance chart will appear here." />
          )}
        </Card>

        {/* Recent records */}
        <Card>
          <h2 className="font-semibold mb-4">Recent Records</h2>
          {records.length === 0 ? (
            <EmptyState icon={CalendarCheck} title="No records" />
          ) : (
            <div className="space-y-2">
              {records.slice(0, 7).map((r) => (
                <div key={r._id} className="flex items-center justify-between py-1.5 border-b border-[rgb(var(--border))] last:border-0">
                  <span className="text-sm">{formatDate(r.date)}</span>
                  <Badge status={r.status} />
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

// ── Admin Dashboard ───────────────────────────────────────────────────────────
function AdminDashboard() {
  const [stats, setStats]    = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([adminAPI.stats(), adminAPI.getAttendance({ month: currentMonth() })])
      .then(([s, a]) => { setStats(s.data); setRecords(a.data.records.slice(0, 10)); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Spinner size={28} className="text-brand-600" /></div>;

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Total Students"   value={stats?.totalUsers ?? 0}            icon={Users}         color="indigo"  />
        <StatCard label="Present Today"    value={stats?.todayPresent ?? 0}           icon={CheckCircle2}  color="emerald" />
        <StatCard label="Month Rate"       value={`${stats?.monthAttendanceRate ?? 0}%`} icon={TrendingUp} color="amber"   />
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Recent Attendance</h2>
          <span className="text-xs text-[rgb(var(--text-muted))]">This month</span>
        </div>
        {records.length === 0 ? (
          <EmptyState icon={CalendarCheck} title="No records" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[rgb(var(--border))]">
                  <th className="text-left pb-2 font-semibold text-[rgb(var(--text-muted))]">Student</th>
                  <th className="text-left pb-2 font-semibold text-[rgb(var(--text-muted))]">Date</th>
                  <th className="text-left pb-2 font-semibold text-[rgb(var(--text-muted))]">Status</th>
                  <th className="text-left pb-2 font-semibold text-[rgb(var(--text-muted))]">Via</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgb(var(--border))]">
                {records.map((r) => (
                  <tr key={r._id} className="hover:bg-[rgb(var(--bg))] transition-colors">
                    <td className="py-2.5">
                      <div>
                        <p className="font-medium">{r.user?.name}</p>
                        <p className="text-xs text-[rgb(var(--text-muted))]">{r.user?.email}</p>
                      </div>
                    </td>
                    <td className="py-2.5 text-[rgb(var(--text-muted))]">{formatDate(r.date)}</td>
                    <td className="py-2.5"><Badge status={r.status} /></td>
                    <td className="py-2.5 text-[rgb(var(--text-muted))] capitalize">{r.markedVia}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

// ── Export ─────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div>
      <div className="mb-6">
        <p className="text-[rgb(var(--text-muted))] text-sm">
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </p>
        <h1 className="page-title">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
          {user?.name?.split(' ')[0]} 👋
        </h1>
      </div>
      {user?.role === 'admin' ? <AdminDashboard /> : <StudentDashboard />}
    </div>
  );
}
