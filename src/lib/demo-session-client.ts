"use client";

import { useState } from "react";

import {
  DEMO_SESSION_COOKIE,
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

export function useViewerRole(initialRole: ViewerRole = "guest") {
  const [viewerRole] = useState<ViewerRole>(() => {
    if (typeof document === "undefined") {
      return initialRole;
    }

    return parseDemoSession(readCookie(DEMO_SESSION_COOKIE))?.role ?? "guest";
  });

  return viewerRole;
}
