import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '../hooks/useDebounce';
import { useLocalStorage } from '../hooks/useLocalStorage';

// ── useDebounce ───────────────────────────────────────────────────────────────
describe('useDebounce', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('hello', 300));
    expect(result.current).toBe('hello');
  });

  it('does not update before delay elapses', () => {
    const { result, rerender } = renderHook(
      ({ val }) => useDebounce(val, 300),
      { initialProps: { val: 'hello' } }
    );

    rerender({ val: 'world' });
    expect(result.current).toBe('hello'); // still old value

    act(() => vi.advanceTimersByTime(150));
    expect(result.current).toBe('hello'); // still old value
  });

  it('updates after delay elapses', () => {
    const { result, rerender } = renderHook(
      ({ val }) => useDebounce(val, 300),
      { initialProps: { val: 'hello' } }
    );

    rerender({ val: 'world' });
    act(() => vi.advanceTimersByTime(300));
    expect(result.current).toBe('world');
  });

  it('resets timer on rapid changes', () => {
    const { result, rerender } = renderHook(
      ({ val }) => useDebounce(val, 300),
      { initialProps: { val: 'a' } }
    );

    rerender({ val: 'b' });
    act(() => vi.advanceTimersByTime(200));

    rerender({ val: 'c' });
    act(() => vi.advanceTimersByTime(200));

    // Timer reset — 'b' was never debounced
    expect(result.current).toBe('a');

    act(() => vi.advanceTimersByTime(100));
    expect(result.current).toBe('c');
  });

  it('uses default 350ms delay', () => {
    const { result, rerender } = renderHook(
      ({ val }) => useDebounce(val),
      { initialProps: { val: 'init' } }
    );

    rerender({ val: 'updated' });
    act(() => vi.advanceTimersByTime(349));
    expect(result.current).toBe('init');

    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toBe('updated');
  });
});

// ── useLocalStorage ────────────────────────────────────────────────────────────
describe('useLocalStorage', () => {
  beforeEach(() => localStorage.clear());

  it('returns initial value when key not in storage', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
    expect(result.current[0]).toBe('default');
  });

  it('stores and retrieves a string', () => {
    const { result } = renderHook(() => useLocalStorage('my-key', ''));

    act(() => result.current[1]('hello'));

    expect(result.current[0]).toBe('hello');
    expect(localStorage.getItem('my-key')).toBe('"hello"');
  });

  it('stores and retrieves an object', () => {
    const { result } = renderHook(() => useLocalStorage('obj-key', {}));

    act(() => result.current[1]({ name: 'Alice', role: 'admin' }));

    expect(result.current[0]).toEqual({ name: 'Alice', role: 'admin' });
  });

  it('rehydrates from existing localStorage on mount', () => {
    localStorage.setItem('existing-key', JSON.stringify({ count: 42 }));

    const { result } = renderHook(() =>
      useLocalStorage('existing-key', { count: 0 })
    );

    expect(result.current[0]).toEqual({ count: 42 });
  });

  it('supports functional updater pattern', () => {
    const { result } = renderHook(() => useLocalStorage('counter', 0));

    act(() => result.current[1]((prev) => prev + 1));
    act(() => result.current[1]((prev) => prev + 1));

    expect(result.current[0]).toBe(2);
  });
});
