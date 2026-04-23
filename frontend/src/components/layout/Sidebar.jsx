import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, CalendarCheck, History, Users,
  QrCode, Settings, LogOut, X, ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../ui';

const navStudent = [
  { to: '/dashboard',   icon: LayoutDashboard, label: 'Dashboard'  },
  { to: '/attendance',  icon: CalendarCheck,   label: 'Mark Attendance' },
  { to: '/history',     icon: History,         label: 'History'    },
];

const navAdmin = [
  { to: '/dashboard',      icon: LayoutDashboard, label: 'Dashboard'    },
  { to: '/admin/users',    icon: Users,           label: 'Manage Users' },
  { to: '/admin/records',  icon: CalendarCheck,   label: 'Attendance'   },
  { to: '/admin/qr',       icon: QrCode,          label: 'QR Codes'     },
];

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';
  const links = isAdmin ? navAdmin : navStudent;

  const handleLogout = () => { logout(); navigate('/login'); };

  const content = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-[rgb(var(--border))]">
        <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center shadow-glow">
          <CalendarCheck size={16} className="text-white" />
        </div>
        <span className="font-extrabold text-lg tracking-tight">Attendify</span>
        {isAdmin && (
          <span className="ml-auto flex items-center gap-1 text-[10px] font-bold text-brand-600 dark:text-brand-400 bg-brand-100 dark:bg-brand-900/40 px-2 py-0.5 rounded-full">
            <ShieldCheck size={10} /> Admin
          </span>
        )}
      </div>

      {/* Nav Links */}
      <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to} to={to}
            onClick={() => onClose?.()}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
               ${isActive
                 ? 'bg-brand-600 text-white shadow-glow'
                 : 'text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))] hover:bg-[rgb(var(--border))]'}`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="border-t border-[rgb(var(--border))] p-3 space-y-0.5">
        <NavLink
          to="/settings"
          onClick={() => onClose?.()}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
             ${isActive ? 'bg-brand-600 text-white' : 'text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))] hover:bg-[rgb(var(--border))]'}`
          }
        >
          <Settings size={17} /> Settings
        </NavLink>

        <div className="flex items-center gap-3 px-3 py-2.5 mt-1">
          <Avatar name={user?.name} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{user?.name}</p>
            <p className="text-xs text-[rgb(var(--text-muted))] truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="btn-ghost p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20"
            title="Log out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 flex-shrink-0 h-screen sticky top-0 border-r border-[rgb(var(--border))] bg-[rgb(var(--surface))]">
        {content}
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={onClose}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 w-64 bg-[rgb(var(--surface))] border-r border-[rgb(var(--border))] flex flex-col lg:hidden"
              initial={{ x: -256 }} animate={{ x: 0 }} exit={{ x: -256 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <button onClick={onClose} className="absolute top-4 right-4 btn-ghost p-1.5">
                <X size={18} />
              </button>
              {content}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
