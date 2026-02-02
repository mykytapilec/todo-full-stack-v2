import { renderHook, act } from '@testing-library/react';
import { useDebounce } from './useDebounce';
import { describe, expect, it, vi } from 'vitest';

vi.useFakeTimers();

describe('useDebounce', () => {
  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('test', 500));

    expect(result.current).toBe('test');
  });

  it('should update value after delay', () => {
    let value = 'initial';
    const { result, rerender } = renderHook(() => useDebounce(value, 500));

    value = 'updated';
    rerender();

    expect(result.current).toBe('initial');

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toBe('updated');
  });

  it('should reset timer if value changes before delay', () => {
    let value = 'first';
    const { result, rerender } = renderHook(() => useDebounce(value, 500));

    value = 'second';
    rerender();

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe('first');

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current).toBe('second');
  });

  it('should handle rapid consecutive updates', () => {
    let value = 'a';
    const { result, rerender } = renderHook(() => useDebounce(value, 200));

    value = 'b';
    rerender();

    act(() => vi.advanceTimersByTime(100));

    value = 'c';
    rerender();

    act(() => vi.advanceTimersByTime(100));

    expect(result.current).toBe('a');

    act(() => vi.advanceTimersByTime(100));

    expect(result.current).toBe('c');
  });

  it('should work with numbers as value', () => {
    let value = 0;
    const { result, rerender } = renderHook(() => useDebounce(value, 300));

    value = 42;
    rerender();

    act(() => vi.advanceTimersByTime(300));

    expect(result.current).toBe(42);
  });
});
