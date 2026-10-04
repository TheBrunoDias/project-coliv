'use client';

import { useEffect, useState } from 'react';

/**
 * Current time for rotation math, refreshed every minute and when the app comes back to the
 * foreground (an installed PWA can stay open in the background for days).
 */
export function useNow(intervalMs = 60_000): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const refresh = () => setNow(new Date());
    const id = setInterval(refresh, intervalMs);
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [intervalMs]);

  return now;
}
