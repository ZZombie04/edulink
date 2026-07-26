"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, LoaderCircle, RotateCcw, Send } from "lucide-react";

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
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 py-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b4a37] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

export function JobApplyButton({
  className,
  dashboardHref,
  fullWidth = false,
  jobId,
  jobStatus,
  showHelperText = false,
  viewerRole,
}: JobApplyButtonProps) {
  const [pendingAction, setPendingAction] = useState<"apply" | "withdraw" | null>(
    null,
  );
  const [errorMessage, setErrorMessage] = useState("");
  const {
    applyToJob,
    loadError,
    state,
    withdrawApplication,
  } = useDemoHiringState();
  const application =
    state.applications.find(
      (item) => item.jobId === jobId && item.status !== "withdrawn",
    ) ?? null;
  const applied = application !== null;

  if (loadError) {
    return (
      <div className={cn(fullWidth ? "w-full" : "w-auto", "space-y-3")}>
        <button
          className={cn(
            baseButtonClassName,
            fullWidth ? "flex w-full" : "inline-flex",
            "bg-surface-subtle text-ink-muted",
            className,
          )}
          disabled
          type="button"
        >
          지원 상태 확인 실패
        </button>
        <div
          className="flex items-start gap-2 rounded-md border border-[#e4b8ae] bg-[#fff3f0] px-4 py-3 text-sm leading-6 text-[#8b3328]"
          role="alert"
        >
          <AlertCircle
            aria-hidden="true"
            className="mt-0.5 h-4 w-4 shrink-0"
          />
          {loadError}
        </div>
      </div>
    );
  }

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
          "bg-[#0b4a37] text-white shadow-[0_8px_20px_rgba(11,74,55,0.16)] hover:bg-[#083a2c]",
          className,
        )}
      >
        <Send aria-hidden="true" className="h-4 w-4" />
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
            ? "bg-[#e4eee7] text-[#0b4a37]"
            : "bg-[#0b4a37] text-white shadow-[0_8px_20px_rgba(11,74,55,0.16)] hover:bg-[#083a2c]",
          className,
        )}
        disabled={applied || pendingAction !== null}
        onClick={async () => {
          setErrorMessage("");
          setPendingAction("apply");

          try {
            await applyToJob(jobId);
          } catch (error) {
            setErrorMessage(
              error instanceof Error
                ? error.message
                : "지원서를 접수하지 못했습니다. 잠시 후 다시 시도해 주세요.",
            );
          } finally {
            setPendingAction(null);
          }
        }}
      >
        {pendingAction === "apply" ? (
          <>
            <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" />
            지원서 접수 중
          </>
        ) : applied ? (
          <>
            <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
            지원 완료
          </>
        ) : (
          <>
            <Send aria-hidden="true" className="h-4 w-4" />
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
                ? "border border-[#bfd0c5] bg-[#edf4ef] text-[#24533f]"
                : "border border-[#e0ddd4] bg-[#f4f2ec] text-[#59625d]",
            )}
            aria-live="polite"
          >
            {helperText}
          </div>

          {errorMessage ? (
            <div
              className="flex items-start gap-2 rounded-md border border-[#e4b8ae] bg-[#fff3f0] px-4 py-3 text-sm leading-6 text-[#8b3328]"
              role="alert"
            >
              <AlertCircle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
              {errorMessage}
            </div>
          ) : null}

          {application &&
          !["withdrawn", "rejected", "hired"].includes(application.status) ? (
            <button
              type="button"
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-[#d8d5cc] bg-white px-4 py-3 text-sm font-semibold text-[#4d5852] transition-colors hover:border-[#b9b5aa] hover:bg-[#f7f5ef] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b4a37] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={pendingAction !== null}
              onClick={async () => {
                setErrorMessage("");
                setPendingAction("withdraw");

                try {
                  await withdrawApplication(application.id);
                } catch (error) {
                  setErrorMessage(
                    error instanceof Error
                      ? error.message
                      : "지원 취소를 처리하지 못했습니다.",
                  );
                } finally {
                  setPendingAction(null);
                }
              }}
            >
              {pendingAction === "withdraw" ? (
                <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" />
              ) : (
                <RotateCcw aria-hidden="true" className="h-4 w-4" />
              )}
              {pendingAction === "withdraw" ? "취소 처리 중" : "지원 취소"}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
