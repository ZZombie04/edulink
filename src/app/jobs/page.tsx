"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  Building2,
  CalendarDays,
  MapPin,
  Search,
} from "lucide-react";

import { gyeonggiRegions, jobPosts } from "@/lib/demo-data";

const employmentTypes = ["기간제 교사", "시간강사"] as const;
const qualificationTypes = ["초등", "중등", "특수"] as const;

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

export default function JobsPage() {
  const [query, setQuery] = useState("");
  const [regionFilters, setRegionFilters] = useState<string[]>(["수원", "화성", "용인"]);
  const [employmentFilters, setEmploymentFilters] = useState<string[]>([
    "기간제 교사",
    "시간강사",
  ]);
  const [qualificationFilters, setQualificationFilters] = useState<string[]>([
    "초등",
    "중등",
  ]);

  const filteredJobs = useMemo(() => {
    const lowered = query.trim().toLowerCase();

    return jobPosts.filter((job) => {
      const matchesQuery =
        lowered.length === 0 ||
        [job.schoolName, job.summary, job.gradeLevel, job.qualificationType]
          .join(" ")
          .toLowerCase()
          .includes(lowered);

      return (
        matchesQuery &&
        regionFilters.includes(job.schoolRegion) &&
        employmentFilters.includes(job.employmentType) &&
        qualificationFilters.includes(job.qualificationType)
      );
    });
  }, [employmentFilters, qualificationFilters, query, regionFilters]);

  const toggleFilter = (value: string, current: string[], setter: (next: string[]) => void) => {
    if (current.includes(value)) {
      setter(current.filter((item) => item !== value));
      return;
    }

    setter([...current, value]);
  };

  return (
    <div className="min-h-screen bg-surface text-ink">
      <header className="sticky top-0 z-50 border-b border-outline bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <div className="text-lg font-bold tracking-tight">EduLink</div>
              <div className="text-xs text-ink-muted">학교 교원 매칭 플랫폼</div>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/auth/login"
              className="hidden rounded-lg border border-outline px-4 py-2 text-sm font-semibold text-ink-soft sm:inline-flex"
            >
              로그인
            </Link>
            <Link
              href="/auth/register/hr"
              className="inline-flex items-center gap-2 rounded-lg bg-[linear-gradient(135deg,#0058be,#2170e4)] px-4 py-2 text-sm font-semibold text-white shadow-soft"
            >
              학교 가입
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <img
          alt="학교 외관"
          className="absolute inset-0 h-full w-full object-cover"
          src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1600&q=80"
        />
        <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(7,18,43,0.88),rgba(0,88,190,0.70))]" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <span className="kicker text-white/85 before:bg-white">채용 공고</span>
          <h1 className="mt-5 max-w-3xl text-4xl font-bold leading-tight text-white sm:text-5xl">
            지금 바로 지원 가능한
            <br />
            학교 채용 공고를 모았습니다.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-white/78">
            지역, 자격, 고용 형태 기준으로 공고를 빠르게 좁혀볼 수 있습니다. 마감
            임박 공고가 먼저 눈에 들어오도록 정보 밀도를 다시 설계했습니다.
          </p>

          <div className="mt-8 max-w-2xl">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/62" />
              <input
                className="w-full rounded-lg border border-white/18 bg-white/12 py-4 pl-11 pr-4 text-sm text-white placeholder:text-white/58 backdrop-blur outline-none transition focus:border-white/36"
                placeholder="학교명, 지역, 자격으로 검색"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <section className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="panel-muted h-fit p-5 lg:sticky lg:top-24">
            <div className="flex items-center justify-between">
              <div className="text-sm font-bold uppercase tracking-[0.16em] text-ink-soft">
                필터
              </div>
              <button
                type="button"
                className="text-xs font-semibold text-primary-700"
                onClick={() => {
                  setQuery("");
                  setRegionFilters(["수원", "화성", "용인"]);
                  setEmploymentFilters(["기간제 교사", "시간강사"]);
                  setQualificationFilters(["초등", "중등"]);
                }}
              >
                초기화
              </button>
            </div>

            <div className="mt-6 space-y-6">
              <div>
                <div className="text-sm font-semibold text-ink">지역</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {gyeonggiRegions.slice(0, 8).map((region) => (
                    <button
                      key={region}
                      type="button"
                      className={`rounded-full px-3 py-2 text-sm font-medium ${
                        regionFilters.includes(region)
                          ? "bg-primary-50 text-primary-700"
                          : "bg-white text-ink-soft"
                      }`}
                      onClick={() => toggleFilter(region, regionFilters, setRegionFilters)}
                    >
                      {region}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-sm font-semibold text-ink">고용 형태</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {employmentTypes.map((type) => (
                    <button
                      key={type}
                      type="button"
                      className={`rounded-full px-3 py-2 text-sm font-medium ${
                        employmentFilters.includes(type)
                          ? "bg-primary-50 text-primary-700"
                          : "bg-white text-ink-soft"
                      }`}
                      onClick={() =>
                        toggleFilter(type, employmentFilters, setEmploymentFilters)
                      }
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-sm font-semibold text-ink">자격 유형</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {qualificationTypes.map((type) => (
                    <button
                      key={type}
                      type="button"
                      className={`rounded-full px-3 py-2 text-sm font-medium ${
                        qualificationFilters.includes(type)
                          ? "bg-primary-50 text-primary-700"
                          : "bg-white text-ink-soft"
                      }`}
                      onClick={() =>
                        toggleFilter(type, qualificationFilters, setQualificationFilters)
                      }
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <div className="space-y-4">
            <div className="panel-surface p-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="text-2xl font-bold text-ink">열린 채용 공고</div>
                  <div className="mt-1 text-sm text-ink-soft">
                    조건에 맞는 공고 {filteredJobs.length}건
                  </div>
                </div>
                <div className="rounded-full bg-surface-subtle px-4 py-2 text-sm font-semibold text-primary-700">
                  마감 임박 공고가 우선 노출됩니다
                </div>
              </div>
            </div>

            {filteredJobs.map((job) => {
              const status = jobStatusLabel(job.status);

              return (
                <article
                  key={job.id}
                  className="panel-surface overflow-hidden transition-transform hover:-translate-y-1"
                >
                  <div className="grid gap-0 md:grid-cols-[240px_minmax(0,1fr)]">
                    <img
                      alt={job.schoolName}
                      className="h-full min-h-[220px] w-full object-cover"
                      src={job.image}
                    />
                    <div className="p-6">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}>
                        {status.label}
                      </span>
                      <h2 className="mt-4 text-2xl font-bold text-ink">
                        {job.schoolName}
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-ink-soft">{job.summary}</p>

                      <div className="mt-5 grid gap-3 text-sm text-ink-soft sm:grid-cols-2">
                        <div className="rounded-lg bg-surface-subtle px-3 py-2">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-primary-600" />
                            {job.schoolRegion}
                          </div>
                        </div>
                        <div className="rounded-lg bg-surface-subtle px-3 py-2">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-primary-600" />
                            {job.gradeLevel}
                          </div>
                        </div>
                        <div className="rounded-lg bg-surface-subtle px-3 py-2">
                          <div className="flex items-center gap-2">
                            <CalendarDays className="h-4 w-4 text-primary-600" />
                            {job.startDate} - {job.endDate}
                          </div>
                        </div>
                        <div className="rounded-lg bg-surface-subtle px-3 py-2">
                          <div className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-primary-600" />
                            {job.employmentType} · {job.qualificationType}
                            {job.qualificationSubject ? ` ${job.qualificationSubject}` : ""}
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="text-sm text-ink-soft">
                          지원자 {job.applicants}명 · 조회 {job.views} · 마감 {job.deadline}
                        </div>
                        <Link
                          href={`/jobs/${job.id}`}
                          className="inline-flex items-center gap-2 text-sm font-semibold text-primary-700"
                        >
                          상세 보기
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
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
