"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  Building2,
  CalendarDays,
  Check,
  Filter,
  MapPin,
  Search,
  SlidersHorizontal,
} from "lucide-react";

import { BrandLockup } from "@/components/brand";
import { HiringStateError } from "@/components/hiring-state-error";
import { JobApplyButton } from "@/components/job-apply-button";
import { LogoutButton } from "@/components/logout-button";
import { gyeonggiRegions } from "@/lib/demo-data";
import { useDemoHiringState } from "@/lib/demo-hiring-state";
import { useDemoSession } from "@/lib/demo-session-client";
import { getDashboardHref } from "@/lib/demo-session";

const employmentTypes = ["기간제 교사", "시간강사"] as const;
const qualificationTypes = ["초등", "중등", "특수"] as const;

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

function FilterButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      aria-pressed={active}
      className={`inline-flex min-h-9 items-center gap-1.5 rounded-md border px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b4a37] focus-visible:ring-offset-2 ${
        active
          ? "border-[#9eb8a9] bg-[#e7efe9] text-[#0b4a37]"
          : "border-[#dedbd2] bg-white text-[#5d6661] hover:border-[#bbb7ac] hover:text-[#17231e]"
      }`}
      onClick={onClick}
      type="button"
    >
      {active ? <Check aria-hidden="true" className="h-3.5 w-3.5" /> : null}
      {children}
    </button>
  );
}

export default function JobsPage() {
  const session = useDemoSession();
  const viewerRole = session?.role ?? "guest";
  const dashboardHref = getDashboardHref(session?.role);
  const { jobs, loaded, loadError, refresh } = useDemoHiringState();
  const [query, setQuery] = useState("");
  const [regionFilters, setRegionFilters] = useState<string[]>([]);
  const [employmentFilters, setEmploymentFilters] = useState<string[]>([]);
  const [qualificationFilters, setQualificationFilters] = useState<string[]>([]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const nextQuery = new URLSearchParams(window.location.search).get("query");
      if (nextQuery) {
        setQuery(nextQuery);
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  const filteredJobs = useMemo(() => {
    const lowered = query.trim().toLowerCase();

    return jobs
      .filter((job) => {
        const matchesQuery =
          lowered.length === 0 ||
          [
            job.schoolName,
            job.schoolRegion,
            job.summary,
            job.gradeLevel,
            job.qualificationType,
            job.qualificationSubject,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(lowered);

        return (
          matchesQuery &&
          (regionFilters.length === 0 ||
            regionFilters.includes(job.schoolRegion)) &&
          (employmentFilters.length === 0 ||
            employmentFilters.includes(job.employmentType)) &&
          (qualificationFilters.length === 0 ||
            qualificationFilters.includes(job.qualificationType))
        );
      })
      .sort((left, right) => {
        const rank = { open: 0, "closing-soon": 1, closed: 2 } as const;
        return rank[left.status] - rank[right.status];
      });
  }, [employmentFilters, jobs, qualificationFilters, query, regionFilters]);

  const activeFilterCount =
    regionFilters.length +
    employmentFilters.length +
    qualificationFilters.length;

  const clearFilters = () => {
    setQuery("");
    setRegionFilters([]);
    setEmploymentFilters([]);
    setQualificationFilters([]);
  };

  const toggleFilter = (
    value: string,
    current: string[],
    setter: (next: string[]) => void,
  ) => {
    setter(
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  };

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

          <nav aria-label="계정 메뉴" className="flex items-center gap-2">
            {dashboardHref ? (
              <>
                <Link
                  href={dashboardHref}
                  className="hidden min-h-10 items-center rounded-md border border-[#d8d5cc] bg-white px-4 py-2 text-sm font-semibold text-[#48534d] hover:bg-[#f0eee8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b4a37] sm:inline-flex"
                >
                  내 홈
                </Link>
                <LogoutButton className="border border-[#d8d5cc] bg-white text-[#48534d] hover:bg-[#f0eee8]" />
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="hidden min-h-10 items-center rounded-md border border-[#d8d5cc] bg-white px-4 py-2 text-sm font-semibold text-[#48534d] hover:bg-[#f0eee8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b4a37] sm:inline-flex"
                >
                  로그인
                </Link>
                <Link
                  href="/auth/register/hr"
                  className="inline-flex min-h-10 items-center rounded-md bg-[#0b4a37] px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(11,74,55,0.14)] hover:bg-[#083a2c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b4a37] focus-visible:ring-offset-2"
                >
                  학교 가입
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <section className="border-b border-[#d9d7cf] bg-[#123d31] text-white">
        <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#bcd2c6]">
                SCHOOL OPPORTUNITIES
              </div>
              <h1 className="mt-4 max-w-3xl break-keep text-4xl font-bold leading-tight tracking-[-0.03em] sm:text-5xl">
                교사 경력에 맞는 학교 채용을
                <br className="hidden sm:block" /> 한곳에서 확인하세요
              </h1>
              <p className="mt-4 max-w-2xl break-keep text-sm leading-7 text-[#d8e5dd] sm:text-base">
                지역과 자격, 근무 형태를 비교하고 실제 진행 상태까지 이어서
                관리할 수 있습니다.
              </p>
            </div>

            <div className="rounded-md border border-white/20 bg-white/10 p-5">
              <div className="text-sm text-[#d8e5dd]">현재 확인 가능한 공고</div>
              <div className="mt-2 text-4xl font-semibold tracking-tight">
                {jobs.filter((job) => job.status !== "closed").length}
                <span className="ml-1 text-lg font-medium text-[#d8e5dd]">건</span>
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs text-[#c8d9d0]">
                <CalendarDays aria-hidden="true" className="h-4 w-4" />
                모집 중·마감 임박 공고 기준
              </div>
            </div>
          </div>

          <div className="relative mt-9 max-w-3xl">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#59635e]"
            />
            <label className="sr-only" htmlFor="job-search">
              학교 채용 공고 검색
            </label>
            <input
              id="job-search"
              className="h-14 w-full rounded-md border border-white/30 bg-[#fbfaf6] py-4 pl-12 pr-4 text-sm text-[#17231e] shadow-[0_12px_30px_rgba(0,0,0,0.12)] outline-none placeholder:text-[#7a827e] focus:border-[#b7d0c1] focus:ring-4 focus:ring-white/15"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="학교명, 지역, 자격, 과목으로 검색"
              type="search"
              value={query}
            />
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
        <section className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="h-fit rounded-md border border-[#dedbd2] bg-[#fbfaf6] p-5 lg:sticky lg:top-24">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#26322d]">
                <SlidersHorizontal aria-hidden="true" className="h-4 w-4" />
                상세 조건
                {activeFilterCount > 0 ? (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#0b4a37] px-1 text-[10px] text-white">
                    {activeFilterCount}
                  </span>
                ) : null}
              </div>
              <button
                className="rounded-md px-2 py-1 text-xs font-semibold text-[#0b4a37] hover:bg-[#e8eee9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b4a37]"
                onClick={clearFilters}
                type="button"
              >
                전체 보기
              </button>
            </div>

            <div className="mt-6 space-y-6">
              <fieldset>
                <legend className="text-sm font-semibold text-[#26322d]">지역</legend>
                <div className="mt-3 flex flex-wrap gap-2">
                  {gyeonggiRegions.slice(0, 8).map((region) => (
                    <FilterButton
                      key={region}
                      active={regionFilters.includes(region)}
                      onClick={() =>
                        toggleFilter(region, regionFilters, setRegionFilters)
                      }
                    >
                      {region}
                    </FilterButton>
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend className="text-sm font-semibold text-[#26322d]">
                  근무 형태
                </legend>
                <div className="mt-3 flex flex-wrap gap-2">
                  {employmentTypes.map((type) => (
                    <FilterButton
                      key={type}
                      active={employmentFilters.includes(type)}
                      onClick={() =>
                        toggleFilter(
                          type,
                          employmentFilters,
                          setEmploymentFilters,
                        )
                      }
                    >
                      {type}
                    </FilterButton>
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend className="text-sm font-semibold text-[#26322d]">
                  교원 자격
                </legend>
                <div className="mt-3 flex flex-wrap gap-2">
                  {qualificationTypes.map((type) => (
                    <FilterButton
                      key={type}
                      active={qualificationFilters.includes(type)}
                      onClick={() =>
                        toggleFilter(
                          type,
                          qualificationFilters,
                          setQualificationFilters,
                        )
                      }
                    >
                      {type}
                    </FilterButton>
                  ))}
                </div>
              </fieldset>
            </div>
          </aside>

          <div className="min-w-0">
            <div className="mb-4 flex flex-col gap-3 border-b border-[#dcd9d0] pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-[-0.02em] text-[#17231e]">
                  채용 공고
                </h2>
                <p className="mt-1 text-sm text-[#68706c]">
                  조건에 맞는 결과 {filteredJobs.length}건
                </p>
              </div>
              <div className="inline-flex items-center gap-2 text-xs font-medium text-[#68706c]">
                <Filter aria-hidden="true" className="h-4 w-4" />
                모집 상태 순으로 정렬
              </div>
            </div>

            {loadError ? (
              <HiringStateError message={loadError} onRetry={refresh} />
            ) : !loaded ? (
              <div aria-live="polite" className="space-y-3">
                {[0, 1, 2].map((item) => (
                  <div
                    key={item}
                    className="h-52 animate-pulse rounded-md border border-[#e2dfd7] bg-[#eeece6]"
                  />
                ))}
                <span className="sr-only">채용 공고를 불러오는 중입니다.</span>
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="rounded-md border border-dashed border-[#c9c5ba] bg-[#fbfaf6] px-6 py-16 text-center">
                <Search aria-hidden="true" className="mx-auto h-8 w-8 text-[#7a827e]" />
                <h3 className="mt-4 text-lg font-semibold text-[#26322d]">
                  조건에 맞는 공고가 없습니다
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#68706c]">
                  검색어를 줄이거나 선택한 조건을 해제해 보세요.
                </p>
                <button
                  className="mt-5 inline-flex min-h-10 items-center rounded-md border border-[#c8c4b9] bg-white px-4 py-2 text-sm font-semibold text-[#0b4a37] hover:bg-[#f0eee8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b4a37]"
                  onClick={clearFilters}
                  type="button"
                >
                  모든 공고 보기
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredJobs.map((job) => {
                  const status = jobStatusLabel(job.status);

                  return (
                    <article
                      key={job.id}
                      className="group rounded-md border border-[#dedbd2] bg-[#fbfaf6] p-5 transition-[border-color,box-shadow] hover:border-[#b9c5be] hover:shadow-[0_12px_30px_rgba(34,45,39,0.07)] sm:p-6"
                    >
                      <div className="flex flex-col gap-5 xl:flex-row xl:items-start">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md border border-[#cbd7d0] bg-[#e8f0eb] text-[#0b4a37]">
                          <Building2 aria-hidden="true" className="h-6 w-6" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <span
                                  className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${status.className}`}
                                >
                                  {status.label}
                                </span>
                                <span className="text-xs font-medium text-[#68706c]">
                                  {job.employmentType}
                                </span>
                              </div>
                              <h3 className="mt-3 break-keep text-xl font-bold tracking-[-0.015em] text-[#17231e]">
                                {job.schoolName} · {job.gradeLevel}
                              </h3>
                              <p className="mt-2 break-keep text-sm leading-6 text-[#616a65]">
                                {job.summary}
                              </p>
                            </div>
                            <div className="shrink-0 text-left text-xs leading-5 text-[#737b77] sm:text-right">
                              <div>마감 {job.deadline}</div>
                              <div>지원자 {job.applicants}명</div>
                            </div>
                          </div>

                          <dl className="mt-5 grid gap-x-6 gap-y-3 border-y border-[#e2dfd7] py-4 text-sm text-[#56605b] sm:grid-cols-2">
                            <div className="flex min-w-0 items-center gap-2">
                              <MapPin aria-hidden="true" className="h-4 w-4 shrink-0 text-[#0b4a37]" />
                              <dt className="sr-only">지역</dt>
                              <dd className="truncate">{job.schoolRegion}</dd>
                            </div>
                            <div className="flex min-w-0 items-center gap-2">
                              <Briefcase aria-hidden="true" className="h-4 w-4 shrink-0 text-[#0b4a37]" />
                              <dt className="sr-only">자격</dt>
                              <dd className="truncate">
                                {job.qualificationType}
                                {job.qualificationSubject
                                  ? ` · ${job.qualificationSubject}`
                                  : ""}
                              </dd>
                            </div>
                            <div className="flex min-w-0 items-center gap-2 sm:col-span-2">
                              <CalendarDays aria-hidden="true" className="h-4 w-4 shrink-0 text-[#0b4a37]" />
                              <dt className="sr-only">근무 기간</dt>
                              <dd>
                                {job.startDate} — {job.endDate}
                              </dd>
                            </div>
                          </dl>

                          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="text-xs text-[#737b77]">
                              조회 {job.views}회 · 등록 {job.postedAt}
                            </div>
                            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
                              <Link
                                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[#cbc7bc] bg-white px-4 py-2 text-sm font-semibold text-[#0b4a37] hover:bg-[#f2f0ea] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b4a37]"
                                href={`/jobs/${job.id}`}
                              >
                                상세 보기
                                <ArrowRight aria-hidden="true" className="h-4 w-4" />
                              </Link>
                              <JobApplyButton
                                className="sm:min-w-[124px]"
                                dashboardHref={dashboardHref}
                                jobId={job.id}
                                jobStatus={job.status}
                                viewerRole={viewerRole}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
