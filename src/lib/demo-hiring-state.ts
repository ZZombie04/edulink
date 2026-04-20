"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  featuredTeachers,
  getTeacherById,
  hrMatchRequests,
  jobPosts,
  teacherMatchRequests,
  type JobPost,
  type MatchRequestStatus,
  type TeacherProfile,
} from "@/lib/demo-data";

const STORAGE_KEY = "edulink_demo_hiring_state";
const STORAGE_EVENT = "edulink-demo-hiring-state";
const DEFAULT_TEACHER_ID = 1;

export type DemoRequestStatus = MatchRequestStatus | "cancelled";
export type ApplicationStatus =
  | "submitted"
  | "reviewing"
  | "interview-requested"
  | "interview-confirmed"
  | "hired"
  | "rejected"
  | "withdrawn";

export interface InterviewSchedule {
  date: string;
  note: string;
  place: string;
  sentAt: string;
  time: string;
}

export interface PoolRequestRecord {
  id: number;
  interview?: InterviewSchedule;
  jobId: string;
  message: string;
  note: string;
  sentAt: string;
  status: DemoRequestStatus;
  teacherId: number;
}

export interface JobApplicationRecord {
  coverNote: string;
  id: number;
  interview?: InterviewSchedule;
  jobId: string;
  status: ApplicationStatus;
  submittedAt: string;
  summary: string;
  teacherId: number;
}

interface ApplicationOverrideRecord {
  interview?: InterviewSchedule;
  status?: ApplicationStatus;
  summary?: string;
}

export interface ResolvedJobPost extends JobPost {
  activeApplicationCount: number;
  source: "custom" | "seed";
}

export interface ResolvedPoolRequest {
  id: number;
  interview?: InterviewSchedule;
  job: ResolvedJobPost | null;
  message: string;
  note: string;
  position: string;
  qualification: string;
  region: string;
  schoolName: string;
  sentAt: string;
  status: DemoRequestStatus;
  summary: string;
  teacher: TeacherProfile | null;
  teacherId: number;
}

export interface ResolvedApplication {
  coverNote: string;
  id: number;
  interview?: InterviewSchedule;
  job: ResolvedJobPost | null;
  jobId: string;
  status: ApplicationStatus;
  submittedAt: string;
  summary: string;
  teacher: TeacherProfile | null;
  teacherId: number;
}

interface DemoHiringState {
  applicationOverrides: Partial<Record<number, ApplicationOverrideRecord>>;
  applications: JobApplicationRecord[];
  customJobs: JobPost[];
  customPoolRequests: PoolRequestRecord[];
  interestedTeacherIds: number[];
  jobStatusOverrides: Record<string, JobPost["status"]>;
  nextApplicationId: number;
  nextJobId: number;
  nextPoolRequestId: number;
  poolRequestOverrides: Partial<
    Record<
      number,
      {
        interview?: InterviewSchedule;
        status?: DemoRequestStatus;
      }
    >
  >;
}

interface CreateJobInput {
  benefits: string[];
  duties: string[];
  employmentType: JobPost["employmentType"];
  endDate: string;
  gradeLevel: string;
  isHomeroom: boolean;
  qualificationSubject?: string;
  qualificationType: JobPost["qualificationType"];
  requirements: string[];
  schoolAddress: string;
  schoolName: string;
  schoolRegion: string;
  startDate: string;
  summary: string;
}

const seedPoolRequests: PoolRequestRecord[] = teacherMatchRequests.map((offer) => ({
  id: offer.id,
  jobId: offer.jobId,
  teacherId: offer.teacherId,
  status: offer.status,
  sentAt: offer.receivedAt,
  note:
    hrMatchRequests.find((request) => request.id === offer.id)?.note ??
    "프로필 열람 후 우선 제안을 전달했습니다.",
  message: offer.message,
}));

const seedApplicationRecords: JobApplicationRecord[] = [
  {
    id: 1,
    jobId: "1",
    teacherId: 2,
    status: "reviewing",
    submittedAt: "2026.04.19 16:10",
    coverNote:
      "학년 담임 경험과 학부모 상담 운영 경험을 살려 바로 근무에 참여할 수 있습니다.",
    summary: "학교 검토가 진행 중인 지원서입니다.",
  },
];

const DEFAULT_STATE: DemoHiringState = {
  applicationOverrides: {},
  applications: [],
  customJobs: [],
  customPoolRequests: [],
  interestedTeacherIds: [],
  jobStatusOverrides: {},
  nextApplicationId:
    Math.max(0, ...seedApplicationRecords.map((application) => application.id)) +
    1,
  nextJobId: 101,
  nextPoolRequestId:
    Math.max(0, ...seedPoolRequests.map((request) => request.id)) + 1,
  poolRequestOverrides: {},
};

function formatTimestamp(date = new Date()) {
  return new Intl.DateTimeFormat("ko-KR", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
  }).format(date);
}

function parseMultilineField(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function parseListInput(value: string) {
  return parseMultilineField(value);
}

function getRequestStatusSummary(
  status: DemoRequestStatus,
  fallbackSummary: string,
  interview?: InterviewSchedule,
) {
  switch (status) {
    case "accepted":
      return interview
        ? "면접 일정까지 전달된 상태입니다. 학교와 다음 절차를 이어갈 수 있습니다."
        : "제안을 수락했고 학교와 다음 절차를 이어가는 상태입니다.";
    case "rejected":
      return "이번 제안은 보류로 정리되었고 다른 제안은 계속 검토할 수 있습니다.";
    case "archived":
      return "교사가 제안을 보관한 상태입니다.";
    case "cancelled":
      return "학교 담당자가 요청을 취소하고 후보 검토를 종료했습니다.";
    default:
      return fallbackSummary;
  }
}

export function getApplicationStatusSummary(
  status: ApplicationStatus,
  interview?: InterviewSchedule,
) {
  switch (status) {
    case "reviewing":
      return "학교 담당자가 지원서를 검토하고 있습니다.";
    case "interview-requested":
      return interview
        ? `${interview.date} ${interview.time} 면접 요청이 도착했습니다.`
        : "면접 요청이 도착했습니다.";
    case "interview-confirmed":
      return interview
        ? `${interview.date} ${interview.time} 면접 일정 확인을 완료했습니다.`
        : "면접 일정 확인을 완료했습니다.";
    case "hired":
      return "최종 채용이 확정된 상태입니다.";
    case "rejected":
      return "검토가 종료되었고 이번 공고는 진행하지 않기로 정리되었습니다.";
    case "withdrawn":
      return "교사가 지원을 취소했습니다.";
    default:
      return "지원서가 접수되어 학교 검토를 기다리는 상태입니다.";
  }
}

function sanitizeApplicationStatus(value: unknown): ApplicationStatus | null {
  const valid: ApplicationStatus[] = [
    "submitted",
    "reviewing",
    "interview-requested",
    "interview-confirmed",
    "hired",
    "rejected",
    "withdrawn",
  ];

  return typeof value === "string" && valid.includes(value as ApplicationStatus)
    ? (value as ApplicationStatus)
    : null;
}

function sanitizeRequestStatus(value: unknown): DemoRequestStatus | null {
  const valid: DemoRequestStatus[] = [
    "pending",
    "accepted",
    "rejected",
    "archived",
    "cancelled",
  ];

  return typeof value === "string" && valid.includes(value as DemoRequestStatus)
    ? (value as DemoRequestStatus)
    : null;
}

function sanitizeInterview(value: unknown): InterviewSchedule | undefined {
  if (typeof value !== "object" || value === null) {
    return undefined;
  }

  const candidate = value as Partial<InterviewSchedule>;

  if (
    typeof candidate.date !== "string" ||
    typeof candidate.time !== "string" ||
    typeof candidate.place !== "string" ||
    typeof candidate.note !== "string" ||
    typeof candidate.sentAt !== "string"
  ) {
    return undefined;
  }

  return {
    date: candidate.date,
    time: candidate.time,
    place: candidate.place,
    note: candidate.note,
    sentAt: candidate.sentAt,
  };
}

function sanitizeJob(candidate: unknown): JobPost | null {
  if (typeof candidate !== "object" || candidate === null) {
    return null;
  }

  const job = candidate as Partial<JobPost>;

  if (
    typeof job.id !== "string" ||
    typeof job.schoolName !== "string" ||
    typeof job.schoolRegion !== "string" ||
    typeof job.schoolAddress !== "string" ||
    typeof job.employmentType !== "string" ||
    typeof job.startDate !== "string" ||
    typeof job.endDate !== "string" ||
    typeof job.qualificationType !== "string" ||
    typeof job.gradeLevel !== "string" ||
    typeof job.summary !== "string" ||
    !Array.isArray(job.duties) ||
    !Array.isArray(job.requirements) ||
    !Array.isArray(job.benefits) ||
    typeof job.status !== "string" ||
    typeof job.postedAt !== "string" ||
    typeof job.deadline !== "string" ||
    typeof job.contactName !== "string" ||
    typeof job.applicants !== "number" ||
    typeof job.views !== "number" ||
    typeof job.isHomeroom !== "boolean"
  ) {
    return null;
  }

  return {
    id: job.id,
    schoolName: job.schoolName,
    schoolRegion: job.schoolRegion,
    schoolAddress: job.schoolAddress,
    employmentType: job.employmentType as JobPost["employmentType"],
    startDate: job.startDate,
    endDate: job.endDate,
    qualificationType: job.qualificationType as JobPost["qualificationType"],
    qualificationSubject:
      typeof job.qualificationSubject === "string"
        ? job.qualificationSubject
        : undefined,
    gradeLevel: job.gradeLevel,
    isHomeroom: job.isHomeroom,
    summary: job.summary,
    duties: job.duties.filter((item): item is string => typeof item === "string"),
    requirements: job.requirements.filter(
      (item): item is string => typeof item === "string",
    ),
    benefits: job.benefits.filter((item): item is string => typeof item === "string"),
    status: job.status as JobPost["status"],
    postedAt: job.postedAt,
    deadline: job.deadline,
    contactName: job.contactName,
    applicants: job.applicants,
    views: job.views,
  };
}

function isDefined<T>(value: T | null): value is T {
  return value !== null;
}

function sanitizeApplication(candidate: unknown): JobApplicationRecord | null {
  if (typeof candidate !== "object" || candidate === null) {
    return null;
  }

  const value = candidate as Partial<JobApplicationRecord>;
  const status = sanitizeApplicationStatus(value.status);

  if (
    typeof value.id !== "number" ||
    typeof value.jobId !== "string" ||
    typeof value.teacherId !== "number" ||
    typeof value.submittedAt !== "string" ||
    typeof value.summary !== "string" ||
    typeof value.coverNote !== "string" ||
    status === null
  ) {
    return null;
  }

  return {
    id: value.id,
    jobId: value.jobId,
    teacherId: value.teacherId,
    submittedAt: value.submittedAt,
    status,
    summary: value.summary,
    coverNote: value.coverNote,
    interview: sanitizeInterview(value.interview),
  };
}

function sanitizePoolRequest(candidate: unknown): PoolRequestRecord | null {
  if (typeof candidate !== "object" || candidate === null) {
    return null;
  }

  const value = candidate as Partial<PoolRequestRecord>;
  const status = sanitizeRequestStatus(value.status);

  if (
    typeof value.id !== "number" ||
    typeof value.jobId !== "string" ||
    typeof value.teacherId !== "number" ||
    typeof value.sentAt !== "string" ||
    typeof value.note !== "string" ||
    typeof value.message !== "string" ||
    status === null
  ) {
    return null;
  }

  return {
    id: value.id,
    jobId: value.jobId,
    teacherId: value.teacherId,
    sentAt: value.sentAt,
    note: value.note,
    message: value.message,
    status,
    interview: sanitizeInterview(value.interview),
  };
}

function sanitizeHiringState(value: unknown): DemoHiringState {
  if (typeof value !== "object" || value === null) {
    return DEFAULT_STATE;
  }

  const candidate = value as Partial<DemoHiringState>;

  const customJobs = Array.isArray(candidate.customJobs)
    ? candidate.customJobs.map(sanitizeJob).filter(isDefined)
    : [];
  const applications = Array.isArray(candidate.applications)
    ? candidate.applications.map(sanitizeApplication).filter(isDefined)
    : [];
  const customPoolRequests = Array.isArray(candidate.customPoolRequests)
    ? candidate.customPoolRequests.map(sanitizePoolRequest).filter(isDefined)
    : [];
  const interestedTeacherIds = Array.isArray(candidate.interestedTeacherIds)
    ? candidate.interestedTeacherIds.filter(
        (teacherId): teacherId is number =>
          typeof teacherId === "number" && getTeacherById(teacherId) !== null,
      )
    : [];

  const jobStatusOverrides = Object.fromEntries(
    Object.entries(candidate.jobStatusOverrides ?? {}).flatMap(([jobId, status]) =>
      typeof status === "string" ? [[jobId, status]] : [],
    ),
  ) as Record<string, JobPost["status"]>;

  const poolRequestOverrides = Object.fromEntries(
    Object.entries(candidate.poolRequestOverrides ?? {}).flatMap(
      ([requestId, override]) => {
        const parsedId = Number(requestId);

        if (!Number.isInteger(parsedId) || typeof override !== "object" || override === null) {
          return [];
        }

        const status = sanitizeRequestStatus(
          (override as { status?: unknown }).status,
        );
        const interview = sanitizeInterview(
          (override as { interview?: unknown }).interview,
        );

        if (!status && !interview) {
          return [];
        }

        return [[parsedId, { status, interview }]];
      },
    ),
  ) as DemoHiringState["poolRequestOverrides"];

  const applicationOverrides = Object.fromEntries(
    Object.entries(candidate.applicationOverrides ?? {}).flatMap(
      ([applicationId, override]) => {
        const parsedId = Number(applicationId);

        if (
          !Number.isInteger(parsedId) ||
          typeof override !== "object" ||
          override === null
        ) {
          return [];
        }

        const status = sanitizeApplicationStatus(
          (override as { status?: unknown }).status,
        );
        const interview = sanitizeInterview(
          (override as { interview?: unknown }).interview,
        );
        const summary =
          typeof (override as { summary?: unknown }).summary === "string"
            ? (override as { summary: string }).summary
            : undefined;

        if (!status && !interview && !summary) {
          return [];
        }

        return [[parsedId, { status, interview, summary }]];
      },
    ),
  ) as DemoHiringState["applicationOverrides"];

  return {
    applicationOverrides,
    applications,
    customJobs,
    customPoolRequests,
    interestedTeacherIds: [...new Set(interestedTeacherIds)],
    jobStatusOverrides,
    nextApplicationId:
      typeof candidate.nextApplicationId === "number"
        ? candidate.nextApplicationId
        : DEFAULT_STATE.nextApplicationId,
    nextJobId:
      typeof candidate.nextJobId === "number"
        ? candidate.nextJobId
        : DEFAULT_STATE.nextJobId,
    nextPoolRequestId:
      typeof candidate.nextPoolRequestId === "number"
        ? candidate.nextPoolRequestId
        : DEFAULT_STATE.nextPoolRequestId,
    poolRequestOverrides,
  };
}

export function readDemoHiringState() {
  if (typeof window === "undefined") {
    return DEFAULT_STATE;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return DEFAULT_STATE;
    }

    return sanitizeHiringState(JSON.parse(raw));
  } catch {
    return DEFAULT_STATE;
  }
}

function writeDemoHiringState(nextState: DemoHiringState) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
  window.dispatchEvent(new Event(STORAGE_EVENT));
}

export function getAllJobs(state?: DemoHiringState | null): ResolvedJobPost[] {
  const customJobs = state?.customJobs ?? [];
  const jobStatusOverrides = state?.jobStatusOverrides ?? {};
  const applications = getAllApplications(state);

  return [...jobPosts, ...customJobs]
    .map((job) => {
      const isSeed = jobPosts.some((seedJob) => seedJob.id === job.id);
      const activeApplicationCount = applications.filter(
        (application) =>
          application.jobId === job.id &&
          !["withdrawn", "rejected"].includes(application.status),
      ).length;

      return {
        ...job,
        applicants: isSeed ? job.applicants + activeApplicationCount : activeApplicationCount,
        activeApplicationCount,
        source: isSeed ? ("seed" as const) : ("custom" as const),
        status: jobStatusOverrides[job.id] ?? job.status,
      };
    })
    .sort((left, right) => right.id.localeCompare(left.id));
}

export function getJobByIdFromState(
  id: string,
  state?: DemoHiringState | null,
): ResolvedJobPost | null {
  return getAllJobs(state).find((job) => job.id === id) ?? null;
}

function getAllApplications(state?: DemoHiringState | null) {
  return [...seedApplicationRecords, ...(state?.applications ?? [])];
}

function resolveApplication(
  application: JobApplicationRecord,
  state?: DemoHiringState | null,
): ResolvedApplication {
  const override = state?.applicationOverrides[application.id];
  const status = override?.status ?? application.status;
  const interview = override?.interview ?? application.interview;
  const summary =
    override?.summary ?? getApplicationStatusSummary(status, interview);

  return {
    ...application,
    interview,
    job: getJobByIdFromState(application.jobId, state),
    status,
    summary,
    teacher: getTeacherById(application.teacherId),
  };
}

function resolvePoolRequest(
  request: PoolRequestRecord,
  state?: DemoHiringState | null,
): ResolvedPoolRequest {
  const override = state?.poolRequestOverrides[request.id];
  const status = override?.status ?? request.status;
  const interview = override?.interview ?? request.interview;
  const job = getJobByIdFromState(request.jobId, state);
  const teacher = getTeacherById(request.teacherId);

  return {
    id: request.id,
    interview,
    job,
    message: request.message,
    note: request.note,
    position: job ? `${job.gradeLevel} / ${job.employmentType}` : request.note,
    qualification: teacher?.qualification ?? "교사 자격 확인 필요",
    region: job?.schoolRegion ?? teacher?.residence ?? "경기",
    schoolName: job?.schoolName ?? "학교 정보 없음",
    sentAt: request.sentAt,
    status,
    summary: getRequestStatusSummary(
      status,
      request.note || "후보 검토를 위한 제안이 도착했습니다.",
      interview,
    ),
    teacher,
    teacherId: request.teacherId,
  };
}

export function getAllPoolRequests(state?: DemoHiringState | null) {
  return [...seedPoolRequests, ...(state?.customPoolRequests ?? [])]
    .map((request) => resolvePoolRequest(request, state))
    .sort((left, right) => right.id - left.id);
}

export function getPoolRequestById(
  id: number,
  state?: DemoHiringState | null,
) {
  return getAllPoolRequests(state).find((request) => request.id === id) ?? null;
}

export function getTeacherOffersForTeacher(
  teacherId: number,
  state?: DemoHiringState | null,
) {
  return getAllPoolRequests(state).filter((request) => request.teacherId === teacherId);
}

export function getHRMatchRequests(state?: DemoHiringState | null) {
  return getAllPoolRequests(state);
}

export function getApplicationsForTeacher(
  teacherId: number,
  state?: DemoHiringState | null,
): ResolvedApplication[] {
  return getAllApplications(state)
    .filter((application) => application.teacherId === teacherId)
    .map((application) => resolveApplication(application, state))
    .sort((left, right) => right.id - left.id);
}

export function getApplicationsForJob(
  jobId: string,
  state?: DemoHiringState | null,
): ResolvedApplication[] {
  return getAllApplications(state)
    .filter((application) => application.jobId === jobId)
    .map((application) => resolveApplication(application, state))
    .sort((left, right) => right.id - left.id);
}

export function getRequestForTeacherAndJob(
  teacherId: number,
  jobId: string,
  state?: DemoHiringState | null,
) {
  return getTeacherOffersForTeacher(teacherId, state).find(
    (request) => request.job?.id === jobId,
  ) ?? null;
}

export function getApplicationForTeacherAndJob(
  teacherId: number,
  jobId: string,
  state?: DemoHiringState | null,
) {
  return getApplicationsForTeacher(teacherId, state).find(
    (application) => application.jobId === jobId,
  ) ?? null;
}

export function useDemoHiringState() {
  const [state, setState] = useState<DemoHiringState>(DEFAULT_STATE);

  useEffect(() => {
    const syncState = () => {
      setState(readDemoHiringState());
    };

    syncState();
    window.addEventListener("storage", syncState);
    window.addEventListener(STORAGE_EVENT, syncState as EventListener);

    return () => {
      window.removeEventListener("storage", syncState);
      window.removeEventListener(STORAGE_EVENT, syncState as EventListener);
    };
  }, []);

  const updateState = useCallback(
    (updater: (current: DemoHiringState) => DemoHiringState) => {
      const nextState = sanitizeHiringState(updater(readDemoHiringState()));

      writeDemoHiringState(nextState);
      setState(nextState);
      return nextState;
    },
    [],
  );

  const createJob = useCallback(
    (input: CreateJobInput) => {
      const now = formatTimestamp();

      updateState((current) => {
        const id = `custom-${current.nextJobId}`;
        const nextJob: JobPost = {
          id,
          schoolName: input.schoolName,
          schoolRegion: input.schoolRegion,
          schoolAddress: input.schoolAddress,
          employmentType: input.employmentType,
          startDate: input.startDate,
          endDate: input.endDate,
          qualificationType: input.qualificationType,
          qualificationSubject: input.qualificationSubject,
          gradeLevel: input.gradeLevel,
          isHomeroom: input.isHomeroom,
          summary: input.summary,
          duties: input.duties,
          requirements: input.requirements,
          benefits: input.benefits,
          status: "open",
          postedAt: now,
          deadline: input.endDate,
          contactName: "홍수진 인사담당",
          applicants: 0,
          views: 0,
        };

        return {
          ...current,
          customJobs: [nextJob, ...current.customJobs],
          nextJobId: current.nextJobId + 1,
        };
      });
    },
    [updateState],
  );

  const updateJobStatus = useCallback(
    (jobId: string, status: JobPost["status"]) => {
      updateState((current) => ({
        ...current,
        jobStatusOverrides: {
          ...current.jobStatusOverrides,
          [jobId]: status,
        },
      }));
    },
    [updateState],
  );

  const applyToJob = useCallback(
    (jobId: string, teacherId = DEFAULT_TEACHER_ID, coverNote = "") => {
      return updateState((current) => {
        const existing = getApplicationForTeacherAndJob(teacherId, jobId, current);

        if (existing && existing.status !== "withdrawn") {
          return current;
        }

        const job = getJobByIdFromState(jobId, current);

        if (!job) {
          return current;
        }

        return {
          ...current,
          applications: [
            {
              id: current.nextApplicationId,
              jobId,
              teacherId,
              submittedAt: formatTimestamp(),
              status: "submitted",
              summary: "지원서가 접수되어 학교 검토를 기다리는 상태입니다.",
              coverNote:
                coverNote.trim() ||
                `${job.gradeLevel} 공고에 바로 지원했습니다. 희망 일정과 근무 조건을 확인해 주세요.`,
            },
            ...current.applications,
          ],
          nextApplicationId: current.nextApplicationId + 1,
        };
      });
    },
    [updateState],
  );

  const withdrawApplication = useCallback(
    (applicationId: number) => {
      updateState((current) => {
        const hasCustom = current.applications.some(
          (application) => application.id === applicationId,
        );
        const summary = getApplicationStatusSummary("withdrawn");

        if (hasCustom) {
          return {
            ...current,
            applications: current.applications.map((application) =>
              application.id === applicationId
                ? {
                    ...application,
                    status: "withdrawn",
                    summary,
                  }
                : application,
            ),
          };
        }

        return {
          ...current,
          applicationOverrides: {
            ...current.applicationOverrides,
            [applicationId]: {
              ...current.applicationOverrides[applicationId],
              status: "withdrawn",
              summary,
            },
          },
        };
      });
    },
    [updateState],
  );

  const updateApplicationStatus = useCallback(
    (applicationId: number, status: ApplicationStatus) => {
      updateState((current) => {
        const hasCustom = current.applications.some(
          (application) => application.id === applicationId,
        );
        const existing = getAllApplications(current).find(
          (application) => application.id === applicationId,
        );
        const interview =
          current.applicationOverrides[applicationId]?.interview ??
          existing?.interview;
        const summary = getApplicationStatusSummary(status, interview);

        if (hasCustom) {
          return {
            ...current,
            applications: current.applications.map((application) =>
              application.id === applicationId
                ? {
                    ...application,
                    status,
                    summary,
                  }
                : application,
            ),
          };
        }

        return {
          ...current,
          applicationOverrides: {
            ...current.applicationOverrides,
            [applicationId]: {
              ...current.applicationOverrides[applicationId],
              status,
              summary,
            },
          },
        };
      });
    },
    [updateState],
  );

  const scheduleInterviewForApplication = useCallback(
    (applicationId: number, interview: Omit<InterviewSchedule, "sentAt">) => {
      updateState((current) => {
        const hasCustom = current.applications.some(
          (application) => application.id === applicationId,
        );
        const payload = {
          ...interview,
          sentAt: formatTimestamp(),
        };
        const summary = getApplicationStatusSummary(
          "interview-requested",
          payload,
        );

        if (hasCustom) {
          return {
            ...current,
            applications: current.applications.map((application) =>
              application.id === applicationId
                ? {
                    ...application,
                    interview: payload,
                    status: "interview-requested",
                    summary,
                  }
                : application,
            ),
          };
        }

        return {
          ...current,
          applicationOverrides: {
            ...current.applicationOverrides,
            [applicationId]: {
              ...current.applicationOverrides[applicationId],
              interview: payload,
              status: "interview-requested",
              summary,
            },
          },
        };
      });
    },
    [updateState],
  );

  const sendPoolRequest = useCallback(
    (
      jobId: string,
      teacherId: number,
      options?: {
        message?: string;
        note?: string;
      },
    ) => {
      updateState((current) => {
        const existing = getRequestForTeacherAndJob(teacherId, jobId, current);

        if (existing && !["cancelled", "rejected", "archived"].includes(existing.status)) {
          return current;
        }

        const job = getJobByIdFromState(jobId, current);
        const teacher = getTeacherById(teacherId);

        if (!job || !teacher) {
          return current;
        }

        return {
          ...current,
          customPoolRequests: [
            {
              id: current.nextPoolRequestId,
              jobId,
              teacherId,
              status: "pending",
              sentAt: formatTimestamp(),
              note:
                options?.note?.trim() ||
                `${job.schoolName} ${job.gradeLevel} 공고 기준으로 매칭 제안을 보냈습니다.`,
              message:
                options?.message?.trim() ||
                `${teacher.summary} 경력과 희망 근무 조건이 공고와 잘 맞아 면접 검토 대상으로 제안을 드립니다.`,
            },
            ...current.customPoolRequests,
          ],
          nextPoolRequestId: current.nextPoolRequestId + 1,
        };
      });
    },
    [updateState],
  );

  const setPoolRequestStatus = useCallback(
    (requestId: number, status: DemoRequestStatus) => {
      updateState((current) => {
        const hasCustom = current.customPoolRequests.some((request) => request.id === requestId);

        if (hasCustom) {
          return {
            ...current,
            customPoolRequests: current.customPoolRequests.map((request) =>
              request.id === requestId ? { ...request, status } : request,
            ),
          };
        }

        return {
          ...current,
          poolRequestOverrides: {
            ...current.poolRequestOverrides,
            [requestId]: {
              ...current.poolRequestOverrides[requestId],
              status,
            },
          },
        };
      });
    },
    [updateState],
  );

  const cancelPoolRequest = useCallback(
    (requestId: number) => {
      setPoolRequestStatus(requestId, "cancelled");
    },
    [setPoolRequestStatus],
  );

  const scheduleInterviewForRequest = useCallback(
    (requestId: number, interview: Omit<InterviewSchedule, "sentAt">) => {
      updateState((current) => {
        const payload = {
          ...interview,
          sentAt: formatTimestamp(),
        };
        const hasCustom = current.customPoolRequests.some((request) => request.id === requestId);

        if (hasCustom) {
          return {
            ...current,
            customPoolRequests: current.customPoolRequests.map((request) =>
              request.id === requestId
                ? {
                    ...request,
                    interview: payload,
                  }
                : request,
            ),
          };
        }

        return {
          ...current,
          poolRequestOverrides: {
            ...current.poolRequestOverrides,
            [requestId]: {
              ...current.poolRequestOverrides[requestId],
              interview: payload,
            },
          },
        };
      });
    },
    [updateState],
  );

  const toggleInterestedTeacher = useCallback(
    (teacherId: number) => {
      updateState((current) => ({
        ...current,
        interestedTeacherIds: current.interestedTeacherIds.includes(teacherId)
          ? current.interestedTeacherIds.filter((item) => item !== teacherId)
          : [...current.interestedTeacherIds, teacherId],
      }));
    },
    [updateState],
  );

  const jobs = useMemo(() => getAllJobs(state), [state]);
  const hrMatchRequests = useMemo(() => getHRMatchRequests(state), [state]);
  const teacherApplications = useMemo(
    () => getApplicationsForTeacher(DEFAULT_TEACHER_ID, state),
    [state],
  );

  const isTeacherInterested = useCallback(
    (teacherId: number) => state.interestedTeacherIds.includes(teacherId),
    [state.interestedTeacherIds],
  );

  const isJobApplied = useCallback(
    (jobId: string, teacherId = DEFAULT_TEACHER_ID) =>
      getApplicationForTeacherAndJob(teacherId, jobId, state)?.status !== undefined &&
      getApplicationForTeacherAndJob(teacherId, jobId, state)?.status !== "withdrawn",
    [state],
  );

  return {
    createJob,
    getApplicationForTeacherAndJob: (teacherId: number, jobId: string) =>
      getApplicationForTeacherAndJob(teacherId, jobId, state),
    getApplicationsForJob: (jobId: string) => getApplicationsForJob(jobId, state),
    getApplicationsForTeacher: (teacherId: number) =>
      getApplicationsForTeacher(teacherId, state),
    getJobById: (jobId: string) => getJobByIdFromState(jobId, state),
    getPoolRequestById: (requestId: number) => getPoolRequestById(requestId, state),
    getRequestForTeacherAndJob: (teacherId: number, jobId: string) =>
      getRequestForTeacherAndJob(teacherId, jobId, state),
    getTeacherOffersForTeacher: (teacherId: number) =>
      getTeacherOffersForTeacher(teacherId, state),
    hrMatchRequests,
    isJobApplied,
    isTeacherInterested,
    jobs,
    liveJobs: jobs.filter((job) => job.status !== "closed"),
    parseListInput,
    scheduleInterviewForApplication,
    scheduleInterviewForRequest,
    sendPoolRequest,
    setPoolRequestStatus,
    state,
    teacherApplications,
    toggleInterestedTeacher,
    updateApplicationStatus,
    updateJobStatus,
    withdrawApplication,
    applyToJob,
    cancelPoolRequest,
  };
}
