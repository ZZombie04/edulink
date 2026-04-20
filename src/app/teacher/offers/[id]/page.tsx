"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  Home,
  LayoutDashboard,
  MapPin,
  XCircle,
} from "lucide-react";
import { useParams } from "next/navigation";

import { PortalShell } from "@/components/portal-shell";
import { featuredTeachers } from "@/lib/demo-data";
import { useDemoHiringState } from "@/lib/demo-hiring-state";

const navItems = [
  { href: "/teacher/dashboard", label: "내 홈", icon: LayoutDashboard, active: true },
  { href: "/jobs", label: "채용 공고", icon: Briefcase },
  { href: "/", label: "메인", icon: Home },
];

function offerTone(status: string) {
  switch (status) {
    case "accepted":
      return {
        label: "응답 완료",
        className: "bg-secondary-50 text-secondary-700",
      };
    case "rejected":
      return {
        label: "검토 종료",
        className: "bg-[var(--danger-soft)] text-[#9c2f24]",
      };
    case "cancelled":
      return {
        label: "요청 취소",
        className: "bg-surface-panel text-ink-soft",
      };
    default:
      return {
        label: "응답 대기",
        className: "bg-[var(--warning-soft)] text-[#9a6a00]",
      };
  }
}

export default function TeacherOfferDetailPage() {
  const params = useParams<{ id: string }>();
  const teacher = featuredTeachers[0];
  const { getPoolRequestById, getTeacherOffersForTeacher, setPoolRequestStatus } =
    useDemoHiringState();
  const offer = getPoolRequestById(Number(params.id));

  if (!offer || offer.teacherId !== teacher.id) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface px-4 text-center">
        <div>
          <div className="text-2xl font-bold text-ink">제안 정보를 찾을 수 없습니다.</div>
          <Link
            href="/teacher/dashboard"
            className="mt-4 inline-flex text-sm font-semibold text-primary-700"
          >
            교사 홈으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const pendingOfferCount = getTeacherOffersForTeacher(teacher.id).filter(
    (item) => item.status === "pending",
  ).length;
  const tone = offerTone(offer.status);
  const responseSummary =
    offer.status === "accepted"
      ? "제안을 수락했고 학교 담당자가 면접 또는 후속 절차를 이어갈 수 있습니다."
      : offer.status === "rejected"
        ? "이번 제안은 보류로 정리되었고 다른 공고나 제안은 계속 검토할 수 있습니다."
        : offer.status === "cancelled"
          ? "학교 담당자가 이 요청을 취소했습니다. 다른 제안은 계속 확인할 수 있습니다."
          : "공고와 근무 조건을 확인한 뒤 수락 또는 보류로 응답할 수 있습니다.";

  return (
    <PortalShell
      navItems={navItems}
      noticeCount={pendingOfferCount}
      primaryAction={{ href: "/jobs", label: "채용 공고 보기", icon: Briefcase }}
      sectionLabel="제안 상세"
      user={{
        name: teacher.name,
        role: "등록 교사",
        detail: teacher.qualification,
        avatarPreset: teacher.avatarPreset,
      }}
    >
      <section className="grid gap-6 xl:grid-cols-[1.06fr_0.94fr]">
        <div className="panel-surface p-6">
          <Link
            href="/teacher/dashboard"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary-700"
          >
            <ArrowLeft className="h-4 w-4" />
            교사 홈으로 돌아가기
          </Link>

          <div className="mt-6">
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tone.className}`}
            >
              {tone.label}
            </span>
            <h1 className="mt-4 break-keep text-3xl font-bold text-ink">
              {offer.schoolName}
            </h1>
            <div className="mt-2 break-keep text-lg font-semibold text-primary-700">
              {offer.position}
            </div>
            <p className="mt-4 break-keep text-sm leading-7 text-ink-soft">
              {offer.message}
            </p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg bg-surface-subtle px-4 py-3 text-sm text-ink-soft">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary-600" />
                {offer.region}
              </div>
            </div>
            <div className="rounded-lg bg-surface-subtle px-4 py-3 text-sm text-ink-soft">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary-600" />
                {offer.sentAt}
              </div>
            </div>
          </div>

          {offer.job ? (
            <div className="mt-6 rounded-lg border border-outline bg-white p-5">
              <div className="text-lg font-bold text-ink">연결된 채용 공고</div>
              <div className="mt-3 break-keep text-sm font-semibold text-primary-700">
                {offer.job.schoolName} / {offer.job.gradeLevel}
              </div>
              <p className="mt-2 break-keep text-sm leading-6 text-ink-soft">
                {offer.job.summary}
              </p>
              <Link
                href={`/jobs/${offer.job.id}`}
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary-700"
              >
                공고 상세 보기
              </Link>
            </div>
          ) : null}
        </div>

        <div className="panel-surface p-6">
          <div className="text-xl font-bold text-ink">응답 처리</div>
          <div className="mt-4 space-y-3">
            <div className="rounded-lg bg-surface-subtle px-4 py-3 text-sm text-ink-soft">
              상태 요약 {offer.summary}
            </div>
            <div className="rounded-lg bg-surface-subtle px-4 py-3 break-keep text-sm text-ink-soft">
              다음 행동 {responseSummary}
            </div>
            {offer.interview ? (
              <div className="rounded-lg bg-primary-50 px-4 py-3 text-sm text-primary-700">
                <div className="font-semibold">학교 면접 요청</div>
                <div className="mt-2">
                  {offer.interview.date} {offer.interview.time}
                </div>
                <div className="mt-1">{offer.interview.place}</div>
                <div className="mt-2 break-keep text-primary-700/80">
                  {offer.interview.note}
                </div>
              </div>
            ) : null}
          </div>

          {offer.status === "pending" ? (
            <div className="mt-6 grid gap-3">
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[linear-gradient(135deg,#0058be,#2170e4)] px-4 py-3 text-sm font-semibold text-white shadow-soft"
                onClick={() => setPoolRequestStatus(offer.id, "accepted")}
              >
                <CheckCircle2 className="h-4 w-4" />
                제안 수락
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-outline bg-white px-4 py-3 text-sm font-semibold text-ink-soft"
                onClick={() => setPoolRequestStatus(offer.id, "rejected")}
              >
                <XCircle className="h-4 w-4" />
                이번 제안 보류
              </button>
            </div>
          ) : (
            <div
              className={`mt-6 rounded-lg px-4 py-3 text-sm ${
                offer.status === "accepted"
                  ? "bg-secondary-50 text-secondary-700"
                  : offer.status === "cancelled"
                    ? "bg-surface-subtle text-ink-soft"
                    : "bg-[var(--danger-soft)] text-[#9c2f24]"
              }`}
            >
              {offer.status === "accepted"
                ? "응답 완료 상태입니다. 학교가 후속 절차를 이어갈 수 있습니다."
                : offer.status === "cancelled"
                  ? "학교 담당자가 요청을 취소한 상태입니다."
                  : "이번 제안은 진행하지 않기로 기록되었습니다."}
            </div>
          )}
        </div>
      </section>
    </PortalShell>
  );
}
