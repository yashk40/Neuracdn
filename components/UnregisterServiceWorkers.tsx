"use client";

import { useEffect } from "react";

/**
 * Clears stray service workers on localhost (often left from other apps or old builds).
 * Those can intercept fetch() and throw "Failed to fetch" in sw.js.
 */
export function UnregisterServiceWorkers() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    if (window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") return;

    navigator.serviceWorker.getRegistrations().then((regs) => {
      regs.forEach((reg) => {
        void reg.unregister();
      });
    });
  }, []);

  return null;
}
