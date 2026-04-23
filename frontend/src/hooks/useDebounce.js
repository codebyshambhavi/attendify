import { useState, useEffect } from 'react';

/**
 * Debounces a value — useful for search inputs to avoid hammering the API.
 * @param {*} value     The value to debounce
 * @param {number} delay  Delay in ms (default 350)
 */
export function useDebounce(value, delay = 350) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
