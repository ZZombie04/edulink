"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Briefcase,
  Check,
  Heart,
  LayoutDashboard,
  LoaderCircle,
  MapPin,
  Search,
  UserRoundSearch,
  Users,
} from "lucide-react";

import { CharacterAvatar } from "@/components/character-avatar";
import { HiringStateError } from "@/components/hiring-state-error";
import { PortalShell } from "@/components/portal-shell";
import type { TeacherStatus } from "@/lib/demo-data";
import { useDemoHiringState } from "@/lib/demo-hiring-state";
import { useDemoSession } from "@/lib/demo-session-client";

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
        className: "border-[#b9cec1] bg-[#edf4ef] text-[#1f6248]",
      };
    case "interviewing":
      return {
        label: "면접 진행 중",
        className: "border-[#e6d1a2] bg-[#fff7e6] text-[#865d13]",
      };
    case "employed":
      return {
        label: "근무 중",
        className: "border-[#c9d1cf] bg-[#eef1f0] text-[#58635e]",
      };
    default:
      return {
        label: "노출 일시중지",
        className: "border-[#d8d5cc] bg-[#f0eee8] text-[#666e69]",
      };
  }
}

function requestTone(status?: string) {
  switch (status) {
    case "accepted":
      return "border-[#b9cec1] bg-[#edf4ef] text-[#1f6248]";
    case "rejected":
      return "border-[#e4b8ae] bg-[#fff3f0] text-[#8b3328]";
    case "cancelled":
      return "border-[#d8d5cc] bg-[#f0eee8] text-[#666e69]";
    default:
      return "border-[#c5d1cb] bg-[#edf1ee] text-[#385646]";
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

export default function HRPoolPage() {
  const session = useDemoSession();
  const {
    hrMatchRequests,
    isTeacherInterested,
    loaded,
    loadError,
    refresh,
    teachers,
    toggleInterestedTeacher,
  } = useDemoHiringState();
  const [query, setQuery] = useState("");
  const [statusFilters, setStatusFilters] = useState<TeacherStatus[]>([
    "seeking",
    "interviewing",
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
  const [savingTeacherId, setSavingTeacherId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const filteredTeachers = useMemo(() => {
    const lowered = query.trim().toLowerCase();

    return teachers.filter((teacher) => {
      const matchesQuery =
        lowered.length === 0 ||
        [
          teacher.name,
          teacher.qualification,
          teacher.subject,
          teacher.residence,
          teacher.summary,
          ...teacher.preferredRegions,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(lowered);

      return (
        matchesQuery &&
        statusFilters.includes(teacher.status) &&
        qualificationFilters.includes(teacher.qualificationCategory) &&
        teacher.preferredTypes.some((type) => workTypeFilters.includes(type))
      );
    });
  }, [query, qualificationFilters, statusFilters, teachers, workTypeFilters]);

  const pendingRequests = hrMatchRequests.filter(
    (request) => request.status === "pending",
  );
  const interestedCount = teachers.filter((teacher) =>
    isTeacherInterested(teacher.id),
  ).length;

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

  const resetFilters = () => {
    setStatusFilters(["seeking", "interviewing"]);
    setQualificationFilters(["초등", "중등", "특수"]);
    setWorkTypeFilters(["기간제", "시간강사"]);
    setQuery("");
  };

  const handleInterest = async (teacherId: number) => {
    setErrorMessage("");
    setSavingTeacherId(teacherId);

    try {
      await toggleInterestedTeacher(teacherId);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "관심 교사 상태를 저장하지 못했습니다.",
      );
    } finally {
      setSavingTeacherId(null);
    }
  };

  return (
    <PortalShell
      navItems={navItems}
      noticeCount={pendingRequests.length}
      primaryAction={{
        href: "/hr/dashboard",
        label: "채용 운영으로 이동",
        icon: LayoutDashboard,
      }}
      sectionLabel="교사 인력풀"
      user={{
        name: session?.name ?? "학교 담당자",
        role: "인사담당",
        detail: session?.detail ?? "소속 학교",
      }}
    >
      <section className="border-b border-[#dcd9d0] pb-7">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0b4a37]">
              TALENT POOL
            </div>
            <h1 className="mt-3 text-3xl font-bold tracking-[-0.03em] text-[#17231e] sm:text-4xl">
              교사 인력풀
            </h1>
            <p className="mt-3 max-w-2xl break-keep text-sm leading-7 text-[#65706a]">
              공개 상태와 자격 조건을 확인한 뒤 관심 후보로 저장하거나 현재 채용
              공고에 직접 제안할 수 있습니다.
            </p>
          </div>

          <dl className="grid grid-cols-3 divide-x divide-[#d8d5cc] rounded-md border border-[#d8d5cc] bg-[#fbfaf6]">
            {[
              [
                "제안 가능",
                teachers.filter((item) => item.status === "seeking").length,
                "명",
              ],
              ["응답 대기", pendingRequests.length, "건"],
              ["관심 후보", interestedCount, "명"],
            ].map(([label, value, unit]) => (
              <div key={label} className="min-w-[104px] px-4 py-3 text-center sm:min-w-[132px]">
                <dt className="text-xs text-[#747c78]">{label}</dt>
                <dd className="mt-1 text-xl font-bold text-[#17231e]">
                  {value}
                  <span className="ml-0.5 text-xs font-medium text-[#747c78]">
                    {unit}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {errorMessage ? (
        <div
          className="mt-5 flex items-start gap-2 rounded-md border border-[#e4b8ae] bg-[#fff3f0] px-4 py-3 text-sm text-[#8b3328]"
          role="alert"
        >
          <AlertCircle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
          {errorMessage}
        </div>
      ) : null}

      <section className="mt-7 grid gap-6 lg:grid-cols-[264px_minmax(0,1fr)]">
        <aside className="h-fit rounded-md border border-[#dedbd2] bg-[#fbfaf6] p-5 lg:sticky lg:top-24">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-[#26322d]">검색 조건</div>
            <button
              className="rounded-md px-2 py-1 text-xs font-semibold text-[#0b4a37] hover:bg-[#e8eee9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b4a37]"
              onClick={resetFilters}
              type="button"
            >
              초기화
            </button>
          </div>

          <div className="mt-5 space-y-6">
            <fieldset>
              <legend className="text-sm font-semibold text-[#39443e]">
                공개 상태
              </legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {(
                  [
                    ["seeking", "제안 가능"],
                    ["interviewing", "면접 중"],
                    ["employed", "근무 중"],
                  ] as const
                ).map(([key, label]) => (
                  <FilterButton
                    key={key}
                    active={statusFilters.includes(key)}
                    onClick={() =>
                      toggleFilter(key, statusFilters, (next) =>
                        setStatusFilters(next as TeacherStatus[]),
                      )
                    }
                  >
                    {label}
                  </FilterButton>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-sm font-semibold text-[#39443e]">
                자격 유형
              </legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {qualificationOptions.map((option) => (
                  <FilterButton
                    key={option}
                    active={qualificationFilters.includes(option)}
                    onClick={() =>
                      toggleFilter(
                        option,
                        qualificationFilters,
                        setQualificationFilters,
                      )
                    }
                  >
                    {option}
                  </FilterButton>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-sm font-semibold text-[#39443e]">
                희망 근무
              </legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {workTypeOptions.map((option) => (
                  <FilterButton
                    key={option}
                    active={workTypeFilters.includes(option)}
                    onClick={() =>
                      toggleFilter(option, workTypeFilters, setWorkTypeFilters)
                    }
                  >
                    {option}
                  </FilterButton>
                ))}
              </div>
            </fieldset>
          </div>
        </aside>

        <div className="min-w-0">
          <div className="mb-4 flex flex-col gap-4 border-b border-[#dcd9d0] pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-[-0.02em] text-[#17231e]">
                등록 교사
              </h2>
              <p className="mt-1 text-sm text-[#68706c]">
                검색 결과 {filteredTeachers.length}명
              </p>
            </div>
            <div className="relative w-full max-w-md">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#77807b]"
              />
              <label className="sr-only" htmlFor="teacher-pool-search">
                교사 인력풀 검색
              </label>
              <input
                id="teacher-pool-search"
                className="h-11 w-full rounded-md border border-[#d8d5cc] bg-white pl-11 pr-4 text-sm text-[#17231e] outline-none placeholder:text-[#7b837f] focus:border-[#0b4a37] focus:ring-2 focus:ring-[#0b4a37]/15"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="이름, 자격, 지역, 과목 검색"
                type="search"
                value={query}
              />
            </div>
          </div>

          {loadError ? (
            <HiringStateError message={loadError} onRetry={refresh} />
          ) : !loaded ? (
            <div aria-live="polite" className="space-y-3">
              {[0, 1, 2].map((item) => (
                <div
                  key={item}
                  className="h-56 animate-pulse rounded-md border border-[#e2dfd7] bg-[#eeece6]"
                />
              ))}
              <span className="sr-only">교사 인력풀을 불러오는 중입니다.</span>
            </div>
          ) : filteredTeachers.length === 0 ? (
            <div className="rounded-md border border-dashed border-[#c9c5ba] bg-[#fbfaf6] px-6 py-16 text-center">
              <UserRoundSearch
                aria-hidden="true"
                className="mx-auto h-9 w-9 text-[#7a827e]"
              />
              <h3 className="mt-4 text-lg font-semibold text-[#26322d]">
                조건에 맞는 교사가 없습니다
              </h3>
              <p className="mt-2 text-sm text-[#68706c]">
                검색어나 공개 상태 필터를 조정해 보세요.
              </p>
              <button
                className="mt-5 inline-flex min-h-10 items-center rounded-md border border-[#c8c4b9] bg-white px-4 py-2 text-sm font-semibold text-[#0b4a37] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b4a37]"
                onClick={resetFilters}
                type="button"
              >
                전체 조건으로 돌아가기
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTeachers.map((teacher, index) => {
                const status = statusTone(teacher.status);
                const latestRequest =
                  hrMatchRequests.find(
                    (request) => request.teacherId === teacher.id,
                  ) ?? null;
                const interested = isTeacherInterested(teacher.id);
                const saving = savingTeacherId === teacher.id;

                return (
                  <article
                    key={teacher.id}
                    className="rounded-md border border-[#dedbd2] bg-[#fbfaf6] p-5 transition-[border-color,box-shadow] hover:border-[#b9c5be] hover:shadow-[0_12px_30px_rgba(34,45,39,0.07)] sm:p-6"
                  >
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-center">
                      <div className="flex min-w-0 flex-1 items-start gap-4">
                        <CharacterAvatar
                          className="h-20 w-20 shrink-0 rounded-md"
                          presetId={teacher.avatarPreset}
                          priority={index === 0}
                          size={80}
                        />

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${status.className}`}
                            >
                              {status.label}
                            </span>
                            {latestRequest ? (
                              <span
                                className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${requestTone(
                                  latestRequest.status,
                                )}`}
                              >
                                {latestRequest.status === "accepted"
                                  ? "제안 수락"
                                  : latestRequest.status === "rejected"
                                    ? "제안 보류"
                                    : latestRequest.status === "cancelled"
                                      ? "요청 취소"
                                      : "응답 대기"}
                              </span>
                            ) : null}
                            {interested ? (
                              <span className="inline-flex rounded-full border border-[#d6c8b9] bg-[#f6eee4] px-2.5 py-1 text-xs font-semibold text-[#775431]">
                                관심 후보
                              </span>
                            ) : null}
                          </div>

                          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
                            <h3 className="break-keep text-xl font-bold text-[#17231e]">
                              {teacher.name}
                            </h3>
                            <span className="text-sm font-medium text-[#0b4a37]">
                              {teacher.qualification}
                              {teacher.subject ? ` · ${teacher.subject}` : ""}
                            </span>
                          </div>

                          <p className="mt-2 line-clamp-2 break-keep text-sm leading-6 text-[#626b66]">
                            {teacher.summary}
                          </p>

                          <dl className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#59635d]">
                            <div className="flex gap-1.5">
                              <dt className="text-[#828985]">경력</dt>
                              <dd className="font-medium">{teacher.experience}</dd>
                            </div>
                            <div className="flex gap-1.5">
                              <dt className="text-[#828985]">거주</dt>
                              <dd className="font-medium">{teacher.residence}</dd>
                            </div>
                            <div className="flex gap-1.5">
                              <dt className="text-[#828985]">희망</dt>
                              <dd className="font-medium">
                                {teacher.preferredTypes.join(", ")}
                              </dd>
                            </div>
                          </dl>

                          <div className="mt-4 flex flex-wrap gap-2">
                            {teacher.preferredRegions.map((region) => (
                              <span
                                key={region}
                                className="inline-flex items-center gap-1 rounded-full border border-[#ddd9d0] bg-white px-2.5 py-1.5 text-xs font-medium text-[#626b66]"
                              >
                                <MapPin aria-hidden="true" className="h-3 w-3" />
                                {region}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="grid w-full gap-2 border-t border-[#e1ded6] pt-4 xl:w-[220px] xl:border-l xl:border-t-0 xl:pl-5 xl:pt-0">
                        <button
                          aria-pressed={interested}
                          className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b4a37] disabled:cursor-not-allowed disabled:opacity-60 ${
                            interested
                              ? "border-[#c9bda9] bg-[#f6eee4] text-[#775431]"
                              : "border-[#d5d1c7] bg-white text-[#4e5953] hover:bg-[#f2f0ea]"
                          }`}
                          disabled={saving}
                          onClick={() => void handleInterest(teacher.id)}
                          type="button"
                        >
                          {saving ? (
                            <LoaderCircle
                              aria-hidden="true"
                              className="h-4 w-4 animate-spin"
                            />
                          ) : (
                            <Heart
                              aria-hidden="true"
                              className={`h-4 w-4 ${interested ? "fill-current" : ""}`}
                            />
                          )}
                          {saving
                            ? "저장 중"
                            : interested
                              ? "관심 해제"
                              : "관심 후보"}
                        </button>

                        <Link
                          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#0b4a37] px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(11,74,55,0.14)] hover:bg-[#083a2c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b4a37] focus-visible:ring-offset-2"
                          href={`/pool/${teacher.id}`}
                        >
                          <Users aria-hidden="true" className="h-4 w-4" />
                          {latestRequest || teacher.status === "employed"
                            ? "프로필 확인"
                            : "채용 제안"}
                        </Link>

                        <p className="break-keep text-xs leading-5 text-[#737b77]">
                          {latestRequest
                            ? latestRequest.summary
                            : "상세 프로필에서 연결 공고와 제안 내용을 확인합니다."}
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </PortalShell>
  );
}
