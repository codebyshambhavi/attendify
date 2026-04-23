import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { QrCode, Clock, RefreshCw, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { qrAPI } from '../services/api';
import { Card, Button, Select, Spinner, Badge } from '../components/ui';
import { formatDateTime } from '../utils/helpers';

const SUBJECTS = ['General', 'Mathematics', 'Physics', 'Chemistry', 'Computer Science', 'English', 'History'];

export default function AdminQRPage() {
  const [qrData, setQrData]   = useState(null);   // { qrImage, session, scanUrl }
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState('General');
  const [expires, setExpires] = useState(15);
  const [sessLoading, setSessLoading] = useState(true);

  const loadSessions = () => {
    setSessLoading(true);
    qrAPI.sessions()
      .then(({ data }) => setSessions(data.sessions))
      .finally(() => setSessLoading(false));
  };

  useEffect(() => { loadSessions(); }, []);

  const generate = async () => {
    setLoading(true);
    try {
      const { data } = await qrAPI.generate({ subject, expiresInMinutes: expires });
      setQrData(data);
      toast.success('QR code generated!');
      loadSessions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate QR');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Generator */}
        <Card>
          <h2 className="font-semibold mb-5 flex items-center gap-2">
            <QrCode size={18} className="text-brand-500" /> Generate QR Code
          </h2>

          <div className="space-y-4 mb-6">
            <Select
              label="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            >
              {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium">Expires in</label>
              <div className="flex gap-2">
                {[5, 10, 15, 30, 60].map((m) => (
                  <button
                    key={m}
                    onClick={() => setExpires(m)}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all
                      ${expires === m
                        ? 'bg-brand-600 text-white border-brand-600'
                        : 'border-[rgb(var(--border))] text-[rgb(var(--text-muted))] hover:border-brand-400'}`}
                  >
                    {m}m
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Button onClick={generate} loading={loading} className="w-full">
            <QrCode size={16} /> Generate QR
          </Button>

          {/* QR Image display */}
          {qrData && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-6 text-center"
            >
              <div className="inline-block p-4 rounded-2xl bg-white border-4 border-brand-600 shadow-glow">
                <img src={qrData.qrImage} alt="QR Code" className="w-52 h-52" />
              </div>
              <div className="mt-4 space-y-1 text-sm">
                <p className="font-semibold text-brand-600 dark:text-brand-400">{qrData.session.subject}</p>
                <p className="text-[rgb(var(--text-muted))] flex items-center justify-center gap-1">
                  <Clock size={13} />
                  Expires: {formatDateTime(qrData.session.expiresAt)}
                </p>
              </div>
              <div className="mt-3 p-2.5 rounded-lg bg-[rgb(var(--bg))] text-xs text-[rgb(var(--text-muted))] font-mono break-all">
                {qrData.scanUrl}
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="mt-3"
                onClick={() => {
                  navigator.clipboard.writeText(qrData.scanUrl);
                  toast.success('Link copied!');
                }}
              >
                Copy Scan Link
              </Button>
            </motion.div>
          )}
        </Card>

        {/* Recent sessions */}
        <Card>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold flex items-center gap-2">
              <Clock size={18} className="text-brand-500" /> Recent Sessions
            </h2>
            <button onClick={loadSessions} className="btn-ghost p-1.5" title="Refresh">
              <RefreshCw size={15} />
            </button>
          </div>

          {sessLoading ? (
            <div className="flex justify-center py-10"><Spinner size={22} className="text-brand-600" /></div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-10 text-sm text-[rgb(var(--text-muted))]">No sessions yet</div>
          ) : (
            <div className="space-y-3">
              {sessions.map((s) => {
                const expired = new Date() > new Date(s.expiresAt);
                return (
                  <motion.div
                    key={s._id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-3.5 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))]"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">{s.subject}</p>
                        <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">{s.date}</p>
                      </div>
                      <span className={`badge flex-shrink-0 ${expired ? 'badge-absent' : 'badge-present'}`}>
                        {expired ? 'Expired' : 'Active'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-xs text-[rgb(var(--text-muted))]">
                      <span className="flex items-center gap-1">
                        <Users size={12} />
                        {s.scannedBy?.length || 0} scanned
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {formatDateTime(s.expiresAt)}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Instructions */}
      <Card className="bg-brand-50 dark:bg-brand-900/20 border-brand-200 dark:border-brand-800">
        <h3 className="font-semibold text-brand-700 dark:text-brand-300 mb-2">How QR Attendance Works</h3>
        <ol className="text-sm text-brand-600 dark:text-brand-400 space-y-1.5 list-decimal list-inside">
          <li>Generate a QR code for a subject and time window above.</li>
          <li>Display the QR code on a projector or share the scan link.</li>
          <li>Students scan the code with their phone camera or open the link.</li>
          <li>Attendance is automatically recorded as "present" for each student.</li>
          <li>QR codes expire after the set duration — preventing late fraud.</li>
        </ol>
      </Card>
    </div>
  );
}
