import type { DemoSession } from "@/lib/demo-session";

export const DEMO_PASSWORD = "edulink123!";
export const DEMO_VERIFICATION_CODE = "EDU2026";

type DemoAccount = DemoSession & {
  label: string;
  password: string;
};

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    avatarPreset: "teacher-f-rose",
    detail: "초등 2급 정교사",
    label: "교사",
    email: "teacher@email.com",
    name: "박서영",
    password: DEMO_PASSWORD,
    redirectTo: "/teacher/dashboard",
    role: "teacher",
  },
  {
    detail: "정인초등학교",
    label: "학교",
    email: "hr@school.go.kr",
    name: "홍수진",
    password: DEMO_PASSWORD,
    redirectTo: "/hr/dashboard",
    role: "hr",
  },
  {
    detail: "시스템 운영",
    label: "관리자",
    email: "admin@edulink.kr",
    name: "관리자",
    password: DEMO_PASSWORD,
    redirectTo: "/admin/dashboard",
    role: "admin",
  },
];

export function findDemoAccount(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPassword = password.trim();

  return DEMO_ACCOUNTS.find(
    (account) =>
      account.email.toLowerCase() === normalizedEmail &&
      account.password === normalizedPassword,
  );
}

export function createDemoSession(account: DemoAccount): DemoSession {
  return {
    avatarPreset: account.avatarPreset,
    detail: account.detail,
    email: account.email,
    name: account.name,
    redirectTo: account.redirectTo,
    role: account.role,
  };
}
