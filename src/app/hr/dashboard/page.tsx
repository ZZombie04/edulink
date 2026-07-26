"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Briefcase,
  CalendarClock,
  CheckCircle2,
  LayoutDashboard,
  LoaderCircle,
  MapPin,
  Plus,
  School,
  Search,
  Send,
  ShieldCheck,
  Star,
  Users,
  XCircle,
} from "lucide-react";

import { PortalShell } from "@/components/portal-shell";
import { HiringStateError } from "@/components/hiring-state-error";
import { useDemoHiringState } from "@/lib/demo-hiring-state";
import { useDemoSession } from "@/lib/demo-session-client";

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

type ReviewDraft = {
  comment: string;
  rating: number;
};

function makeInterviewDraft(): InterviewDraft {
  return {
    date: "",
    time: "",
    place: "",
    note: "",
  };
}

function makeDefaultJobDraft(schoolName = ""): JobDraft {
  return {
    schoolName,
    schoolRegion: "",
    schoolAddress: "",
    employmentType: "기간제 교사",
    startDate: "",
    endDate: "",
    qualificationType: "초등",
    qualificationSubject: "",
    gradeLevel: "",
    isHomeroom: true,
    summary: "",
    duties: "",
    requirements: "",
    benefits: "",
  };
}

function assertInterviewDraft(
  draft: InterviewDraft,
  today: string,
) {
  if (
    !draft.date ||
    draft.date < today ||
    !draft.time ||
    !draft.place.trim()
  ) {
    throw new Error(
      "오늘 이후의 면접 날짜와 시간, 장소를 모두 입력해 주세요.",
    );
  }
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
    case "hired":
      return "bg-secondary-50 text-secondary-700";
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
  const session = useDemoSession();
  const today = new Date().toISOString().slice(0, 10);
  const {
    cancelPoolRequest,
    completePoolRequestHire,
    createJob,
    getApplicationsForJob,
    hrOrganization,
    hrMatchRequests,
    jobs,
    loaded,
    loadError,
    parseListInput,
    refresh,
    scheduleInterviewForApplication,
    scheduleInterviewForRequest,
    updateApplicationStatus,
    updateJobStatus,
  } = useDemoHiringState();
  const [jobDraft, setJobDraft] = useState<JobDraft>(makeDefaultJobDraft());
  const [creationMessage, setCreationMessage] = useState("");
  const [operationError, setOperationError] = useState("");
  const [operationMessage, setOperationMessage] = useState("");
  const [pendingAction, setPendingAction] = useState("");
  const [applicationInterviews, setApplicationInterviews] = useState<
    Record<number, InterviewDraft>
  >({});
  const [requestInterviews, setRequestInterviews] = useState<
    Record<number, InterviewDraft>
  >({});
  const [reviewDrafts, setReviewDrafts] = useState<
    Record<number, ReviewDraft>
  >({});
  const [submittedReviewTeacherIds, setSubmittedReviewTeacherIds] = useState<
    number[]
  >([]);
  const schoolName = hrOrganization?.schoolName ?? session?.detail ?? "";
  const schoolRegion = hrOrganization?.schoolRegion ?? "";
  const schoolAddress = hrOrganization?.schoolAddress ?? "";

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
  const hiredCandidates = useMemo(() => {
    const candidates = [
      ...jobsWithApplications.flatMap(({ applications }) =>
        applications
          .filter(
            (application) =>
              application.status === "hired" && application.teacher,
          )
          .map((application) => ({
            name: application.teacher?.name ?? "채용 교사",
            qualification:
              application.teacher?.qualification ?? "자격 정보 확인 필요",
            teacherId: application.teacherId,
          })),
      ),
      ...hrMatchRequests
        .filter((request) => request.status === "hired" && request.teacher)
        .map((request) => ({
          name: request.teacher?.name ?? "채용 교사",
          qualification:
            request.teacher?.qualification ?? request.qualification,
          teacherId: request.teacherId,
        })),
    ];

    return Array.from(
      new Map(candidates.map((candidate) => [candidate.teacherId, candidate])).values(),
    );
  }, [hrMatchRequests, jobsWithApplications]);

  const updateJobDraftField = <K extends keyof JobDraft>(
    key: K,
    value: JobDraft[K],
  ) => {
    setJobDraft((current) => ({ ...current, [key]: value }));
  };

  const runOperation = async (
    key: string,
    action: () => Promise<void>,
    successMessage: string,
  ) => {
    setOperationError("");
    setOperationMessage("");
    setPendingAction(key);

    try {
      await action();
      setOperationMessage(successMessage);
    } catch (error) {
      setOperationError(
        error instanceof Error
          ? error.message
          : "요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.",
      );
    } finally {
      setPendingAction("");
    }
  };

  const handleCreateJob = async (event: React.FormEvent) => {
    event.preventDefault();

    if (
      !schoolName.trim() ||
      !schoolRegion.trim() ||
      !schoolAddress.trim() ||
      !jobDraft.gradeLevel.trim() ||
      !jobDraft.summary.trim() ||
      parseListInput(jobDraft.duties).length === 0 ||
      parseListInput(jobDraft.requirements).length === 0
    ) {
      setOperationError("학교·근무 조건과 공고 내용을 모두 입력해 주세요.");
      return;
    }

    if (jobDraft.startDate < today) {
      setOperationError("근무 시작일은 오늘보다 빠를 수 없습니다.");
      return;
    }

    if (new Date(jobDraft.endDate) < new Date(jobDraft.startDate)) {
      setOperationError("근무 종료일은 시작일보다 빠를 수 없습니다.");
      return;
    }

    setOperationError("");
    setCreationMessage("");
    setPendingAction("create-job");

    try {
      await createJob({
        schoolName,
        schoolRegion,
        schoolAddress,
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
        `${schoolName} ${jobDraft.gradeLevel} 공고가 등록되었습니다.`,
      );
      setJobDraft(makeDefaultJobDraft());
    } catch (error) {
      setOperationError(
        error instanceof Error
          ? error.message
          : "채용 공고를 등록하지 못했습니다.",
      );
    } finally {
      setPendingAction("");
    }
  };

  const submitPrivateReview = async (
    teacherId: number,
    teacherName: string,
  ) => {
    const draft = reviewDrafts[teacherId] ?? { comment: "", rating: 5 };

    await runOperation(
      `review-${teacherId}`,
      async () => {
        const response = await fetch("/api/reviews", {
          body: JSON.stringify({
            comment: draft.comment.trim(),
            rating: draft.rating,
            teacherId,
          }),
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          method: "POST",
        });
        const result = (await response.json().catch(() => null)) as
          | { message?: string }
          | null;

        if (!response.ok) {
          throw new Error(
            result?.message ?? "비공개 평가를 저장하지 못했습니다.",
          );
        }

        setSubmittedReviewTeacherIds((current) =>
          current.includes(teacherId) ? current : [...current, teacherId],
        );
      },
      `${teacherName} 교사 평가를 관리자 검토함에 제출했습니다.`,
    );
  };

  return (
    <PortalShell
      navItems={navItems}
      noticeCount={pendingMatches.length + acceptedMatches.length}
      primaryAction={{ href: "/pool", label: "교사 인력풀 보기", icon: Search }}
      sectionLabel="학교 채용 운영"
      user={{
        name: session?.name ?? "학교 담당자",
        role: "인사담당",
        detail: session?.detail ?? "소속 학교",
      }}
    >
      {loadError ? (
        <div className="mb-5">
          <HiringStateError message={loadError} onRetry={refresh} />
        </div>
      ) : null}

      {!loaded ? (
        <div
          aria-live="polite"
          className="mb-5 flex items-center gap-2 rounded-md border border-[#d7d4cb] bg-[#fbfaf6] px-4 py-3 text-sm text-[#65706a]"
        >
          <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" />
          채용 운영 데이터를 불러오는 중입니다.
        </div>
      ) : null}

      {operationError ? (
        <div
          className="mb-5 flex items-start gap-2 rounded-md border border-[#e4b8ae] bg-[#fff3f0] px-4 py-3 text-sm text-[#8b3328]"
          role="alert"
        >
          <AlertCircle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
          {operationError}
        </div>
      ) : null}

      {operationMessage ? (
        <div
          className="mb-5 flex items-start gap-2 rounded-md border border-[#b9cec1] bg-[#edf4ef] px-4 py-3 text-sm text-[#1f6248]"
          role="status"
        >
          <CheckCircle2 aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
          {operationMessage}
        </div>
      ) : null}
      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="self-start rounded-md border border-[#174c3e] bg-[#123d31] p-6 text-white shadow-[0_14px_34px_rgba(18,61,49,0.12)]">
          <div className="flex min-h-[184px] flex-col justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#bdd2c7]">
                HIRING OPERATIONS
              </div>
              <div className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
                학교 채용 관리
              </div>
              <div className="mt-3 break-keep text-sm leading-6 text-white/84">
                공고 등록부터 지원서 검토, 인력풀 제안, 면접 일정까지 실제
                채용 절차를 한곳에서 관리합니다.
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/pool"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-white px-5 py-3 text-sm font-semibold text-[#0b4a37] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <Search className="h-4 w-4" />
                교사 인력풀 보기
              </Link>
              <Link
                href="/jobs"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-white/25 bg-white/10 px-5 py-3 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
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
            <div
              className="mt-4 rounded-md border border-[#b9cec1] bg-[#edf4ef] px-4 py-3 text-sm text-[#1f6248]"
              role="status"
            >
              {creationMessage}
            </div>
          ) : null}

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="block">
              <div className="mb-2 text-sm font-semibold text-ink">학교명</div>
              <input
                className="input-surface"
                readOnly
                required
                value={schoolName}
              />
            </label>

            <label className="block">
              <div className="mb-2 text-sm font-semibold text-ink">지역</div>
              <input
                className="input-surface"
                readOnly
                required
                value={schoolRegion}
              />
            </label>

            <label className="block md:col-span-2">
              <div className="mb-2 text-sm font-semibold text-ink">주소</div>
              <input
                className="input-surface"
                readOnly
                required
                value={schoolAddress}
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
                required
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
                min={today}
                required
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
                min={jobDraft.startDate || today}
                required
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
                required
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
                required
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
                required
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
            className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#0b4a37] px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(11,74,55,0.16)] hover:bg-[#083a2c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b4a37] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={pendingAction === "create-job"}
          >
            {pendingAction === "create-job" ? (
              <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" />
            ) : (
              <Plus aria-hidden="true" className="h-4 w-4" />
            )}
            {pendingAction === "create-job" ? "공고 등록 중" : "채용 공고 등록"}
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
                      aria-pressed={job.status === "open"}
                      className={`min-h-10 rounded-md border px-4 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b4a37] disabled:opacity-60 ${
                        job.status === "open"
                          ? "border-[#9eb8a9] bg-[#e7efe9] text-[#0b4a37]"
                          : "border-[#d3d0c7] bg-white text-[#5b6560]"
                      }`}
                      disabled={Boolean(pendingAction)}
                      onClick={() =>
                        void runOperation(
                          `job-open-${job.id}`,
                          () => updateJobStatus(job.id, "open"),
                          `${job.schoolName} 공고를 모집 중으로 변경했습니다.`,
                        )
                      }
                    >
                      모집 중
                    </button>
                    <button
                      type="button"
                      aria-pressed={job.status === "closing-soon"}
                      className={`min-h-10 rounded-md border px-4 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b4a37] disabled:opacity-60 ${
                        job.status === "closing-soon"
                          ? "border-[#d9c38f] bg-[#fff7e6] text-[#865d13]"
                          : "border-[#d3d0c7] bg-white text-[#5b6560]"
                      }`}
                      disabled={Boolean(pendingAction)}
                      onClick={() =>
                        void runOperation(
                          `job-closing-${job.id}`,
                          () => updateJobStatus(job.id, "closing-soon"),
                          `${job.schoolName} 공고를 마감 임박으로 변경했습니다.`,
                        )
                      }
                    >
                      마감 임박
                    </button>
                    <button
                      type="button"
                      aria-pressed={job.status === "closed"}
                      className={`min-h-10 rounded-md border px-4 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b4a37] disabled:opacity-60 ${
                        job.status === "closed"
                          ? "border-[#c6c2b7] bg-[#eceae4] text-[#515b55]"
                          : "border-[#d3d0c7] bg-white text-[#5b6560]"
                      }`}
                      disabled={Boolean(pendingAction)}
                      onClick={() =>
                        void runOperation(
                          `job-closed-${job.id}`,
                          () => updateJobStatus(job.id, "closed"),
                          `${job.schoolName} 공고를 마감했습니다.`,
                        )
                      }
                    >
                      마감
                    </button>
                    <Link
                      href={`/jobs/${job.id}`}
                      className="inline-flex min-h-10 items-center rounded-md border border-[#d3d0c7] bg-white px-4 py-2 text-sm font-semibold text-[#0b4a37] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b4a37]"
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
                                  className="min-h-10 rounded-md border border-[#d3d0c7] bg-white px-4 py-2 text-sm font-semibold text-[#5b6560] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b4a37] disabled:opacity-60"
                                  disabled={Boolean(pendingAction)}
                                  onClick={() =>
                                    void runOperation(
                                      `application-review-${application.id}`,
                                      () =>
                                        updateApplicationStatus(
                                          application.id,
                                          "reviewing",
                                        ),
                                      "지원서 검토를 시작했습니다.",
                                    )
                                  }
                                >
                                  서류 검토 시작
                                </button>
                              ) : null}
                              {application.status === "interview-confirmed" ? (
                                <button
                                  type="button"
                                  className="min-h-10 rounded-md bg-[#0b4a37] px-4 py-2 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b4a37] focus-visible:ring-offset-2 disabled:opacity-60"
                                  disabled={Boolean(pendingAction)}
                                  onClick={() =>
                                    void runOperation(
                                      `application-hire-${application.id}`,
                                      () =>
                                        updateApplicationStatus(
                                          application.id,
                                          "hired",
                                        ),
                                      "채용 확정을 저장했습니다.",
                                    )
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
                                  className="min-h-10 rounded-md border border-[#d3d0c7] bg-white px-4 py-2 text-sm font-semibold text-[#5b6560] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b4a37] disabled:opacity-60"
                                  disabled={Boolean(pendingAction)}
                                  onClick={() =>
                                    void runOperation(
                                      `application-reject-${application.id}`,
                                      () =>
                                        updateApplicationStatus(
                                          application.id,
                                          "rejected",
                                        ),
                                      "지원서 검토를 종료했습니다.",
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
                                  min={today}
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
                                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#0b4a37] px-4 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(11,74,55,0.14)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b4a37] focus-visible:ring-offset-2 disabled:opacity-60 md:col-span-2"
                                disabled={Boolean(pendingAction)}
                                onClick={() =>
                                  void runOperation(
                                    `application-interview-${application.id}`,
                                    () => {
                                      assertInterviewDraft(draft, today);
                                      return scheduleInterviewForApplication(
                                        application.id,
                                        draft,
                                      );
                                    },
                                    "면접 일정을 교사에게 보냈습니다.",
                                  )
                                }
                              >
                                {pendingAction ===
                                `application-interview-${application.id}` ? (
                                  <LoaderCircle
                                    aria-hidden="true"
                                    className="h-4 w-4 animate-spin"
                                  />
                                ) : (
                                  <CalendarClock
                                    aria-hidden="true"
                                    className="h-4 w-4"
                                  />
                                )}
                                {pendingAction ===
                                `application-interview-${application.id}`
                                  ? "일정 전송 중"
                                  : "면접 일정 보내기"}
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
                        {request.status === "hired"
                          ? "채용 확정"
                          : request.status === "accepted"
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
                          className="min-h-10 rounded-md border border-[#d3d0c7] bg-white px-4 py-2 text-sm font-semibold text-[#5b6560] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b4a37] disabled:opacity-60"
                          disabled={Boolean(pendingAction)}
                          onClick={() =>
                            void runOperation(
                              `request-cancel-${request.id}`,
                              () => cancelPoolRequest(request.id),
                              "대기 중인 채용 제안을 취소했습니다.",
                            )
                          }
                        >
                          {pendingAction === `request-cancel-${request.id}`
                            ? "취소 중"
                            : "요청 취소"}
                        </button>
                      ) : null}
                      {request.status === "accepted" ? (
                        <button
                          type="button"
                          className="min-h-10 rounded-md bg-[#0b4a37] px-4 py-2 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b4a37] focus-visible:ring-offset-2 disabled:opacity-60"
                          disabled={Boolean(pendingAction)}
                          onClick={() =>
                            void runOperation(
                              `request-hire-${request.id}`,
                              () => completePoolRequestHire(request.id),
                              "직접 제안 채용과 계약을 확정했습니다.",
                            )
                          }
                        >
                          {pendingAction === `request-hire-${request.id}`
                            ? "확정 중"
                            : "채용 확정"}
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
                          min={today}
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
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#0b4a37] px-4 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(11,74,55,0.14)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b4a37] focus-visible:ring-offset-2 disabled:opacity-60 md:col-span-2"
                        disabled={Boolean(pendingAction)}
                        onClick={() =>
                          void runOperation(
                            `request-interview-${request.id}`,
                            () => {
                              assertInterviewDraft(draft, today);
                              return scheduleInterviewForRequest(
                                request.id,
                                draft,
                              );
                            },
                            "면접 요청을 교사에게 보냈습니다.",
                          )
                        }
                      >
                        {pendingAction ===
                        `request-interview-${request.id}` ? (
                          <LoaderCircle
                            aria-hidden="true"
                            className="h-4 w-4 animate-spin"
                          />
                        ) : (
                          <CalendarClock
                            aria-hidden="true"
                            className="h-4 w-4"
                          />
                        )}
                        {pendingAction === `request-interview-${request.id}`
                          ? "요청 전송 중"
                          : "면접 요청 보내기"}
                      </button>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mt-8 panel-surface p-6">
        <div className="flex flex-col gap-3 border-b border-outline pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-700">
              PRIVATE REFERENCE
            </div>
            <h2 className="mt-2 text-xl font-bold text-ink">
              채용 후 비공개 평가
            </h2>
            <p className="mt-2 max-w-2xl break-keep text-sm leading-6 text-ink-soft">
              채용이 확정된 교사에 대한 별점과 업무 후기를 남길 수 있습니다.
              제출 내용은 에듀링크 관리자만 열람하며 교사와 다른 학교에는
              공개되지 않습니다.
            </p>
          </div>
          <span className="text-sm font-medium text-ink-muted">
            평가 가능 {hiredCandidates.length}명
          </span>
        </div>

        {hiredCandidates.length > 0 ? (
          <div className="mt-6 grid gap-5 xl:grid-cols-2">
            {hiredCandidates.map((candidate) => {
              const draft = reviewDrafts[candidate.teacherId] ?? {
                comment: "",
                rating: 5,
              };
              const submitted = submittedReviewTeacherIds.includes(
                candidate.teacherId,
              );

              return (
                <div
                  className="rounded-lg border border-outline bg-surface p-5"
                  key={candidate.teacherId}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-lg font-bold text-ink">
                        {candidate.name}
                      </div>
                      <div className="mt-1 text-sm text-ink-soft">
                        {candidate.qualification}
                      </div>
                    </div>
                    <ShieldCheck
                      aria-hidden="true"
                      className="h-5 w-5 text-primary-700"
                    />
                  </div>

                  {submitted ? (
                    <div
                      className="mt-5 flex items-start gap-2 rounded-md border border-[#b9cec1] bg-[#edf4ef] px-4 py-3 text-sm leading-6 text-[#1f6248]"
                      role="status"
                    >
                      <CheckCircle2
                        aria-hidden="true"
                        className="mt-0.5 h-4 w-4 shrink-0"
                      />
                      평가가 관리자 전용 검토함에 안전하게 제출되었습니다.
                    </div>
                  ) : (
                    <>
                      <fieldset className="mt-5">
                        <legend className="text-sm font-semibold text-ink">
                          별점
                        </legend>
                        <div className="mt-2 flex gap-1">
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <button
                              aria-label={`${rating}점`}
                              aria-pressed={draft.rating === rating}
                              className="flex h-11 w-11 items-center justify-center rounded-md border border-outline bg-white text-[#b3b8b4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b4a37] data-[selected=true]:border-[#0b4a37] data-[selected=true]:bg-[#edf4ef] data-[selected=true]:text-[#0b4a37]"
                              data-selected={draft.rating >= rating}
                              key={rating}
                              onClick={() =>
                                setReviewDrafts((current) => ({
                                  ...current,
                                  [candidate.teacherId]: {
                                    ...draft,
                                    rating,
                                  },
                                }))
                              }
                              type="button"
                            >
                              <Star
                                aria-hidden="true"
                                className="h-5 w-5"
                                fill={
                                  draft.rating >= rating
                                    ? "currentColor"
                                    : "none"
                                }
                              />
                            </button>
                          ))}
                        </div>
                      </fieldset>

                      <label className="mt-5 block">
                        <span className="mb-2 block text-sm font-semibold text-ink">
                          업무 후기
                        </span>
                        <textarea
                          className="input-surface min-h-[112px]"
                          maxLength={2000}
                          onChange={(event) =>
                            setReviewDrafts((current) => ({
                              ...current,
                              [candidate.teacherId]: {
                                ...draft,
                                comment: event.target.value,
                              },
                            }))
                          }
                          placeholder="수업 운영, 협업, 책임감 등 채용 이후 확인한 내용을 작성해 주세요."
                          value={draft.comment}
                        />
                      </label>

                      <button
                        className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-[#0b4a37] px-4 py-3 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b4a37] focus-visible:ring-offset-2 disabled:opacity-60"
                        disabled={Boolean(pendingAction)}
                        onClick={() =>
                          void submitPrivateReview(
                            candidate.teacherId,
                            candidate.name,
                          )
                        }
                        type="button"
                      >
                        {pendingAction ===
                        `review-${candidate.teacherId}` ? (
                          <LoaderCircle
                            aria-hidden="true"
                            className="h-4 w-4 animate-spin"
                          />
                        ) : (
                          <ShieldCheck
                            aria-hidden="true"
                            className="h-4 w-4"
                          />
                        )}
                        {pendingAction === `review-${candidate.teacherId}`
                          ? "평가 제출 중"
                          : "관리자 전용 평가 제출"}
                      </button>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-6 rounded-lg border border-dashed border-outline bg-surface-subtle px-5 py-9 text-center">
            <div className="text-sm font-semibold text-ink">
              아직 평가할 수 있는 채용 건이 없습니다.
            </div>
            <p className="mt-2 text-sm leading-6 text-ink-soft">
              지원 또는 직접 제안에서 채용 확정을 완료하면 이곳에 평가 대상이
              표시됩니다.
            </p>
          </div>
        )}
      </section>
    </PortalShell>
  );
}
