import { NextResponse } from "next/server";

import {
  HiringServiceError,
  listTeacherReviews,
  submitTeacherReview,
} from "@/lib/hiring-state-service";
import { getDemoSessionFromServerCookie } from "@/lib/demo-session-server";

function errorResponse(error: unknown, fallback: string) {
  const isExpected = error instanceof HiringServiceError;

  if (!isExpected) {
    console.error("Unexpected review API error", error);
  }

  return NextResponse.json(
    {
      code: isExpected ? error.code : "REVIEW_REQUEST_FAILED",
      message: isExpected ? error.message : fallback,
    },
    { status: isExpected ? error.status : 500 },
  );
}

export async function GET() {
  try {
    const session = await getDemoSessionFromServerCookie();
    const reviews = await listTeacherReviews(session);

    return NextResponse.json(
      { reviews },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    return errorResponse(error, "교사 평가를 불러오지 못했습니다.");
  }
}

export async function POST(request: Request) {
  try {
    const session = await getDemoSessionFromServerCookie();
    const body = (await request.json().catch(() => null)) as {
      comment?: string;
      contractId?: string;
      rating?: number;
      teacherId?: number;
    } | null;

    if (!body || typeof body.rating !== "number") {
      return NextResponse.json(
        {
          code: "INVALID_REQUEST",
          message: "평가 대상과 별점을 확인해 주세요.",
        },
        { status: 400 },
      );
    }

    const result = await submitTeacherReview(session, {
      comment: body.comment,
      contractId: body.contractId,
      rating: body.rating,
      teacherId: body.teacherId,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return errorResponse(error, "교사 평가를 저장하지 못했습니다.");
  }
}
