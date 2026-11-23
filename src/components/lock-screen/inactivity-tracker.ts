'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Default inactivity timeout: 45 minutes (2,700,000 milliseconds)
 */
export const DEFAULT_INACTIVITY_TIMEOUT_MS = 45 * 60 * 1000;

/**
 * List of DOM events to monitor.
 * Crucial: Includes mouse wheel, scrolling, typing, pointer movements and touch.
 */
export const INACTIVITY_LISTENED_EVENTS = [
  'wheel',
  'scroll',
  'mousemove',
  'mousedown',
  'keydown',
  'touchstart',
  'touchmove',
  'click',
] as const;

export function shouldTriggerLock(
  lastActivityTimestamp: number,
  timeoutMs: number,
  currentTimestamp: number = Date.now()
): boolean {
  if (!lastActivityTimestamp || lastActivityTimestamp <= 0) return false;
  return currentTimestamp - lastActivityTimestamp >= timeoutMs;
}

export function calculateRemainingTime(
  lastActivityTimestamp: number,
  timeoutMs: number,
  currentTimestamp: number = Date.now()
): number {
  if (!lastActivityTimestamp) return timeoutMs;
  const elapsed = currentTimestamp - lastActivityTimestamp;
  return Math.max(0, timeoutMs - elapsed);
}

export interface InactivityTrackerOptions {
  timeoutMs?: number;
  enabled?: boolean;
  onLock?: () => void;
  onUnlock?: () => void;
}

export function useInactivityTracker(options: InactivityTrackerOptions = {}) {
  const {
    timeoutMs = DEFAULT_INACTIVITY_TIMEOUT_MS,
    enabled = true,
    onLock,
    onUnlock,
  } = options;

  const [isLocked, setIsLocked] = useState(false);
  const lastActivityRef = useRef<number>(Date.now());
  const channelRef = useRef<BroadcastChannel | null>(null);
  const lastThrottleRef = useRef<number>(0);

  // Broadcast lock/unlock or activity state across tabs
  const broadcast = useCallback((type: 'ACTIVITY' | 'LOCK' | 'UNLOCK', timestamp: number) => {
    try {
      if (channelRef.current) {
        channelRef.current.postMessage({ type, timestamp });
      }
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('previoffice_last_activity', timestamp.toString());
      }
    } catch {
      // BroadcastChannel or localStorage unavailable
    }
  }, []);

  // Record user interaction (throttled to once per second)
  const recordActivity = useCallback(() => {
    if (isLocked) return;
    const now = Date.now();
    if (now - lastThrottleRef.current < 1000) return;
    lastThrottleRef.current = now;
    lastActivityRef.current = now;
    broadcast('ACTIVITY', now);
  }, [isLocked, broadcast]);

  // Unlock callback
  const unlock = useCallback(() => {
    const now = Date.now();
    lastActivityRef.current = now;
    lastThrottleRef.current = now;
    setIsLocked(false);
    broadcast('UNLOCK', now);
    if (onUnlock) onUnlock();
  }, [broadcast, onUnlock]);

  // Setup multi-tab communication bus
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const channel = new BroadcastChannel('previoffice_inactivity');
      channelRef.current = channel;

      channel.onmessage = (event) => {
        const { type, timestamp } = event.data || {};
        if (type === 'ACTIVITY' && typeof timestamp === 'number') {
          if (timestamp > lastActivityRef.current) {
            lastActivityRef.current = timestamp;
          }
        } else if (type === 'LOCK') {
          setIsLocked(true);
        } else if (type === 'UNLOCK') {
          setIsLocked(false);
          lastActivityRef.current = Date.now();
        }
      };
    } catch {
      // BroadcastChannel unsupported fallback
    }

    // Storage event fallback for older browsers / isolated processes
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'previoffice_last_activity' && e.newValue) {
        const ts = parseInt(e.newValue, 10);
        if (!isNaN(ts) && ts > lastActivityRef.current) {
          lastActivityRef.current = ts;
        }
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      if (channelRef.current) {
        channelRef.current.close();
        channelRef.current = null;
      }
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  // Attach passive activity listeners (wheel, scroll, mousemove, keydown, touch)
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const listenerOptions: AddEventListenerOptions = { passive: true, capture: true };

    INACTIVITY_LISTENED_EVENTS.forEach((eventName) => {
      window.addEventListener(eventName, recordActivity, listenerOptions);
    });

    return () => {
      INACTIVITY_LISTENED_EVENTS.forEach((eventName) => {
        window.removeEventListener(eventName, recordActivity, listenerOptions);
      });
    };
  }, [enabled, recordActivity]);

  // Periodic ticker to check if 45 minutes have elapsed
  useEffect(() => {
    if (!enabled || isLocked) return;

    const intervalId = setInterval(() => {
      const now = Date.now();
      if (shouldTriggerLock(lastActivityRef.current, timeoutMs, now)) {
        setIsLocked(true);
        broadcast('LOCK', now);
        if (onLock) onLock();
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(intervalId);
  }, [enabled, isLocked, timeoutMs, broadcast, onLock]);

  return {
    isLocked,
    unlock,
    recordActivity,
  };
}
