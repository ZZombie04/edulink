import type { ViewerRole } from "@/lib/demo-session";

export function maskPersonalName(name: string) {
  const normalized = name.trim();

  if (!normalized) {
    return "";
  }

  const chars = Array.from(normalized);

  if (chars.length === 1) {
    return "○";
  }

  if (chars.length === 2) {
    return `${chars[0]}○`;
  }

  return `${chars[0]}${"○".repeat(chars.length - 2)}${chars.at(-1)}`;
}

export function canViewTeacherFullName(viewerRole: ViewerRole) {
  return viewerRole === "hr";
}

export function getTeacherDisplayName(name: string, viewerRole: ViewerRole) {
  return canViewTeacherFullName(viewerRole) ? name : maskPersonalName(name);
}

export function getContactDisplayName(name: string, viewerRole: ViewerRole) {
  if (viewerRole !== "guest") {
    return name;
  }

  const [personName, ...rest] = name.trim().split(" ");

  if (!personName) {
    return "";
  }

  return [maskPersonalName(personName), ...rest].join(" ");
}
