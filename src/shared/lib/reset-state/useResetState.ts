import { useCallback, useState } from 'react';

/**
 * Состояние, которое возвращается к `initial`, когда меняется `key` (например, открыт новый бросок).
 * Замена `useEffect(() => setValue(initial), [key])` без лишней перерисовки.
 */
export function useResetState<T>(initial: T, key: unknown): [T, (value: T) => void] {
  const [state, setState] = useState({ key, value: initial });
  const value = state.key === key ? state.value : initial;
  const setValue = useCallback((next: T) => setState({ key, value: next }), [key]);
  return [value, setValue];
}
