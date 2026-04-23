import { Menu, Sun, Moon, Bell } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

export default function Navbar({ onMenuClick, title }) {
  const { dark, toggle } = useTheme();
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-[rgb(var(--surface))]/80 backdrop-blur-md border-b border-[rgb(var(--border))] px-4 md:px-6 h-14 flex items-center gap-3">
      {/* Mobile menu toggle */}
      <button onClick={onMenuClick} className="btn-ghost p-2 lg:hidden -ml-2">
        <Menu size={20} />
      </button>

      {/* Page title */}
      <h1 className="font-bold text-base flex-1 truncate">{title}</h1>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <button className="btn-ghost p-2 relative">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-brand-500 rounded-full" />
        </button>

        <button onClick={toggle} className="btn-ghost p-2" title="Toggle theme">
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
}
