import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const TITLES = {
  '/dashboard':     'Dashboard',
  '/attendance':    'Mark Attendance',
  '/history':       'Attendance History',
  '/settings':      'Settings',
  '/admin':         'Students',
  '/admin/users':   'Manage Users',
  '/admin/records': 'Attendance Records',
  '/admin/qr':      'QR Code Generator',
};

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();
  const title = TITLES[pathname] || 'Attendify';

  return (
    <div className="flex min-h-screen bg-[rgb(var(--bg))]">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onMenuClick={() => setSidebarOpen(true)} title={title} />

        <main className="flex-1 p-4 md:p-6 overflow-y-auto animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
