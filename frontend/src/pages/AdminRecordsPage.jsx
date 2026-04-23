import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarCheck, Download, Search, Edit2, CheckSquare } from 'lucide-react';
import { format, addMonths, subMonths } from 'date-fns';
import toast from 'react-hot-toast';
import { adminAPI } from '../services/api';
import { Card, Badge, Spinner, EmptyState, Modal, Button, Select } from '../components/ui';
import { formatDate, downloadBlob, currentMonth } from '../utils/helpers';

export default function AdminRecordsPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth]     = useState(new Date());
  const [search, setSearch]   = useState('');
  const [editRec, setEditRec] = useState(null);
  const [saving, setSaving]   = useState(false);
  const [exporting, setExporting] = useState(false);

  // Bulk mark state
  const [bulkModal, setBulkModal] = useState(false);
  const [bulkStatus, setBulkStatus] = useState('present');
  const [bulkDate, setBulkDate]     = useState(new Date().toISOString().split('T')[0]);

  const monthStr = format(month, 'yyyy-MM');

  const load = () => {
    setLoading(true);
    adminAPI.getAttendance({ month: monthStr })
      .then(({ data }) => setRecords(data.records))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [monthStr]);

  const filtered = records.filter((r) => {
    const q = search.toLowerCase();
    return !q || r.user?.name?.toLowerCase().includes(q) || r.user?.email?.toLowerCase().includes(q) || r.date?.includes(q);
  });

  const handleUpdate = async () => {
    setSaving(true);
    try {
      await adminAPI.updateAttendance(editRec._id, { status: editRec.status, note: editRec.note });
      toast.success('Record updated');
      setEditRec(null);
      load();
    } catch {
      toast.error('Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const { data } = await adminAPI.exportCSV(monthStr);
      downloadBlob(data, `attendance-${monthStr}.csv`);
      toast.success('CSV downloaded!');
    } catch {
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  const handleBulkMark = async () => {
    // Collect unique user IDs visible in filtered list
    const userIds = [...new Set(records.map((r) => r.user?._id).filter(Boolean))];
    if (!userIds.length) return toast.error('No users found');
    try {
      await adminAPI.bulkMark({ userIds, date: bulkDate, status: bulkStatus });
      toast.success(`Marked ${userIds.length} students as ${bulkStatus}`);
      setBulkModal(false);
      load();
    } catch {
      toast.error('Bulk mark failed');
    }
  };

  return (
    <div className="space-y-5 animate-slide-up">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        {/* Month nav */}
        <div className="flex items-center gap-2 card !p-2">
          <button className="btn-ghost p-1.5" onClick={() => setMonth((m) => subMonths(m, 1))}>‹</button>
          <span className="text-sm font-semibold px-2 whitespace-nowrap">{format(month, 'MMM yyyy')}</span>
          <button
            className="btn-ghost p-1.5 disabled:opacity-30"
            disabled={monthStr >= currentMonth()}
            onClick={() => setMonth((m) => addMonths(m, 1))}
          >›</button>
        </div>

        {/* Search */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[rgb(var(--text-muted))]" />
          <input className="input pl-10" placeholder="Search student…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setBulkModal(true)} size="sm">
            <CheckSquare size={14} /> Bulk Mark
          </Button>
          <Button onClick={handleExport} loading={exporting} size="sm">
            <Download size={14} /> Export CSV
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card className="!p-0 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Spinner size={24} className="text-brand-600" /></div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={CalendarCheck} title="No records" description="No attendance records for this month." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[rgb(var(--bg))]">
                <tr>
                  {['Student', 'Date', 'Subject', 'Status', 'Via', 'Note', 'Edit'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 font-semibold text-[rgb(var(--text-muted))] whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgb(var(--border))]">
                {filtered.map((r, i) => (
                  <motion.tr
                    key={r._id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="hover:bg-[rgb(var(--bg))] transition-colors"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium">{r.user?.name}</p>
                      <p className="text-xs text-[rgb(var(--text-muted))]">{r.user?.studentId || r.user?.email}</p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-[rgb(var(--text-muted))]">{formatDate(r.date)}</td>
                    <td className="px-4 py-3 text-[rgb(var(--text-muted))]">{r.subject || '—'}</td>
                    <td className="px-4 py-3"><Badge status={r.status} /></td>
                    <td className="px-4 py-3 capitalize text-[rgb(var(--text-muted))]">{r.markedVia}</td>
                    <td className="px-4 py-3 text-[rgb(var(--text-muted))] max-w-[140px] truncate">{r.note || '—'}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => setEditRec({ ...r })} className="btn-ghost p-1.5 text-brand-600 dark:text-brand-400">
                        <Edit2 size={14} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Edit record modal */}
      <Modal open={!!editRec} onClose={() => setEditRec(null)} title="Edit Attendance Record">
        {editRec && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-[rgb(var(--bg))] text-sm">
              <span className="text-[rgb(var(--text-muted))]">Student: </span>
              <span className="font-medium">{editRec.user?.name}</span>
              <span className="mx-2 text-[rgb(var(--text-muted))]">·</span>
              <span className="text-[rgb(var(--text-muted))]">{formatDate(editRec.date)}</span>
            </div>
            <Select label="Status" value={editRec.status} onChange={(e) => setEditRec((r) => ({ ...r, status: e.target.value }))}>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
            </Select>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium">Note</label>
              <textarea className="input resize-none" rows={2} value={editRec.note || ''} onChange={(e) => setEditRec((r) => ({ ...r, note: e.target.value }))} />
            </div>
            <div className="flex gap-3 pt-1">
              <Button onClick={handleUpdate} loading={saving} className="flex-1">Save</Button>
              <Button variant="secondary" onClick={() => setEditRec(null)} className="flex-1">Cancel</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Bulk mark modal */}
      <Modal open={bulkModal} onClose={() => setBulkModal(false)} title="Bulk Mark Attendance">
        <div className="space-y-4">
          <p className="text-sm text-[rgb(var(--text-muted))]">
            Mark all <strong>{[...new Set(records.map((r) => r.user?._id))].length}</strong> students in this month's records.
          </p>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">Date</label>
            <input type="date" className="input" value={bulkDate} onChange={(e) => setBulkDate(e.target.value)} />
          </div>
          <Select label="Status" value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value)}>
            <option value="present">Present</option>
            <option value="absent">Absent</option>
            <option value="late">Late</option>
          </Select>
          <div className="flex gap-3 pt-1">
            <Button onClick={handleBulkMark} className="flex-1">Apply</Button>
            <Button variant="secondary" onClick={() => setBulkModal(false)} className="flex-1">Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
