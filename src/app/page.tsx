import Link from "next/link";
import {
  ArrowRight,
  Bell,
  Briefcase,
  Clock3,
  LayoutDashboard,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

import { BrandLockup } from "@/components/brand";
import { CharacterAvatar } from "@/components/character-avatar";
import { JobVisual } from "@/components/job-visual";
import { getDemoSessionFromServerCookie } from "@/lib/demo-session-server";
import { featuredTeachers, jobPosts, teacherMatchRequests } from "@/lib/demo-data";

type TeacherStatusTone = {
  className: string;
  label: string;
};

const publicLaunchRows: Array<{
  Icon: LucideIcon;
  detail: string;
  meta: string;
  title: string;
}> = [
  {
    Icon: Search,
    title: "교사 인력풀",
    detail: "경력, 자격, 희망 지역을 기준으로 바로 탐색",
    meta: "즉시 확인",
  },
  {
    Icon: Briefcase,
    title: "채용 공고",
    detail: "기간제와 시간강사 공고를 한 화면에서 정리",
    meta: "바로 등록",
  },
  {
    Icon: ShieldCheck,
    title: "학교 계정",
    detail: "학교 가입 후 승인 흐름까지 끊김 없이 진행",
    meta: "운영 연결",
  },
];

const publicPoolPreview: Array<{
  avatarPreset: Parameters<typeof CharacterAvatar>[0]["presetId"];
  summary: string;
  tags: string[];
  title: string;
}> = [
  {
    avatarPreset: "teacher-f-mint",
    title: "초등 담임",
    summary: "학급 운영, 생활지도, 기초학력 보강 중심으로 빠르게 검토합니다.",
    tags: ["초등 자격", "담임", "남부권"],
  },
  {
    avatarPreset: "teacher-m-navy",
    title: "중등 수학",
    summary: "중등 교과 수업과 평가 운영이 가능한 프로필 흐름으로 정리합니다.",
    tags: ["중등 자격", "수학", "서남권"],
  },
  {
    avatarPreset: "teacher-f-violet",
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
    id: "101",
    schoolName: "초등 담임 공고",
    schoolRegion: "경기 남부",
    gradeLevel: "3학년 담임",
    employmentType: "기간제",
    qualificationType: "초등",
    summary: "학급 운영과 생활지도를 바로 이어갈 수 있는 공고 형식으로 정리했습니다.",
    schedule: "즉시 시작 - 학기말",
    detail: "주 5일 / 담임",
  },
  {
    id: "102",
    schoolName: "중등 수학 공고",
    schoolRegion: "경기 서남부",
    gradeLevel: "1학년 교과",
    employmentType: "시간강사",
    qualificationType: "중등",
    qualificationSubject: "수학",
    summary: "교과 수업과 평가 운영 기준을 중심으로 검토하기 쉬운 구성입니다.",
    schedule: "주 3일 - 단기",
    detail: "교과 수업 / 평가",
  },
  {
    id: "103",
    schoolName: "고등 영어 공고",
    schoolRegion: "경기 동남부",
    gradeLevel: "2학년 교과",
    employmentType: "기간제",
    qualificationType: "중등",
    qualificationSubject: "영어",
    summary: "학년 운영과 교과 수업을 함께 맡는 채용 흐름을 기준으로 보여줍니다.",
    schedule: "다음 달 시작 - 학기말",
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
              <div className="grid gap-10 lg:grid-cols-[0.96fr_1.04fr] lg:items-center">
                <div className="max-w-3xl">
                  <div className="inline-flex rounded-full bg-white/12 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm">
                    경기도 기간제·시간강사
                  </div>

                  <h1 className="mt-6 text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
                    교사 인력풀과 채용 공고를
                    <br />
                    바로 시작하는 첫 화면
                  </h1>

                  <p className="mt-5 max-w-2xl text-base leading-7 text-white sm:text-lg">
                    교사는 경력과 희망 조건을 등록하고, 학교는 필요한 공고를
                    열어 바로 검토 흐름을 이어갈 수 있습니다.
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

                <div className="rounded-[32px] border border-white/14 bg-white/10 p-6 backdrop-blur-sm sm:p-7">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-white/72">
                        오늘 바로 시작
                      </div>
                      <div className="mt-2 text-2xl font-bold text-white">
                        첫 화면에서 바로 이어지는 운영 흐름
                      </div>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-2 text-xs font-semibold text-white">
                      <Sparkles className="h-3.5 w-3.5" />
                      교사 / 학교 분리 가입
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3">
                    {publicLaunchRows.map((item) => (
                      <div
                        key={item.title}
                        className="grid gap-3 rounded-[24px] border border-white/10 bg-white/8 px-4 py-4 sm:grid-cols-[auto_1fr_auto] sm:items-center"
                      >
                        <div className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-white/14 text-white">
                          <item.Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-white">
                            {item.title}
                          </div>
                          <div className="mt-1 text-sm leading-6 text-white/72">
                            {item.detail}
                          </div>
                        </div>
                        <div className="text-xs font-semibold text-white/76">
                          {item.meta}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[24px] bg-white/8 px-4 py-4">
                      <div className="text-xs font-semibold text-white/70">
                        교사 가입
                      </div>
                      <div className="mt-2 text-lg font-bold text-white">
                        경력과 희망 근무 조건 등록
                      </div>
                    </div>
                    <div className="rounded-[24px] bg-white/8 px-4 py-4">
                      <div className="text-xs font-semibold text-white/70">
                        학교 가입
                      </div>
                      <div className="mt-2 text-lg font-bold text-white">
                        채용 공고 등록과 승인 흐름 연결
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
                {publicPoolPreview.map((teacher) => (
                  <article
                    key={teacher.title}
                    className="rounded-lg border border-outline bg-surface p-5 transition-transform hover:-translate-y-1"
                  >
                    <div className="flex items-start gap-3">
                      <CharacterAvatar
                        className="h-16 w-16 rounded-lg"
                        presetId={teacher.avatarPreset}
                        size={64}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-lg font-bold text-ink">
                          {teacher.title}
                        </div>
                        <p className="mt-2 text-sm leading-6 text-ink-soft">
                          {teacher.summary}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium text-ink-muted">
                      {teacher.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-surface-panel px-2.5 py-1"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </article>
                ))}
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
            {publicJobPreview.map((job) => (
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
                  <p className="text-sm leading-6 text-ink-soft">{job.summary}</p>

                  <div className="mt-5 space-y-3 text-sm text-ink-soft">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary-600" />
                      {job.schoolRegion} / {job.gradeLevel}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock3 className="h-4 w-4 text-primary-600" />
                      {job.schedule}
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-primary-600" />
                      {job.detail}
                    </div>
                  </div>

                  <Link
                    href="/jobs"
                    className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary-700"
                  >
                    전체 공고 보기
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
