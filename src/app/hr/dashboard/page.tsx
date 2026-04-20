"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  CalendarClock,
  CheckCircle2,
  LayoutDashboard,
  MapPin,
  Plus,
  School,
  Search,
  Send,
  ShieldCheck,
  Users,
  XCircle,
} from "lucide-react";

import { PortalShell } from "@/components/portal-shell";
import { useDemoHiringState } from "@/lib/demo-hiring-state";

const navItems = [
  {
    href: "/hr/dashboard",
    label: "채용 운영",
    icon: LayoutDashboard,
    active: true,
  },
  { href: "/pool", label: "교사 인력풀", icon: Search },
  { href: "/jobs", label: "채용 공고", icon: Briefcase },
];

type InterviewDraft = {
  date: string;
  note: string;
  place: string;
  time: string;
};

type JobDraft = {
  benefits: string;
  duties: string;
  employmentType: "기간제 교사" | "시간강사";
  endDate: string;
  gradeLevel: string;
  isHomeroom: boolean;
  qualificationSubject: string;
  qualificationType: "초등" | "중등" | "특수";
  requirements: string;
  schoolAddress: string;
  schoolName: string;
  schoolRegion: string;
  startDate: string;
  summary: string;
};

function makeInterviewDraft(): InterviewDraft {
  return {
    date: "2026-04-24",
    time: "14:00",
    place: "성진초등학교 2층 회의실",
    note: "수업 운영 경험과 근무 가능 일정 확인 예정",
  };
}

function makeDefaultJobDraft(): JobDraft {
  return {
    schoolName: "성진초등학교",
    schoolRegion: "수원",
    schoolAddress: "경기도 수원시 영통구 창룡대로 58",
    employmentType: "기간제 교사",
    startDate: "2026-05-07",
    endDate: "2026-08-31",
    qualificationType: "초등",
    qualificationSubject: "",
    gradeLevel: "4학년 담임",
    isHomeroom: true,
    summary: "학급 운영과 기초학력 지원을 맡을 기간제 교사를 모집합니다.",
    duties: "4학년 담임 및 학급 운영\n국어, 수학, 사회 수업\n학부모 상담 및 생활지도",
    requirements: "초등 2급 정교사 이상\n담임 경험 1년 이상 우대\n즉시 근무 가능자 우대",
    benefits: "경기도교육청 기준 보수 적용\n멘토 교사 배정\n급식 및 교재 지원",
  };
}

function jobTone(status: string) {
  switch (status) {
    case "open":
      return "bg-secondary-50 text-secondary-700";
    case "closing-soon":
      return "bg-[var(--warning-soft)] text-[#9a6a00]";
    default:
      return "bg-surface-panel text-ink-soft";
  }
}

function applicationTone(status: string) {
  switch (status) {
    case "interview-requested":
    case "interview-confirmed":
      return "bg-primary-50 text-primary-700";
    case "hired":
      return "bg-secondary-50 text-secondary-700";
    case "rejected":
    case "withdrawn":
      return "bg-surface-panel text-ink-soft";
    default:
      return "bg-[var(--warning-soft)] text-[#9a6a00]";
  }
}

function requestTone(status: string) {
  switch (status) {
    case "accepted":
      return "bg-secondary-50 text-secondary-700";
    case "rejected":
      return "bg-[var(--danger-soft)] text-[#9c2f24]";
    case "cancelled":
      return "bg-surface-panel text-ink-soft";
    default:
      return "bg-[var(--warning-soft)] text-[#9a6a00]";
  }
}

export default function HRDashboardPage() {
  const {
    cancelPoolRequest,
    createJob,
    getApplicationsForJob,
    hrMatchRequests,
    jobs,
    parseListInput,
    scheduleInterviewForApplication,
    scheduleInterviewForRequest,
    updateApplicationStatus,
    updateJobStatus,
  } = useDemoHiringState();
  const [jobDraft, setJobDraft] = useState<JobDraft>(makeDefaultJobDraft());
  const [creationMessage, setCreationMessage] = useState("");
  const [applicationInterviews, setApplicationInterviews] = useState<
    Record<number, InterviewDraft>
  >({});
  const [requestInterviews, setRequestInterviews] = useState<
    Record<number, InterviewDraft>
  >({});

  const pendingMatches = hrMatchRequests.filter(
    (request) => request.status === "pending",
  );
  const acceptedMatches = hrMatchRequests.filter(
    (request) => request.status === "accepted",
  );
  const jobsWithApplications = useMemo(
    () =>
      jobs
        .map((job) => ({
          applications: getApplicationsForJob(job.id),
          job,
        }))
        .filter((item) => item.applications.length > 0),
    [getApplicationsForJob, jobs],
  );
  const totalApplications = jobsWithApplications.reduce(
    (sum, item) => sum + item.applications.length,
    0,
  );
  const interviewCount = jobsWithApplications.reduce(
    (sum, item) =>
      sum +
      item.applications.filter((application) => application.interview).length,
    0,
  );

  const updateJobDraftField = <K extends keyof JobDraft>(
    key: K,
    value: JobDraft[K],
  ) => {
    setJobDraft((current) => ({ ...current, [key]: value }));
  };

  const handleCreateJob = (event: React.FormEvent) => {
    event.preventDefault();

    createJob({
      schoolName: jobDraft.schoolName,
      schoolRegion: jobDraft.schoolRegion,
      schoolAddress: jobDraft.schoolAddress,
      employmentType: jobDraft.employmentType,
      startDate: jobDraft.startDate,
      endDate: jobDraft.endDate,
      qualificationType: jobDraft.qualificationType,
      qualificationSubject:
        jobDraft.qualificationSubject.trim() || undefined,
      gradeLevel: jobDraft.gradeLevel,
      isHomeroom: jobDraft.isHomeroom,
      summary: jobDraft.summary,
      duties: parseListInput(jobDraft.duties),
      requirements: parseListInput(jobDraft.requirements),
      benefits: parseListInput(jobDraft.benefits),
    });
    setCreationMessage(
      `${jobDraft.schoolName} ${jobDraft.gradeLevel} 공고가 등록되었습니다.`,
    );
    setJobDraft(makeDefaultJobDraft());
  };

  return (
    <PortalShell
      navItems={navItems}
      noticeCount={pendingMatches.length + acceptedMatches.length}
      primaryAction={{ href: "/pool", label: "교사 인력풀 보기", icon: Search }}
      sectionLabel="학교 채용 운영"
      user={{
        name: "홍수진",
        role: "인사담당",
        detail: "성진초등학교",
      }}
    >
      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="self-start rounded-lg bg-[linear-gradient(135deg,#0058be,#2170e4)] p-6 text-white shadow-soft">
          <div className="flex min-h-[184px] flex-col justify-between">
            <div>
              <div className="inline-flex rounded-full bg-white/12 px-3 py-2 text-sm font-semibold text-white/90">
                채용 운영
              </div>
              <div className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
                학교 채용 관리
              </div>
              <div className="mt-3 break-keep text-sm leading-6 text-white/84">
                공고 등록, 지원서 검토, 인력풀 제안, 면접 일정 요청까지 실제 운영
                흐름처럼 이어서 체험할 수 있도록 구성했습니다.
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/pool"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-primary-700"
              >
                <Search className="h-4 w-4" />
                교사 인력풀 보기
              </Link>
              <Link
                href="/jobs"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/18 bg-white/10 px-5 py-3 text-sm font-semibold text-white"
              >
                <Briefcase className="h-4 w-4" />
                채용 공고 보기
              </Link>
            </div>
          </div>
        </div>

        <div className="panel-surface p-6">
          <div className="text-sm font-semibold text-ink-soft">오늘 처리할 항목</div>
          <div className="mt-5 space-y-3">
            {[
              `${pendingMatches.length}건의 매칭 요청이 교사 응답을 기다리고 있습니다.`,
              `${acceptedMatches.length}건의 수락된 제안에서 면접 일정을 보낼 수 있습니다.`,
              `${totalApplications}건의 지원서가 공고별로 연결되어 있습니다.`,
            ].map((note) => (
              <div
                key={note}
                className="rounded-lg bg-surface-subtle px-4 py-3 break-keep text-sm text-ink-soft"
              >
                {note}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "운영 중 공고", value: `${jobs.length}건`, Icon: Briefcase },
          { label: "지원서", value: `${totalApplications}건`, Icon: Users },
          { label: "응답 대기 요청", value: `${pendingMatches.length}건`, Icon: Send },
          { label: "면접 일정", value: `${interviewCount}건`, Icon: CalendarClock },
        ].map((item) => (
          <div key={item.label} className="panel-surface p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
              <item.Icon className="h-5 w-5" />
            </div>
            <div className="mt-4 text-3xl font-bold text-ink">{item.value}</div>
            <div className="mt-1 text-sm text-ink-soft">{item.label}</div>
          </div>
        ))}
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <form className="panel-surface p-6" onSubmit={handleCreateJob}>
          <div className="flex items-center justify-between gap-4">
            <div className="text-xl font-bold text-ink">채용 공고 등록</div>
            <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">
              바로 등록
            </span>
          </div>

          {creationMessage ? (
            <div className="mt-4 rounded-lg bg-secondary-50 px-4 py-3 text-sm text-secondary-700">
              {creationMessage}
            </div>
          ) : null}

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="block">
              <div className="mb-2 text-sm font-semibold text-ink">학교명</div>
              <input
                className="input-surface"
                value={jobDraft.schoolName}
                onChange={(event) =>
                  updateJobDraftField("schoolName", event.target.value)
                }
              />
            </label>

            <label className="block">
              <div className="mb-2 text-sm font-semibold text-ink">지역</div>
              <input
                className="input-surface"
                value={jobDraft.schoolRegion}
                onChange={(event) =>
                  updateJobDraftField("schoolRegion", event.target.value)
                }
              />
            </label>

            <label className="block md:col-span-2">
              <div className="mb-2 text-sm font-semibold text-ink">주소</div>
              <input
                className="input-surface"
                value={jobDraft.schoolAddress}
                onChange={(event) =>
                  updateJobDraftField("schoolAddress", event.target.value)
                }
              />
            </label>

            <label className="block">
              <div className="mb-2 text-sm font-semibold text-ink">고용 형태</div>
              <select
                className="input-surface"
                value={jobDraft.employmentType}
                onChange={(event) =>
                  updateJobDraftField(
                    "employmentType",
                    event.target.value as JobDraft["employmentType"],
                  )
                }
              >
                <option value="기간제 교사">기간제 교사</option>
                <option value="시간강사">시간강사</option>
              </select>
            </label>

            <label className="block">
              <div className="mb-2 text-sm font-semibold text-ink">학년/포지션</div>
              <input
                className="input-surface"
                value={jobDraft.gradeLevel}
                onChange={(event) =>
                  updateJobDraftField("gradeLevel", event.target.value)
                }
              />
            </label>

            <label className="block">
              <div className="mb-2 text-sm font-semibold text-ink">자격 유형</div>
              <select
                className="input-surface"
                value={jobDraft.qualificationType}
                onChange={(event) =>
                  updateJobDraftField(
                    "qualificationType",
                    event.target.value as JobDraft["qualificationType"],
                  )
                }
              >
                <option value="초등">초등</option>
                <option value="중등">중등</option>
                <option value="특수">특수</option>
              </select>
            </label>

            <label className="block">
              <div className="mb-2 text-sm font-semibold text-ink">교과</div>
              <input
                className="input-surface"
                placeholder="예: 수학, 영어"
                value={jobDraft.qualificationSubject}
                onChange={(event) =>
                  updateJobDraftField("qualificationSubject", event.target.value)
                }
              />
            </label>

            <label className="block">
              <div className="mb-2 text-sm font-semibold text-ink">시작일</div>
              <input
                className="input-surface"
                type="date"
                value={jobDraft.startDate}
                onChange={(event) =>
                  updateJobDraftField("startDate", event.target.value)
                }
              />
            </label>

            <label className="block">
              <div className="mb-2 text-sm font-semibold text-ink">종료일</div>
              <input
                className="input-surface"
                type="date"
                value={jobDraft.endDate}
                onChange={(event) =>
                  updateJobDraftField("endDate", event.target.value)
                }
              />
            </label>

            <label className="flex items-center gap-3 rounded-lg bg-surface-subtle px-4 py-3 text-sm font-medium text-ink-soft md:col-span-2">
              <input
                checked={jobDraft.isHomeroom}
                type="checkbox"
                onChange={(event) =>
                  updateJobDraftField("isHomeroom", event.target.checked)
                }
              />
              담임 업무 포함
            </label>

            <label className="block md:col-span-2">
              <div className="mb-2 text-sm font-semibold text-ink">공고 요약</div>
              <textarea
                className="input-surface min-h-[110px]"
                value={jobDraft.summary}
                onChange={(event) =>
                  updateJobDraftField("summary", event.target.value)
                }
              />
            </label>

            <label className="block">
              <div className="mb-2 text-sm font-semibold text-ink">주요 업무</div>
              <textarea
                className="input-surface min-h-[140px]"
                value={jobDraft.duties}
                onChange={(event) =>
                  updateJobDraftField("duties", event.target.value)
                }
              />
            </label>

            <label className="block">
              <div className="mb-2 text-sm font-semibold text-ink">자격 및 우대</div>
              <textarea
                className="input-surface min-h-[140px]"
                value={jobDraft.requirements}
                onChange={(event) =>
                  updateJobDraftField("requirements", event.target.value)
                }
              />
            </label>

            <label className="block md:col-span-2">
              <div className="mb-2 text-sm font-semibold text-ink">지원 사항</div>
              <textarea
                className="input-surface min-h-[120px]"
                value={jobDraft.benefits}
                onChange={(event) =>
                  updateJobDraftField("benefits", event.target.value)
                }
              />
            </label>
          </div>

          <button
            type="submit"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-[linear-gradient(135deg,#0058be,#2170e4)] px-5 py-3 text-sm font-semibold text-white shadow-soft"
          >
            <Plus className="h-4 w-4" />
            채용 공고 등록
          </button>
        </form>

        <div className="panel-surface p-6">
          <div className="text-xl font-bold text-ink">운영 흐름 요약</div>
          <div className="mt-5 space-y-4">
            {[
              "1. 채용 공고를 등록하고 운영 상태를 조정합니다.",
              "2. 지원서가 들어오면 검토 후 면접 일정을 보냅니다.",
              "3. 인력풀에서 교사를 찾아 공고와 연결해 직접 제안할 수 있습니다.",
              "4. 교사가 수락하면 면접 장소와 시간을 바로 전달합니다.",
            ].map((item) => (
              <div
                key={item}
                className="rounded-lg bg-surface-subtle px-4 py-4 break-keep text-sm leading-6 text-ink-soft"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-8 panel-surface p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="text-xl font-bold text-ink">내 채용 공고 관리</div>
          <Link href="/jobs" className="text-sm font-semibold text-primary-700">
            전체 공고 보기
          </Link>
        </div>

        <div className="mt-6 grid gap-4">
          {jobs.map((job) => {
            const applications = getApplicationsForJob(job.id);

            return (
              <div
                key={job.id}
                className="rounded-lg border border-outline bg-surface p-5"
              >
                <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
                      <School className="h-8 w-8" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${jobTone(
                            job.status,
                          )}`}
                        >
                          {job.status === "open"
                            ? "모집 중"
                            : job.status === "closing-soon"
                              ? "마감 임박"
                              : "모집 마감"}
                        </span>
                        {job.source === "custom" ? (
                          <span className="rounded-full bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-700">
                            새로 등록
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-3 break-keep text-xl font-bold text-ink">
                        {job.schoolName}
                      </div>
                      <div className="mt-1 break-keep text-sm text-ink-soft">
                        {job.gradeLevel} / {job.employmentType}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-3 text-sm text-ink-muted">
                        <span>지원서 {applications.length}건</span>
                        <span>조회 {job.views}</span>
                        <span>마감 {job.deadline}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 xl:justify-end">
                    <button
                      type="button"
                      className="rounded-lg border border-outline px-4 py-3 text-sm font-semibold text-ink-soft"
                      onClick={() => updateJobStatus(job.id, "open")}
                    >
                      모집 중
                    </button>
                    <button
                      type="button"
                      className="rounded-lg border border-outline px-4 py-3 text-sm font-semibold text-ink-soft"
                      onClick={() => updateJobStatus(job.id, "closing-soon")}
                    >
                      마감 임박
                    </button>
                    <button
                      type="button"
                      className="rounded-lg border border-outline px-4 py-3 text-sm font-semibold text-ink-soft"
                      onClick={() => updateJobStatus(job.id, "closed")}
                    >
                      마감
                    </button>
                    <Link
                      href={`/jobs/${job.id}`}
                      className="rounded-lg border border-outline px-4 py-3 text-sm font-semibold text-primary-700"
                    >
                      공고 보기
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="panel-surface p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="text-xl font-bold text-ink">지원서 검토와 면접 요청</div>
            <span className="text-sm text-ink-muted">{totalApplications}건</span>
          </div>

          <div className="mt-6 space-y-5">
            {jobsWithApplications.length > 0 ? (
              jobsWithApplications.map(({ applications, job }) => (
                <div
                  key={job.id}
                  className="rounded-lg border border-outline bg-surface p-5"
                >
                  <div className="break-keep text-lg font-bold text-ink">
                    {job.schoolName} / {job.gradeLevel}
                  </div>
                  <div className="mt-1 text-sm text-ink-soft">
                    지원자 {applications.length}명
                  </div>

                  <div className="mt-5 space-y-4">
                    {applications.map((application) => {
                      const draft =
                        applicationInterviews[application.id] ?? makeInterviewDraft();

                      return (
                        <div
                          key={application.id}
                          className="rounded-lg bg-surface-subtle p-4"
                        >
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div className="min-w-0">
                              <span
                                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${applicationTone(
                                  application.status,
                                )}`}
                              >
                                {application.status === "interview-requested"
                                  ? "면접 요청"
                                  : application.status === "interview-confirmed"
                                    ? "면접 일정 확인"
                                    : application.status === "hired"
                                      ? "채용 확정"
                                      : application.status === "rejected"
                                        ? "검토 종료"
                                        : application.status === "withdrawn"
                                          ? "지원 취소"
                                          : application.status === "reviewing"
                                            ? "서류 검토"
                                            : "지원 접수"}
                              </span>
                              <div className="mt-3 break-keep text-lg font-bold text-ink">
                                {application.teacher?.name ?? "교사 정보 없음"}
                              </div>
                              <div className="mt-1 break-keep text-sm text-ink-soft">
                                {application.teacher?.qualification ?? "자격 정보 없음"} /{" "}
                                {application.teacher?.residence ?? "지역 확인 필요"}
                              </div>
                              <p className="mt-3 break-keep text-sm leading-6 text-ink-muted">
                                {application.coverNote}
                              </p>
                              <div className="mt-3 text-sm text-ink-soft">
                                {application.summary}
                              </div>
                              {application.interview ? (
                                <div className="mt-4 rounded-lg bg-primary-50 px-4 py-3 text-sm text-primary-700">
                                  {application.interview.date} {application.interview.time} /{" "}
                                  {application.interview.place}
                                  <div className="mt-1 break-keep text-primary-700/80">
                                    {application.interview.note}
                                  </div>
                                </div>
                              ) : null}
                            </div>

                            <div className="flex flex-wrap gap-2 lg:justify-end">
                              {application.status === "submitted" ? (
                                <button
                                  type="button"
                                  className="rounded-lg border border-outline px-4 py-3 text-sm font-semibold text-ink-soft"
                                  onClick={() =>
                                    updateApplicationStatus(
                                      application.id,
                                      "reviewing",
                                    )
                                  }
                                >
                                  서류 검토 시작
                                </button>
                              ) : null}
                              {application.status === "interview-confirmed" ? (
                                <button
                                  type="button"
                                  className="rounded-lg bg-secondary-600 px-4 py-3 text-sm font-semibold text-white"
                                  onClick={() =>
                                    updateApplicationStatus(application.id, "hired")
                                  }
                                >
                                  채용 확정
                                </button>
                              ) : null}
                              {!["hired", "rejected", "withdrawn"].includes(
                                application.status,
                              ) ? (
                                <button
                                  type="button"
                                  className="rounded-lg border border-outline px-4 py-3 text-sm font-semibold text-ink-soft"
                                  onClick={() =>
                                    updateApplicationStatus(
                                      application.id,
                                      "rejected",
                                    )
                                  }
                                >
                                  검토 종료
                                </button>
                              ) : null}
                            </div>
                          </div>

                          {!["hired", "rejected", "withdrawn"].includes(
                            application.status,
                          ) ? (
                            <div className="mt-5 grid gap-3 md:grid-cols-2">
                              <label className="block">
                                <div className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                                  면접 날짜
                                </div>
                                <input
                                  className="input-surface"
                                  type="date"
                                  value={draft.date}
                                  onChange={(event) =>
                                    setApplicationInterviews((current) => ({
                                      ...current,
                                      [application.id]: {
                                        ...draft,
                                        date: event.target.value,
                                      },
                                    }))
                                  }
                                />
                              </label>
                              <label className="block">
                                <div className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                                  시간
                                </div>
                                <input
                                  className="input-surface"
                                  type="time"
                                  value={draft.time}
                                  onChange={(event) =>
                                    setApplicationInterviews((current) => ({
                                      ...current,
                                      [application.id]: {
                                        ...draft,
                                        time: event.target.value,
                                      },
                                    }))
                                  }
                                />
                              </label>
                              <label className="block md:col-span-2">
                                <div className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                                  장소
                                </div>
                                <input
                                  className="input-surface"
                                  value={draft.place}
                                  onChange={(event) =>
                                    setApplicationInterviews((current) => ({
                                      ...current,
                                      [application.id]: {
                                        ...draft,
                                        place: event.target.value,
                                      },
                                    }))
                                  }
                                />
                              </label>
                              <label className="block md:col-span-2">
                                <div className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                                  안내 메모
                                </div>
                                <textarea
                                  className="input-surface min-h-[96px]"
                                  value={draft.note}
                                  onChange={(event) =>
                                    setApplicationInterviews((current) => ({
                                      ...current,
                                      [application.id]: {
                                        ...draft,
                                        note: event.target.value,
                                      },
                                    }))
                                  }
                                />
                              </label>
                              <button
                                type="button"
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[linear-gradient(135deg,#0058be,#2170e4)] px-4 py-3 text-sm font-semibold text-white shadow-soft md:col-span-2"
                                onClick={() =>
                                  scheduleInterviewForApplication(
                                    application.id,
                                    draft,
                                  )
                                }
                              >
                                <CalendarClock className="h-4 w-4" />
                                면접 일정 보내기
                              </button>
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-outline bg-surface-subtle px-4 py-8 text-center text-sm text-ink-soft">
                현재 연결된 지원서가 없습니다. 교사 화면에서 공고 지원을 진행하면
                이 영역에 바로 반영됩니다.
              </div>
            )}
          </div>
        </div>

        <div className="panel-surface p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="text-xl font-bold text-ink">매칭 요청과 면접 연결</div>
            <span className="text-sm text-ink-muted">{hrMatchRequests.length}건</span>
          </div>

          <div className="mt-6 space-y-4">
            {hrMatchRequests.map((request) => {
              const draft =
                requestInterviews[request.id] ?? makeInterviewDraft();

              return (
                <div
                  key={request.id}
                  className="rounded-lg border border-outline bg-surface p-5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${requestTone(
                          request.status,
                        )}`}
                      >
                        {request.status === "accepted"
                          ? "응답 완료"
                          : request.status === "rejected"
                            ? "검토 종료"
                            : request.status === "cancelled"
                              ? "요청 취소"
                              : "응답 대기"}
                      </span>
                      <div className="mt-3 break-keep text-lg font-bold text-ink">
                        {request.teacher?.name ?? "교사 정보 없음"}
                      </div>
                      <div className="mt-1 break-keep text-sm text-ink-soft">
                        {request.qualification} / {request.position}
                      </div>
                      <div className="mt-2 break-keep text-sm leading-6 text-ink-muted">
                        {request.summary}
                      </div>
                      {request.interview ? (
                        <div className="mt-4 rounded-lg bg-primary-50 px-4 py-3 text-sm text-primary-700">
                          {request.interview.date} {request.interview.time} /{" "}
                          {request.interview.place}
                          <div className="mt-1 break-keep text-primary-700/80">
                            {request.interview.note}
                          </div>
                        </div>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap gap-2 lg:justify-end">
                      {request.status === "pending" ? (
                        <button
                          type="button"
                          className="rounded-lg border border-outline px-4 py-3 text-sm font-semibold text-ink-soft"
                          onClick={() => cancelPoolRequest(request.id)}
                        >
                          요청 취소
                        </button>
                      ) : null}
                      <Link
                        href={`/pool/${request.teacherId}`}
                        className="rounded-lg border border-outline px-4 py-3 text-sm font-semibold text-primary-700"
                      >
                        프로필 보기
                      </Link>
                    </div>
                  </div>

                  {request.status === "accepted" ? (
                    <div className="mt-5 grid gap-3 md:grid-cols-2">
                      <label className="block">
                        <div className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                          면접 날짜
                        </div>
                        <input
                          className="input-surface"
                          type="date"
                          value={draft.date}
                          onChange={(event) =>
                            setRequestInterviews((current) => ({
                              ...current,
                              [request.id]: {
                                ...draft,
                                date: event.target.value,
                              },
                            }))
                          }
                        />
                      </label>
                      <label className="block">
                        <div className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                          시간
                        </div>
                        <input
                          className="input-surface"
                          type="time"
                          value={draft.time}
                          onChange={(event) =>
                            setRequestInterviews((current) => ({
                              ...current,
                              [request.id]: {
                                ...draft,
                                time: event.target.value,
                              },
                            }))
                          }
                        />
                      </label>
                      <label className="block md:col-span-2">
                        <div className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                          장소
                        </div>
                        <input
                          className="input-surface"
                          value={draft.place}
                          onChange={(event) =>
                            setRequestInterviews((current) => ({
                              ...current,
                              [request.id]: {
                                ...draft,
                                place: event.target.value,
                              },
                            }))
                          }
                        />
                      </label>
                      <label className="block md:col-span-2">
                        <div className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                          안내 메모
                        </div>
                        <textarea
                          className="input-surface min-h-[96px]"
                          value={draft.note}
                          onChange={(event) =>
                            setRequestInterviews((current) => ({
                              ...current,
                              [request.id]: {
                                ...draft,
                                note: event.target.value,
                              },
                            }))
                          }
                        />
                      </label>
                      <button
                        type="button"
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-[linear-gradient(135deg,#0058be,#2170e4)] px-4 py-3 text-sm font-semibold text-white shadow-soft md:col-span-2"
                        onClick={() =>
                          scheduleInterviewForRequest(request.id, draft)
                        }
                      >
                        <CalendarClock className="h-4 w-4" />
                        면접 요청 보내기
                      </button>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </PortalShell>
  );
}
