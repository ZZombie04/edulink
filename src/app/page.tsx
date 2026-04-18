import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  Clock3,
  MapPin,
  Search,
  Users,
} from "lucide-react";

import { BrandLockup } from "@/components/brand";
import { CharacterAvatar } from "@/components/character-avatar";
import { JobVisual } from "@/components/job-visual";
import { getViewerRoleFromServerCookie } from "@/lib/demo-session-server";
import { featuredTeachers, jobPosts } from "@/lib/demo-data";
import { getTeacherDisplayName } from "@/lib/privacy";

function teacherStatusLabel(status: string) {
  switch (status) {
    case "seeking":
      return {
        label: "구직중",
        className: "bg-secondary-50 text-secondary-700",
      };
    case "interviewing":
      return {
        label: "면접 진행",
        className: "bg-[var(--warning-soft)] text-[#9a6a00]",
      };
    case "employed":
      return {
        label: "근무 예정",
        className: "bg-primary-50 text-primary-700",
      };
    default:
      return {
        label: "휴식중",
        className: "bg-surface-panel text-ink-soft",
      };
  }
}

function jobStatusLabel(status: string) {
  switch (status) {
    case "open":
      return {
        label: "지원 가능",
        className: "bg-secondary-50 text-secondary-700",
      };
    case "closing-soon":
      return {
        label: "마감 임박",
        className: "bg-[var(--warning-soft)] text-[#9a6a00]",
      };
    default:
      return {
        label: "마감",
        className: "bg-surface-panel text-ink-soft",
      };
  }
}

export default async function Home() {
  const viewerRole = await getViewerRoleFromServerCookie();
  const openJobs = jobPosts.filter((job) => job.status !== "closed");

  return (
    <div className="min-h-screen bg-surface text-ink">
      <header className="sticky top-0 z-50 border-b border-white/12 bg-[rgba(7,18,43,0.82)] backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/">
            <BrandLockup textClassName="text-white" />
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-medium text-white/75 md:flex">
            <Link
              href="#candidate-pool"
              className="transition-colors hover:text-white"
            >
              인재풀
            </Link>
            <Link href="#jobs" className="transition-colors hover:text-white">
              채용 공고
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/auth/login"
              className="hidden rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10 sm:inline-flex"
            >
              로그인
            </Link>
            <Link
              href="/auth/register/teacher"
              className="hidden items-center gap-2 rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10 sm:inline-flex"
            >
              교사 가입
            </Link>
            <Link
              href="/auth/register/hr"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-primary-700 transition-transform hover:-translate-y-px"
            >
              학교 가입
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden bg-[linear-gradient(140deg,#071b3a,#0a4da4,#18907c)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.12),transparent_34%)]" />

          <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-16 sm:px-6 sm:pb-20 sm:pt-20">
            <div className="grid gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
              <div className="max-w-3xl">
                <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
                  경기도 학교 교원 채용
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-7 text-white sm:text-lg">
                  인재풀과 채용 공고를 같은 흐름 안에서 확인할 수 있도록
                  정리했습니다.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/pool"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-primary-700 transition-transform hover:-translate-y-px"
                  >
                    <Search className="h-4 w-4" />
                    인재풀 보기
                  </Link>
                  <Link
                    href="/jobs"
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/25 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/16"
                  >
                    <Briefcase className="h-4 w-4" />
                    채용 공고 보기
                  </Link>
                </div>

                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  {[
                    ["열린 공고", `${openJobs.length}건`],
                    ["공개 인재", `${featuredTeachers.length}명`],
                    ["즉시 검토", "183명"],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-[20px] border border-white/12 bg-white/10 px-4 py-4 backdrop-blur-sm"
                    >
                      <div className="text-sm font-semibold text-white">
                        {label}
                      </div>
                      <div className="mt-2 text-2xl font-bold text-white">
                        {value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4">
                <JobVisual
                  className="min-h-[340px]"
                  employmentType={openJobs[0].employmentType}
                  gradeLevel={openJobs[0].gradeLevel}
                  id={openJobs[0].id}
                  qualificationSubject={openJobs[0].qualificationSubject}
                  qualificationType={openJobs[0].qualificationType}
                  schoolName={openJobs[0].schoolName}
                  schoolRegion={openJobs[0].schoolRegion}
                  variant="hero"
                />

                <div className="grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
                  <div className="rounded-[26px] border border-white/12 bg-white/10 p-5 backdrop-blur-sm">
                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-white">
                      Teacher
                    </div>
                    <div className="mt-4 flex items-center gap-3">
                      <CharacterAvatar
                        className="h-16 w-16 rounded-[18px]"
                        presetId={featuredTeachers[0].avatarPreset}
                        size={64}
                      />
                      <div>
                        <div className="text-lg font-bold text-white">
                          {getTeacherDisplayName(
                            featuredTeachers[0].name,
                            viewerRole,
                          )}
                        </div>
                        <div className="text-sm text-white">
                          {featuredTeachers[0].qualification}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {featuredTeachers[0].preferredRegions.map((region) => (
                        <span
                          key={region}
                          className="rounded-full bg-white/12 px-3 py-2 text-xs font-semibold text-white"
                        >
                          {region}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      ["채용 공고", "실시간 상태"],
                      ["인재풀", "조건 필터"],
                      ["교사 가입", "캐릭터 등록"],
                      ["학교 가입", "승인 흐름"],
                    ].map(([title, detail]) => (
                      <div
                        key={title}
                        className="rounded-[22px] border border-white/12 bg-white/10 px-4 py-4 backdrop-blur-sm"
                      >
                        <div className="text-sm font-semibold text-white">
                          {title}
                        </div>
                        <div className="mt-1 text-xs text-white">{detail}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          className="relative z-10 -mt-8 px-4 sm:px-6"
          id="candidate-pool"
        >
          <div className="mx-auto max-w-7xl">
            <div className="panel-surface p-6 sm:p-8">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-3xl font-bold tracking-tight text-ink">
                  인재풀
                </h2>
                <Link
                  href="/pool"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary-700"
                >
                  전체 보기
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="mt-8 grid gap-4 lg:grid-cols-3">
                {featuredTeachers.slice(0, 3).map((teacher) => {
                  const status = teacherStatusLabel(teacher.status);

                  return (
                    <article
                      key={teacher.id}
                      className="rounded-lg border border-outline bg-surface p-5 transition-transform hover:-translate-y-1"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <CharacterAvatar
                            className="h-14 w-14 rounded-lg"
                            presetId={teacher.avatarPreset}
                            size={56}
                          />
                          <div>
                            <div className="text-lg font-bold text-ink">
                              {getTeacherDisplayName(teacher.name, viewerRole)}
                            </div>
                            <div className="text-sm text-ink-soft">
                              {teacher.qualification}
                            </div>
                          </div>
                        </div>
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </div>

                      <div className="mt-4 grid gap-3 text-sm text-ink-soft">
                        <div className="rounded-lg bg-surface-panel px-3 py-2">
                          {teacher.experience}
                        </div>
                        <div className="rounded-lg bg-surface-panel px-3 py-2">
                          {teacher.residence}
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium text-ink-muted">
                        {teacher.preferredRegions.map((region) => (
                          <span
                            key={region}
                            className="rounded-full bg-surface-panel px-2.5 py-1"
                          >
                            {region}
                          </span>
                        ))}
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6" id="jobs">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-3xl font-bold tracking-tight text-ink">
              채용 공고
            </h2>
            <Link
              href="/jobs"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary-700"
            >
              전체 보기
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {openJobs.map((job) => {
              const status = jobStatusLabel(job.status);

              return (
                <article
                  key={job.id}
                  className="panel-surface overflow-hidden p-5 transition-transform hover:-translate-y-1"
                >
                  <JobVisual
                    className="min-h-[248px]"
                    employmentType={job.employmentType}
                    gradeLevel={job.gradeLevel}
                    id={job.id}
                    qualificationSubject={job.qualificationSubject}
                    qualificationType={job.qualificationType}
                    schoolName={job.schoolName}
                    schoolRegion={job.schoolRegion}
                  />

                  <div className="mt-5">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}
                    >
                      {status.label}
                    </span>
                    <p className="mt-4 text-sm leading-6 text-ink-soft">
                      {job.summary}
                    </p>

                    <div className="mt-5 space-y-3 text-sm text-ink-soft">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary-600" />
                        {job.schoolRegion} / {job.gradeLevel}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock3 className="h-4 w-4 text-primary-600" />
                        {job.startDate} - {job.endDate}
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary-600" />
                        지원자 {job.applicants}명 / 조회 {job.views}
                      </div>
                    </div>

                    <Link
                      href={`/jobs/${job.id}`}
                      className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary-700"
                    >
                      상세 보기
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
