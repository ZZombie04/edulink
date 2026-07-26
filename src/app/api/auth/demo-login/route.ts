import { NextResponse } from "next/server";

import {
  authenticateUser,
  HiringServiceError,
} from "@/lib/hiring-state-service";
import {
  DEMO_SESSION_COOKIE,
  DEMO_SESSION_MAX_AGE_SECONDS,
  getSafePostLoginRedirect,
} from "@/lib/demo-session";
import { signDemoSession } from "@/lib/demo-session-signing";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const requestedNext = body?.next;

  try {
    const account = await authenticateUser(email, password);

    if (!account) {
      return NextResponse.json(
        {
          code: "INVALID_CREDENTIALS",
          message: "계정 정보 또는 비밀번호를 다시 확인해 주세요.",
        },
        { status: 401 },
      );
    }

    const redirectTo = getSafePostLoginRedirect(
      account.role,
      requestedNext,
    );
    const response = NextResponse.json({
      redirectTo,
      role: account.role,
    });

    response.cookies.set({
      httpOnly: true,
      maxAge: DEMO_SESSION_MAX_AGE_SECONDS,
      name: DEMO_SESSION_COOKIE,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      value: signDemoSession({
        ...account,
        redirectTo,
      }),
    });

    return response;
  } catch (error) {
    const isExpected = error instanceof HiringServiceError;

    if (!isExpected) {
      console.error("Unexpected authentication error", error);
    }

    return NextResponse.json(
      {
        code: isExpected ? error.code : "AUTHENTICATION_FAILED",
        message:
          isExpected
            ? error.message
            : "로그인 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
      },
      { status: isExpected ? error.status : 500 },
    );
  }
}
