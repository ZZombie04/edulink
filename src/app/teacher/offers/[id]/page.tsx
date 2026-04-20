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
import {
  getJobById,
  getTeacherById,
  getTeacherOfferById,
} from "@/lib/demo-data";
import {
  getOfferStatusSummary,
  getResolvedTeacherOffersForTeacher,
  resolveTeacherOfferStatus,
  useDemoHiringState,
} from "@/lib/demo-hiring-state";

const navItems = [
  { href: "/teacher/dashboard", label: "내 홈", icon: LayoutDashboard, active: true },
  { href: "/jobs", label: "채용 공고", icon: Briefcase },
  { href: "/", label: "메인", icon: Home },
];

export default function TeacherOfferDetailPage() {
  const params = useParams<{ id: string }>();
  const { setOfferStatus, state } = useDemoHiringState();
  const offer = getTeacherOfferById(Number(params.id));

  if (!offer) {
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

  const job = getJobById(offer.jobId);
  const teacher = getTeacherById(offer.teacherId);
  const offerStatus = resolveTeacherOfferStatus(offer, state);
  const pendingOfferCount = getResolvedTeacherOffersForTeacher(
    offer.teacherId,
    state,
  ).filter((item) => item.status === "pending").length;
  const statusSummary = getOfferStatusSummary(offerStatus, offer.summary);
  const responseSummary =
    offerStatus === "accepted"
      ? "수락을 완료했습니다. 학교가 다음 절차를 이어갈 수 있도록 응답 상태가 반영되었습니다."
      : offerStatus === "rejected"
        ? "이번 제안은 보류로 정리되었습니다. 다른 채용 제안은 계속 검토할 수 있습니다."
        : "공고 상세를 확인한 뒤 수락 또는 보류를 선택해 응답을 완료할 수 있습니다.";

  return (
    <PortalShell
      navItems={navItems}
      noticeCount={pendingOfferCount}
      primaryAction={{ href: "/jobs", label: "채용 공고 보기", icon: Briefcase }}
      sectionLabel="제안 상세"
      user={{
        name: teacher?.name ?? "박서영",
        role: "등록 교사",
        detail: teacher?.qualification ?? "초등 2급 정교사",
        avatarPreset: teacher?.avatarPreset ?? "teacher-f-mint",
      }}
    >
      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
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
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                offerStatus === "accepted"
                  ? "bg-secondary-50 text-secondary-700"
                  : offerStatus === "rejected"
                    ? "bg-[var(--danger-soft)] text-[#9c2f24]"
                    : "bg-[var(--warning-soft)] text-[#9a6a00]"
              }`}
            >
              {offerStatus === "accepted"
                ? "응답 완료"
                : offerStatus === "rejected"
                  ? "검토 종료"
                  : "검토 필요"}
            </span>
            <h1 className="mt-4 text-3xl font-bold text-ink">{offer.schoolName}</h1>
            <div className="mt-2 text-lg font-semibold text-primary-700">
              {offer.position}
            </div>
            <p className="mt-4 text-sm leading-7 text-ink-soft">{offer.message}</p>
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
                {offer.period}
              </div>
            </div>
          </div>

          {job ? (
            <div className="mt-6 rounded-lg border border-outline bg-white p-5">
              <div className="text-lg font-bold text-ink">연결된 채용 공고</div>
              <div className="mt-3 text-sm font-semibold text-primary-700">
                {job.schoolName} / {job.gradeLevel}
              </div>
              <p className="mt-2 text-sm leading-6 text-ink-soft">{job.summary}</p>
              <Link
                href={`/jobs/${job.id}`}
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
              받은 시각 {offer.receivedAt}
            </div>
            <div className="rounded-lg bg-surface-subtle px-4 py-3 text-sm text-ink-soft">
              상태 요약 {statusSummary}
            </div>
            <div className="rounded-lg bg-surface-subtle px-4 py-3 text-sm text-ink-soft">
              다음 행동 {responseSummary}
            </div>
          </div>

          {offerStatus === "pending" ? (
            <div className="mt-6 grid gap-3">
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[linear-gradient(135deg,#0058be,#2170e4)] px-4 py-3 text-sm font-semibold text-white shadow-soft"
                onClick={() => setOfferStatus(offer.id, "accepted")}
              >
                <CheckCircle2 className="h-4 w-4" />
                제안 수락
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-outline bg-white px-4 py-3 text-sm font-semibold text-ink-soft"
                onClick={() => setOfferStatus(offer.id, "rejected")}
              >
                <XCircle className="h-4 w-4" />
                이번 제안 보류
              </button>
            </div>
          ) : (
            <div
              className={`mt-6 rounded-lg px-4 py-3 text-sm ${
                offerStatus === "accepted"
                  ? "bg-secondary-50 text-secondary-700"
                  : "bg-[var(--danger-soft)] text-[#9c2f24]"
              }`}
            >
              {offerStatus === "accepted"
                ? "응답 완료 상태입니다. 학교가 다음 절차를 이어갈 수 있습니다."
                : "이번 제안은 진행하지 않기로 기록되었습니다."}
            </div>
          )}
        </div>
      </section>
    </PortalShell>
  );
}
