import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  CalendarDays,
  CheckCircle2,
  MapPin,
} from "lucide-react";

import { BrandLockup } from "@/components/brand";
import { JobVisual } from "@/components/job-visual";
import { jobPosts } from "@/lib/demo-data";

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

export default function JobDetailPage({ params }: { params: { id: string } }) {
  const job = jobPosts.find((item) => item.id === params.id);

  if (!job) {
    notFound();
  }

  const status = jobStatusLabel(job.status);

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
            <Link
              href="/auth/login"
              className="rounded-lg border border-outline px-4 py-2 text-sm font-semibold text-primary-700"
            >
              로그인
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-[linear-gradient(145deg,#071b3a,#0b4fa6,#18907c)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.14),transparent_34%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16">
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
              >
                {status.label}
              </span>
              <h1 className="mt-5 max-w-3xl text-4xl font-bold leading-tight text-white sm:text-5xl">
                {job.schoolName}
              </h1>
              <p className="mt-3 text-lg font-semibold text-white/92">
                {job.gradeLevel}
              </p>
              <p className="mt-5 max-w-2xl text-base leading-7 text-white/88">
                {job.summary}
              </p>

              <div className="mt-8 flex flex-wrap gap-3 text-sm">
                <span className="rounded-full border border-white/18 bg-white/10 px-3 py-2 text-white">
                  {job.employmentType}
                </span>
                <span className="rounded-full border border-white/18 bg-white/10 px-3 py-2 text-white">
                  {job.qualificationType}
                  {job.qualificationSubject
                    ? ` · ${job.qualificationSubject}`
                    : ""}
                </span>
                <span className="rounded-full border border-white/18 bg-white/10 px-3 py-2 text-white">
                  마감 {job.deadline}
                </span>
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
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
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
                    {job.isHomeroom ? "담임 포함" : "교과 중심"} ·{" "}
                    {job.contactName}
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
                    <div className="text-sm leading-6 text-ink-soft">
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
                    className="rounded-lg border border-outline bg-white px-4 py-3 text-sm leading-6 text-ink-soft"
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
                    className="rounded-lg border border-secondary-100 bg-secondary-50 px-4 py-3 text-sm leading-6 text-secondary-700"
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
                담당자 {job.contactName}
              </div>
            </div>

            <Link
              href="/auth/login"
              className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-[linear-gradient(135deg,#0058be,#2170e4)] px-4 py-3 text-sm font-semibold text-white shadow-soft"
            >
              로그인하고 지원하기
            </Link>
          </aside>
        </div>
      </main>
    </div>
  );
}
