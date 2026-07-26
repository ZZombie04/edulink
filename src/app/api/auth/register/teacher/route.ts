import { NextResponse } from "next/server";

import {
  HiringServiceError,
  registerTeacher,
} from "@/lib/hiring-state-service";
import type { TeacherRegistrationInput } from "@/lib/hiring-shared";
import {
  DEMO_SESSION_COOKIE,
  DEMO_SESSION_MAX_AGE_SECONDS,
} from "@/lib/demo-session";
import { signDemoSession } from "@/lib/demo-session-signing";

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as
      | TeacherRegistrationInput
      | null;

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        {
          code: "INVALID_REQUEST",
          message: "가입 신청 형식이 올바르지 않습니다.",
        },
        { status: 400 },
      );
    }

    const session = await registerTeacher(body);
    const response = NextResponse.json(
      {
        redirectTo: session.redirectTo,
        role: session.role,
      },
      { status: 201 },
    );

    response.cookies.set({
      httpOnly: true,
      maxAge: DEMO_SESSION_MAX_AGE_SECONDS,
      name: DEMO_SESSION_COOKIE,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      value: signDemoSession(session),
    });

    return response;
  } catch (error) {
    const isExpected = error instanceof HiringServiceError;

    if (!isExpected) {
      console.error("Unexpected teacher registration error", error);
    }

    return NextResponse.json(
      {
        code: isExpected
          ? error.code
          : "TEACHER_REGISTRATION_FAILED",
        message:
          isExpected
            ? error.message
            : "교사 가입을 완료하지 못했습니다. 잠시 후 다시 시도해 주세요.",
      },
      { status: isExpected ? error.status : 500 },
    );
  }
}
