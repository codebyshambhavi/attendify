import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Hash, BookOpen, CalendarCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { Button, Input } from '../ui';

export default function SignupPage() {
  const [form, setForm]   = useState({ name: '', email: '', password: '', studentId: '', department: '' });
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await signup(form);
      toast.success('Account created! Welcome aboard 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[rgb(var(--bg))]">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
            <CalendarCheck size={16} className="text-white" />
          </div>
          <span className="font-extrabold text-lg">Attendify</span>
        </div>

        <h1 className="text-2xl font-extrabold mb-1">Create your account</h1>
        <p className="text-[rgb(var(--text-muted))] text-sm mb-8">Join Attendify and track your attendance</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Full Name" type="text" placeholder="Alice Johnson" icon={User} value={form.name} onChange={set('name')} required />
          <Input label="Email" type="email" placeholder="you@example.com" icon={Mail} value={form.email} onChange={set('email')} required />
          <Input label="Password" type="password" placeholder="Min. 6 characters" icon={Lock} value={form.password} onChange={set('password')} required />

          <div className="grid grid-cols-2 gap-3">
            <Input label="Student ID" type="text" placeholder="CS001" icon={Hash} value={form.studentId} onChange={set('studentId')} />
            <Input label="Department" type="text" placeholder="Computer Sci." icon={BookOpen} value={form.department} onChange={set('department')} />
          </div>

          <Button type="submit" loading={loading} className="w-full mt-2">
            Create Account
          </Button>
        </form>

        <p className="text-center text-sm text-[rgb(var(--text-muted))] mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-600 dark:text-brand-400 font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
