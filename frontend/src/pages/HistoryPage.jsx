import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { History, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { format, addMonths, subMonths, parseISO } from 'date-fns';
import { attendanceAPI } from '../services/api';
import { Card, Badge, Spinner, EmptyState } from '../components/ui';
import { formatDate, pctClass } from '../utils/helpers';

export default function HistoryPage() {
  const [month, setMonth]     = useState(new Date());
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');

  const monthStr = format(month, 'yyyy-MM');

  useEffect(() => {
    setLoading(true);
    attendanceAPI.my(monthStr)
      .then(({ data }) => setData(data))
      .finally(() => setLoading(false));
  }, [monthStr]);

  const records = (data?.records || []).filter((r) =>
    r.subject?.toLowerCase().includes(search.toLowerCase()) ||
    r.status?.toLowerCase().includes(search.toLowerCase()) ||
    r.date?.includes(search)
  );

  const { stats } = data || {};

  return (
    <div className="space-y-5 animate-slide-up">
      {/* Month navigator */}
      <Card className="flex items-center justify-between">
        <button
          onClick={() => setMonth((m) => subMonths(m, 1))}
          className="btn-ghost p-2"
        >
          <ChevronLeft size={18} />
        </button>
        <h2 className="font-bold text-lg">{format(month, 'MMMM yyyy')}</h2>
        <button
          onClick={() => setMonth((m) => addMonths(m, 1))}
          disabled={format(month, 'yyyy-MM') >= format(new Date(), 'yyyy-MM')}
          className="btn-ghost p-2 disabled:opacity-30"
        >
          <ChevronRight size={18} />
        </button>
      </Card>

      {/* Stats row */}
      {stats && (
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Total',   val: stats.total,                  cls: '' },
            { label: 'Present', val: stats.present,                cls: 'text-emerald-600 dark:text-emerald-400' },
            { label: 'Absent',  val: stats.absent,                 cls: 'text-rose-600 dark:text-rose-400' },
            { label: '%',       val: `${stats.percentage}%`,       cls: pctClass(stats.percentage) },
          ].map(({ label, val, cls }) => (
            <Card key={label} className="text-center !p-3">
              <p className={`text-2xl font-extrabold ${cls}`}>{val}</p>
              <p className="section-label mt-0.5">{label}</p>
            </Card>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[rgb(var(--text-muted))]" />
        <input
          className="input pl-10"
          placeholder="Filter by date, subject, or status…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <Card className="!p-0 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner size={24} className="text-brand-600" />
          </div>
        ) : records.length === 0 ? (
          <EmptyState
            icon={History}
            title="No records found"
            description="No attendance records for this month or filter."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[rgb(var(--bg))]">
                <tr>
                  {['Date', 'Subject', 'Status', 'Marked Via', 'Note'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 font-semibold text-[rgb(var(--text-muted))]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgb(var(--border))]">
                {records.map((r, i) => (
                  <motion.tr
                    key={r._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-[rgb(var(--bg))] transition-colors"
                  >
                    <td className="px-4 py-3 font-medium">{formatDate(r.date)}</td>
                    <td className="px-4 py-3 text-[rgb(var(--text-muted))]">{r.subject || '—'}</td>
                    <td className="px-4 py-3"><Badge status={r.status} /></td>
                    <td className="px-4 py-3 capitalize text-[rgb(var(--text-muted))]">{r.markedVia}</td>
                    <td className="px-4 py-3 text-[rgb(var(--text-muted))]">{r.note || '—'}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
