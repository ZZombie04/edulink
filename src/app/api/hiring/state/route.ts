import { NextResponse } from "next/server";

import {
  getHiringStateForSession,
  HiringServiceError,
  performHiringMutation,
} from "@/lib/hiring-state-service";
import { getDemoSessionFromServerCookie } from "@/lib/demo-session-server";

export async function GET() {
  try {
    const session = await getDemoSessionFromServerCookie();
    const state = await getHiringStateForSession(session);

    return NextResponse.json(state, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const isExpected = error instanceof HiringServiceError;

    if (!isExpected) {
      console.error("Unexpected hiring state read error", error);
    }

    return NextResponse.json(
      {
        code: isExpected ? error.code : "HIRING_STATE_READ_FAILED",
        message: isExpected
          ? error.message
          : "채용 상태를 불러오지 못했습니다.",
      },
      {
        status: isExpected ? error.status : 500,
      },
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
    const isExpected = error instanceof HiringServiceError;

    if (!isExpected) {
      console.error("Unexpected hiring state mutation error", error);
    }

    return NextResponse.json(
      {
        code: isExpected ? error.code : "HIRING_MUTATION_FAILED",
        message: isExpected
          ? error.message
          : "채용 상태를 저장하지 못했습니다.",
      },
      {
        status: isExpected ? error.status : 500,
      },
    );
  }
}
