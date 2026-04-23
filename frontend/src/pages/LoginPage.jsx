import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, CalendarCheck, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Button, Input } from '../components/ui';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left — decorative */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-brand-600 p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-500 to-brand-900 opacity-90" />
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/5 rounded-full" />
        <div className="absolute bottom-20 -left-10 w-56 h-56 bg-white/5 rounded-full" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 text-white">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <CalendarCheck size={18} className="text-white" />
            </div>
            <span className="font-extrabold text-xl">Attendify</span>
          </div>
        </div>

        <div className="relative z-10 text-white">
          <h2 className="text-4xl font-extrabold leading-tight mb-4">
            Smart attendance<br />for modern teams.
          </h2>
          <p className="text-white/70 text-base leading-relaxed">
            Track, analyze, and export attendance data with ease. QR-based check-ins, real-time dashboards, and admin insights — all in one place.
          </p>
        </div>

        <div className="relative z-10 flex gap-4 text-white/60 text-sm">
          <span>© 2024 Attendify</span>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-[rgb(var(--bg))]">
        <motion.div
          className="w-full max-w-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <CalendarCheck size={16} className="text-white" />
            </div>
            <span className="font-extrabold text-lg">Attendify</span>
          </div>

          <h1 className="text-2xl font-extrabold mb-1">Welcome back</h1>
          <p className="text-[rgb(var(--text-muted))] text-sm mb-8">Sign in to continue to your dashboard</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              icon={Mail}
              value={form.email}
              onChange={set('email')}
              required
              autoComplete="email"
            />

            <div className="space-y-1.5">
              <label className="block text-sm font-medium">Password</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[rgb(var(--text-muted))]">
                  <Lock size={16} />
                </div>
                <input
                  className="input pl-10 pr-10"
                  type={showPwd ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={set('password')}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))]"
                  onClick={() => setShowPwd((s) => !s)}
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Button type="submit" loading={loading} className="w-full mt-2">
              Sign In
            </Button>
          </form>

          {/* Demo credentials hint */}
          <div className="mt-5 p-3.5 rounded-xl bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 text-xs text-brand-700 dark:text-brand-300 space-y-0.5">
            <p className="font-semibold">Demo credentials</p>
            <p>Admin: admin@attendify.com / Admin@123</p>
            <p>Student: alice@attendify.com / Student@123</p>
          </div>

          <p className="text-center text-sm text-[rgb(var(--text-muted))] mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-brand-600 dark:text-brand-400 font-semibold hover:underline">
              Sign up
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
