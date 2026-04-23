import { describe, it, expect } from 'vitest';
import {
  formatDate,
  getInitials,
  avatarColor,
  pctClass,
  todayISO,
  currentMonth,
} from '../utils/helpers';

describe('formatDate', () => {
  it('formats ISO date string to readable form', () => {
    expect(formatDate('2024-04-15')).toBe('Apr 15, 2024');
  });

  it('formats another date correctly', () => {
    expect(formatDate('2024-01-01')).toBe('Jan 1, 2024');
  });
});

describe('getInitials', () => {
  it('returns two initials from full name', () => {
    expect(getInitials('Alice Johnson')).toBe('AJ');
  });

  it('returns one initial from single name', () => {
    expect(getInitials('Alice')).toBe('A');
  });

  it('handles three-word name', () => {
    expect(getInitials('Alice Bob Charlie')).toBe('AB');
  });

  it('handles empty string', () => {
    expect(getInitials('')).toBe('');
  });
});

describe('avatarColor', () => {
  it('returns a Tailwind bg class', () => {
    const result = avatarColor('Alice');
    expect(result).toMatch(/^bg-/);
  });

  it('returns same color for same name', () => {
    expect(avatarColor('Alice')).toBe(avatarColor('Alice'));
  });

  it('returns different colors for different names', () => {
    // Not guaranteed but very likely across a range of names
    const colors = ['Alice', 'Bob', 'Carol', 'Dave', 'Eve', 'Frank', 'Grace'].map(avatarColor);
    const unique  = new Set(colors);
    expect(unique.size).toBeGreaterThan(1);
  });
});

describe('pctClass', () => {
  it('returns green for >= 75%', () => {
    expect(pctClass(75)).toContain('emerald');
    expect(pctClass(100)).toContain('emerald');
  });

  it('returns amber for 50–74%', () => {
    expect(pctClass(50)).toContain('amber');
    expect(pctClass(74)).toContain('amber');
  });

  it('returns rose for < 50%', () => {
    expect(pctClass(49)).toContain('rose');
    expect(pctClass(0)).toContain('rose');
  });
});

describe('todayISO', () => {
  it('returns a YYYY-MM-DD string', () => {
    expect(todayISO()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('matches today\'s date', () => {
    const expected = new Date().toISOString().split('T')[0];
    expect(todayISO()).toBe(expected);
  });
});

describe('currentMonth', () => {
  it('returns a YYYY-MM string', () => {
    expect(currentMonth()).toMatch(/^\d{4}-\d{2}$/);
  });

  it('matches today\'s month', () => {
    const expected = new Date().toISOString().slice(0, 7);
    expect(currentMonth()).toBe(expected);
  });
});
