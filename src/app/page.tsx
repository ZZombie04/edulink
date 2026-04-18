import Link from "next/link";
import { ArrowRight, Briefcase, Building2, Clock3, MapPin, Search, Users } from "lucide-react";

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
            <div className="text-lg font-bold tracking-tight">EduLink</div>
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-medium text-white/75 md:flex">
            <Link href="#candidate-pool" className="transition-colors hover:text-white">
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
        <section className="relative min-h-[68vh] overflow-hidden">
          <img
            alt="학교 교실"
            className="absolute inset-0 h-full w-full object-cover"
            src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1600&q=80"
          />
          <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(7,18,43,0.92),rgba(0,88,190,0.72),rgba(0,110,47,0.42))]" />

          <div className="relative mx-auto flex min-h-[68vh] max-w-7xl flex-col justify-center px-4 pb-20 pt-20 sm:px-6">
            <div className="max-w-3xl">
              <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
                경기도 학교 교원 채용
              </h1>

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
            </div>
          </div>
        </section>

        <section className="relative z-10 -mt-10 px-4 sm:px-6" id="candidate-pool">
          <div className="mx-auto max-w-7xl">
            <div className="panel-surface p-6 sm:p-8">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-3xl font-bold tracking-tight text-ink">인재풀</h2>
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
                            <div className="text-lg font-bold text-ink">{teacher.name}</div>
                            <div className="text-sm text-ink-soft">{teacher.qualification}</div>
                          </div>
                        </div>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}>
                          {status.label}
                        </span>
                      </div>

                      <div className="mt-4 grid gap-3 text-sm text-ink-soft">
                        <div className="rounded-lg bg-surface-panel px-3 py-2">{teacher.experience}</div>
                        <div className="rounded-lg bg-surface-panel px-3 py-2">{teacher.residence}</div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium text-ink-muted">
                        {teacher.preferredRegions.map((region) => (
                          <span key={region} className="rounded-full bg-surface-panel px-2.5 py-1">
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
            <h2 className="text-3xl font-bold tracking-tight text-ink">채용 공고</h2>
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
                  className="panel-surface overflow-hidden transition-transform hover:-translate-y-1"
                >
                  <img alt={job.schoolName} className="h-52 w-full object-cover" src={job.image} />
                  <div className="p-6">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}>
                      {status.label}
                    </span>
                    <h3 className="mt-4 text-xl font-bold text-ink">{job.schoolName}</h3>

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
