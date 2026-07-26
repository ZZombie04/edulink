import "server-only";

import { cookies } from "next/headers";

import {
  DEMO_SESSION_COOKIE,
  type ViewerRole,
} from "@/lib/demo-session";
import { verifyDemoSessionToken } from "@/lib/demo-session-signing";

export async function getDemoSessionFromServerCookie() {
  const cookieStore = await cookies();

  return verifyDemoSessionToken(
    cookieStore.get(DEMO_SESSION_COOKIE)?.value,
  );
}

export async function getViewerRoleFromServerCookie(): Promise<ViewerRole> {
  return (await getDemoSessionFromServerCookie())?.role ?? "guest";
}
