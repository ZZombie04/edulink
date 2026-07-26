import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Bell,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  LayoutDashboard,
  MapPin,
  Search,
  ShieldCheck,
  UserRoundCheck,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

import { BrandLockup } from "@/components/brand";
import { CharacterAvatar } from "@/components/character-avatar";
import {
  RotatingJobShowcase,
  RotatingPoolShowcase,
} from "@/components/home-rotating-sections";
import { LogoutButton } from "@/components/logout-button";
import { getDashboardHref } from "@/lib/demo-session";
import { getDemoSessionFromServerCookie } from "@/lib/demo-session-server";
import { featuredTeachers, jobPosts, teacherMatchRequests } from "@/lib/demo-data";

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
    summary:
      "학급 운영, 생활지도, 기초학력 보강 경험을 중심으로 검토할 수 있는 교사 프로필입니다.",
    tags: ["초등 자격", "담임 경력", "경기 남부"],
  },
  {
    avatarPreset: "teacher-m-navy",
    href: "/pool/2",
    title: "중등 수학",
    summary:
      "교과 수업과 평가 운영 경험, 근무 가능 시점을 한눈에 확인할 수 있습니다.",
    tags: ["중등 자격", "수학", "경기 서남"],
  },
  {
    avatarPreset: "teacher-f-violet",
    href: "/pool/4",
    title: "특수교육 지원",
    summary:
      "통합학급 지원과 개별화 수업 경험을 중심으로 정리된 검증 대기 프로필입니다.",
    tags: ["특수 자격", "지원 수업", "경기 동부"],
  },
];

const publicJobPreview = [
  {
    id: "1",
    schoolName: "정인초등학교",
    schoolRegion: "수원",
    gradeLevel: "3학년 담임",
    employmentType: "기간제 교사",
    qualificationType: "초등",
    summary: "3학년 담임과 생활지도를 담당할 기간제 교사를 모집합니다.",
    schedule: "2026.08.18 - 2026.12.18",
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
    summary: "중학교 1학년 수학 수업을 맡을 시간강사를 모집합니다.",
    schedule: "2026.08.10 - 2026.09.18",
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
    summary: "영어 수업과 학년 운영 업무를 맡을 기간제 교사를 모집합니다.",
    schedule: "2026.03.01 - 2027.02.28",
    detail: "교과 수업 / 학년 운영",
  },
];

const startLinks: Array<{
  Icon: LucideIcon;
  href: string;
  title: string;
  detail: string;
}> = [
  {
    Icon: Search,
    href: "/auth/login?next=/pool",
    title: "교사 인력풀 찾기",
    detail: "자격·경력·희망 조건으로 탐색",
  },
  {
    Icon: BriefcaseBusiness,
    href: "/jobs",
    title: "채용 공고 보기",
    detail: "기간제·시간강사 공고 확인",
  },
  {
    Icon: Building2,
    href: "/auth/register/hr",
    title: "학교 계정 신청",
    detail: "승인 후 채용 기능 이용",
  },
];

function statusLabel(status: string) {
  switch (status) {
    case "seeking":
      return "채용 제안 가능";
    case "interviewing":
      return "면접 진행 중";
    case "employed":
      return "근무 중";
    default:
      return "프로필 비공개";
  }
}

export default async function Home() {
  const session = await getDemoSessionFromServerCookie();
  const demoMode = process.env.EDULINK_ENABLE_DEMO_SEED === "true";
  const dashboardHref = getDashboardHref(session?.role);
  const openJobs = demoMode
    ? jobPosts.filter((job) => job.status !== "closed")
    : [];
  const signedInTeacher =
    demoMode && session?.role === "teacher"
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
  const primaryHeroHref =
    session?.role === "teacher"
      ? "/teacher/dashboard"
      : session?.role === "hr"
        ? "/pool"
        : "/auth/register/hr";
  const primaryHeroLabel =
    session?.role === "teacher"
      ? "내 대시보드 열기"
      : session?.role === "hr"
        ? "교사 인력풀 보기"
        : "학교 계정으로 시작";

  return (
    <div className="min-h-screen bg-surface text-ink">
      <header className="sticky top-0 z-50 border-b border-outline bg-[rgba(247,246,241,0.94)] backdrop-blur">
        <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between gap-5 px-4 sm:px-6">
          <Link href="/" aria-label="EduLink 홈">
            <BrandLockup />
          </Link>

          <nav
            className="hidden items-center gap-7 text-sm font-semibold text-ink-soft md:flex"
            aria-label="주요 메뉴"
          >
            <Link href="#teacher-pool" className="hover:text-primary-700">
              교사 인력풀
            </Link>
            <Link href="#jobs" className="hover:text-primary-700">
              채용 공고
            </Link>
            <Link href="#how-it-works" className="hover:text-primary-700">
              이용 방법
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            {dashboardHref ? (
              <>
                <Link
                  href={dashboardHref}
                  className="inline-flex min-h-10 items-center gap-2 border border-outline bg-surface-contrast px-3.5 text-sm font-semibold text-ink transition-colors hover:border-primary-400"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden sm:inline">내 대시보드</span>
                  <span className="sm:hidden">내 홈</span>
                </Link>
                <LogoutButton className="hidden min-h-10 border-outline bg-transparent text-ink-soft hover:bg-surface-panel sm:inline-flex" />
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="inline-flex px-2 py-2 text-sm font-semibold text-ink-soft hover:text-primary-700 sm:px-3"
                >
                  로그인
                </Link>
                <Link
                  href="/auth/register/teacher"
                  className="hidden min-h-10 items-center border border-outline bg-surface-contrast px-3.5 text-sm font-semibold text-ink hover:border-primary-400 md:inline-flex"
                >
                  교사 가입
                </Link>
                <Link
                  href="/auth/register/hr"
                  className="inline-flex min-h-10 items-center gap-2 bg-primary-700 px-3.5 text-sm font-semibold text-white transition-colors hover:bg-primary-800"
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
        <section className="border-b border-outline">
          <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[minmax(0,1.08fr)_minmax(400px,0.92fr)] lg:items-center lg:py-28">
            <div className="max-w-3xl">
              <p className="kicker">
                {signedInTeacher
                  ? `${signedInTeacher.name} 선생님의 채용 네트워크`
                  : "학교와 교사를 위한 채용 네트워크"}
              </p>
              <h1 className="mt-6 break-keep text-[clamp(2.65rem,7vw,5.4rem)] font-bold leading-[1.05] tracking-[-0.06em] text-ink">
                {signedInTeacher ? (
                  <>
                    새로운 제안을
                    <br />
                    한눈에 확인하세요.
                  </>
                ) : (
                  <>
                    교육의 다음을,
                    <br />
                    사람으로 연결합니다.
                  </>
                )}
              </h1>
              <p className="mt-7 max-w-2xl break-keep text-base leading-8 text-ink-soft sm:text-lg">
                {signedInTeacher
                  ? "현재 프로필 노출 상태와 학교의 채용 제안, 희망 근무 조건을 안전하게 관리할 수 있습니다."
                  : "검증된 교사 프로필과 구체적인 학교 채용 정보를 바탕으로, 필요한 사람과 기회를 더 정확하게 연결합니다."}
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={primaryHeroHref}
                  className="inline-flex min-h-12 items-center justify-center gap-2 bg-primary-700 px-5 text-sm font-bold text-white transition-colors hover:bg-primary-800"
                >
                  {session?.role === "teacher" ? (
                    <LayoutDashboard className="h-4 w-4" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  {primaryHeroLabel}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/jobs"
                  className="inline-flex min-h-12 items-center justify-center gap-2 border border-outline-strong bg-transparent px-5 text-sm font-bold text-ink transition-colors hover:bg-surface-contrast"
                >
                  <BriefcaseBusiness className="h-4 w-4" />
                  채용 공고 보기
                </Link>
              </div>

              <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 border-t border-outline pt-5 text-sm text-ink-soft">
                {[
                  "승인된 학교 계정",
                  "자격·경력 기반 매칭",
                  "단계별 개인정보 보호",
                ].map((item) => (
                  <span key={item} className="inline-flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary-600" />
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="border border-outline bg-surface-contrast">
              {signedInTeacher ? (
                <>
                  <div className="flex items-start gap-4 border-b border-outline p-6">
                    <CharacterAvatar
                      presetId={signedInTeacher.avatarPreset}
                      size={72}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-bold text-primary-700">
                          {statusLabel(signedInTeacher.status)}
                        </span>
                        <span className="text-xs text-ink-muted">
                          프로필 조회 {signedInTeacher.portfolioViews}회
                        </span>
                      </div>
                      <h2 className="mt-2 text-xl font-bold text-ink">
                        {signedInTeacher.qualification}
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-ink-soft">
                        {signedInTeacher.summary}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 border-b border-outline">
                    {[
                      ["받은 제안", `${teacherRequests.length}건`],
                      ["희망 지역", `${signedInTeacher.preferredRegions.length}곳`],
                      ["등록 공고", `${openJobs.length}건`],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="border-r border-outline px-4 py-5 last:border-r-0"
                      >
                        <div className="text-xs text-ink-muted">{label}</div>
                        <div className="mt-1.5 text-xl font-bold text-ink">
                          {value}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="flex items-center justify-between px-5 py-4">
                      <span className="inline-flex items-center gap-2 text-sm font-bold">
                        <Bell className="h-4 w-4 text-primary-600" />
                        최근 받은 제안
                      </span>
                      <Link
                        href="/teacher/dashboard"
                        className="text-xs font-bold text-primary-700"
                      >
                        전체 보기
                      </Link>
                    </div>
                    {teacherRequests.slice(0, 2).map((request) => (
                      <Link
                        key={request.id}
                        href={`/teacher/offers/${request.id}`}
                        className="flex items-center justify-between gap-4 border-t border-outline px-5 py-4 hover:bg-surface-subtle"
                      >
                        <div>
                          <div className="text-sm font-bold text-ink">
                            {request.schoolName}
                          </div>
                          <div className="mt-1 flex items-center gap-1.5 text-xs text-ink-muted">
                            <MapPin className="h-3.5 w-3.5" />
                            {request.region} · {request.position}
                          </div>
                        </div>
                        <ArrowUpRight className="h-4 w-4 text-ink-muted" />
                      </Link>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-primary-900 px-6 py-7 text-white">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="text-xs font-semibold text-white/60">
                          지금 EduLink에서
                        </div>
                        <div className="mt-2 text-2xl font-bold">
                          필요한 채용 업무를 시작하세요
                        </div>
                      </div>
                      <UsersRound className="h-8 w-8 text-[#b7cec1]" />
                    </div>
                    <div className="mt-6 grid grid-cols-2 border-t border-white/16 pt-5">
                      <div>
                        <div className="text-xs text-white/55">등록 교사</div>
                        <div className="mt-1 text-2xl font-bold">
                          {demoMode ? `${featuredTeachers.length}명` : "—"}
                        </div>
                      </div>
                      <div className="border-l border-white/16 pl-5">
                        <div className="text-xs text-white/55">모집 중 공고</div>
                        <div className="mt-1 text-2xl font-bold">
                          {openJobs.length}건
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    {startLinks.map(({ Icon, href, title, detail }) => (
                      <Link
                        key={title}
                        href={
                          title === "교사 인력풀 찾기" &&
                          session?.role === "hr"
                            ? "/pool"
                            : href
                        }
                        className="grid grid-cols-[auto_1fr_auto] items-center gap-4 border-b border-outline px-5 py-5 transition-colors last:border-b-0 hover:bg-surface-subtle"
                      >
                        <Icon className="h-5 w-5 text-primary-600" />
                        <div>
                          <div className="text-sm font-bold text-ink">{title}</div>
                          <div className="mt-1 text-xs text-ink-muted">
                            {detail}
                          </div>
                        </div>
                        <ArrowUpRight className="h-4 w-4 text-ink-muted" />
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        <section
          className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24"
          id="teacher-pool"
        >
          <div className="mb-9 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="kicker">Talent network</p>
              <h2 className="mt-4 text-3xl font-bold tracking-[-0.045em] text-ink sm:text-4xl">
                조건에 맞는 교사를 더 빠르게
              </h2>
              <p className="mt-3 max-w-2xl break-keep text-sm leading-7 text-ink-soft">
                공개 프로필에는 자격과 경력, 희망 조건만 표시되며 상세 연락처는
                제안 수락 이후 확인할 수 있습니다.
              </p>
            </div>
            <Link
              href={
                session?.role === "hr"
                  ? "/pool"
                  : "/auth/login?next=/pool"
              }
              className="inline-flex items-center gap-2 text-sm font-bold text-primary-700 hover:underline"
            >
              인력풀 전체 보기
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {demoMode ? (
            <RotatingPoolShowcase items={publicPoolPreview} />
          ) : (
            <div className="border-y border-outline bg-surface-contrast px-6 py-14 text-center">
              <h3 className="text-lg font-bold text-ink">
                등록된 교사 프로필은 승인된 학교 계정에서 확인합니다.
              </h3>
              <p className="mt-2 text-sm leading-6 text-ink-soft">
                개인정보 보호를 위해 공개 화면에는 실제 인재 정보를 노출하지
                않습니다.
              </p>
            </div>
          )}
        </section>

        <section
          className="bg-primary-900 text-white"
          id="how-it-works"
        >
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24">
            <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr]">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#a9c4b6]">
                  How it works
                </p>
                <h2 className="mt-4 break-keep text-3xl font-bold tracking-[-0.045em] sm:text-4xl">
                  신뢰를 지키는 채용 절차
                </h2>
                <p className="mt-4 break-keep text-sm leading-7 text-white/66">
                  가입부터 제안, 검토까지 각 역할에 필요한 정보와 기능을
                  구분했습니다.
                </p>
              </div>

              <div className="border-t border-white/18">
                {[
                  {
                    number: "01",
                    Icon: UserRoundCheck,
                    title: "프로필과 학교 정보 등록",
                    detail: "교사는 자격·경력, 학교는 담당자와 기관 정보를 등록합니다.",
                  },
                  {
                    number: "02",
                    Icon: ShieldCheck,
                    title: "권한과 자격 검토",
                    detail: "학교 계정은 관리자 승인 후 인력풀과 채용 기능을 이용합니다.",
                  },
                  {
                    number: "03",
                    Icon: BriefcaseBusiness,
                    title: "공고·제안·지원 관리",
                    detail: "학교와 교사가 각자의 대시보드에서 진행 상태를 확인합니다.",
                  },
                ].map(({ number, Icon, title, detail }) => (
                  <div
                    key={number}
                    className="grid gap-4 border-b border-white/18 py-6 sm:grid-cols-[48px_36px_1fr] sm:items-start"
                  >
                    <span className="text-xs font-bold text-[#a9c4b6]">
                      {number}
                    </span>
                    <Icon className="h-5 w-5 text-[#b9d0c3]" />
                    <div>
                      <h3 className="text-base font-bold text-white">{title}</h3>
                      <p className="mt-2 text-sm leading-6 text-white/62">
                        {detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section
          className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24"
          id="jobs"
        >
          <div className="mb-9 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="kicker">Open positions</p>
              <h2 className="mt-4 text-3xl font-bold tracking-[-0.045em] text-ink sm:text-4xl">
                지금 확인할 수 있는 채용 공고
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-ink-soft">
                근무 형태, 기간, 자격 조건을 확인하고 지원 과정을 이어가세요.
              </p>
            </div>
            <Link
              href="/jobs"
              className="inline-flex items-center gap-2 text-sm font-bold text-primary-700 hover:underline"
            >
              채용 공고 전체 보기
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {demoMode ? (
            <RotatingJobShowcase items={publicJobPreview} />
          ) : (
            <div className="border-y border-outline bg-surface-contrast px-6 py-14 text-center">
              <h3 className="text-lg font-bold text-ink">
                현재 공개된 채용 공고가 없습니다.
              </h3>
              <p className="mt-2 text-sm leading-6 text-ink-soft">
                승인된 학교가 공고를 등록하면 이 영역과 공고 목록에 표시됩니다.
              </p>
            </div>
          )}
        </section>

        <section className="border-t border-outline bg-surface-contrast">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-4 py-16 sm:px-6 lg:flex-row lg:items-center">
            <div>
              <p className="kicker">Join Edulink</p>
              <h2 className="mt-4 break-keep text-3xl font-bold tracking-[-0.045em] text-ink">
                더 나은 채용 연결을 시작하세요.
              </h2>
              <p className="mt-3 text-sm leading-7 text-ink-soft">
                교사와 학교에 맞는 가입 절차를 선택할 수 있습니다.
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Link
                href="/auth/register/teacher"
                className="inline-flex min-h-12 items-center justify-center gap-2 border border-outline-strong px-5 text-sm font-bold text-ink hover:bg-surface-subtle"
              >
                교사로 가입
              </Link>
              <Link
                href="/auth/register/hr"
                className="inline-flex min-h-12 items-center justify-center gap-2 bg-primary-700 px-5 text-sm font-bold text-white hover:bg-primary-800"
              >
                학교 계정 신청
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-outline bg-surface px-4 py-7 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 text-xs text-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <BrandLockup className="[&>span:first-child]:h-7 [&>span:first-child]:w-7" />
          <p>학교와 교사의 개인정보는 역할과 채용 단계에 따라 보호됩니다.</p>
        </div>
      </footer>
    </div>
  );
}
