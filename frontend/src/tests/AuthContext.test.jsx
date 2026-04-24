import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

vi.mock('../services/api', () => ({
  authAPI: {
    me: vi.fn(),
    login: vi.fn(),
    signup: vi.fn(),
  },
}));

const AuthDisplay = () => {
  const { user, loading } = useAuth();
  if (loading) return <p>loading</p>;
  return <p>{user ? `logged in: ${user.email}` : 'logged out'}</p>;
};

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    authAPI.me.mockReset();
    authAPI.login.mockReset();
    authAPI.signup.mockReset();
  });

  it('shows logged out when no token in localStorage', async () => {
    authAPI.me.mockRejectedValueOnce(new Error('no token'));

    render(
      <AuthProvider>
        <AuthDisplay />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('logged out')).toBeInTheDocument();
    });
  });

  it('rehydrates user from stored token', async () => {
    localStorage.setItem('token', 'fake-token');
    authAPI.me.mockResolvedValueOnce({ data: { user: { email: 'alice@test.com' } } });

    render(
      <AuthProvider>
        <AuthDisplay />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('logged in: alice@test.com')).toBeInTheDocument();
    });
  });

  it('clears token on failed rehydration', async () => {
    localStorage.setItem('token', 'expired-token');
    localStorage.setItem('user', JSON.stringify({ email: 'expired@test.com', role: 'student' }));
    authAPI.me.mockRejectedValueOnce(new Error('401'));

    render(
      <AuthProvider>
        <AuthDisplay />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('logged out')).toBeInTheDocument();
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });
  });
});

const LoginTester = () => {
  const { login, user } = useAuth();
  return (
    <div>
      <p>{user ? `user: ${user.email}` : 'none'}</p>
      <button onClick={() => login('a@b.com', 'pass')}>Login</button>
    </div>
  );
};

describe('AuthContext login()', () => {
  beforeEach(() => {
    localStorage.clear();
    authAPI.me.mockReset();
    authAPI.login.mockReset();
    authAPI.signup.mockReset();
    authAPI.me.mockRejectedValue(new Error('no token'));
  });

  it('sets user and token on successful login', async () => {
    authAPI.login.mockResolvedValueOnce({
      data: { token: 'new-token', user: { email: 'a@b.com', role: 'student' } },
    });

    render(
      <AuthProvider>
        <LoginTester />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByText('none')).toBeInTheDocument());

    await act(async () => {
      screen.getByRole('button', { name: /login/i }).click();
    });

    await waitFor(() => {
      expect(screen.getByText('user: a@b.com')).toBeInTheDocument();
      expect(localStorage.getItem('token')).toBe('new-token');
      expect(localStorage.getItem('user')).toBe(JSON.stringify({ email: 'a@b.com', role: 'student' }));
    });
  });
});
