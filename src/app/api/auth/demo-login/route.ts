import { NextResponse } from "next/server";

import { authenticateUser } from "@/lib/hiring-state-service";
import { DEMO_SESSION_COOKIE, serializeDemoSession } from "@/lib/demo-session";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email : "";
  const password = typeof body?.password === "string" ? body.password : "";

  const account = await authenticateUser(email, password);

  if (!account) {
    return NextResponse.json(
      { message: "계정 정보 또는 비밀번호를 다시 확인해 주세요." },
      { status: 401 },
    );
  }

  const response = NextResponse.json({
    redirectTo: account.redirectTo,
    role: account.role,
  });

  response.cookies.set({
    httpOnly: false,
    maxAge: 60 * 60 * 8,
    name: DEMO_SESSION_COOKIE,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    value: serializeDemoSession(account),
  });

  return response;
}
