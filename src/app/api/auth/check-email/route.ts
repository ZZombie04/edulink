import { NextResponse } from "next/server";

import {
  HiringServiceError,
  checkEmailAvailability,
} from "@/lib/hiring-state-service";

export async function GET(request: Request) {
  const email = new URL(request.url).searchParams.get("email") ?? "";

  try {
    const result = await checkEmailAvailability(email);

    return NextResponse.json(result, {
      headers: { "Cache-Control": "no-store" },
      status: 200,
    });
  } catch (error) {
    const isExpected = error instanceof HiringServiceError;

    if (!isExpected) {
      console.error("Unexpected email availability check error", error);
    }

    return NextResponse.json(
      {
        available: false,
        code: isExpected ? error.code : "EMAIL_CHECK_FAILED",
        message: isExpected
          ? error.message
          : "이메일 확인에 실패했습니다. 잠시 후 다시 시도해 주세요.",
      },
      { status: isExpected ? error.status : 500 },
    );
  }
}
