import { NextResponse } from "next/server";

import {
  HiringServiceError,
  registerHR,
} from "@/lib/hiring-state-service";
import type { HRRegistrationInput } from "@/lib/hiring-shared";

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as
      | HRRegistrationInput
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

    const result = await registerHR(body);

    return NextResponse.json(
      {
        ...result,
        message:
          "학교 계정 신청이 접수되었습니다. 관리자 승인 후 로그인할 수 있습니다.",
      },
      { status: 202 },
    );
  } catch (error) {
    const isExpected = error instanceof HiringServiceError;

    if (!isExpected) {
      console.error("Unexpected HR registration error", error);
    }

    return NextResponse.json(
      {
        code: isExpected ? error.code : "HR_REGISTRATION_FAILED",
        message:
          isExpected
            ? error.message
            : "학교 계정 신청을 완료하지 못했습니다. 잠시 후 다시 시도해 주세요.",
      },
      { status: isExpected ? error.status : 500 },
    );
  }
}
