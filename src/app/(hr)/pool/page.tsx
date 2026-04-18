"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  Briefcase,
  LayoutDashboard,
  MapPin,
  Search,
  Sparkles,
  Star,
  Users,
} from "lucide-react";

import { PortalShell } from "@/components/portal-shell";
import { featuredTeachers, type TeacherStatus } from "@/lib/demo-data";

const navItems = [
  { href: "/hr/dashboard", label: "대시보드", icon: LayoutDashboard },
  { href: "/pool", label: "인재풀", icon: Search, active: true },
  { href: "/jobs", label: "채용 공고", icon: Briefcase },
  { href: "/admin/dashboard", label: "운영 지표", icon: BarChart3 },
];

const qualificationOptions = ["초등", "중등", "특수"] as const;
const workTypeOptions = ["기간제", "시간강사"] as const;

function statusTone(status: TeacherStatus) {
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

export default function HCPoolPage() {
  const [query, setQuery] = useState("");
  const [statusFilters, setStatusFilters] = useState<TeacherStatus[]>([
    "seeking",
    "interviewing",
  ]);
  const [qualificationFilters, setQualificationFilters] = useState<string[]>([
    "초등",
    "중등",
  ]);
  const [workTypeFilters, setWorkTypeFilters] = useState<string[]>([
    "기간제",
    "시간강사",
  ]);

  const filteredTeachers = useMemo(() => {
    const lowered = query.trim().toLowerCase();

    return featuredTeachers.filter((teacher) => {
      const matchesQuery =
        lowered.length === 0 ||
        [teacher.name, teacher.qualification, teacher.residence, teacher.summary]
          .join(" ")
          .toLowerCase()
          .includes(lowered);

      const matchesStatus = statusFilters.includes(teacher.status);
      const matchesQualification = qualificationFilters.includes(
        teacher.qualificationCategory
      );
      const matchesWorkType = teacher.preferredTypes.some((type) =>
        workTypeFilters.includes(type)
      );

      return (
        matchesQuery && matchesStatus && matchesQualification && matchesWorkType
      );
    });
  }, [query, qualificationFilters, statusFilters, workTypeFilters]);

  const toggleFilter = (value: string, current: string[], setter: (next: string[]) => void) => {
    if (current.includes(value)) {
      setter(current.filter((item) => item !== value));
      return;
    }

    setter([...current, value]);
  };

  return (
    <PortalShell
      navItems={navItems}
      noticeCount={3}
      primaryAction={{ href: "/jobs", label: "새 채용 공고 확인", icon: Sparkles }}
      sectionLabel="인재풀 운영"
      user={{
        name: "홍수진",
        role: "인사담당",
        detail: "정인초등학교",
        avatar:
          "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=240&q=80",
      }}
    >
      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="rounded-lg bg-[linear-gradient(135deg,#0058be,#2170e4)] p-8 text-white shadow-soft">
          <span className="kicker text-white/85 before:bg-white">인재풀</span>
          <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
            채용 속도보다 먼저,
            <br />
            후보의 결을 읽는 인재풀.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/78 sm:text-base">
            지역과 자격, 근무 선호를 함께 묶어 바로 검토할 수 있게 정리했습니다. 빠른
            액션 버튼과 상태 칩을 전면에 올려서 다음 행동이 눈에 띄게 바뀌었습니다.
          </p>
        </div>

        <div className="panel-surface p-6">
          <div className="text-sm font-semibold text-ink-soft">오늘의 인재풀 스냅샷</div>
          <div className="mt-5 grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
            {[
              ["즉시 검토 가능", "183명"],
              ["면접 진행중", "27명"],
              ["예약 제안 가능", "9명"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg bg-surface-subtle p-4">
                <div className="text-sm font-medium text-ink-soft">{label}</div>
                <div className="mt-2 text-3xl font-bold text-ink">{value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="panel-muted h-fit p-5 lg:sticky lg:top-24">
          <div className="flex items-center justify-between">
              <div className="text-sm font-bold uppercase tracking-[0.16em] text-ink-soft">
              필터
            </div>
            <button
              type="button"
              className="text-xs font-semibold text-primary-700"
              onClick={() => {
                setStatusFilters(["seeking", "interviewing"]);
                setQualificationFilters(["초등", "중등"]);
                setWorkTypeFilters(["기간제", "시간강사"]);
                setQuery("");
              }}
            >
              초기화
            </button>
          </div>

          <div className="mt-6 space-y-6">
            <div>
              <div className="text-sm font-semibold text-ink">구직 상태</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {(
                  [
                    ["seeking", "구직중"],
                    ["interviewing", "면접 진행"],
                    ["employed", "근무 예정"],
                    ["paused", "휴식중"],
                  ] as const
                ).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    className={`rounded-full px-3 py-2 text-sm font-medium ${
                      statusFilters.includes(key)
                        ? "bg-primary-50 text-primary-700"
                        : "bg-white text-ink-soft"
                    }`}
                    onClick={() =>
                      toggleFilter(
                        key,
                        statusFilters,
                        (next) => setStatusFilters(next as TeacherStatus[])
                      )
                    }
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-sm font-semibold text-ink">자격 유형</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {qualificationOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={`rounded-full px-3 py-2 text-sm font-medium ${
                      qualificationFilters.includes(option)
                        ? "bg-primary-50 text-primary-700"
                        : "bg-white text-ink-soft"
                    }`}
                    onClick={() =>
                      toggleFilter(
                        option,
                        qualificationFilters,
                        setQualificationFilters
                      )
                    }
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-sm font-semibold text-ink">근무 형태</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {workTypeOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={`rounded-full px-3 py-2 text-sm font-medium ${
                      workTypeFilters.includes(option)
                        ? "bg-primary-50 text-primary-700"
                        : "bg-white text-ink-soft"
                    }`}
                    onClick={() =>
                      toggleFilter(option, workTypeFilters, setWorkTypeFilters)
                    }
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <div className="space-y-4">
          <div className="panel-surface p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="text-2xl font-bold text-ink">인재풀 탐색</div>
                <div className="mt-1 text-sm text-ink-soft">
                  검색 결과 {filteredTeachers.length}명 · 조건은 실시간으로 반영됩니다.
                </div>
              </div>

              <div className="relative w-full max-w-md">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
                <input
                  className="input-surface pl-11"
                  placeholder="이름, 자격, 지역으로 검색"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </div>
            </div>
          </div>

          {filteredTeachers.map((teacher) => {
            const status = statusTone(teacher.status);

            return (
              <article
                key={teacher.id}
                className="panel-surface overflow-hidden p-6 transition-transform hover:-translate-y-1"
              >
                <div className="flex flex-col gap-6 xl:flex-row xl:items-center">
                  <div className="flex flex-1 items-start gap-4">
                    <img
                      alt={teacher.name}
                      className="h-20 w-20 rounded-lg object-cover"
                      src={teacher.avatar}
                    />
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}>
                          {status.label}
                        </span>
                        {teacher.reservation ? (
                          <span className="rounded-full bg-[var(--tertiary-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--tertiary-solid)]">
                            예약 제안 가능 {teacher.reservationCount ? `${teacher.reservationCount}건` : ""}
                          </span>
                        ) : null}
                      </div>

                      <div className="mt-3 flex flex-wrap items-end gap-3">
                        <h2 className="text-2xl font-bold text-ink">{teacher.name}</h2>
                        <span className="text-sm text-ink-muted">
                          {teacher.age}세 · {teacher.birthYear}년생
                        </span>
                      </div>

                      <div className="mt-2 text-sm font-semibold text-primary-700">
                        {teacher.qualification}
                        {teacher.subject ? ` · ${teacher.subject}` : ""}
                      </div>

                      <p className="mt-3 text-sm leading-6 text-ink-soft">{teacher.summary}</p>

                      <div className="mt-4 grid gap-3 text-sm text-ink-soft md:grid-cols-2 xl:grid-cols-4">
                        <div className="rounded-lg bg-surface-subtle px-3 py-2">
                          경력 {teacher.experience}
                        </div>
                        <div className="rounded-lg bg-surface-subtle px-3 py-2">
                          거주지 {teacher.residence}
                        </div>
                        <div className="rounded-lg bg-surface-subtle px-3 py-2">
                          선호 {teacher.preferredTypes.join(", ")}
                        </div>
                        <div className="rounded-lg bg-surface-subtle px-3 py-2">
                          조회 {teacher.portfolioViews}
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {teacher.preferredRegions.map((region) => (
                          <span
                            key={region}
                            className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-medium text-ink-soft ring-1 ring-outline"
                          >
                            <MapPin className="h-3 w-3" />
                            {region}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex w-full gap-3 xl:w-auto xl:flex-col">
                    <button
                      type="button"
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-outline px-4 py-3 text-sm font-semibold text-primary-700 transition-colors hover:bg-primary-50 xl:min-w-[180px]"
                    >
                      <Star className="h-4 w-4" />
                      관심 인재 등록
                    </button>
                    <Link
                      href="/hr/dashboard"
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-[linear-gradient(135deg,#0058be,#2170e4)] px-4 py-3 text-sm font-semibold text-white shadow-soft transition-transform hover:-translate-y-px xl:min-w-[180px]"
                    >
                      <Users className="h-4 w-4" />
                      매칭 요청 보내기
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </PortalShell>
  );
}
