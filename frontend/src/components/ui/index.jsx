import { motion } from 'framer-motion';
import { getInitials, avatarColor } from '../../utils/helpers';

// ── Button ───────────────────────────────────────────────────────────────────
export function Button({ variant = 'primary', size = 'md', loading, children, className = '', ...props }) {
  const base = 'btn-' + variant;
  const sizes = { sm: 'text-xs px-3 py-1.5', md: '', lg: 'text-base px-6 py-3' };
  return (
    <button className={`${base} ${sizes[size]} ${className}`} disabled={loading || props.disabled} {...props}>
      {loading && <Spinner size={14} />}
      {children}
    </button>
  );
}

// ── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, className = '', hover = false, ...props }) {
  return (
    <motion.div
      className={`card p-5 ${hover ? 'hover:shadow-card-md transition-shadow cursor-pointer' : ''} ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// ── Badge ─────────────────────────────────────────────────────────────────────
export function Badge({ status }) {
  const cls = {
    present: 'badge-present',
    absent:  'badge-absent',
    late:    'badge-late',
    admin:   'badge-admin',
    student: 'badge-student',
  };
  return (
    <span className={cls[status] || 'badge bg-slate-100 text-slate-600'}>
      <span className={`w-1.5 h-1.5 rounded-full inline-block ${
        status === 'present' ? 'bg-emerald-500' :
        status === 'absent'  ? 'bg-rose-500'    :
        status === 'late'    ? 'bg-amber-500'   : 'bg-slate-400'
      }`} />
      {status}
    </span>
  );
}

// ── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner({ size = 20, className = '' }) {
  return (
    <svg
      className={`animate-spin text-current ${className}`}
      width={size} height={size}
      viewBox="0 0 24 24" fill="none"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z" />
    </svg>
  );
}

// ── Avatar ────────────────────────────────────────────────────────────────────
export function Avatar({ name, size = 'md' }) {
  const sz = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-12 h-12 text-base' };
  return (
    <div className={`${sz[size]} ${avatarColor(name)} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}>
      {getInitials(name)}
    </div>
  );
}

// ── Input ─────────────────────────────────────────────────────────────────────
export function Input({ label, error, icon: Icon, className = '', ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-[rgb(var(--text))]">{label}</label>}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[rgb(var(--text-muted))]">
            <Icon size={16} />
          </div>
        )}
        <input className={`input ${Icon ? 'pl-10' : ''} ${error ? 'border-rose-400 focus:ring-rose-400/30 focus:border-rose-400' : ''} ${className}`} {...props} />
      </div>
      {error && <p className="text-xs text-rose-500">{error}</p>}
    </div>
  );
}

// ── Select ────────────────────────────────────────────────────────────────────
export function Select({ label, children, className = '', ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-[rgb(var(--text))]">{label}</label>}
      <select className={`input ${className}`} {...props}>
        {children}
      </select>
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, maxWidth = 'max-w-md' }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        onClick={onClose}
      />
      <motion.div
        className={`card relative z-10 w-full ${maxWidth} p-6`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {title && <h2 className="text-lg font-bold mb-4">{title}</h2>}
        {children}
      </motion.div>
    </div>
  );
}

// ── Empty State ───────────────────────────────────────────────────────────────
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-[rgb(var(--border))] flex items-center justify-center mb-4">
          <Icon size={24} className="text-[rgb(var(--text-muted))]" />
        </div>
      )}
      <p className="font-semibold text-[rgb(var(--text))]">{title}</p>
      {description && <p className="text-sm text-[rgb(var(--text-muted))] mt-1 max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ── Stats Card ────────────────────────────────────────────────────────────────
export function StatCard({ label, value, icon: Icon, color, trend }) {
  const colors = {
    indigo:  { bg: 'bg-brand-100 dark:bg-brand-900/30',   icon: 'text-brand-600 dark:text-brand-400'  },
    emerald: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', icon: 'text-emerald-600 dark:text-emerald-400' },
    rose:    { bg: 'bg-rose-100 dark:bg-rose-900/30',     icon: 'text-rose-600 dark:text-rose-400'    },
    amber:   { bg: 'bg-amber-100 dark:bg-amber-900/30',   icon: 'text-amber-600 dark:text-amber-400'  },
  };
  const c = colors[color] || colors.indigo;
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="section-label mb-1">{label}</p>
          <p className="text-3xl font-bold">{value}</p>
          {trend !== undefined && (
            <p className="text-xs text-[rgb(var(--text-muted))] mt-1">{trend}</p>
          )}
        </div>
        <div className={`w-11 h-11 rounded-xl ${c.bg} flex items-center justify-center`}>
          <Icon size={20} className={c.icon} />
        </div>
      </div>
    </Card>
  );
}
