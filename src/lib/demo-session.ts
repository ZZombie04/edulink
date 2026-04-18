import type { AvatarPresetId } from "@/lib/avatar-presets";

export const DEMO_SESSION_COOKIE = "edulink_session";

export type DemoUserRole = "teacher" | "hr" | "admin";
export type ViewerRole = DemoUserRole | "guest";

export interface DemoSession {
  avatarPreset?: AvatarPresetId;
  detail?: string;
  email: string;
  name: string;
  redirectTo: string;
  role: DemoUserRole;
}

export function serializeDemoSession(session: DemoSession) {
  return encodeURIComponent(JSON.stringify(session));
}

export function parseDemoSession(value?: string | null) {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(decodeURIComponent(value));

    if (
      typeof parsed !== "object" ||
      parsed === null ||
      typeof parsed.email !== "string" ||
      typeof parsed.name !== "string" ||
      typeof parsed.redirectTo !== "string" ||
      !["teacher", "hr", "admin"].includes(parsed.role)
    ) {
      return null;
    }

    return parsed as DemoSession;
  } catch {
    return null;
  }
}

export function getViewerRoleFromCookieValue(
  value?: string | null,
): ViewerRole {
  return parseDemoSession(value)?.role ?? "guest";
}

export function isAuthorizedRole(
  viewerRole: ViewerRole,
  allowedRoles: DemoUserRole[],
) {
  return allowedRoles.includes(viewerRole as DemoUserRole);
}
