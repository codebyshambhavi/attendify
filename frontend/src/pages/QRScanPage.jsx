import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, QrCode, CalendarCheck } from 'lucide-react';
import { qrAPI } from '../services/api';
import { Spinner } from '../components/ui';
import { useAuth } from '../context/AuthContext';

export default function QRScanPage() {
  const { token } = useParams();
  const { user, loading: authLoading } = useAuth();
  const [state, setState] = useState('loading'); // loading | success | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setState('error');
      setMessage('Please log in first, then re-scan the QR code.');
      return;
    }

    qrAPI.scan(token)
      .then(({ data }) => {
        setState('success');
        setMessage(data.message || 'Attendance marked!');
      })
      .catch((err) => {
        setState('error');
        setMessage(err.response?.data?.message || 'Invalid or expired QR code.');
      });
  }, [token, user, authLoading]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[rgb(var(--bg))]">
      <motion.div
        className="w-full max-w-sm text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-10">
          <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center shadow-glow">
            <CalendarCheck size={18} className="text-white" />
          </div>
          <span className="font-extrabold text-xl">Attendify</span>
        </div>

        {state === 'loading' && (
          <div className="space-y-4">
            <Spinner size={40} className="text-brand-600 mx-auto" />
            <p className="text-[rgb(var(--text-muted))]">Processing your QR scan…</p>
          </div>
        )}

        {state === 'success' && (
          <motion.div
            initial={{ scale: 0.8 }} animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="space-y-4"
          >
            <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto">
              <CheckCircle2 size={40} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <h1 className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
              Attendance Marked!
            </h1>
            <p className="text-[rgb(var(--text-muted))]">{message}</p>
            <p className="text-sm font-medium">Hey {user?.name?.split(' ')[0]}, you're good to go ✅</p>
            <Link to="/dashboard" className="btn-primary inline-flex mt-2">
              Go to Dashboard
            </Link>
          </motion.div>
        )}

        {state === 'error' && (
          <motion.div
            initial={{ scale: 0.8 }} animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="space-y-4"
          >
            <div className="w-20 h-20 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center mx-auto">
              <XCircle size={40} className="text-rose-600 dark:text-rose-400" />
            </div>
            <h1 className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">Scan Failed</h1>
            <p className="text-[rgb(var(--text-muted))]">{message}</p>
            <div className="flex flex-col gap-2 mt-2">
              {!user && (
                <Link to="/login" className="btn-primary inline-flex justify-center">Log In</Link>
              )}
              <Link to="/dashboard" className="btn-secondary inline-flex justify-center">Dashboard</Link>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
