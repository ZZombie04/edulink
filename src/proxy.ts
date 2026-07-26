import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  DEMO_SESSION_COOKIE,
  getDashboardHref,
  isAuthorizedRole,
  sanitizeNextRedirect,
  type DemoUserRole,
  type ViewerRole,
} from "@/lib/demo-session";
import { verifyDemoSessionToken } from "@/lib/demo-session-signing";

const accessRules: Array<{
  allowedRoles: DemoUserRole[];
  pathname: string;
}> = [
  { pathname: "/teacher/dashboard", allowedRoles: ["teacher"] },
  { pathname: "/teacher/offers", allowedRoles: ["teacher"] },
  { pathname: "/hr/dashboard", allowedRoles: ["hr"] },
  { pathname: "/admin/dashboard", allowedRoles: ["admin"] },
  { pathname: "/pool", allowedRoles: ["hr"] },
];

function getFallbackPathname(role: ViewerRole) {
  return getDashboardHref(role) ?? "/auth/login";
}

export function proxy(request: NextRequest) {
  const matchedRule = accessRules.find(
    (rule) =>
      request.nextUrl.pathname === rule.pathname ||
      request.nextUrl.pathname.startsWith(`${rule.pathname}/`),
  );

  if (!matchedRule) {
    return NextResponse.next();
  }

  const session = verifyDemoSessionToken(
    request.cookies.get(DEMO_SESSION_COOKIE)?.value,
  );
  const viewerRole: ViewerRole = session?.role ?? "guest";

  if (isAuthorizedRole(viewerRole, matchedRule.allowedRoles)) {
    return NextResponse.next();
  }

  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = getFallbackPathname(viewerRole);

  if (viewerRole === "guest") {
    const requestedPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;
    redirectUrl.search = "";
    redirectUrl.searchParams.set(
      "next",
      sanitizeNextRedirect(requestedPath, "/"),
    );
  } else {
    redirectUrl.search = "";
  }

  return NextResponse.redirect(redirectUrl);
}

export const config = {
  matcher: [
    "/teacher/:path*",
    "/hr/:path*",
    "/admin/:path*",
    "/pool/:path*",
  ],
};
