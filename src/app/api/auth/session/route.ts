import { NextResponse } from "next/server";

import { getDemoSessionFromServerCookie } from "@/lib/demo-session-server";

export async function GET() {
  const session = await getDemoSessionFromServerCookie();

  return NextResponse.json(
    { session },
    {
      headers: {
        "Cache-Control": "no-store",
      },
      status: session ? 200 : 401,
    },
  );
}
