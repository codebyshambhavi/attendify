import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, Sun, Moon, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Card, Button, Input, Avatar } from '../components/ui';

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const { dark, toggle } = useTheme();
  const isFaculty = user?.role === 'faculty' || user?.role === 'admin';

  const [profile, setProfile] = useState({ name: user?.name || '', studentId: user?.studentId || '', department: user?.department || '' });
  const [pwd, setPwd]         = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPwd, setSavingPwd]         = useState(false);

  const setP = (k) => (e) => setProfile((p) => ({ ...p, [k]: e.target.value }));
  const setPw = (k) => (e) => setPwd((p) => ({ ...p, [k]: e.target.value }));

  const saveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await authAPI.updateProfile(profile);
      await refreshUser();
      toast.success('Profile updated!');
    } catch {
      toast.error('Update failed');
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    if (pwd.newPassword !== pwd.confirm) return toast.error('Passwords do not match');
    if (pwd.newPassword.length < 6) return toast.error('Min. 6 characters');
    setSavingPwd(true);
    try {
      await authAPI.changePassword({ currentPassword: pwd.currentPassword, newPassword: pwd.newPassword });
      toast.success('Password changed!');
      setPwd({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setSavingPwd(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-slide-up">
      {/* Profile */}
      <Card>
        <div className="flex items-center gap-4 mb-6">
          <Avatar name={user?.name} size="lg" />
          <div>
            <p className="font-bold text-lg">{user?.name}</p>
            <p className="text-sm text-[rgb(var(--text-muted))]">{user?.email}</p>
            <span className={`badge mt-1 ${isFaculty ? 'badge-admin' : 'badge-student'}`}>
              {user?.role}
            </span>
          </div>
        </div>

        <form onSubmit={saveProfile} className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2"><User size={16} /> Profile Info</h3>
          <Input label="Full Name" value={profile.name} onChange={setP('name')} required />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Student ID" value={profile.studentId} onChange={setP('studentId')} />
            <Input label="Department" value={profile.department} onChange={setP('department')} />
          </div>
          <Button type="submit" loading={savingProfile} size="sm">
            <Save size={14} /> Save Profile
          </Button>
        </form>
      </Card>

      {/* Password */}
      <Card>
        <form onSubmit={savePassword} className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2"><Lock size={16} /> Change Password</h3>
          <Input label="Current Password" type="password" value={pwd.currentPassword} onChange={setPw('currentPassword')} required />
          <Input label="New Password" type="password" placeholder="Min. 6 characters" value={pwd.newPassword} onChange={setPw('newPassword')} required />
          <Input label="Confirm New Password" type="password" value={pwd.confirm} onChange={setPw('confirm')} required />
          <Button type="submit" loading={savingPwd} size="sm">
            <Save size={14} /> Update Password
          </Button>
        </form>
      </Card>

      {/* Appearance */}
      <Card>
        <h3 className="font-semibold flex items-center gap-2 mb-4">
          {dark ? <Moon size={16} /> : <Sun size={16} />} Appearance
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Dark Mode</p>
            <p className="text-xs text-[rgb(var(--text-muted))]">Switch between light and dark theme</p>
          </div>
          <button
            onClick={toggle}
            className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${dark ? 'bg-brand-600' : 'bg-slate-200 dark:bg-slate-700'}`}
          >
            <motion.span
              className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow"
              animate={{ x: dark ? 24 : 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          </button>
        </div>
      </Card>
    </div>
  );
}
