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
  ShieldCheck,
  Users,
} from "lucide-react";

import { BrandLockup } from "@/components/brand";
import { HiringStateError } from "@/components/hiring-state-error";
import { JobApplyButton } from "@/components/job-apply-button";
import { LogoutButton } from "@/components/logout-button";
import { useDemoHiringState } from "@/lib/demo-hiring-state";
import { useDemoSession, useViewerRole } from "@/lib/demo-session-client";
import { getDashboardHref } from "@/lib/demo-session";
import { getContactDisplayName } from "@/lib/privacy";

function jobStatusLabel(status: string) {
  switch (status) {
    case "open":
      return {
        label: "지원 가능",
        className: "border-[#b9cec1] bg-[#edf4ef] text-[#1f6248]",
      };
    case "closing-soon":
      return {
        label: "마감 임박",
        className: "border-[#e6d1a2] bg-[#fff7e6] text-[#865d13]",
      };
    default:
      return {
        label: "모집 마감",
        className: "border-[#d8d5cc] bg-[#f0eee8] text-[#666e69]",
      };
  }
}

export default function JobDetailPage() {
  const params = useParams<{ id: string }>();
  const session = useDemoSession();
  const viewerRole = useViewerRole();
  const dashboardHref = getDashboardHref(session?.role ?? null);
  const {
    getJobById,
    getApplicationsForJob,
    loaded,
    loadError,
    refresh,
  } = useDemoHiringState();
  const job = getJobById(params.id);

  if (!loaded) {
    return (
      <div
        aria-live="polite"
        className="flex min-h-screen items-center justify-center bg-[#f7f6f1] px-4"
      >
        <div className="w-full max-w-3xl animate-pulse space-y-4">
          <div className="h-7 w-32 rounded bg-[#e5e2da]" />
          <div className="h-14 w-3/4 rounded bg-[#e5e2da]" />
          <div className="h-72 rounded-md border border-[#e0ddd5] bg-[#eeece6]" />
          <span className="sr-only">공고 정보를 불러오는 중입니다.</span>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f6f1] px-4">
        <div className="w-full max-w-xl">
          <HiringStateError message={loadError} onRetry={refresh} />
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f6f1] px-4 text-center">
        <div className="max-w-xl rounded-md border border-[#dedbd2] bg-[#fbfaf6] p-8 shadow-[0_14px_40px_rgba(30,42,36,0.06)]">
          <Briefcase aria-hidden="true" className="mx-auto h-9 w-9 text-[#65706a]" />
          <h1 className="mt-4 text-2xl font-bold text-[#17231e]">
            공고 정보를 찾을 수 없습니다
          </h1>
          <p className="mt-3 break-keep text-sm leading-6 text-[#65706a]">
            삭제되었거나 더 이상 제공되지 않는 채용 공고일 수 있습니다.
          </p>
          <Link
            href="/jobs"
            className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-md bg-[#0b4a37] px-4 py-2 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b4a37] focus-visible:ring-offset-2"
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
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
    <div className="min-h-screen bg-[#f7f6f1] text-[#17231e]">
      <header className="sticky top-0 z-50 border-b border-[#dfddd5] bg-[#fbfaf6]/95 backdrop-blur">
        <div className="mx-auto flex min-h-[72px] max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b4a37] focus-visible:ring-offset-2"
            href="/"
          >
            <BrandLockup textClassName="text-[#17231e]" />
          </Link>
          <nav aria-label="공고 상세 메뉴" className="flex items-center gap-2">
            <Link
              href="/jobs"
              className="inline-flex min-h-10 items-center gap-2 rounded-md border border-[#d8d5cc] bg-white px-3 py-2 text-sm font-semibold text-[#4c5751] hover:bg-[#f0eee8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b4a37] sm:px-4"
            >
              <ArrowLeft aria-hidden="true" className="h-4 w-4" />
              <span className="hidden sm:inline">공고 목록</span>
            </Link>
            {dashboardHref ? (
              <>
                <Link
                  href={dashboardHref}
                  className="hidden min-h-10 items-center rounded-md border border-[#d8d5cc] bg-white px-4 py-2 text-sm font-semibold text-[#0b4a37] hover:bg-[#f0eee8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b4a37] sm:inline-flex"
                >
                  내 홈
                </Link>
                <LogoutButton className="border border-[#d8d5cc] bg-white text-[#4c5751] hover:bg-[#f0eee8]" />
              </>
            ) : (
              <Link
                href={`/auth/login?next=/jobs/${job.id}`}
                className="inline-flex min-h-10 items-center rounded-md bg-[#0b4a37] px-4 py-2 text-sm font-semibold text-white hover:bg-[#083a2c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b4a37] focus-visible:ring-offset-2"
              >
                로그인
              </Link>
            )}
          </nav>
        </div>
      </header>

      <section className="border-b border-[#d2d0c8] bg-[#123d31] text-white">
        <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <Link
            className="inline-flex items-center gap-2 rounded-md text-sm font-medium text-[#cfe0d7] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            href="/jobs"
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            전체 채용 공고
          </Link>

          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
            <div className="max-w-4xl">
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${status.className}`}
                >
                  {status.label}
                </span>
                <span className="text-sm text-[#c9dbd1]">
                  {job.employmentType} · {job.qualificationType}
                  {job.qualificationSubject ? ` ${job.qualificationSubject}` : ""}
                </span>
              </div>
              <h1 className="mt-5 break-keep text-4xl font-bold leading-tight tracking-[-0.035em] sm:text-5xl">
                {job.schoolName}
              </h1>
              <p className="mt-3 break-keep text-xl font-semibold text-[#dce9e2]">
                {job.gradeLevel}
              </p>
              <p className="mt-5 max-w-3xl break-keep text-sm leading-7 text-[#d3e2da] sm:text-base">
                {job.summary}
              </p>
            </div>

            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-white/15 bg-white/15">
              <div className="bg-[#123d31] p-4">
                <dt className="text-xs text-[#bcd0c5]">근무 지역</dt>
                <dd className="mt-2 text-sm font-semibold">{job.schoolRegion}</dd>
              </div>
              <div className="bg-[#123d31] p-4">
                <dt className="text-xs text-[#bcd0c5]">지원 마감</dt>
                <dd className="mt-2 text-sm font-semibold">{job.deadline}</dd>
              </div>
              <div className="bg-[#123d31] p-4">
                <dt className="text-xs text-[#bcd0c5]">지원자</dt>
                <dd className="mt-2 text-sm font-semibold">{job.applicants}명</dd>
              </div>
              <div className="bg-[#123d31] p-4">
                <dt className="text-xs text-[#bcd0c5]">등록일</dt>
                <dd className="mt-2 text-sm font-semibold">{job.postedAt}</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-5">
            <section className="rounded-md border border-[#dedbd2] bg-[#fbfaf6] p-6">
              <h2 className="text-lg font-bold text-[#17231e]">근무 안내</h2>
              <dl className="mt-5 grid gap-x-8 gap-y-5 sm:grid-cols-2">
                {[
                  {
                    icon: MapPin,
                    label: "근무 지역",
                    value: job.schoolRegion,
                  },
                  {
                    icon: CalendarDays,
                    label: "근무 기간",
                    value: `${job.startDate} — ${job.endDate}`,
                  },
                  {
                    icon: Building2,
                    label: "학교 주소",
                    value: job.schoolAddress,
                  },
                  {
                    icon: Briefcase,
                    label: "업무 형태",
                    value: `${job.isHomeroom ? "담임 포함" : "교과 중심"} · ${job.employmentType}`,
                  },
                ].map((item) => (
                  <div key={item.label} className="flex gap-3">
                    <item.icon
                      aria-hidden="true"
                      className="mt-0.5 h-5 w-5 shrink-0 text-[#0b4a37]"
                    />
                    <div>
                      <dt className="text-xs font-medium text-[#7a827e]">
                        {item.label}
                      </dt>
                      <dd className="mt-1 break-keep text-sm leading-6 text-[#39443e]">
                        {item.value}
                      </dd>
                    </div>
                  </div>
                ))}
              </dl>
            </section>

            {[
              {
                title: "주요 업무",
                items: job.duties,
                tone: "default",
              },
              {
                title: "자격 및 우대",
                items: job.requirements,
                tone: "default",
              },
              {
                title: "근무 지원 사항",
                items: job.benefits,
                tone: "green",
              },
            ].map((section) => (
              <section
                key={section.title}
                className="rounded-md border border-[#dedbd2] bg-[#fbfaf6] p-6"
              >
                <h2 className="text-lg font-bold text-[#17231e]">
                  {section.title}
                </h2>
                {section.items.length > 0 ? (
                  <ul className="mt-5 divide-y divide-[#e3e0d8]">
                    {section.items.map((item) => (
                      <li
                        key={item}
                        className={`flex gap-3 py-3 first:pt-0 last:pb-0 ${
                          section.tone === "green"
                            ? "text-[#24533f]"
                            : "text-[#515c56]"
                        }`}
                      >
                        <CheckCircle2
                          aria-hidden="true"
                          className="mt-0.5 h-4 w-4 shrink-0 text-[#0b4a37]"
                        />
                        <span className="break-keep text-sm leading-6">{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-4 text-sm text-[#747c78]">
                    별도 안내된 내용이 없습니다.
                  </p>
                )}
              </section>
            ))}
          </div>

          <aside className="h-fit rounded-md border border-[#d5d2c9] bg-[#fbfaf6] p-6 shadow-[0_14px_36px_rgba(31,44,37,0.07)] lg:sticky lg:top-24">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#69726d]">
              <ShieldCheck aria-hidden="true" className="h-4 w-4 text-[#0b4a37]" />
              지원 전 확인
            </div>
            <dl className="mt-5 divide-y divide-[#e2dfd7] text-sm">
              <div className="flex items-center justify-between gap-4 py-3 first:pt-0">
                <dt className="text-[#727a76]">담당자</dt>
                <dd className="text-right font-medium text-[#2c3731]">{contactName}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 py-3">
                <dt className="text-[#727a76]">조회</dt>
                <dd className="font-medium text-[#2c3731]">{job.views}회</dd>
              </div>
              <div className="flex items-center justify-between gap-4 py-3">
                <dt className="flex items-center gap-1.5 text-[#727a76]">
                  <Users aria-hidden="true" className="h-4 w-4" />
                  현재 지원
                </dt>
                <dd className="font-medium text-[#2c3731]">
                  {applications.length > 0
                    ? `${applications.length}건 진행 중`
                    : "접수 가능"}
                </dd>
              </div>
            </dl>

            <JobApplyButton
              className="mt-6"
              dashboardHref={dashboardHref}
              fullWidth
              jobId={job.id}
              jobStatus={job.status}
              showHelperText
              viewerRole={session?.role ?? "guest"}
            />

            <p className="mt-5 break-keep text-center text-xs leading-5 text-[#7a827e]">
              지원 후 진행 상태와 면접 요청은 교사 홈에서 확인할 수 있습니다.
            </p>
          </aside>
        </div>
      </main>
    </div>
  );
}
