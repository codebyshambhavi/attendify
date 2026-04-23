import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/auth/ProtectedRoute';

// We'll set the mock return per test
let mockAuthState = { user: null, loading: false };

vi.mock('../context/AuthContext', () => ({
  useAuth: () => mockAuthState,
}));

const Protected   = () => <p>Protected Content</p>;
const LoginPage   = () => <p>Login Page</p>;
const Dashboard   = () => <p>Dashboard</p>;

const renderWithRoutes = (initialPath = '/protected') =>
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/login"     element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route
          path="/protected"
          element={
            <ProtectedRoute>
              <Protected />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-only"
          element={
            <ProtectedRoute adminOnly>
              <Protected />
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>
  );

describe('ProtectedRoute', () => {
  it('shows spinner while auth is loading', () => {
    mockAuthState = { user: null, loading: true };
    const { container } = renderWithRoutes();
    expect(container.querySelector('svg')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('redirects to /login when not authenticated', () => {
    mockAuthState = { user: null, loading: false };
    renderWithRoutes();
    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('renders children when authenticated', () => {
    mockAuthState = { user: { role: 'student' }, loading: false };
    renderWithRoutes();
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('redirects student from adminOnly route to /dashboard', () => {
    mockAuthState = { user: { role: 'student' }, loading: false };
    renderWithRoutes('/admin-only');
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('allows admin through adminOnly route', () => {
    mockAuthState = { user: { role: 'admin' }, loading: false };
    renderWithRoutes('/admin-only');
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});
