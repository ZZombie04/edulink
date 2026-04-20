"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  CalendarDays,
  CheckCircle2,
  MapPin,
} from "lucide-react";

import { BrandLockup } from "@/components/brand";
import { JobApplyButton } from "@/components/job-apply-button";
import { JobVisual } from "@/components/job-visual";
import { LogoutButton } from "@/components/logout-button";
import { useDemoHiringState } from "@/lib/demo-hiring-state";
import { useDemoSession, useViewerRole } from "@/lib/demo-session-client";
import { getDashboardHref } from "@/lib/demo-session";
import { getContactDisplayName } from "@/lib/privacy";

function jobStatusLabel(status: string) {
  switch (status) {
    case "open":
      return {
        label: "지금 지원 가능",
        className: "bg-secondary-50 text-secondary-700",
      };
    case "closing-soon":
      return {
        label: "마감 임박",
        className: "bg-[var(--warning-soft)] text-[#9a6a00]",
      };
    default:
      return {
        label: "모집 마감",
        className: "bg-surface-panel text-ink-soft",
      };
  }
}

export default function JobDetailPage() {
  const params = useParams<{ id: string }>();
  const session = useDemoSession();
  const viewerRole = useViewerRole();
  const dashboardHref = getDashboardHref(session?.role ?? null);
  const { getJobById, getApplicationsForJob } = useDemoHiringState();
  const job = getJobById(params.id);

  if (!job) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface px-4 text-center">
        <div className="panel-surface max-w-xl p-8">
          <div className="text-2xl font-bold text-ink">공고 정보를 찾을 수 없습니다.</div>
          <p className="mt-3 break-keep text-sm leading-6 text-ink-soft">
            이미 마감되었거나 현재 더미 상태에 없는 공고입니다.
          </p>
          <Link
            href="/jobs"
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary-700"
          >
            <ArrowLeft className="h-4 w-4" />
            공고 목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const status = jobStatusLabel(job.status);
  const contactName = getContactDisplayName(job.contactName, viewerRole);
  const applications = getApplicationsForJob(job.id);

  return (
    <div className="min-h-screen bg-surface text-ink">
      <header className="sticky top-0 z-50 border-b border-outline bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/">
            <BrandLockup />
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/jobs"
              className="inline-flex items-center gap-2 rounded-lg border border-outline px-4 py-2 text-sm font-semibold text-ink-soft"
            >
              <ArrowLeft className="h-4 w-4" />
              공고 목록
            </Link>
            {dashboardHref ? (
              <>
                <Link
                  href={dashboardHref}
                  className="rounded-lg border border-outline px-4 py-2 text-sm font-semibold text-primary-700"
                >
                  내 홈
                </Link>
                <LogoutButton className="border border-outline bg-white text-ink-soft hover:bg-surface-subtle" />
              </>
            ) : (
              <Link
                href="/auth/login"
                className="rounded-lg border border-outline px-4 py-2 text-sm font-semibold text-primary-700"
              >
                로그인
              </Link>
            )}
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-[linear-gradient(145deg,#071b3a,#0b4fa6,#18907c)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.14),transparent_34%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16">
          <div className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
            <div className="max-w-3xl">
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
              >
                {status.label}
              </span>
              <h1 className="mt-5 break-keep text-4xl font-bold leading-tight text-white sm:text-5xl">
                {job.schoolName}
              </h1>
              <p className="mt-3 break-keep text-lg font-semibold text-white/92">
                {job.gradeLevel}
              </p>
              <p className="mt-5 break-keep text-base leading-7 text-white/88">
                {job.summary}
              </p>

              <div className="mt-8 flex flex-wrap gap-3 text-sm">
                <span className="rounded-full border border-white/18 bg-white/10 px-3 py-2 text-white">
                  {job.employmentType}
                </span>
                <span className="rounded-full border border-white/18 bg-white/10 px-3 py-2 text-white">
                  {job.qualificationType}
                  {job.qualificationSubject ? ` · ${job.qualificationSubject}` : ""}
                </span>
                <span className="rounded-full border border-white/18 bg-white/10 px-3 py-2 text-white">
                  마감 {job.deadline}
                </span>
                {job.source === "custom" ? (
                  <span className="rounded-full border border-white/18 bg-white/10 px-3 py-2 text-white">
                    새로 등록한 공고
                  </span>
                ) : null}
              </div>
            </div>

            <JobVisual
              className="min-h-[320px]"
              employmentType={job.employmentType}
              gradeLevel={job.gradeLevel}
              id={job.id}
              qualificationSubject={job.qualificationSubject}
              qualificationType={job.qualificationType}
              schoolName={job.schoolName}
              schoolRegion={job.schoolRegion}
              variant="hero"
            />
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-6">
            <section className="panel-surface p-6">
              <div className="text-lg font-bold text-ink">근무 안내 정보</div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg bg-surface-subtle px-4 py-3 text-sm text-ink-soft">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary-600" />
                    {job.schoolRegion}
                  </div>
                </div>
                <div className="rounded-lg bg-surface-subtle px-4 py-3 text-sm text-ink-soft">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-primary-600" />
                    {job.startDate} - {job.endDate}
                  </div>
                </div>
                <div className="rounded-lg bg-surface-subtle px-4 py-3 text-sm text-ink-soft">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary-600" />
                    {job.schoolAddress}
                  </div>
                </div>
                <div className="rounded-lg bg-surface-subtle px-4 py-3 text-sm text-ink-soft">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-primary-600" />
                    {job.isHomeroom ? "담임 포함" : "교과 중심"} · {contactName}
                  </div>
                </div>
              </div>
            </section>

            <section className="panel-surface p-6">
              <div className="text-lg font-bold text-ink">주요 업무</div>
              <div className="mt-5 space-y-3">
                {job.duties.map((duty) => (
                  <div
                    key={duty}
                    className="flex gap-3 rounded-lg bg-surface-subtle px-4 py-3"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-secondary-600" />
                    <div className="break-keep text-sm leading-6 text-ink-soft">
                      {duty}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="panel-surface p-6">
              <div className="text-lg font-bold text-ink">자격 및 우대</div>
              <div className="mt-5 space-y-3">
                {job.requirements.map((requirement) => (
                  <div
                    key={requirement}
                    className="rounded-lg border border-outline bg-white px-4 py-3 break-keep text-sm leading-6 text-ink-soft"
                  >
                    {requirement}
                  </div>
                ))}
              </div>
            </section>

            <section className="panel-surface p-6">
              <div className="text-lg font-bold text-ink">근무 지원 사항</div>
              <div className="mt-5 space-y-3">
                {job.benefits.map((benefit) => (
                  <div
                    key={benefit}
                    className="rounded-lg border border-secondary-100 bg-secondary-50 px-4 py-3 break-keep text-sm leading-6 text-secondary-700"
                  >
                    {benefit}
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="panel-surface h-fit p-6 lg:sticky lg:top-24">
            <div className="text-sm font-semibold uppercase tracking-[0.16em] text-ink-soft">
              빠른 요약
            </div>
            <div className="mt-5 space-y-4 text-sm text-ink-soft">
              <div className="rounded-lg bg-surface-subtle px-4 py-3">
                등록일 {job.postedAt}
              </div>
              <div className="rounded-lg bg-surface-subtle px-4 py-3">
                마감일 {job.deadline}
              </div>
              <div className="rounded-lg bg-surface-subtle px-4 py-3">
                지원자 {job.applicants}명 · 조회 {job.views}
              </div>
              <div className="rounded-lg bg-surface-subtle px-4 py-3">
                담당자 {contactName}
              </div>
              {applications.length > 0 ? (
                <div className="rounded-lg bg-primary-50 px-4 py-3 text-primary-700">
                  새 더미 지원 {applications.length}건이 현재 공고에 연결되어 있습니다.
                </div>
              ) : null}
            </div>

            <JobApplyButton
              className="mt-6"
              dashboardHref={dashboardHref}
              fullWidth
              jobId={job.id}
              jobStatus={job.status}
              showHelperText
              viewerRole={session?.role ?? "guest"}
            />
          </aside>
        </div>
      </main>
    </div>
  );
}
