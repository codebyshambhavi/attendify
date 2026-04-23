import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarCheck, CheckCircle2, Clock, XCircle, BookOpen, StickyNote } from 'lucide-react';
import toast from 'react-hot-toast';
import { attendanceAPI } from '../services/api';
import { Button, Card, Badge, Select, Input, Spinner } from '../components/ui';
import { formatDate, todayISO } from '../utils/helpers';

const SUBJECTS = ['General', 'Mathematics', 'Physics', 'Chemistry', 'Computer Science', 'English', 'History'];

export default function AttendancePage() {
  const [todayRecord, setTodayRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [status, setStatus]   = useState('present');
  const [subject, setSubject] = useState('General');
  const [note, setNote]       = useState('');

  const today = todayISO();

  useEffect(() => {
    attendanceAPI.today()
      .then(({ data }) => setTodayRecord(data.record))
      .finally(() => setLoading(false));
  }, []);

  const handleMark = async () => {
    setMarking(true);
    try {
      const { data } = await attendanceAPI.mark({ date: today, status, subject, note });
      setTodayRecord(data.record);
      toast.success(`Attendance marked as ${status}!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to mark attendance');
    } finally {
      setMarking(false);
    }
  };

  const statusOptions = [
    { value: 'present', label: 'Present',  icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' },
    { value: 'late',    label: 'Late',     icon: Clock,        color: 'text-amber-600 dark:text-amber-400',   bg: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' },
    { value: 'absent',  label: 'Absent',   icon: XCircle,      color: 'text-rose-600 dark:text-rose-400',     bg: 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800' },
  ];

  if (loading) return <div className="flex justify-center py-20"><Spinner size={28} className="text-brand-600" /></div>;

  return (
    <div className="max-w-lg mx-auto space-y-5 animate-slide-up">
      {/* Date card */}
      <Card>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center">
            <CalendarCheck size={22} className="text-brand-600 dark:text-brand-400" />
          </div>
          <div>
            <p className="section-label">Today's Date</p>
            <p className="font-bold text-lg">{formatDate(today)}</p>
          </div>
          {todayRecord && (
            <div className="ml-auto">
              <Badge status={todayRecord.status} />
            </div>
          )}
        </div>
      </Card>

      {/* Already marked */}
      {todayRecord ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="font-bold text-xl mb-1">Attendance Recorded</h2>
            <p className="text-[rgb(var(--text-muted))] text-sm mb-4">
              You've already marked attendance for today.
            </p>
            <div className="flex justify-center gap-3 flex-wrap">
              <div className="text-sm">
                <span className="text-[rgb(var(--text-muted))]">Status: </span>
                <Badge status={todayRecord.status} />
              </div>
              <div className="text-sm">
                <span className="text-[rgb(var(--text-muted))]">Subject: </span>
                <span className="font-medium">{todayRecord.subject}</span>
              </div>
            </div>
          </Card>
        </motion.div>
      ) : (
        /* Mark form */
        <Card>
          <h2 className="font-semibold mb-5">Mark Your Attendance</h2>

          {/* Status picker */}
          <div className="mb-5">
            <p className="section-label mb-3">Status</p>
            <div className="grid grid-cols-3 gap-3">
              {statusOptions.map(({ value, label, icon: Icon, color, bg }) => (
                <button
                  key={value}
                  onClick={() => setStatus(value)}
                  className={`flex flex-col items-center gap-2 p-3.5 rounded-xl border-2 transition-all duration-200
                    ${status === value ? `${bg} border-current` : 'border-[rgb(var(--border))] hover:border-[rgb(var(--text-muted))]'}`}
                >
                  <Icon size={20} className={status === value ? color : 'text-[rgb(var(--text-muted))]'} />
                  <span className={`text-xs font-semibold ${status === value ? color : 'text-[rgb(var(--text-muted))]'}`}>
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Subject */}
          <Select
            label="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="mb-4"
          >
            {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>

          {/* Note */}
          <div className="mb-6 space-y-1.5">
            <label className="block text-sm font-medium">Note (optional)</label>
            <textarea
              className="input resize-none"
              rows={2}
              placeholder="Any note about today's attendance..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <Button onClick={handleMark} loading={marking} className="w-full">
            <CalendarCheck size={16} />
            Mark Attendance
          </Button>
        </Card>
      )}

      {/* Info */}
      <div className="text-xs text-[rgb(var(--text-muted))] text-center">
        💡 Attendance can also be marked via QR code scan from your admin.
      </div>
    </div>
  );
}
