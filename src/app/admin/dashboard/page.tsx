"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Briefcase,
  CheckCircle2,
  ChevronRight,
  Home,
  LayoutDashboard,
  LoaderCircle,
  Search,
  ShieldCheck,
  Star,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react";

import { HiringStateError } from "@/components/hiring-state-error";
import { PortalShell } from "@/components/portal-shell";
import { useDemoHiringState } from "@/lib/demo-hiring-state";
import { useDemoSession } from "@/lib/demo-session-client";

const navItems = [
  {
    href: "/admin/dashboard",
    label: "운영 개요",
    icon: LayoutDashboard,
    active: true,
  },
  { href: "/jobs", label: "채용 공고", icon: Briefcase },
  { href: "/", label: "메인", icon: Home },
];

type ApprovalStatus = "pending" | "approved" | "rejected";

interface HrApproval {
  createdAt: string;
  department: string | null;
  email: string;
  id: string;
  name: string;
  phone: string;
  position: string;
  rejectionReason: string | null;
  schoolAddress: string;
  schoolCode: string;
  schoolName: string;
  schoolRegion: string;
  schoolType: string;
  status: ApprovalStatus;
  verificationCode: string;
}

interface TeacherReview {
  comment: string | null;
  contract: {
    endDate: string;
    id: string;
    schoolName: string;
    startDate: string;
  };
  createdAt: string;
  hr: {
    id: string;
    name: string;
    schoolName: string;
  };
  id: string;
  rating: number;
  teacher: {
    averageRating?: number;
    demoId: number | null;
    email: string;
    id: string;
    name: string;
    reviewCount?: number;
  };
  updatedAt: string;
}

async function readApi<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: "no-store" });
  const payload = (await response.json().catch(() => null)) as
    | (T & { message?: string })
    | null;

  if (!response.ok || !payload) {
    throw new Error(payload?.message ?? "운영 데이터를 불러오지 못했습니다.");
  }

  return payload;
}

function statusTone(status: ApprovalStatus) {
  switch (status) {
    case "approved":
      return {
        label: "승인 완료",
        className: "border-[#b9cec1] bg-[#edf4ef] text-[#1f6248]",
      };
    case "rejected":
      return {
        label: "반려",
        className: "border-[#e4b8ae] bg-[#fff3f0] text-[#8b3328]",
      };
    default:
      return {
        label: "승인 대기",
        className: "border-[#e6d1a2] bg-[#fff7e6] text-[#865d13]",
      };
  }
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <span
      aria-label={`별점 ${rating}점`}
      className="inline-flex items-center gap-0.5 text-[#9b6d18]"
    >
      {[1, 2, 3, 4, 5].map((value) => (
        <Star
          key={value}
          aria-hidden="true"
          className={`h-4 w-4 ${value <= rating ? "fill-current" : "text-[#d7d3c8]"}`}
        />
      ))}
    </span>
  );
}

export default function AdminDashboardPage() {
  const session = useDemoSession();
  const {
    jobs,
    loaded: hiringLoaded,
    loadError: hiringLoadError,
    refresh: refreshHiringState,
  } = useDemoHiringState();
  const [activeWorkspace, setActiveWorkspace] = useState<
    "approvals" | "reviews"
  >("approvals");
  const [approvals, setApprovals] = useState<HrApproval[]>([]);
  const [reviews, setReviews] = useState<TeacherReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [query, setQuery] = useState("");
  const [approvalFilter, setApprovalFilter] = useState<
    "all" | ApprovalStatus
  >("pending");
  const [ratingFilter, setRatingFilter] = useState(0);
  const [selectedApprovalId, setSelectedApprovalId] = useState<string | null>(
    null,
  );
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [pendingAction, setPendingAction] = useState("");
  const [feedback, setFeedback] = useState<{
    tone: "error" | "success";
    message: string;
  } | null>(null);

  const loadAdminData = useCallback(async () => {
    setLoading(true);
    setLoadError("");

    try {
      const [approvalPayload, reviewPayload] = await Promise.all([
        readApi<{ approvals: HrApproval[] }>("/api/admin/hr-approvals"),
        readApi<{ reviews: TeacherReview[] }>("/api/reviews"),
      ]);
      setApprovals(approvalPayload.approvals);
      setReviews(reviewPayload.reviews);
      setSelectedApprovalId((current) => {
        if (
          current &&
          approvalPayload.approvals.some((approval) => approval.id === current)
        ) {
          return current;
        }
        return (
          approvalPayload.approvals.find(
            (approval) => approval.status === "pending",
          )?.id ??
          approvalPayload.approvals[0]?.id ??
          null
        );
      });
      setSelectedReviewId((current) => {
        if (
          current &&
          reviewPayload.reviews.some((review) => review.id === current)
        ) {
          return current;
        }
        return reviewPayload.reviews[0]?.id ?? null;
      });
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "운영 데이터를 불러오지 못했습니다.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      void loadAdminData();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [loadAdminData]);

  const filteredApprovals = useMemo(() => {
    const lowered = query.trim().toLowerCase();
    return approvals.filter((approval) => {
      const matchesStatus =
        approvalFilter === "all" || approval.status === approvalFilter;
      const matchesQuery =
        lowered.length === 0 ||
        [
          approval.name,
          approval.email,
          approval.schoolName,
          approval.schoolCode,
          approval.schoolRegion,
          approval.position,
        ]
          .join(" ")
          .toLowerCase()
          .includes(lowered);
      return matchesStatus && matchesQuery;
    });
  }, [approvalFilter, approvals, query]);

  const filteredReviews = useMemo(() => {
    const lowered = query.trim().toLowerCase();
    return reviews.filter((review) => {
      const matchesRating =
        ratingFilter === 0 || review.rating >= ratingFilter;
      const matchesQuery =
        lowered.length === 0 ||
        [
          review.teacher.name,
          review.teacher.email,
          review.hr.name,
          review.hr.schoolName,
          review.contract.schoolName,
          review.comment,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(lowered);
      return matchesRating && matchesQuery;
    });
  }, [query, ratingFilter, reviews]);

  const selectedApproval =
    filteredApprovals.find(
      (approval) => approval.id === selectedApprovalId,
    ) ??
    filteredApprovals[0] ??
    null;
  const selectedReview =
    filteredReviews.find((review) => review.id === selectedReviewId) ??
    filteredReviews[0] ??
    null;
  const pendingApprovals = approvals.filter(
    (approval) => approval.status === "pending",
  );
  const reviewedTeacherCount = new Set(
    reviews.map((review) => review.teacher.id),
  ).size;

  const decideApproval = async (decision: "approve" | "reject") => {
    if (!selectedApproval) {
      return;
    }
    if (decision === "reject" && !rejectionReason.trim()) {
      setFeedback({
        tone: "error",
        message: "반려 사유를 입력해 주세요.",
      });
      return;
    }

    setFeedback(null);
    setPendingAction(decision);

    try {
      const response = await fetch("/api/admin/hr-approvals", {
        body: JSON.stringify({
          decision,
          id: selectedApproval.id,
          rejectionReason:
            decision === "reject" ? rejectionReason.trim() : undefined,
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const payload = (await response.json().catch(() => null)) as
        | { message?: string }
        | null;
      if (!response.ok) {
        throw new Error(
          payload?.message ?? "학교 계정 신청을 처리하지 못했습니다.",
        );
      }

      setFeedback({
        tone: "success",
        message:
          decision === "approve"
            ? `${selectedApproval.schoolName} 계정을 승인했습니다.`
            : `${selectedApproval.schoolName} 계정을 반려했습니다.`,
      });
      setRejectionReason("");
      await loadAdminData();
    } catch (error) {
      setFeedback({
        tone: "error",
        message:
          error instanceof Error
            ? error.message
            : "학교 계정 신청을 처리하지 못했습니다.",
      });
    } finally {
      setPendingAction("");
    }
  };

  return (
    <PortalShell
      navItems={navItems}
      noticeCount={pendingApprovals.length}
      primaryAction={{
        href: "/admin/dashboard",
        label: "운영 작업함",
        icon: ShieldCheck,
      }}
      sectionLabel="운영 관리자"
      user={{
        name: session?.name ?? "EduLink 관리자",
        role: "시스템 운영",
        detail: session?.detail ?? "승인 및 품질 관리",
      }}
    >
      {hiringLoadError ? (
        <div className="mb-5">
          <HiringStateError
            message={hiringLoadError}
            onRetry={refreshHiringState}
          />
        </div>
      ) : null}

      <section className="border-b border-[#dcd9d0] pb-7">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0b4a37]">
              ADMIN CONTROL
            </div>
            <h1 className="mt-3 text-3xl font-bold tracking-[-0.03em] text-[#17231e] sm:text-4xl">
              운영 관리
            </h1>
            <p className="mt-3 max-w-2xl break-keep text-sm leading-7 text-[#65706a]">
              실제 학교 계정 신청을 검토하고, 채용 완료 후 제출된 교사 평가는
              관리자 권한에서만 확인합니다.
            </p>
          </div>

          <button
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[#d3d0c7] bg-white px-4 py-2 text-sm font-semibold text-[#0b4a37] hover:bg-[#f0eee8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b4a37] disabled:opacity-60"
            disabled={loading}
            onClick={() => void loadAdminData()}
            type="button"
          >
            {loading ? (
              <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" />
            ) : (
              <ShieldCheck aria-hidden="true" className="h-4 w-4" />
            )}
            최신 데이터 확인
          </button>
        </div>
      </section>

      {feedback ? (
        <div
          className={`mt-5 flex items-start gap-2 rounded-md border px-4 py-3 text-sm ${
            feedback.tone === "error"
              ? "border-[#e4b8ae] bg-[#fff3f0] text-[#8b3328]"
              : "border-[#b9cec1] bg-[#edf4ef] text-[#1f6248]"
          }`}
          role={feedback.tone === "error" ? "alert" : "status"}
        >
          {feedback.tone === "error" ? (
            <AlertCircle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
          ) : (
            <CheckCircle2 aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
          )}
          {feedback.message}
        </div>
      ) : null}

      {loadError ? (
        <div
          className="mt-5 rounded-md border border-[#e4b8ae] bg-[#fff3f0] p-5 text-sm text-[#8b3328]"
          role="alert"
        >
          <div className="flex items-start gap-2">
            <AlertCircle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <div className="font-semibold">운영 데이터를 불러오지 못했습니다</div>
              <div className="mt-1">{loadError}</div>
            </div>
          </div>
          <button
            className="mt-4 rounded-md border border-[#d9a79c] bg-white px-3 py-2 font-semibold"
            onClick={() => void loadAdminData()}
            type="button"
          >
            다시 시도
          </button>
        </div>
      ) : null}

      <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "승인 대기 학교",
            value: pendingApprovals.length,
            unit: "건",
            Icon: ShieldCheck,
          },
          {
            label: "등록 학교 계정",
            value: approvals.length,
            unit: "개",
            Icon: UserCheck,
          },
          {
            label: "활성 채용 공고",
            value: jobs.filter((job) => job.status !== "closed").length,
            unit: "건",
            Icon: Briefcase,
          },
          {
            label: "평가 등록 교사",
            value: reviewedTeacherCount,
            unit: "명",
            Icon: Users,
          },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-md border border-[#dedbd2] bg-[#fbfaf6] p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm text-[#737b77]">{item.label}</div>
                <div className="mt-2 text-2xl font-bold text-[#17231e]">
                  {loading || !hiringLoaded ? "—" : item.value}
                  <span className="ml-0.5 text-sm font-medium text-[#737b77]">
                    {loading || !hiringLoaded ? "" : item.unit}
                  </span>
                </div>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#e8f0eb] text-[#0b4a37]">
                <item.Icon aria-hidden="true" className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="mt-6 overflow-hidden rounded-md border border-[#d7d4cb] bg-[#fbfaf6]">
        <div className="flex flex-col gap-4 border-b border-[#dedbd2] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex gap-1" role="tablist" aria-label="관리자 작업">
            <button
              aria-selected={activeWorkspace === "approvals"}
              className={`relative min-h-10 rounded-md px-4 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b4a37] ${
                activeWorkspace === "approvals"
                  ? "bg-[#0b4a37] text-white"
                  : "text-[#5c6660] hover:bg-[#f0eee8]"
              }`}
              onClick={() => {
                setActiveWorkspace("approvals");
                setQuery("");
              }}
              role="tab"
              type="button"
            >
              학교 승인
              {pendingApprovals.length > 0 ? (
                <span className="ml-2 rounded-full bg-white/18 px-1.5 py-0.5 text-[10px]">
                  {pendingApprovals.length}
                </span>
              ) : null}
            </button>
            <button
              aria-selected={activeWorkspace === "reviews"}
              className={`min-h-10 rounded-md px-4 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b4a37] ${
                activeWorkspace === "reviews"
                  ? "bg-[#0b4a37] text-white"
                  : "text-[#5c6660] hover:bg-[#f0eee8]"
              }`}
              onClick={() => {
                setActiveWorkspace("reviews");
                setQuery("");
              }}
              role="tab"
              type="button"
            >
              비공개 교사 평가
            </button>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#78807c]"
              />
              <label className="sr-only" htmlFor="admin-search">
                관리자 데이터 검색
              </label>
              <input
                id="admin-search"
                className="h-10 w-full rounded-md border border-[#d6d3ca] bg-white pl-10 pr-3 text-sm outline-none placeholder:text-[#858c88] focus:border-[#0b4a37] focus:ring-2 focus:ring-[#0b4a37]/15 sm:w-72"
                onChange={(event) => setQuery(event.target.value)}
                placeholder={
                  activeWorkspace === "approvals"
                    ? "학교명, 담당자, 코드 검색"
                    : "교사명, 학교명, 평가 내용 검색"
                }
                type="search"
                value={query}
              />
            </div>
            {activeWorkspace === "approvals" ? (
              <label>
                <span className="sr-only">승인 상태 필터</span>
                <select
                  className="h-10 rounded-md border border-[#d6d3ca] bg-white px-3 text-sm text-[#4f5954] outline-none focus:border-[#0b4a37] focus:ring-2 focus:ring-[#0b4a37]/15"
                  onChange={(event) =>
                    setApprovalFilter(
                      event.target.value as "all" | ApprovalStatus,
                    )
                  }
                  value={approvalFilter}
                >
                  <option value="pending">승인 대기</option>
                  <option value="approved">승인 완료</option>
                  <option value="rejected">반려</option>
                  <option value="all">전체 상태</option>
                </select>
              </label>
            ) : (
              <label>
                <span className="sr-only">최소 별점 필터</span>
                <select
                  className="h-10 rounded-md border border-[#d6d3ca] bg-white px-3 text-sm text-[#4f5954] outline-none focus:border-[#0b4a37] focus:ring-2 focus:ring-[#0b4a37]/15"
                  onChange={(event) => setRatingFilter(Number(event.target.value))}
                  value={ratingFilter}
                >
                  <option value={0}>전체 별점</option>
                  <option value={5}>5점</option>
                  <option value={4}>4점 이상</option>
                  <option value={3}>3점 이상</option>
                </select>
              </label>
            )}
          </div>
        </div>

        {loading ? (
          <div aria-live="polite" className="grid min-h-[420px] gap-px bg-[#dedbd2] lg:grid-cols-[minmax(0,1fr)_420px]">
            <div className="animate-pulse bg-[#fbfaf6] p-6" />
            <div className="animate-pulse bg-[#f4f2ec] p-6" />
            <span className="sr-only">관리자 작업 데이터를 불러오는 중입니다.</span>
          </div>
        ) : activeWorkspace === "approvals" ? (
          <div
            className="grid min-h-[460px] gap-px bg-[#dedbd2] lg:grid-cols-[minmax(0,1fr)_420px]"
            role="tabpanel"
          >
            <div className="bg-[#fbfaf6]">
              {filteredApprovals.length === 0 ? (
                <div className="flex min-h-[460px] flex-col items-center justify-center px-6 text-center">
                  <UserCheck aria-hidden="true" className="h-8 w-8 text-[#7a827e]" />
                  <h2 className="mt-4 font-semibold text-[#344039]">
                    조건에 맞는 학교 신청이 없습니다
                  </h2>
                  <p className="mt-2 text-sm text-[#707874]">
                    상태 필터나 검색어를 변경해 보세요.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[#e1ded6]">
                  {filteredApprovals.map((approval) => {
                    const tone = statusTone(approval.status);
                    return (
                      <button
                        key={approval.id}
                        aria-pressed={selectedApproval?.id === approval.id}
                        className={`flex w-full items-start gap-4 p-5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0b4a37] ${
                          selectedApproval?.id === approval.id
                            ? "bg-[#edf2ef]"
                            : "hover:bg-[#f5f3ed]"
                        }`}
                        onClick={() => {
                          setSelectedApprovalId(approval.id);
                          setRejectionReason("");
                          setFeedback(null);
                        }}
                        type="button"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#e8f0eb] text-sm font-bold text-[#0b4a37]">
                          {approval.schoolName.slice(0, 1)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-[#26322d]">
                              {approval.schoolName}
                            </span>
                            <span
                              className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${tone.className}`}
                            >
                              {tone.label}
                            </span>
                          </div>
                          <p className="mt-1 truncate text-sm text-[#65706a]">
                            {approval.name} · {approval.position}
                          </p>
                          <p className="mt-1 text-xs text-[#828985]">
                            {approval.schoolRegion} ·{" "}
                            {new Date(approval.createdAt).toLocaleDateString(
                              "ko-KR",
                            )}
                          </p>
                        </div>
                        <ChevronRight
                          aria-hidden="true"
                          className="mt-2 h-4 w-4 shrink-0 text-[#8a918d]"
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <aside className="bg-[#f7f5ef] p-6">
              {selectedApproval ? (
                <>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#0b4a37]">
                        SCHOOL ACCOUNT
                      </div>
                      <h2 className="mt-2 text-xl font-bold text-[#17231e]">
                        {selectedApproval.schoolName}
                      </h2>
                      <p className="mt-1 text-sm text-[#66706a]">
                        {selectedApproval.schoolType} ·{" "}
                        {selectedApproval.schoolRegion}
                      </p>
                    </div>
                    <span
                      className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusTone(selectedApproval.status).className}`}
                    >
                      {statusTone(selectedApproval.status).label}
                    </span>
                  </div>

                  <dl className="mt-6 divide-y divide-[#dedbd2] text-sm">
                    {[
                      ["담당자", selectedApproval.name],
                      ["직위·부서", [selectedApproval.position, selectedApproval.department].filter(Boolean).join(" · ")],
                      ["기관 이메일", selectedApproval.email],
                      ["연락처", selectedApproval.phone],
                      ["학교 코드", selectedApproval.schoolCode],
                      ["학교 주소", selectedApproval.schoolAddress],
                      ["인증 코드", selectedApproval.verificationCode],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="grid gap-1 py-3 first:pt-0 sm:grid-cols-[100px_1fr]"
                      >
                        <dt className="text-[#7a827e]">{label}</dt>
                        <dd className="break-all font-medium text-[#344039]">
                          {value || "—"}
                        </dd>
                      </div>
                    ))}
                  </dl>

                  {selectedApproval.status === "pending" ? (
                    <div className="mt-6 space-y-3 border-t border-[#dedbd2] pt-5">
                      <label className="block" htmlFor="rejection-reason">
                        <span className="mb-2 block text-sm font-semibold text-[#344039]">
                          반려 사유
                          <span className="ml-1 font-normal text-[#858c88]">
                            반려 시 필수
                          </span>
                        </span>
                        <textarea
                          id="rejection-reason"
                          className="min-h-24 w-full resize-y rounded-md border border-[#d6d3ca] bg-white px-3 py-3 text-sm leading-6 outline-none placeholder:text-[#858c88] focus:border-[#0b4a37] focus:ring-2 focus:ring-[#0b4a37]/15"
                          onChange={(event) =>
                            setRejectionReason(event.target.value)
                          }
                          placeholder="학교 정보 또는 신청 서류의 보완 사항을 입력하세요."
                          value={rejectionReason}
                        />
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#0b4a37] px-4 py-2 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b4a37] focus-visible:ring-offset-2 disabled:opacity-60"
                          disabled={Boolean(pendingAction)}
                          onClick={() => void decideApproval("approve")}
                          type="button"
                        >
                          {pendingAction === "approve" ? (
                            <LoaderCircle
                              aria-hidden="true"
                              className="h-4 w-4 animate-spin"
                            />
                          ) : (
                            <CheckCircle2
                              aria-hidden="true"
                              className="h-4 w-4"
                            />
                          )}
                          승인
                        </button>
                        <button
                          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[#d9a79c] bg-white px-4 py-2 text-sm font-semibold text-[#8b3328] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b3328] disabled:opacity-60"
                          disabled={Boolean(pendingAction)}
                          onClick={() => void decideApproval("reject")}
                          type="button"
                        >
                          {pendingAction === "reject" ? (
                            <LoaderCircle
                              aria-hidden="true"
                              className="h-4 w-4 animate-spin"
                            />
                          ) : (
                            <XCircle aria-hidden="true" className="h-4 w-4" />
                          )}
                          반려
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-6 rounded-md border border-[#d8d5cc] bg-white px-4 py-3 text-sm text-[#59635d]">
                      {selectedApproval.status === "approved"
                        ? "승인 완료된 학교 계정입니다."
                        : `반려 사유: ${selectedApproval.rejectionReason ?? "기록 없음"}`}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex min-h-[380px] items-center justify-center text-sm text-[#707874]">
                  왼쪽에서 학교 신청을 선택하세요.
                </div>
              )}
            </aside>
          </div>
        ) : (
          <div
            className="grid min-h-[460px] gap-px bg-[#dedbd2] lg:grid-cols-[minmax(0,1fr)_420px]"
            role="tabpanel"
          >
            <div className="bg-[#fbfaf6]">
              {filteredReviews.length === 0 ? (
                <div className="flex min-h-[460px] flex-col items-center justify-center px-6 text-center">
                  <Star aria-hidden="true" className="h-8 w-8 text-[#7a827e]" />
                  <h2 className="mt-4 font-semibold text-[#344039]">
                    등록된 교사 평가가 없습니다
                  </h2>
                  <p className="mt-2 max-w-sm break-keep text-sm leading-6 text-[#707874]">
                    채용과 계약 관계가 확인된 학교가 평가를 제출하면 여기에
                    표시됩니다.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[#e1ded6]">
                  {filteredReviews.map((review) => (
                    <button
                      key={review.id}
                      aria-pressed={selectedReview?.id === review.id}
                      className={`flex w-full items-start gap-4 p-5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0b4a37] ${
                        selectedReview?.id === review.id
                          ? "bg-[#edf2ef]"
                          : "hover:bg-[#f5f3ed]"
                      }`}
                      onClick={() => setSelectedReviewId(review.id)}
                      type="button"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e8f0eb] text-sm font-bold text-[#0b4a37]">
                        {review.teacher.name.slice(0, 1)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-[#26322d]">
                            {review.teacher.name}
                          </span>
                          <RatingStars rating={review.rating} />
                        </div>
                        <p className="mt-1 truncate text-sm text-[#65706a]">
                          {review.hr.schoolName} · {review.hr.name}
                        </p>
                        <p className="mt-1 line-clamp-1 text-xs text-[#828985]">
                          {review.comment || "서술형 평가 없음"}
                        </p>
                      </div>
                      <ChevronRight
                        aria-hidden="true"
                        className="mt-2 h-4 w-4 shrink-0 text-[#8a918d]"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <aside className="bg-[#f7f5ef] p-6">
              {selectedReview ? (
                <>
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#0b4a37]">
                    PRIVATE REVIEW
                  </div>
                  <h2 className="mt-2 text-xl font-bold text-[#17231e]">
                    {selectedReview.teacher.name}
                  </h2>
                  <p className="mt-1 text-sm text-[#65706a]">
                    {selectedReview.teacher.email}
                  </p>

                  <div className="mt-5 rounded-md border border-[#d8d5cc] bg-white p-4">
                    <div className="flex items-center justify-between gap-4">
                      <RatingStars rating={selectedReview.rating} />
                      <span className="text-2xl font-bold text-[#17231e]">
                        {selectedReview.rating}.0
                      </span>
                    </div>
                    <div className="mt-3 text-xs text-[#7a827e]">
                      이 교사 평균{" "}
                      {selectedReview.teacher.averageRating?.toFixed(1) ??
                        selectedReview.rating.toFixed(1)}
                      점 · 평가{" "}
                      {selectedReview.teacher.reviewCount ?? 1}건
                    </div>
                  </div>

                  <div className="mt-5">
                    <h3 className="text-sm font-semibold text-[#344039]">
                      학교 평가 내용
                    </h3>
                    <p className="mt-2 whitespace-pre-wrap break-keep rounded-md border border-[#dedbd2] bg-white p-4 text-sm leading-7 text-[#59635d]">
                      {selectedReview.comment || "서술형 평가가 등록되지 않았습니다."}
                    </p>
                  </div>

                  <dl className="mt-5 divide-y divide-[#dedbd2] text-sm">
                    {[
                      ["평가 학교", selectedReview.hr.schoolName],
                      ["작성 담당자", selectedReview.hr.name],
                      ["계약 학교", selectedReview.contract.schoolName],
                      [
                        "계약 기간",
                        `${selectedReview.contract.startDate} — ${selectedReview.contract.endDate}`,
                      ],
                      [
                        "작성일",
                        new Date(selectedReview.createdAt).toLocaleDateString(
                          "ko-KR",
                        ),
                      ],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="grid gap-1 py-3 first:pt-0 sm:grid-cols-[90px_1fr]"
                      >
                        <dt className="text-[#7a827e]">{label}</dt>
                        <dd className="font-medium text-[#344039]">{value}</dd>
                      </div>
                    ))}
                  </dl>

                  <div className="mt-5 rounded-md border border-[#c7d3cc] bg-[#edf2ef] px-4 py-3 text-xs leading-5 text-[#456053]">
                    이 평가는 관리자 전용 정보이며 교사·학교 인력풀·공개 공고
                    화면에는 노출되지 않습니다.
                  </div>
                </>
              ) : (
                <div className="flex min-h-[380px] items-center justify-center text-sm text-[#707874]">
                  왼쪽에서 교사 평가를 선택하세요.
                </div>
              )}
            </aside>
          </div>
        )}
      </section>
    </PortalShell>
  );
}
