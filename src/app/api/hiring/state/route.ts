import { NextResponse } from "next/server";

import {
  getHiringStateForSession,
  performHiringMutation,
} from "@/lib/hiring-state-service";
import { getDemoSessionFromServerCookie } from "@/lib/demo-session-server";

export async function GET() {
  try {
    const session = await getDemoSessionFromServerCookie();
    const state = await getHiringStateForSession(session);

    return NextResponse.json(state);
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "채용 상태를 불러오지 못했습니다.",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getDemoSessionFromServerCookie();
    const body = (await request.json().catch(() => null)) as {
      action?: string;
      payload?: Record<string, unknown>;
    } | null;

    if (!body?.action) {
      return NextResponse.json(
        { message: "변경 요청 형식이 올바르지 않습니다." },
        { status: 400 },
      );
    }

    await performHiringMutation(session, body.action, body.payload ?? {});
    const state = await getHiringStateForSession(session);

    return NextResponse.json(state);
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "채용 상태를 저장하지 못했습니다.",
      },
      { status: 500 },
    );
  }
}
