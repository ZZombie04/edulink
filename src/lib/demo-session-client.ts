"use client";

import { useEffect, useState } from "react";

import {
  DEMO_SESSION_COOKIE,
  type DemoSession,
  parseDemoSession,
  type ViewerRole,
} from "@/lib/demo-session";

function readCookie(name: string) {
  if (typeof document === "undefined") {
    return null;
  }

  const match = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${name}=`));

  return match ? match.slice(name.length + 1) : null;
}

export function useDemoSession(initialSession: DemoSession | null = null) {
  const [session, setSession] = useState<DemoSession | null>(() => {
    if (typeof document === "undefined") {
      return initialSession;
    }

    return parseDemoSession(readCookie(DEMO_SESSION_COOKIE)) ?? initialSession;
  });

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const nextSession =
      parseDemoSession(readCookie(DEMO_SESSION_COOKIE)) ?? initialSession;
    const frame = window.requestAnimationFrame(() => {
      setSession(nextSession);
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [initialSession]);

  return session;
}

export function useViewerRole(initialRole: ViewerRole = "guest") {
  return useDemoSession()?.role ?? initialRole;
}
