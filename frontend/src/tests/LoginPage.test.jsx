import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';

// Mock auth context
const mockLogin = vi.fn();
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ login: mockLogin }),
}));

// Mock router navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const renderLogin = () =>
  render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>
  );

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders email and password fields', () => {
    renderLogin();
    expect(screen.getByPlaceholderText(/you@example.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument();
  });

  it('renders sign in button', () => {
    renderLogin();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('shows demo credentials hint', () => {
    renderLogin();
    expect(screen.getByText(/demo credentials/i)).toBeInTheDocument();
  });

  it('calls login with email and password on submit', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValueOnce({ name: 'Alice', role: 'student' });

    renderLogin();

    await user.type(screen.getByPlaceholderText(/you@example.com/i), 'alice@test.com');
    await user.type(screen.getByPlaceholderText(/••••••••/i), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('alice@test.com', 'password123');
    });
  });

  it('navigates to dashboard on successful login', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValueOnce({ name: 'Alice', role: 'student' });

    renderLogin();

    await user.type(screen.getByPlaceholderText(/you@example.com/i), 'alice@test.com');
    await user.type(screen.getByPlaceholderText(/••••••••/i), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('shows error toast on failed login', async () => {
    const user   = userEvent.setup();
    const toast  = await import('react-hot-toast');
    mockLogin.mockRejectedValueOnce({
      response: { data: { message: 'Invalid credentials' } },
    });

    renderLogin();

    await user.type(screen.getByPlaceholderText(/you@example.com/i), 'bad@test.com');
    await user.type(screen.getByPlaceholderText(/••••••••/i), 'wrongpass');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(toast.default.error).toHaveBeenCalledWith('Invalid credentials');
    });
  });

  it('toggles password visibility', async () => {
    const user = userEvent.setup();
    renderLogin();

    const pwdInput = screen.getByPlaceholderText(/••••••••/i);
    expect(pwdInput).toHaveAttribute('type', 'password');

    // Find and click the eye toggle (last button before submit)
    const toggleBtn = screen.getByTitle
      ? screen.queryByTitle(/show|hide/i)
      : null;

    // Fallback — find all buttons and click the eye icon one
    const buttons = screen.getAllByRole('button');
    const eyeBtn  = buttons.find((b) => b.type === 'button' && !b.textContent.includes('Sign'));
    if (eyeBtn) {
      await user.click(eyeBtn);
      expect(pwdInput).toHaveAttribute('type', 'text');
    }
  });

  it('has a link to signup page', () => {
    renderLogin();
    expect(screen.getByRole('link', { name: /sign up/i })).toBeInTheDocument();
  });
});
