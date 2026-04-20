import { NextResponse } from "next/server";

import { DEMO_SESSION_COOKIE } from "@/lib/demo-session";

export async function POST() {
  const response = NextResponse.json({ ok: true });

  response.cookies.set({
    httpOnly: false,
    maxAge: 0,
    name: DEMO_SESSION_COOKIE,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    value: "",
  });

  return response;
}
