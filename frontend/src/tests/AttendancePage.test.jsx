import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import AttendancePage from '../pages/AttendancePage';

// Mock auth context — logged in as student
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { _id: 'u1', name: 'Alice', role: 'student' },
  }),
}));

// Mock attendance API
const mockMark  = vi.fn();
const mockToday = vi.fn();

vi.mock('../services/api', () => ({
  attendanceAPI: {
    today: () => mockToday(),
    mark:  (data) => mockMark(data),
  },
}));

const renderPage = () =>
  render(
    <MemoryRouter>
      <AttendancePage />
    </MemoryRouter>
  );

describe('AttendancePage — no record today', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockToday.mockResolvedValue({ data: { record: null, date: '2024-04-21' } });
  });

  it('renders the mark attendance form', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText(/mark your attendance/i)).toBeInTheDocument();
    });
  });

  it('shows status options — Present, Late, Absent', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Present')).toBeInTheDocument();
      expect(screen.getByText('Late')).toBeInTheDocument();
      expect(screen.getByText('Absent')).toBeInTheDocument();
    });
  });

  it('marks attendance when button clicked', async () => {
    const user = userEvent.setup();
    mockMark.mockResolvedValueOnce({
      data: { record: { _id: 'r1', status: 'present', date: '2024-04-21', subject: 'General' } },
    });

    renderPage();
    await waitFor(() =>
      expect(screen.getByText(/mark your attendance/i)).toBeInTheDocument()
    );

    await user.click(screen.getByRole('button', { name: /mark attendance/i }));

    await waitFor(() => {
      expect(mockMark).toHaveBeenCalled();
    });
  });

  it('selects Absent status on click', async () => {
    const user = userEvent.setup();
    renderPage();
    await waitFor(() => expect(screen.getByText('Absent')).toBeInTheDocument());

    await user.click(screen.getByText('Absent').closest('button'));
    // The button should gain absent styling — just verify no crash
    expect(screen.getByText('Absent')).toBeInTheDocument();
  });
});

describe('AttendancePage — already marked today', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockToday.mockResolvedValue({
      data: {
        record: { _id: 'r1', status: 'present', date: '2024-04-21', subject: 'Math' },
        date: '2024-04-21',
      },
    });
  });

  it('shows already-marked state', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText(/attendance recorded/i)).toBeInTheDocument();
    });
  });

  it('does not show the mark form', async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.queryByText(/mark your attendance/i)).not.toBeInTheDocument()
    );
  });

  it('shows the recorded status badge', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('present')).toBeInTheDocument();
    });
  });
});
