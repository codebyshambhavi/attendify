import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock react-hot-toast so we don't need a DOM Toaster in every test
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error:   vi.fn(),
    loading: vi.fn(),
  },
  Toaster: () => null,
}));

// Mock framer-motion to avoid animation side effects
vi.mock('framer-motion', () => ({
  motion: {
    div:    ({ children, ...p }) => <div {...p}>{children}</div>,
    span:   ({ children, ...p }) => <span {...p}>{children}</span>,
    tr:     ({ children, ...p }) => <tr {...p}>{children}</tr>,
    aside:  ({ children, ...p }) => <aside {...p}>{children}</aside>,
  },
  AnimatePresence: ({ children }) => children,
}));
