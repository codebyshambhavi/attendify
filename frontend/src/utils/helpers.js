import { format, parseISO } from 'date-fns';

export const formatDate = (dateStr) => format(parseISO(dateStr), 'MMM d, yyyy');
export const formatDateTime = (date) => format(new Date(date), 'MMM d, yyyy · h:mm a');
export const todayISO = () => new Date().toISOString().split('T')[0];
export const currentMonth = () => new Date().toISOString().slice(0, 7);

export const getInitials = (name = '') =>
  name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

export const avatarColor = (name = '') => {
  const colors = [
    'bg-violet-500', 'bg-blue-500', 'bg-emerald-500',
    'bg-amber-500', 'bg-rose-500', 'bg-cyan-500', 'bg-pink-500',
  ];
  let sum = 0;
  for (const c of name) sum += c.charCodeAt(0);
  return colors[sum % colors.length];
};

export const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

// Format percentage with trend indicator
export const pctClass = (pct) => {
  if (pct >= 75) return 'text-emerald-600 dark:text-emerald-400';
  if (pct >= 50) return 'text-amber-600 dark:text-amber-400';
  return 'text-rose-600 dark:text-rose-400';
};
