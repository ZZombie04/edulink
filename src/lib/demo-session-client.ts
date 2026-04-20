"use client";

import { useState } from "react";

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
  const [session] = useState<DemoSession | null>(() => {
    if (typeof document === "undefined") {
      return initialSession;
    }

    return parseDemoSession(readCookie(DEMO_SESSION_COOKIE)) ?? initialSession;
  });

  return session;
}

export function useViewerRole(initialRole: ViewerRole = "guest") {
  return useDemoSession()?.role ?? initialRole;
}
