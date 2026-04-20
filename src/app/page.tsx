import Link from "next/link";
import {
  ArrowRight,
  Bell,
  Briefcase,
  Clock3,
  LayoutDashboard,
  MapPin,
  School,
  Search,
  type LucideIcon,
} from "lucide-react";

import { BrandLockup } from "@/components/brand";
import { CharacterAvatar } from "@/components/character-avatar";
import { JobVisual } from "@/components/job-visual";
import { LogoutButton } from "@/components/logout-button";
import { getDashboardHref } from "@/lib/demo-session";
import { getDemoSessionFromServerCookie } from "@/lib/demo-session-server";
import { featuredTeachers, jobPosts, teacherMatchRequests } from "@/lib/demo-data";

type TeacherStatusTone = {
  className: string;
  label: string;
};

const publicLaunchRows: Array<{
  Icon: LucideIcon;
  detail: string;
  href: string;
  meta: string;
  title: string;
}> = [
  {
    Icon: Search,
    title: "교사 인력풀",
    detail: "경력과 희망 조건 확인",
    href: "/pool",
    meta: "바로 보기",
  },
  {
    Icon: Briefcase,
    title: "채용 공고",
    detail: "기간제교사 및 시간강사 공고",
    href: "/jobs",
    meta: "공고 보기",
  },
  {
    Icon: School,
    title: "학교 가입",
    detail: "채용 공고 등록",
    href: "/auth/register/hr",
    meta: "가입하기",
  },
];

const publicPoolPreview: Array<{
  avatarPreset: Parameters<typeof CharacterAvatar>[0]["presetId"];
  href: string;
  summary: string;
  tags: string[];
  title: string;
}> = [
  {
    avatarPreset: "teacher-f-mint",
    href: "/pool/1",
    title: "초등 담임",
    summary: "학급 운영, 생활지도, 기초학력 보강 중심으로 빠르게 검토합니다.",
    tags: ["초등 자격", "담임", "남부권"],
  },
  {
    avatarPreset: "teacher-m-navy",
    href: "/pool/2",
    title: "중등 수학",
    summary: "중등 교과 수업과 평가 운영이 가능한 프로필 흐름으로 정리합니다.",
    tags: ["중등 자격", "수학", "서남권"],
  },
  {
    avatarPreset: "teacher-f-violet",
    href: "/pool/4",
    title: "특수 지원",
    summary: "통합학급 지원과 개별화 수업 경험 중심으로 확인할 수 있습니다.",
    tags: ["특수 자격", "지원 수업", "동부권"],
  },
];

const publicJobPreview: Array<{
  detail: string;
  employmentType: string;
  gradeLevel: string;
  id: string;
  qualificationSubject?: string;
  qualificationType: string;
  schedule: string;
  schoolName: string;
  schoolRegion: string;
  summary: string;
}> = [
  {
    id: "1",
    schoolName: "정인초등학교",
    schoolRegion: "수원",
    gradeLevel: "3학년 담임",
    employmentType: "기간제 교사",
    qualificationType: "초등",
    summary: "3학년 담임과 생활지도를 담당할 기간제 교사를 모집합니다.",
    schedule: "2026-05-01 - 2026-08-31",
    detail: "주 5일 / 담임",
  },
  {
    id: "2",
    schoolName: "서해중학교",
    schoolRegion: "화성",
    gradeLevel: "1학년 교과",
    employmentType: "시간강사",
    qualificationType: "중등",
    qualificationSubject: "수학",
    summary: "중1 수학 수업을 맡을 시간강사를 모집합니다.",
    schedule: "2026-04-22 - 2026-05-30",
    detail: "교과 수업 / 평가",
  },
  {
    id: "3",
    schoolName: "늘봄고등학교",
    schoolRegion: "용인",
    gradeLevel: "2학년 교과",
    employmentType: "기간제 교사",
    qualificationType: "중등",
    qualificationSubject: "영어",
    summary: "영어 수업과 담임 업무를 맡을 기간제 교사를 모집합니다.",
    schedule: "2026-03-01 - 2027-02-28",
    detail: "교과 수업 / 학년 운영",
  },
];

function teacherStatusLabel(status: string): TeacherStatusTone {
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

export default async function Home() {
  const session = await getDemoSessionFromServerCookie();
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
      : teacherMatchRequests.filter(
          (request) =>
            request.teacherId === signedInTeacher.id ||
            signedInTeacher.preferredRegions.includes(request.region),
        );
  const desktopGhostLinkClassName =
    "hidden items-center gap-2 rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10 sm:inline-flex";
  const desktopPrimaryLinkClassName =
    "inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-primary-700 transition-transform hover:-translate-y-px";
  const mobileQuickLinkClassName =
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/16 bg-white/8 px-3 py-2 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/14";
  const mobilePrimaryLinkClassName =
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-primary-700 transition-transform hover:-translate-y-px";

  return (
    <div className="min-h-screen bg-surface text-ink">
      <header className="sticky top-0 z-50 border-b border-white/12 bg-[#07122b] md:bg-[rgba(7,18,43,0.82)] md:backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex min-h-16 items-center justify-between gap-3 py-3 md:h-16 md:py-0">
            <Link href="/">
              <BrandLockup textClassName="text-white" />
            </Link>

            <nav className="hidden items-center gap-6 text-sm font-medium text-white md:flex">
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

            <div className="hidden items-center gap-2 md:flex">
              {dashboardHref ? (
                <>
                  <Link href={dashboardHref} className={desktopGhostLinkClassName}>
                    <LayoutDashboard className="h-4 w-4" />
                    내 홈
                  </Link>
                  <Link href="/jobs" className={desktopPrimaryLinkClassName}>
                    <Briefcase className="h-4 w-4" />
                    공고 보기
                  </Link>
                  <LogoutButton className="hidden border border-white/20 text-white hover:bg-white/10 sm:inline-flex" />
                </>
              ) : (
                <>
                  <Link href="/auth/login" className={desktopGhostLinkClassName}>
                    로그인
                  </Link>
                  <Link
                    href="/auth/register/teacher"
                    className={desktopGhostLinkClassName}
                  >
                    교사 가입
                  </Link>
                  <Link
                    href="/auth/register/hr"
                    className={desktopPrimaryLinkClassName}
                  >
                    학교 가입
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </>
              )}
            </div>

            <div className="flex md:hidden">
              {dashboardHref ? (
                <Link href={dashboardHref} className={mobilePrimaryLinkClassName}>
                  <LayoutDashboard className="h-4 w-4" />
                  내 홈
                </Link>
              ) : (
                <Link href="/auth/register/hr" className={mobilePrimaryLinkClassName}>
                  학교 가입
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>

          <div className="grid gap-2 pb-3 md:hidden">
            {dashboardHref ? (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <Link href="/jobs" className={mobileQuickLinkClassName}>
                    <Briefcase className="mr-2 h-4 w-4" />
                    채용 공고
                  </Link>
                  <Link href="#teacher-pool" className={mobileQuickLinkClassName}>
                    <Search className="mr-2 h-4 w-4" />
                    교사 인력풀
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Link href="#jobs" className={mobileQuickLinkClassName}>
                    <School className="mr-2 h-4 w-4" />
                    학교 채용
                  </Link>
                  <LogoutButton className="min-h-11 w-full border border-white/16 bg-white/8 text-white hover:bg-white/14" />
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <Link href="/auth/login" className={mobileQuickLinkClassName}>
                    로그인
                  </Link>
                  <Link
                    href="/auth/register/teacher"
                    className={mobileQuickLinkClassName}
                  >
                    교사 가입
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Link href="#teacher-pool" className={mobileQuickLinkClassName}>
                    <Search className="mr-2 h-4 w-4" />
                    교사 인력풀
                  </Link>
                  <Link href="/jobs" className={mobileQuickLinkClassName}>
                    <Briefcase className="mr-2 h-4 w-4" />
                    채용 공고
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="bg-[#06162f] text-white">
        <section className="relative overflow-hidden bg-[linear-gradient(140deg,#071b3a,#0a4da4,#18907c)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.12),transparent_34%)]" />

          <div className="relative mx-auto max-w-7xl px-4 pb-14 pt-10 sm:px-6 sm:pb-20 sm:pt-20">
            {signedInTeacher ? (
              <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
                <div className="max-w-3xl">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/12 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm">
                    <Bell className="h-4 w-4" />
                    교사 홈
                  </div>

                  <h1 className="mt-6 text-3xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
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

                  <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {[
                      ["받은 제안", `${teacherRequests.length}건`],
                      ["희망 지역", `${signedInTeacher.preferredRegions.length}곳`],
                      ["프로필 조회", `${signedInTeacher.portfolioViews}회`],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="rounded-[20px] border border-white/12 bg-white/10 px-4 py-4 backdrop-blur-sm last:col-span-2 sm:last:col-span-1"
                      >
                        <div className="text-sm font-semibold text-white">
                          {label}
                        </div>
                        <div className="mt-2 text-xl font-bold text-white sm:text-2xl">
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
              <div className="grid gap-10 lg:grid-cols-[0.96fr_1.04fr] lg:items-center">
                <div className="max-w-3xl">
                  <div className="inline-flex rounded-full bg-white/12 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm">
                    경기도 기간제·시간강사
                  </div>

                  <h1 className="mt-6 text-3xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
                    교사 채용 포털
                  </h1>

                  <p className="mt-5 max-w-2xl text-base leading-7 text-white sm:text-lg">
                    기간제교사 및 시간강사 구인 구직
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

                  <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {[
                      ["모집 중 공고", `${openJobs.length}건`],
                      ["등록 교사", `${featuredTeachers.length}명`],
                      ["마감 임박 공고", `${closingSoonJobs.length}건`],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="rounded-[20px] border border-white/12 bg-white/10 px-4 py-4 backdrop-blur-sm last:col-span-2 sm:last:col-span-1"
                      >
                        <div className="text-sm font-semibold text-white">
                          {label}
                        </div>
                        <div className="mt-2 text-xl font-bold text-white sm:text-2xl">
                          {value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[32px] border border-white/14 bg-white/10 p-5 text-white backdrop-blur-sm sm:p-7">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-white">
                      오늘 바로 시작
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3">
                    {publicLaunchRows.map((item) => (
                      <Link
                        key={item.title}
                        href={item.href}
                        className="grid gap-3 rounded-[24px] border border-white/10 bg-white/8 px-4 py-4 transition-colors hover:bg-white/12 sm:grid-cols-[auto_1fr_auto] sm:items-center"
                      >
                        <div className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-white/14 text-white">
                          <item.Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-white">
                            {item.title}
                          </div>
                          <div className="mt-1 text-sm leading-6 text-white">
                            {item.detail}
                          </div>
                        </div>
                        <div className="text-xs font-semibold text-white">
                          {item.meta}
                        </div>
                      </Link>
                    ))}
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[24px] bg-white/8 px-4 py-4">
                      <div className="text-xs font-semibold text-white">
                        교사 가입
                      </div>
                      <div className="mt-2 text-lg font-bold text-white">
                        경력과 희망 근무 조건 등록
                      </div>
                    </div>
                    <div className="rounded-[24px] bg-white/8 px-4 py-4">
                      <div className="text-xs font-semibold text-white">
                        학교 가입
                      </div>
                      <div className="mt-2 text-lg font-bold text-white">
                        채용 공고 등록
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="relative z-10 -mt-8 px-4 sm:px-6" id="teacher-pool">
          <div className="mx-auto max-w-7xl">
            <div className="rounded-[28px] border border-white/10 bg-white/[0.06] p-6 text-white sm:p-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-white">
                    기간제·시간강사
                  </div>
                  <h2 className="mt-2 text-3xl font-bold tracking-tight text-white">
                    교사 인력풀
                  </h2>
                </div>
                <Link
                  href="/pool"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-white"
                >
                  전체 보기
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="mt-8 grid gap-4 lg:grid-cols-3">
                {publicPoolPreview.map((teacher) => (
                  <Link
                    key={teacher.title}
                    href={teacher.href}
                    className="block rounded-lg border border-white/10 bg-white/8 p-5 transition-colors hover:bg-white/12"
                  >
                    <div className="flex items-start gap-3">
                      <CharacterAvatar
                        className="h-16 w-16 rounded-lg"
                        presetId={teacher.avatarPreset}
                        size={64}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-lg font-bold text-white">
                          {teacher.title}
                        </div>
                        <p className="mt-2 text-sm leading-6 text-white">
                          {teacher.summary}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium text-white">
                      {teacher.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-white/10 px-2.5 py-1"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6" id="jobs">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-white">
                학교 채용
              </div>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-white">
                채용 공고
              </h2>
            </div>
            <Link
              href="/jobs"
              className="inline-flex items-center gap-2 text-sm font-semibold text-white"
            >
              전체 보기
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {publicJobPreview.map((job) => (
              <article
                key={job.id}
                className="rounded-[28px] border border-white/10 bg-white/[0.06] p-5 text-white transition-colors hover:bg-white/10"
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
                  <p className="text-sm leading-6 text-white">{job.summary}</p>

                  <div className="mt-5 space-y-3 text-sm text-white">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-white" />
                      {job.schoolRegion} / {job.gradeLevel}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock3 className="h-4 w-4 text-white" />
                      {job.schedule}
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-white" />
                      {job.detail}
                    </div>
                  </div>

                  <Link
                    href={`/jobs/${job.id}`}
                    className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white"
                  >
                    공고 상세 보기
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
