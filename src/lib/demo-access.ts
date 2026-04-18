export const DEMO_PASSWORD = "edulink123!";
export const DEMO_VERIFICATION_CODE = "EDU2026";

export const DEMO_ACCOUNTS = [
  {
    label: "교사",
    email: "teacher@email.com",
    password: DEMO_PASSWORD,
    redirectTo: "/teacher/dashboard",
  },
  {
    label: "학교",
    email: "hr@school.go.kr",
    password: DEMO_PASSWORD,
    redirectTo: "/hr/dashboard",
  },
  {
    label: "관리자",
    email: "admin@edulink.kr",
    password: DEMO_PASSWORD,
    redirectTo: "/admin/dashboard",
  },
] as const;

export function findDemoAccount(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPassword = password.trim();

  return DEMO_ACCOUNTS.find(
    (account) =>
      account.email.toLowerCase() === normalizedEmail &&
      account.password === normalizedPassword,
  );
}
