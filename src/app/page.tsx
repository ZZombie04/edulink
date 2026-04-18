import Link from "next/link";
import {
  ArrowRight,
  Bell,
  Briefcase,
  Clock3,
  LayoutDashboard,
  MapPin,
  Search,
  UserRound,
} from "lucide-react";

import { BrandLockup } from "@/components/brand";
import { CharacterAvatar } from "@/components/character-avatar";
import { JobVisual } from "@/components/job-visual";
import { getDemoSessionFromServerCookie } from "@/lib/demo-session-server";
import { featuredTeachers, jobPosts, teacherMatchRequests } from "@/lib/demo-data";
import { getTeacherDisplayName } from "@/lib/privacy";

function teacherStatusLabel(status: string) {
  switch (status) {
    case "seeking":
      return {
        label: "채용 제안 가능",
        className: "bg-secondary-50 text-secondary-700",
      };
    case "interviewing":
      return {
        label: "면접 진행 중",
        className: "bg-[var(--warning-soft)] text-[#9a6a00]",
      };
    case "employed":
      return {
        label: "근무 중",
        className: "bg-primary-50 text-primary-700",
      };
    default:
      return {
        label: "노출 일시중지",
        className: "bg-surface-panel text-ink-soft",
      };
  }
}

function jobStatusLabel(status: string) {
  switch (status) {
    case "open":
      return {
        label: "모집 중",
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

function getDashboardHref(role?: string) {
  switch (role) {
    case "teacher":
      return "/teacher/dashboard";
    case "hr":
      return "/hr/dashboard";
    case "admin":
      return "/admin/dashboard";
    default:
      return null;
  }
}

export default async function Home() {
  const session = await getDemoSessionFromServerCookie();
  const viewerRole = session?.role ?? "guest";
  const dashboardHref = getDashboardHref(session?.role);
  const openJobs = jobPosts.filter((job) => job.status !== "closed");
  const closingSoonJobs = jobPosts.filter((job) => job.status === "closing-soon");
  const signedInTeacher =
    session?.role === "teacher"
      ? featuredTeachers.find((teacher) => teacher.name === session.name) ??
        featuredTeachers.find(
          (teacher) => teacher.avatarPreset === session.avatarPreset,
        ) ??
        featuredTeachers[0]
      : null;
  const teacherRequests =
    signedInTeacher === null
      ? []
      : teacherMatchRequests.filter((request) =>
          signedInTeacher.preferredRegions.includes(request.region),
        );

  return (
    <div className="min-h-screen bg-surface text-ink">
      <header className="sticky top-0 z-50 border-b border-white/12 bg-[rgba(7,18,43,0.82)] backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/">
            <BrandLockup textClassName="text-white" />
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-medium text-white/75 md:flex">
            <Link
              href="#teacher-pool"
              className="transition-colors hover:text-white"
            >
              교사 인력풀
            </Link>
            <Link href="#jobs" className="transition-colors hover:text-white">
              채용 공고
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            {dashboardHref ? (
              <>
                <Link
                  href={dashboardHref}
                  className="hidden items-center gap-2 rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10 sm:inline-flex"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  내 홈
                </Link>
                <Link
                  href="/jobs"
                  className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-primary-700 transition-transform hover:-translate-y-px"
                >
                  <Briefcase className="h-4 w-4" />
                  공고 보기
                </Link>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden bg-[linear-gradient(140deg,#071b3a,#0a4da4,#18907c)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.12),transparent_34%)]" />

          <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-16 sm:px-6 sm:pb-20 sm:pt-20">
            {signedInTeacher ? (
              <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
                <div className="max-w-3xl">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/12 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm">
                    <Bell className="h-4 w-4" />
                    교사 홈
                  </div>

                  <h1 className="mt-6 text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
                    {signedInTeacher.name} 선생님
                  </h1>

                  <p className="mt-5 max-w-2xl text-base leading-7 text-white sm:text-lg">
                    현재 노출 상태와 받은 제안, 희망 근무 조건을 바로 확인할 수
                    있습니다.
                  </p>

                  <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <Link
                      href="/teacher/dashboard"
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-primary-700 transition-transform hover:-translate-y-px"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      내 대시보드
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
                      ["받은 제안", `${teacherRequests.length}건`],
                      ["희망 지역", `${signedInTeacher.preferredRegions.length}곳`],
                      ["프로필 조회", `${signedInTeacher.portfolioViews}회`],
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
                  <div className="rounded-[26px] border border-white/12 bg-white/10 p-6 backdrop-blur-sm">
                    <div className="flex items-start gap-4">
                      <CharacterAvatar
                        className="h-20 w-20 rounded-[22px]"
                        presetId={signedInTeacher.avatarPreset}
                        size={80}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${teacherStatusLabel(signedInTeacher.status).className}`}
                          >
                            {teacherStatusLabel(signedInTeacher.status).label}
                          </span>
                        </div>
                        <div className="mt-3 text-2xl font-bold text-white">
                          {signedInTeacher.qualification}
                        </div>
                        <p className="mt-2 text-sm leading-6 text-white/80">
                          {signedInTeacher.summary}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-[20px] bg-white/10 px-4 py-4">
                        <div className="text-xs font-semibold text-white/70">
                          희망 근무 형태
                        </div>
                        <div className="mt-2 text-sm font-semibold text-white">
                          {signedInTeacher.preferredTypes.join(", ")}
                        </div>
                      </div>
                      <div className="rounded-[20px] bg-white/10 px-4 py-4">
                        <div className="text-xs font-semibold text-white/70">
                          거주 지역
                        </div>
                        <div className="mt-2 text-sm font-semibold text-white">
                          {signedInTeacher.residence}
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                      {signedInTeacher.preferredRegions.map((region) => (
                        <span
                          key={region}
                          className="rounded-full bg-white/12 px-3 py-2 text-xs font-semibold text-white"
                        >
                          {region}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[26px] border border-white/12 bg-white/10 p-6 backdrop-blur-sm">
                    <div className="flex items-center justify-between gap-4">
                      <div className="text-lg font-bold text-white">
                        최근 받은 제안
                      </div>
                      <Link
                        href="/teacher/dashboard"
                        className="text-sm font-semibold text-white"
                      >
                        전체 보기
                      </Link>
                    </div>

                    <div className="mt-4 space-y-3">
                      {teacherRequests.slice(0, 2).map((request) => (
                        <div
                          key={request.id}
                          className="rounded-[20px] bg-white/10 px-4 py-4"
                        >
                          <div className="text-sm font-semibold text-white">
                            {request.schoolName}
                          </div>
                          <div className="mt-1 text-sm text-white/78">
                            {request.position}
                          </div>
                          <div className="mt-2 flex items-center gap-2 text-xs text-white/70">
                            <MapPin className="h-3.5 w-3.5" />
                            {request.region}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
                <div className="max-w-3xl">
                  <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
                    경기도 기간제·시간강사
                    <br />
                    교사 인력풀
                  </h1>

                  <p className="mt-5 max-w-2xl text-base leading-7 text-white sm:text-lg">
                    교사 인력풀과 채용 공고를 바로 확인하고 회원가입을 시작할 수
                    있습니다.
                  </p>

                  <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <Link
                      href="/pool"
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-primary-700 transition-transform hover:-translate-y-px"
                    >
                      <Search className="h-4 w-4" />
                      교사 인력풀 보기
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
                      ["모집 중 공고", `${openJobs.length}건`],
                      ["등록 교사", `${featuredTeachers.length}명`],
                      ["마감 임박 공고", `${closingSoonJobs.length}건`],
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

                  <div className="grid gap-4 md:grid-cols-2">
                    {[
                      ["교사 회원가입", "프로필 등록"],
                      ["학교 회원가입", "공고 등록"],
                      ["교사 인력풀", "조건 검색"],
                      ["채용 공고", "상세 확인"],
                    ].map(([title, detail]) => (
                      <div
                        key={title}
                        className="rounded-[22px] border border-white/12 bg-white/10 px-4 py-4 backdrop-blur-sm"
                      >
                        <div className="text-sm font-semibold text-white">
                          {title}
                        </div>
                        <div className="mt-1 text-xs text-white/78">
                          {detail}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="relative z-10 -mt-8 px-4 sm:px-6" id="teacher-pool">
          <div className="mx-auto max-w-7xl">
            <div className="panel-surface p-6 sm:p-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-primary-700">
                    기간제·시간강사
                  </div>
                  <h2 className="mt-2 text-3xl font-bold tracking-tight text-ink">
                    교사 인력풀
                  </h2>
                </div>
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
                          경력 {teacher.experience}
                        </div>
                        <div className="rounded-lg bg-surface-panel px-3 py-2">
                          거주지 {teacher.residence}
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
            <div>
              <div className="text-sm font-semibold text-primary-700">
                학교 채용
              </div>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-ink">
                채용 공고
              </h2>
            </div>
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
                        <UserRound className="h-4 w-4 text-primary-600" />
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
