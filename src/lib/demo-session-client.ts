"use client";

import { useEffect, useState } from "react";

import type {
  DemoSession,
  ViewerRole,
} from "@/lib/demo-session";

let cachedSession: DemoSession | null | undefined;
let pendingSessionRequest: Promise<DemoSession | null> | null = null;

async function requestCurrentSession() {
  if (cachedSession !== undefined) {
    return cachedSession;
  }

  if (!pendingSessionRequest) {
    pendingSessionRequest = fetch("/api/auth/session", {
      cache: "no-store",
      credentials: "same-origin",
    })
      .then(async (response) => {
        if (!response.ok) {
          return null;
        }

        const result = (await response.json().catch(() => null)) as
          | { session?: DemoSession | null }
          | null;

        return result?.session ?? null;
      })
      .catch(() => null)
      .then((session) => {
        cachedSession = session;
        pendingSessionRequest = null;
        return session;
      });
  }

  return pendingSessionRequest;
}

export function clearDemoSessionClientCache() {
  cachedSession = undefined;
  pendingSessionRequest = null;
}

export function useDemoSession(initialSession: DemoSession | null = null) {
  const [session, setSession] = useState<DemoSession | null>(
    initialSession ?? cachedSession ?? null,
  );

  useEffect(() => {
    let active = true;

    void requestCurrentSession().then((nextSession) => {
      if (active) {
        setSession(nextSession ?? initialSession);
      }
    });

    return () => {
      active = false;
    };
  }, [initialSession]);

  return session;
}

export function useViewerRole(initialRole: ViewerRole = "guest") {
  return useDemoSession()?.role ?? initialRole;
}
