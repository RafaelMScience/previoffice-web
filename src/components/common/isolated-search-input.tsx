'use client';

import React, { useState, useCallback, memo } from 'react';
import { Search, X } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';

/**
 * Isolated Search Input Component (Item 30)
 * 
 * Isolates high-frequency keystroke state updates inside this micro-component.
 * Prevents the parent dashboard, tables, and KPI cards from re-rendering on every character typed.
 * Emits `onSearch` only after the 300ms debounce delay.
 */

export interface IsolatedSearchInputProps {
  placeholder?: string;
  onSearch: (debouncedQuery: string) => void;
  debounceMs?: number;
  className?: string;
  ariaLabel?: string;
}

export const IsolatedSearchInput = memo(function IsolatedSearchInput({
  placeholder = 'Buscar...',
  onSearch,
  debounceMs = 300,
  className = '',
  ariaLabel = 'Campo de busca',
}: IsolatedSearchInputProps) {
  const [localValue, setLocalValue] = useState('');
  const debouncedValue = useDebounce(localValue, debounceMs);

  // Notify parent only when debounced value changes
  React.useEffect(() => {
    onSearch(debouncedValue);
  }, [debouncedValue, onSearch]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
  }, []);

  const handleClear = useCallback(() => {
    setLocalValue('');
  }, []);

  return (
    <div className={`relative flex-1 max-w-md ${className}`}>
      <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      <input
        type="text"
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className="w-full pl-10 pr-9 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543]/20 focus:border-[#C89543] transition-all placeholder:text-slate-400 font-medium text-slate-800"
      />
      {localValue && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Limpar busca"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-md transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
});
