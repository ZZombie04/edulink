"use client";

import Link from "next/link";
import { CheckCircle2, RotateCcw, Send } from "lucide-react";

import { useDemoHiringState } from "@/lib/demo-hiring-state";
import type { ViewerRole } from "@/lib/demo-session";
import { cn } from "@/lib/utils";

interface JobApplyButtonProps {
  className?: string;
  dashboardHref?: string | null;
  fullWidth?: boolean;
  jobId: string;
  jobStatus: "open" | "closing-soon" | "closed";
  showHelperText?: boolean;
  viewerRole: ViewerRole;
}

const baseButtonClassName =
  "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition-colors";

export function JobApplyButton({
  className,
  dashboardHref,
  fullWidth = false,
  jobId,
  jobStatus,
  showHelperText = false,
  viewerRole,
}: JobApplyButtonProps) {
  const {
    applyToJob,
    getApplicationForTeacherAndJob,
    isJobApplied,
    withdrawApplication,
  } = useDemoHiringState();
  const application = getApplicationForTeacherAndJob(1, jobId);
  const applied = isJobApplied(jobId);

  if (jobStatus === "closed" && !applied) {
    return (
      <div className={cn(fullWidth ? "w-full" : "w-auto", showHelperText ? "space-y-3" : "")}>
        <span
          className={cn(
            baseButtonClassName,
            fullWidth ? "flex w-full" : "inline-flex",
            "bg-surface-subtle text-ink-muted",
            className,
          )}
        >
          모집 마감
        </span>
      </div>
    );
  }

  if (viewerRole !== "teacher") {
    const href =
      viewerRole === "guest"
        ? `/auth/login?next=/jobs/${jobId}`
        : dashboardHref ?? "/";
    const label = viewerRole === "guest" ? "로그인하고 지원" : "내 홈으로 돌아가기";

    return (
      <Link
        href={href}
        className={cn(
          baseButtonClassName,
          fullWidth ? "flex w-full" : "inline-flex",
          "bg-[linear-gradient(135deg,#0058be,#2170e4)] text-white shadow-soft",
          className,
        )}
      >
        {label}
      </Link>
    );
  }

  const helperText = applied
    ? application?.summary ??
      "지원이 접수되었습니다. 학교 검토 후 진행 상태를 교사 홈에서 확인할 수 있습니다."
    : "지원 후 학교 검토가 시작되며, 수락 요청이나 추가 안내는 교사 홈에서 이어집니다.";

  return (
    <div className={cn(fullWidth ? "w-full" : "w-auto", showHelperText ? "space-y-3" : "")}>
      <button
        type="button"
        className={cn(
          baseButtonClassName,
          fullWidth ? "flex w-full" : "inline-flex",
          applied
            ? "bg-secondary-50 text-secondary-700"
            : "bg-[linear-gradient(135deg,#0058be,#2170e4)] text-white shadow-soft hover:opacity-95",
          className,
        )}
        disabled={applied}
        onClick={() => applyToJob(jobId)}
      >
        {applied ? (
          <>
            <CheckCircle2 className="h-4 w-4" />
            지원 완료
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            지원하기
          </>
        )}
      </button>

      {showHelperText ? (
        <div className="space-y-3">
          <div
            className={cn(
              "rounded-lg px-4 py-3 text-sm leading-6",
              applied
                ? "bg-secondary-50 text-secondary-700"
                : "bg-surface-subtle text-ink-soft",
            )}
          >
            {helperText}
          </div>

          {application &&
          !["withdrawn", "rejected", "hired"].includes(application.status) ? (
            <button
              type="button"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-outline bg-white px-4 py-3 text-sm font-semibold text-ink-soft"
              onClick={() => withdrawApplication(application.id)}
            >
              <RotateCcw className="h-4 w-4" />
              지원 취소
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
