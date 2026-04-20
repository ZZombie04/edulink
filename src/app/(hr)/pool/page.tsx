"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  Heart,
  LayoutDashboard,
  MapPin,
  Search,
  Sparkles,
  Star,
  Users,
} from "lucide-react";

import { CharacterAvatar } from "@/components/character-avatar";
import { PortalShell } from "@/components/portal-shell";
import { featuredTeachers, type TeacherStatus } from "@/lib/demo-data";
import { useDemoHiringState } from "@/lib/demo-hiring-state";

const navItems = [
  { href: "/hr/dashboard", label: "채용 운영", icon: LayoutDashboard },
  { href: "/pool", label: "교사 인력풀", icon: Search, active: true },
  { href: "/jobs", label: "채용 공고", icon: Briefcase },
];

const qualificationOptions = ["초등", "중등", "특수"] as const;
const workTypeOptions = ["기간제", "시간강사"] as const;

function statusTone(status: TeacherStatus) {
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

function requestTone(status?: string) {
  switch (status) {
    case "accepted":
      return "bg-secondary-50 text-secondary-700";
    case "rejected":
      return "bg-[var(--danger-soft)] text-[#9c2f24]";
    case "cancelled":
      return "bg-surface-panel text-ink-soft";
    default:
      return "bg-primary-50 text-primary-700";
  }
}

export default function HRPoolPage() {
  const {
    hrMatchRequests,
    isTeacherInterested,
    toggleInterestedTeacher,
  } = useDemoHiringState();
  const [query, setQuery] = useState("");
  const [statusFilters, setStatusFilters] = useState<TeacherStatus[]>([
    "seeking",
    "interviewing",
    "employed",
  ]);
  const [qualificationFilters, setQualificationFilters] = useState<string[]>([
    "초등",
    "중등",
    "특수",
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
        teacher.qualificationCategory,
      );
      const matchesWorkType = teacher.preferredTypes.some((type) =>
        workTypeFilters.includes(type),
      );

      return (
        matchesQuery && matchesStatus && matchesQualification && matchesWorkType
      );
    });
  }, [query, qualificationFilters, statusFilters, workTypeFilters]);

  const pendingRequests = hrMatchRequests.filter(
    (request) => request.status === "pending",
  );

  const toggleFilter = (
    value: string,
    current: string[],
    setter: (next: string[]) => void,
  ) => {
    if (current.includes(value)) {
      setter(current.filter((item) => item !== value));
      return;
    }

    setter([...current, value]);
  };

  return (
    <PortalShell
      navItems={navItems}
      noticeCount={pendingRequests.length}
      primaryAction={{ href: "/hr/dashboard", label: "채용 운영 보기", icon: Sparkles }}
      sectionLabel="교사 인력풀 운영"
      user={{
        name: "홍수진",
        role: "인사담당",
        detail: "성진초등학교",
      }}
    >
      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="self-start rounded-lg bg-[linear-gradient(135deg,#0058be,#2170e4)] p-6 text-white shadow-soft">
          <div className="flex min-h-[176px] flex-col justify-between">
            <div>
              <div className="inline-flex rounded-full bg-white/12 px-3 py-2 text-sm font-semibold text-white/90">
                기간제·시간강사
              </div>
              <div className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
                교사 인력풀
              </div>
              <div className="mt-3 break-keep text-sm leading-6 text-white/84">
                관심 교사 저장, 프로필 확인, 공고 연결 매칭 요청까지 한 흐름으로
                이어집니다.
              </div>
            </div>
            <div className="text-sm font-medium text-white/82">
              현재 표시 {filteredTeachers.length}명
            </div>
          </div>
        </div>

        <div className="panel-surface p-6">
          <div className="text-sm font-semibold text-ink-soft">
            오늘의 인력풀 현황
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
            {[
              ["연락 가능한 교사", `${featuredTeachers.filter((item) => item.status === "seeking").length}명`],
              ["응답 대기 제안", `${pendingRequests.length}건`],
              ["관심 등록", `${featuredTeachers.filter((item) => isTeacherInterested(item.id)).length}명`],
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
                setStatusFilters(["seeking", "interviewing", "employed"]);
                setQualificationFilters(["초등", "중등", "특수"]);
                setWorkTypeFilters(["기간제", "시간강사"]);
                setQuery("");
              }}
            >
              초기화
            </button>
          </div>

          <div className="mt-6 space-y-6">
            <div>
              <div className="text-sm font-semibold text-ink">노출 상태</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {(
                  [
                    ["seeking", "채용 제안 가능"],
                    ["interviewing", "면접 진행 중"],
                    ["employed", "근무 중"],
                    ["paused", "노출 일시중지"],
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
                        (next) => setStatusFilters(next as TeacherStatus[]),
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
                        setQualificationFilters,
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
                <div className="text-2xl font-bold text-ink">교사 검색</div>
                <div className="mt-1 text-sm text-ink-soft">
                  검색 결과 {filteredTeachers.length}명
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
            const latestRequest =
              hrMatchRequests.find((request) => request.teacherId === teacher.id) ??
              null;
            const interested = isTeacherInterested(teacher.id);

            return (
              <article
                key={teacher.id}
                className="panel-surface overflow-hidden p-6 transition-transform hover:-translate-y-1"
              >
                <div className="flex flex-col gap-6 xl:flex-row xl:items-center">
                  <div className="flex flex-1 items-start gap-4">
                    <CharacterAvatar
                      className="h-20 w-20 rounded-lg"
                      presetId={teacher.avatarPreset}
                      size={80}
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}
                        >
                          {status.label}
                        </span>
                        {latestRequest ? (
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${requestTone(
                              latestRequest.status,
                            )}`}
                          >
                            {latestRequest.status === "accepted"
                              ? "응답 완료"
                              : latestRequest.status === "rejected"
                                ? "보류"
                                : latestRequest.status === "cancelled"
                                  ? "요청 취소"
                                  : "요청 발송"}
                          </span>
                        ) : null}
                        {interested ? (
                          <span className="rounded-full bg-[var(--tertiary-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--tertiary-solid)]">
                            관심 등록
                          </span>
                        ) : null}
                      </div>

                      <div className="mt-3 flex flex-wrap items-end gap-3">
                        <h2 className="break-keep text-2xl font-bold text-ink">
                          {teacher.name}
                        </h2>
                        <span className="text-sm text-ink-muted">
                          {teacher.age}세 / {teacher.birthYear}년생
                        </span>
                      </div>

                      <div className="mt-2 break-keep text-sm font-semibold text-primary-700">
                        {teacher.qualification}
                        {teacher.subject ? ` / ${teacher.subject}` : ""}
                      </div>

                      <p className="mt-3 break-keep text-sm leading-6 text-ink-soft">
                        {teacher.summary}
                      </p>

                      <div className="mt-4 grid gap-3 text-sm text-ink-soft md:grid-cols-2 xl:grid-cols-4">
                        <div className="rounded-lg bg-surface-subtle px-3 py-2">
                          경력 {teacher.experience}
                        </div>
                        <div className="rounded-lg bg-surface-subtle px-3 py-2">
                          거주지 {teacher.residence}
                        </div>
                        <div className="rounded-lg bg-surface-subtle px-3 py-2">
                          희망 {teacher.preferredTypes.join(", ")}
                        </div>
                        <div className="rounded-lg bg-surface-subtle px-3 py-2">
                          조회 {teacher.portfolioViews}회
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {teacher.preferredRegions.map((region) => (
                          <span
                            key={region}
                            className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-2 text-xs font-medium text-ink-soft ring-1 ring-outline"
                          >
                            <MapPin className="h-3 w-3" />
                            {region}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid w-full gap-3 xl:w-[240px]">
                    <button
                      type="button"
                      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold ${
                        interested
                          ? "bg-primary-50 text-primary-700"
                          : "border border-outline bg-white text-ink-soft"
                      }`}
                      onClick={() => toggleInterestedTeacher(teacher.id)}
                    >
                      <Heart className="h-4 w-4" />
                      {interested ? "관심 등록 해제" : "관심 등록"}
                    </button>

                    <Link
                      href={`/pool/${teacher.id}`}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-[linear-gradient(135deg,#0058be,#2170e4)] px-4 py-3 text-sm font-semibold text-white shadow-soft"
                    >
                      <Users className="h-4 w-4" />
                      {latestRequest ? "프로필 상세 확인" : "매칭 요청 진행"}
                    </Link>

                    <div className="rounded-lg bg-surface-subtle px-4 py-3 text-sm leading-6 text-ink-soft">
                      {latestRequest
                        ? latestRequest.summary
                        : "프로필 상세로 들어가 공고를 연결한 뒤 매칭 요청을 보낼 수 있습니다."}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}

          {filteredTeachers.length === 0 ? (
            <div className="rounded-lg border border-dashed border-outline bg-surface-subtle px-4 py-10 text-center text-sm text-ink-soft">
              현재 조건에 맞는 교사가 없습니다. 필터를 조정해 주세요.
            </div>
          ) : null}
        </div>
      </section>
    </PortalShell>
  );
}
