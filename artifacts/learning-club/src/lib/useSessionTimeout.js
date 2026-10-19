import { useEffect, useRef, useState } from 'react';
import { auth } from '@/lib/firebase';

// ---- change these two numbers to change the timeouts ----
export const IDLE_MINUTES = 15;      // log out after this long with no activity
export const MAX_SESSION_HOURS = 2;  // log out this long after signing in, no matter what
const WARN_SECONDS = 60;             // show the warning this many seconds before logout

const IDLE_MS = IDLE_MINUTES * 60 * 1000;
const MAX_MS = MAX_SESSION_HOURS * 60 * 60 * 1000;
const ACTIVITY_EVENTS = ['mousemove', 'keydown', 'click', 'touchstart', 'scroll'];

/**
 * Calls onExpire() when the session runs out.
 * Returns null normally, or { seconds, canExtend } during the last minute.
 */
export function useSessionTimeout(onExpire) {
  const [warn, setWarn] = useState(null);
  const lastActive = useRef(Date.now());

  useEffect(() => {
    const touch = () => { lastActive.current = Date.now(); };
    ACTIVITY_EVENTS.forEach((name) => window.addEventListener(name, touch, { passive: true }));

    // sign-in time survives a page refresh, so reloading cannot reset the limit
    const signedInAt = Date.parse(auth.currentUser?.metadata?.lastSignInTime ?? '') || Date.now();

    const timer = window.setInterval(() => {
      const now = Date.now();
      const idleDeadline = lastActive.current + IDLE_MS;
      const maxDeadline = signedInAt + MAX_MS;
      const left = Math.min(idleDeadline, maxDeadline) - now;

      if (left <= 0) {
        window.clearInterval(timer);
        onExpire();
      } else if (left <= WARN_SECONDS * 1000) {
        setWarn({ seconds: Math.ceil(left / 1000), canExtend: idleDeadline < maxDeadline });
      } else {
        setWarn(null);
      }
    }, 1000);

    return () => {
      window.clearInterval(timer);
      ACTIVITY_EVENTS.forEach((name) => window.removeEventListener(name, touch));
    };
  }, [onExpire]);

  return warn;
}