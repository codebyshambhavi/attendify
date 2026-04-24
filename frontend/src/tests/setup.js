import '@testing-library/jest-dom';
import React from 'react';
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
    div:    ({ children, ...p }) => React.createElement('div', p, children),
    span:   ({ children, ...p }) => React.createElement('span', p, children),
    tr:     ({ children, ...p }) => React.createElement('tr', p, children),
    aside:  ({ children, ...p }) => React.createElement('aside', p, children),
  },
  AnimatePresence: ({ children }) => children,
}));
