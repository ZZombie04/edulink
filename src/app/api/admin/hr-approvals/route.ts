import { NextResponse } from "next/server";

import {
  decideHrApproval,
  HiringServiceError,
  listHrApprovals,
} from "@/lib/hiring-state-service";
import { getDemoSessionFromServerCookie } from "@/lib/demo-session-server";

function errorResponse(error: unknown, fallback: string) {
  const isExpected = error instanceof HiringServiceError;

  if (!isExpected) {
    console.error("Unexpected HR approval API error", error);
  }

  return NextResponse.json(
    {
      code: isExpected ? error.code : "ADMIN_REQUEST_FAILED",
      message: isExpected ? error.message : fallback,
    },
    { status: isExpected ? error.status : 500 },
  );
}

export async function GET() {
  try {
    const session = await getDemoSessionFromServerCookie();
    const approvals = await listHrApprovals(session);

    return NextResponse.json(
      { approvals },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    return errorResponse(error, "학교 계정 신청을 불러오지 못했습니다.");
  }
}

export async function POST(request: Request) {
  try {
    const session = await getDemoSessionFromServerCookie();
    const body = (await request.json().catch(() => null)) as {
      decision?: "approve" | "reject";
      id?: string;
      rejectionReason?: string;
    } | null;

    if (!body?.id || !body.decision) {
      return NextResponse.json(
        {
          code: "INVALID_REQUEST",
          message: "처리할 신청과 승인 결정을 확인해 주세요.",
        },
        { status: 400 },
      );
    }

    const result = await decideHrApproval(
      session,
      body.id,
      body.decision,
      body.rejectionReason,
    );

    return NextResponse.json(result);
  } catch (error) {
    return errorResponse(error, "학교 계정 신청을 처리하지 못했습니다.");
  }
}
