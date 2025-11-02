// src/tests/unit/useCounter.test.js
import { renderHook, act } from '@testing-library/react';
import useCounter from '../../hooks/useCounter';

describe('useCounter Hook', () => {
  it('should increment and decrement', () => {
    const { result } = renderHook(() => useCounter(0));

    act(() => result.current.increment());
    expect(result.current.count).toBe(1);

    act(() => result.current.decrement());
    expect(result.current.count).toBe(0);
  });

  it('should start with initial value', () => {
    const { result } = renderHook(() => useCounter(5));
    expect(result.current.count).toBe(5);
  });

  it('should handle multiple increments', () => {
    const { result } = renderHook(() => useCounter(0));

    act(() => {
      result.current.increment();
      result.current.increment();
      result.current.increment();
    });

    expect(result.current.count).toBe(3);
  });
});