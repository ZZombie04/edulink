"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Briefcase,
  CalendarDays,
  Home,
  LayoutDashboard,
  MapPin,
} from "lucide-react";
import { useParams } from "next/navigation";

import { PortalShell } from "@/components/portal-shell";
import { getJobById, getTeacherOfferById } from "@/lib/demo-data";

const navItems = [
  { href: "/teacher/dashboard", label: "내 홈", icon: LayoutDashboard, active: true },
  { href: "/jobs", label: "채용 공고", icon: Briefcase },
  { href: "/", label: "메인", icon: Home },
];

export default function TeacherOfferDetailPage() {
  const params = useParams<{ id: string }>();
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

  return (
    <PortalShell
      navItems={navItems}
      noticeCount={1}
      primaryAction={{ href: "/jobs", label: "채용 공고 보기", icon: Briefcase }}
      sectionLabel="제안 상세"
      user={{
        name: "박서영",
        role: "등록 교사",
        detail: "초등 2급 정교사",
        avatarPreset: "teacher-f-mint",
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
                offer.status === "accepted"
                  ? "bg-secondary-50 text-secondary-700"
                  : offer.status === "rejected"
                    ? "bg-[var(--danger-soft)] text-[#9c2f24]"
                    : "bg-[var(--warning-soft)] text-[#9a6a00]"
              }`}
            >
              {offer.status === "accepted"
                ? "응답 완료"
                : offer.status === "rejected"
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
          <div className="text-xl font-bold text-ink">검토 메모</div>
          <div className="mt-4 space-y-3">
            <div className="rounded-lg bg-surface-subtle px-4 py-3 text-sm text-ink-soft">
              받은 시각 {offer.receivedAt}
            </div>
            <div className="rounded-lg bg-surface-subtle px-4 py-3 text-sm text-ink-soft">
              상태 요약 {offer.summary}
            </div>
            <div className="rounded-lg bg-surface-subtle px-4 py-3 text-sm text-ink-soft">
              다음 행동 공고 상세 확인 후 응답 준비
            </div>
          </div>
        </div>
      </section>
    </PortalShell>
  );
}
