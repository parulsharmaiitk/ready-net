import { useEffect, useRef } from 'react';
import { announce } from '../pwa/bus';

/** Move focus to the screen's heading and announce it, once per mount. */
export function useStepFocus<T extends HTMLElement>(announcement: string) {
  const ref = useRef<T>(null);
  useEffect(() => {
    window.scrollTo(0, 0);
    ref.current?.focus();
    announce(announcement);
    // Only on mount: each step is keyed so it remounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return ref;
}
