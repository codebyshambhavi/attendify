import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Trash2, Edit2, UserPlus, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminAPI } from '../services/api';
import { Card, Badge, Avatar, Spinner, EmptyState, Modal, Button, Input, Select } from '../components/ui';
import { formatDate } from '../utils/helpers';

export default function AdminUsersPage() {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [roleFilter, setRole] = useState('');
  const [editUser, setEditUser] = useState(null);
  const [saving, setSaving]   = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const load = () => {
    setLoading(true);
    adminAPI.getUsers({ search, role: roleFilter })
      .then(({ data }) => setUsers(data.users))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search, roleFilter]);

  const handleUpdate = async () => {
    setSaving(true);
    try {
      await adminAPI.updateUser(editUser._id, {
        name: editUser.name,
        role: editUser.role,
        studentId: editUser.studentId,
        department: editUser.department,
        isActive: editUser.isActive,
      });
      toast.success('User updated');
      setEditUser(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await adminAPI.deleteUser(deleteId);
      toast.success('User deleted');
      setDeleteId(null);
      load();
    } catch {
      toast.error('Delete failed');
    }
  };

  const toggleActive = async (user) => {
    try {
      await adminAPI.updateUser(user._id, { isActive: !user.isActive });
      toast.success(`User ${user.isActive ? 'deactivated' : 'activated'}`);
      load();
    } catch {
      toast.error('Failed');
    }
  };

  return (
    <div className="space-y-5 animate-slide-up">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[rgb(var(--text-muted))]" />
          <input
            className="input pl-10"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input w-40"
          value={roleFilter}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="">All roles</option>
          <option value="student">Student</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {/* Table */}
      <Card className="!p-0 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Spinner size={24} className="text-brand-600" /></div>
        ) : users.length === 0 ? (
          <EmptyState icon={Users} title="No users found" description="Try adjusting your search or filters." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[rgb(var(--bg))]">
                <tr>
                  {['User', 'Student ID', 'Department', 'Role', 'Status', 'Joined', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 font-semibold text-[rgb(var(--text-muted))] whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgb(var(--border))]">
                {users.map((u, i) => (
                  <motion.tr
                    key={u._id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-[rgb(var(--bg))] transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={u.name} size="sm" />
                        <div>
                          <p className="font-medium">{u.name}</p>
                          <p className="text-xs text-[rgb(var(--text-muted))]">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[rgb(var(--text-muted))]">{u.studentId || '—'}</td>
                    <td className="px-4 py-3 text-[rgb(var(--text-muted))]">{u.department || '—'}</td>
                    <td className="px-4 py-3"><Badge status={u.role} /></td>
                    <td className="px-4 py-3">
                      <span className={`badge ${u.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[rgb(var(--text-muted))] whitespace-nowrap">{formatDate(u.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditUser({ ...u })}
                          className="btn-ghost p-1.5 text-brand-600 dark:text-brand-400"
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => toggleActive(u)}
                          className={`btn-ghost p-1.5 ${u.isActive ? 'text-amber-600' : 'text-emerald-600'}`}
                          title={u.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {u.isActive ? <X size={14} /> : <Check size={14} />}
                        </button>
                        <button
                          onClick={() => setDeleteId(u._id)}
                          className="btn-ghost p-1.5 text-rose-500"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Edit Modal */}
      <Modal open={!!editUser} onClose={() => setEditUser(null)} title="Edit User">
        {editUser && (
          <div className="space-y-4">
            <Input label="Name" value={editUser.name} onChange={(e) => setEditUser((u) => ({ ...u, name: e.target.value }))} />
            <Input label="Student ID" value={editUser.studentId || ''} onChange={(e) => setEditUser((u) => ({ ...u, studentId: e.target.value }))} />
            <Input label="Department" value={editUser.department || ''} onChange={(e) => setEditUser((u) => ({ ...u, department: e.target.value }))} />
            <Select label="Role" value={editUser.role} onChange={(e) => setEditUser((u) => ({ ...u, role: e.target.value }))}>
              <option value="student">Student</option>
              <option value="admin">Admin</option>
            </Select>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="isActive" checked={editUser.isActive} onChange={(e) => setEditUser((u) => ({ ...u, isActive: e.target.checked }))} className="w-4 h-4 accent-brand-600" />
              <label htmlFor="isActive" className="text-sm font-medium">Active account</label>
            </div>
            <div className="flex gap-3 pt-2">
              <Button onClick={handleUpdate} loading={saving} className="flex-1">Save Changes</Button>
              <Button variant="secondary" onClick={() => setEditUser(null)} className="flex-1">Cancel</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete User">
        <p className="text-[rgb(var(--text-muted))] text-sm mb-5">
          This will permanently delete the user and all their attendance records. This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={handleDelete} className="btn-primary flex-1 bg-rose-600 hover:bg-rose-700">Delete</button>
          <Button variant="secondary" onClick={() => setDeleteId(null)} className="flex-1">Cancel</Button>
        </div>
      </Modal>
    </div>
  );
}
