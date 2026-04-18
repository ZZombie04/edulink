import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  Building2,
  Clock3,
  MapPin,
  Search,
  Sparkles,
  Users,
} from "lucide-react";

import { CharacterAvatar } from "@/components/character-avatar";
import { featuredTeachers, jobPosts } from "@/lib/demo-data";

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

export default function Home() {
  const openJobs = jobPosts.filter((job) => job.status !== "closed");

  return (
    <div className="min-h-screen bg-surface text-ink">
      <header className="sticky top-0 z-50 border-b border-white/20 bg-[rgba(7,18,43,0.72)] backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3 text-white">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/12">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <div className="text-lg font-bold tracking-tight">EduLink</div>
              <div className="text-xs text-white/65">학교 교원 매칭 플랫폼</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-medium text-white/75 md:flex">
            <Link href="#candidate-pool" className="transition-colors hover:text-white">
              인재풀
            </Link>
            <Link href="#jobs" className="transition-colors hover:text-white">
              채용 공고
            </Link>
            <Link href="#overview" className="transition-colors hover:text-white">
              운영 개요
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
              href="/auth/register/hr"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-primary-700 transition-transform hover:-translate-y-px"
            >
              학교로 시작하기
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative min-h-[76vh] overflow-hidden">
          <img
            alt="교실에서 학생과 교사가 함께 있는 장면"
            className="absolute inset-0 h-full w-full object-cover"
            src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1600&q=80"
          />
          <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(7,18,43,0.92),rgba(0,88,190,0.72),rgba(0,110,47,0.42))]" />

          <div className="relative mx-auto flex min-h-[76vh] max-w-7xl flex-col justify-center px-4 pb-24 pt-20 sm:px-6">
            <div className="max-w-3xl">
              <span className="kicker text-white/85 before:bg-white" id="overview">
                경기권 학교 채용 허브
              </span>
              <h1 className="mt-6 text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
                학교가 필요한 교사를
                <br />
                더 빠르고 선명하게 연결합니다.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-white/78 sm:text-lg">
                인재풀 탐색, 공고 등록, 매칭 요청, 승인 운영까지 한 흐름으로 이어지는
                교원 채용 포털입니다. 오늘 바로 확인 가능한 후보와 공고를 같은 화면에서
                이어보세요.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/pool"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-primary-700 transition-transform hover:-translate-y-px"
                >
                  <Search className="h-4 w-4" />
                  인재풀 바로 보기
                </Link>
                <Link
                  href="/jobs"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/25 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/16"
                >
                  <Briefcase className="h-4 w-4" />
                  채용 공고 둘러보기
                </Link>
              </div>
            </div>

            <div className="mt-14 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  label: "활성 인재풀",
                  value: "247명",
                  detail: "오늘 18건 업데이트",
                },
                {
                  label: "진행 중 공고",
                  value: "18건",
                  detail: "학교별 빠른 응답 체계",
                },
                {
                  label: "평균 매칭 리드타임",
                  value: "2.3일",
                  detail: "전주 대비 0.4일 단축",
                },
                {
                  label: "지금 검토 중 요청",
                  value: "9건",
                  detail: "인사담당 승인 대기 포함",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-lg border border-white/18 bg-white/10 p-5 text-white backdrop-blur"
                >
                  <div className="text-sm font-medium text-white/72">{item.label}</div>
                  <div className="mt-2 text-3xl font-bold">{item.value}</div>
                  <div className="mt-2 text-sm text-white/65">{item.detail}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative z-10 -mt-10 px-4 sm:px-6" id="candidate-pool">
          <div className="mx-auto grid max-w-7xl gap-6 xl:grid-cols-[1.3fr_0.7fr]">
            <div className="panel-surface p-6 sm:p-8">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <span className="kicker text-primary-700">추천 인재</span>
                  <h2 className="mt-4 text-3xl font-bold tracking-tight text-ink">
                    지금 바로 검토할 수 있는 후보
                  </h2>
                  <div className="section-rule mt-4" />
                </div>
                <Link
                  href="/pool"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary-700"
                >
                  전체 인재풀 보기
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
                            <div className="text-lg font-bold text-ink">{teacher.name}</div>
                            <div className="text-sm text-ink-soft">
                              {teacher.age}세 · {teacher.qualification}
                            </div>
                          </div>
                        </div>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}>
                          {status.label}
                        </span>
                      </div>

                      <p className="mt-4 text-sm leading-6 text-ink-soft">{teacher.summary}</p>

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

                      <div className="mt-5 flex items-center justify-between text-sm text-ink-soft">
                        <span>{teacher.experience}</span>
                        <span>프로필 조회 {teacher.portfolioViews}</span>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>

            <div className="panel-surface overflow-hidden">
              <img
                alt="학교 복도 풍경"
                className="h-52 w-full object-cover"
                src="https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=1200&q=80"
              />
              <div className="p-6">
                <span className="kicker text-secondary-700 before:bg-[var(--secondary-solid)]">
                  운영 흐름
                </span>
                <div className="mt-4 space-y-4">
                  {[
                    ["인재 탐색", "지역, 자격, 근무 형태별로 조건을 조합해 후보를 압축합니다."],
                    ["빠른 요청", "관심 후보에게 바로 매칭 요청을 보내고 응답 상태를 추적합니다."],
                    ["승인 관리", "학교 승인과 공고 운영을 같은 톤으로 이어서 정리합니다."],
                  ].map(([title, detail]) => (
                    <div key={title} className="rounded-lg bg-surface-subtle p-4">
                      <div className="text-sm font-semibold text-ink">{title}</div>
                      <div className="mt-1 text-sm leading-6 text-ink-soft">{detail}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6" id="jobs">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="kicker text-primary-700">열린 채용</span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-ink">
                학교가 지금 찾고 있는 자리
              </h2>
              <div className="section-rule mt-4" />
            </div>
            <Link
              href="/jobs"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary-700"
            >
              전체 공고 보기
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {openJobs.map((job) => {
              const status = jobStatusLabel(job.status);

              return (
                <article
                  key={job.id}
                  className="panel-surface overflow-hidden transition-transform hover:-translate-y-1"
                >
                  <img
                    alt={job.schoolName}
                    className="h-52 w-full object-cover"
                    src={job.image}
                  />
                  <div className="p-6">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}>
                      {status.label}
                    </span>
                    <h3 className="mt-4 text-xl font-bold text-ink">
                      {job.schoolName}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-ink-soft">{job.summary}</p>

                    <div className="mt-5 space-y-3 text-sm text-ink-soft">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary-600" />
                        {job.schoolRegion} · {job.gradeLevel}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock3 className="h-4 w-4 text-primary-600" />
                        {job.startDate} - {job.endDate}
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary-600" />
                        지원자 {job.applicants}명 · 조회 {job.views}
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

        <section className="border-t border-outline bg-surface-subtle">
          <div className="mx-auto grid max-w-7xl gap-6 px-4 py-16 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
            {[
              {
                title: "학교 인사담당",
                detail: "공고 등록부터 승인 추적까지 한 흐름으로 관리합니다.",
                Icon: Building2,
              },
              {
                title: "구직 교사",
                detail: "근무 가능 지역과 형태를 빠르게 공개하고 제안을 받습니다.",
                Icon: Users,
              },
              {
                title: "검색 중심 UX",
                detail: "조건을 좁힐수록 결과가 자연스럽게 정리되도록 구성했습니다.",
                Icon: Search,
              },
              {
                title: "빠른 액션",
                detail: "중요한 버튼과 상태를 한눈에 보이게 정리했습니다.",
                Icon: Sparkles,
              },
            ].map((item) => (
              <div key={item.title} className="rounded-lg bg-white p-6 shadow-panel">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
                  <item.Icon className="h-5 w-5" />
                </div>
                <div className="mt-4 text-lg font-bold text-ink">{item.title}</div>
                <div className="mt-2 text-sm leading-6 text-ink-soft">{item.detail}</div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
