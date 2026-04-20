import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  DEMO_SESSION_COOKIE,
  getViewerRoleFromCookieValue,
  isAuthorizedRole,
  type DemoUserRole,
} from "@/lib/demo-session";

const accessRules: Array<{
  allowedRoles: DemoUserRole[];
  pathname: string;
}> = [
  { pathname: "/teacher/dashboard", allowedRoles: ["teacher"] },
  { pathname: "/hr/dashboard", allowedRoles: ["hr"] },
  { pathname: "/admin/dashboard", allowedRoles: ["admin"] },
  { pathname: "/pool", allowedRoles: ["hr"] },
  { pathname: "/teacher/offers", allowedRoles: ["teacher"] },
];

function getFallbackPathname(
  role: ReturnType<typeof getViewerRoleFromCookieValue>,
) {
  switch (role) {
    case "teacher":
      return "/teacher/dashboard";
    case "hr":
      return "/hr/dashboard";
    case "admin":
      return "/admin/dashboard";
    default:
      return "/auth/login";
  }
}

export function proxy(request: NextRequest) {
  const matchedRule = accessRules.find((rule) =>
    request.nextUrl.pathname.startsWith(rule.pathname),
  );

  if (!matchedRule) {
    return NextResponse.next();
  }

  const viewerRole = getViewerRoleFromCookieValue(
    request.cookies.get(DEMO_SESSION_COOKIE)?.value,
  );

  if (isAuthorizedRole(viewerRole, matchedRule.allowedRoles)) {
    return NextResponse.next();
  }

  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = getFallbackPathname(viewerRole);

  if (viewerRole === "guest") {
    redirectUrl.searchParams.set("next", request.nextUrl.pathname);
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
