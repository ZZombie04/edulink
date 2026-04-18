import { cookies } from "next/headers";

import {
  DEMO_SESSION_COOKIE,
  getViewerRoleFromCookieValue,
  parseDemoSession,
} from "@/lib/demo-session";

export async function getDemoSessionFromServerCookie() {
  const cookieStore = await cookies();

  return parseDemoSession(cookieStore.get(DEMO_SESSION_COOKIE)?.value);
}

export async function getViewerRoleFromServerCookie() {
  const cookieStore = await cookies();

  return getViewerRoleFromCookieValue(
    cookieStore.get(DEMO_SESSION_COOKIE)?.value,
  );
}
