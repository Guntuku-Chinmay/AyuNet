import { useEffect, useRef } from 'react';

export interface UseIdleTimerOptions {
  timeoutMs?: number;
  onIdle: () => void;
}

export function useIdleTimer({ timeoutMs = 15 * 60 * 1000, onIdle }: UseIdleTimerOptions) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(onIdle, timeoutMs);
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll', 'wheel'];

    const handleEvent = () => resetTimer();

    events.forEach((event) => window.addEventListener(event, handleEvent));
    resetTimer();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach((event) => window.removeEventListener(event, handleEvent));
    };
  }, [timeoutMs, onIdle]);
}
