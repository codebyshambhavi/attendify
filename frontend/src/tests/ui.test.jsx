import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button, Badge, Avatar, Spinner, StatCard } from '../components/ui';
import { CalendarCheck } from 'lucide-react';

// ── Button ────────────────────────────────────────────────────────────────────
describe('Button', () => {
  it('renders with label', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('shows spinner when loading', () => {
    const { container } = render(<Button loading>Save</Button>);
    expect(container.querySelector('svg')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('calls onClick', () => {
    const fn = vi.fn();
    render(<Button onClick={fn}>Go</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('is disabled when loading', () => {
    render(<Button loading>Save</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('is disabled when disabled prop set', () => {
    render(<Button disabled>Save</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});

// ── Badge ─────────────────────────────────────────────────────────────────────
describe('Badge', () => {
  it('renders present badge', () => {
    render(<Badge status="present" />);
    expect(screen.getByText('present')).toBeInTheDocument();
  });

  it('renders absent badge', () => {
    render(<Badge status="absent" />);
    expect(screen.getByText('absent')).toBeInTheDocument();
  });

  it('renders late badge', () => {
    render(<Badge status="late" />);
    expect(screen.getByText('late')).toBeInTheDocument();
  });

  it('renders admin badge', () => {
    render(<Badge status="admin" />);
    expect(screen.getByText('admin')).toBeInTheDocument();
  });
});

// ── Avatar ────────────────────────────────────────────────────────────────────
describe('Avatar', () => {
  it('shows initials from full name', () => {
    render(<Avatar name="Alice Johnson" />);
    expect(screen.getByText('AJ')).toBeInTheDocument();
  });

  it('shows single initial for single name', () => {
    render(<Avatar name="Alice" />);
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('handles empty name gracefully', () => {
    render(<Avatar name="" />);
    // Should render without crashing
    expect(document.querySelector('.rounded-full')).toBeInTheDocument();
  });
});

// ── Spinner ───────────────────────────────────────────────────────────────────
describe('Spinner', () => {
  it('renders an SVG', () => {
    const { container } = render(<Spinner />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('respects custom size', () => {
    const { container } = render(<Spinner size={32} />);
    const svg = container.querySelector('svg');
    expect(svg.getAttribute('width')).toBe('32');
    expect(svg.getAttribute('height')).toBe('32');
  });
});

// ── StatCard ──────────────────────────────────────────────────────────────────
describe('StatCard', () => {
  it('renders label and value', () => {
    render(<StatCard label="Present" value="18" icon={CalendarCheck} color="emerald" />);
    expect(screen.getByText('Present')).toBeInTheDocument();
    expect(screen.getByText('18')).toBeInTheDocument();
  });

  it('renders optional trend text', () => {
    render(
      <StatCard label="Rate" value="85%" icon={CalendarCheck} color="indigo" trend="↑ Good standing" />
    );
    expect(screen.getByText('↑ Good standing')).toBeInTheDocument();
  });
});
