import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook to automatically cancel pending HTTP requests on unmount or re-fetch (Item 28)
 * 
 * Uses AbortController so stale requests show as (canceled) in the DevTools Network tab,
 * saving mobile bandwidth and preventing memory leaks / setting state on unmounted components.
 */

export function useFetchWithAbort() {
  const controllerRef = useRef<AbortController | null>(null);

  const getSignal = useCallback(() => {
    // Abort previous in-flight request if new one starts
    if (controllerRef.current) {
      controllerRef.current.abort();
    }
    const newController = new AbortController();
    controllerRef.current = newController;
    return newController.signal;
  }, []);

  const cancelActiveRequest = useCallback(() => {
    if (controllerRef.current) {
      controllerRef.current.abort();
      controllerRef.current = null;
    }
  }, []);

  useEffect(() => {
    // Clean up and abort on component unmount
    return () => {
      if (controllerRef.current) {
        controllerRef.current.abort();
        controllerRef.current = null;
      }
    };
  }, []);

  return {
    getSignal,
    cancelActiveRequest,
  };
}
