'use client';

import { useState, useEffect } from 'react';

/**
 * Custom React hook that debounces any rapidly changing value by `delayMs`.
 * Ideal for search input fields, filters, and autocomplete inputs.
 * 
 * @param value The raw value from the input field
 * @param delayMs Wait time in milliseconds before updating debounced value (defaults to 300ms)
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delayMs: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delayMs]);

  return debouncedValue;
}
