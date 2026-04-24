import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Layout
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Pages
import LoginPage       from './pages/LoginPage';
import SignupPage      from './pages/SignupPage';
import DashboardPage   from './pages/DashboardPage';
import AttendancePage  from './pages/AttendancePage';
import HistoryPage     from './pages/HistoryPage';
import SettingsPage    from './pages/SettingsPage';
import AdminPage       from './pages/AdminPage';
import AdminUsersPage  from './pages/AdminUsersPage';
import AdminRecordsPage from './pages/AdminRecordsPage';
import AdminQRPage     from './pages/AdminQRPage';
import QRScanPage      from './pages/QRScanPage';
import NotFoundPage    from './pages/NotFoundPage';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'rgb(var(--surface))',
                color: 'rgb(var(--text))',
                border: '1px solid rgb(var(--border))',
                borderRadius: '12px',
                fontSize: '14px',
              },
              success: { iconTheme: { primary: '#10b981', secondary: 'white' } },
              error:   { iconTheme: { primary: '#f43f5e', secondary: 'white' } },
            }}
          />

          <Routes>
            {/* Public */}
            <Route path="/login"  element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/scan/:token" element={<QRScanPage />} />

            {/* Protected — all inside AppLayout */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard"  element={<DashboardPage />} />
              <Route path="/attendance" element={<AttendancePage />} />
              <Route path="/history"    element={<HistoryPage />} />
              <Route path="/settings"   element={<SettingsPage />} />

              {/* Admin-only */}
              <Route path="/admin"         element={<ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>} />
              <Route path="/admin/users"   element={<ProtectedRoute adminOnly><AdminUsersPage /></ProtectedRoute>} />
              <Route path="/admin/records" element={<ProtectedRoute adminOnly><AdminRecordsPage /></ProtectedRoute>} />
              <Route path="/admin/qr"      element={<ProtectedRoute adminOnly><AdminQRPage /></ProtectedRoute>} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
