import type { AvatarPresetId } from "@/lib/avatar-presets";

export const DEMO_SESSION_COOKIE = "edulink_session";
export const DEMO_SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

export type DemoUserRole = "teacher" | "hr" | "admin";
export type ViewerRole = DemoUserRole | "guest";

export interface DemoSession {
  avatarPreset?: AvatarPresetId;
  detail?: string;
  email: string;
  name: string;
  redirectTo: string;
  role: DemoUserRole;
  userId: string;
}

const DEFAULT_REDIRECTS: Record<DemoUserRole, string> = {
  admin: "/admin/dashboard",
  hr: "/hr/dashboard",
  teacher: "/teacher/dashboard",
};

const ROLE_PATH_PREFIXES: Record<DemoUserRole, string[]> = {
  admin: ["/admin"],
  hr: ["/hr", "/pool"],
  teacher: ["/teacher", "/jobs"],
};

export function parseDemoUserRole(value: unknown): DemoUserRole | null {
  return value === "teacher" || value === "hr" || value === "admin"
    ? value
    : null;
}

/**
 * Maps database roles to the three product-facing roles. Unknown values are
 * rejected instead of silently receiving teacher privileges.
 */
export function mapDatabaseRoleToDemoRole(value: unknown): DemoUserRole | null {
  switch (value) {
    case "TEACHER":
      return "teacher";
    case "HR_MANAGER":
      return "hr";
    case "EDU_ADMIN":
    case "SUPER_ADMIN":
      return "admin";
    default:
      return null;
  }
}

export function sanitizeNextRedirect(
  value: unknown,
  fallback = "/",
): string {
  const safeFallback =
    typeof fallback === "string" &&
    fallback.startsWith("/") &&
    !fallback.startsWith("//") &&
    !fallback.includes("\\")
      ? fallback
      : "/";

  if (
    typeof value !== "string" ||
    value.length === 0 ||
    value.length > 2048 ||
    value !== value.trim() ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\") ||
    /[\u0000-\u001f\u007f]/.test(value)
  ) {
    return safeFallback;
  }

  try {
    const decodedValue = decodeURIComponent(value);

    if (
      decodedValue.includes("\\") ||
      /[\u0000-\u001f\u007f]/.test(decodedValue)
    ) {
      return safeFallback;
    }

    const parsed = new URL(value, "https://edulink.local");

    if (parsed.origin !== "https://edulink.local") {
      return safeFallback;
    }

    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return safeFallback;
  }
}

export function getSafePostLoginRedirect(
  role: DemoUserRole,
  requestedNext?: unknown,
) {
  const fallback = DEFAULT_REDIRECTS[role];
  const sanitized = sanitizeNextRedirect(requestedNext, fallback);
  const isRolePath = ROLE_PATH_PREFIXES[role].some(
    (prefix) =>
      sanitized === prefix || sanitized.startsWith(`${prefix}/`),
  );

  return isRolePath ? sanitized : fallback;
}

export function isAuthorizedRole(
  viewerRole: ViewerRole,
  allowedRoles: DemoUserRole[],
) {
  return viewerRole !== "guest" && allowedRoles.includes(viewerRole);
}

export function getDashboardHref(role?: DemoUserRole | ViewerRole | null) {
  return role && role !== "guest" ? DEFAULT_REDIRECTS[role] : null;
}
