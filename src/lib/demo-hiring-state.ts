"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  type ApplicationStatus,
  getApplicationStatusSummary,
  parseListInput,
  type DemoRequestStatus,
  type HiringStatePayload,
  type InterviewSchedule,
  type ResolvedApplication,
  type ResolvedJobPost,
  type ResolvedPoolRequest,
} from "@/lib/hiring-shared";

const FALLBACK_TEACHER_ID = 1;

const EMPTY_STATE: HiringStatePayload = {
  applications: [],
  interestedTeacherIds: [],
  jobs: [],
  requests: [],
};

async function requestHiringState(
  action?: string,
  payload?: Record<string, unknown>,
) {
  const response = await fetch("/api/hiring/state", {
    body: action ? JSON.stringify({ action, payload }) : undefined,
    cache: "no-store",
    headers: action ? { "Content-Type": "application/json" } : undefined,
    method: action ? "POST" : "GET",
  });

  if (!response.ok) {
    const result = (await response.json().catch(() => null)) as
      | { message?: string }
      | null;

    throw new Error(result?.message ?? "채용 상태 요청에 실패했습니다.");
  }

  return (await response.json()) as HiringStatePayload;
}

function getPoolRequestByIdFromState(
  requestId: number,
  state: HiringStatePayload,
) {
  return state.requests.find((request) => request.id === requestId) ?? null;
}

function getJobByIdFromState(jobId: string, state: HiringStatePayload) {
  return state.jobs.find((job) => job.id === jobId) ?? null;
}

function getApplicationsForTeacherFromState(
  teacherId: number,
  state: HiringStatePayload,
) {
  return state.applications.filter((application) => application.teacherId === teacherId);
}

function getApplicationsForJobFromState(jobId: string, state: HiringStatePayload) {
  return state.applications.filter((application) => application.jobId === jobId);
}

function getTeacherOffersForTeacherFromState(
  teacherId: number,
  state: HiringStatePayload,
) {
  return state.requests.filter((request) => request.teacherId === teacherId);
}

function getRequestForTeacherAndJobFromState(
  teacherId: number,
  jobId: string,
  state: HiringStatePayload,
) {
  return (
    state.requests.find(
      (request) => request.teacherId === teacherId && request.job?.id === jobId,
    ) ?? null
  );
}

function getApplicationForTeacherAndJobFromState(
  teacherId: number,
  jobId: string,
  state: HiringStatePayload,
) {
  return (
    state.applications.find(
      (application) =>
        application.teacherId === teacherId && application.jobId === jobId,
    ) ?? null
  );
}

export {
  type ApplicationStatus,
  getApplicationStatusSummary,
  parseListInput,
  type DemoRequestStatus,
  type InterviewSchedule,
  type ResolvedApplication,
  type ResolvedJobPost,
  type ResolvedPoolRequest,
};

export function useDemoHiringState() {
  const [state, setState] = useState<HiringStatePayload>(EMPTY_STATE);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState("");
  const hasRequestedInitialState = useRef(false);

  const refresh = useCallback(async () => {
    setLoadError("");

    try {
      const nextState = await requestHiringState();
      setState(nextState);
      return nextState;
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "채용 데이터를 불러오지 못했습니다.",
      );
      throw error;
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (hasRequestedInitialState.current) {
      return;
    }

    hasRequestedInitialState.current = true;
    void refresh().catch(() => undefined);
  }, [refresh]);

  const mutate = useCallback(
    async (action: string, payload: Record<string, unknown>) => {
      const nextState = await requestHiringState(action, payload);
      setState(nextState);
      return nextState;
    },
    [],
  );

  const jobs = useMemo(() => state.jobs, [state.jobs]);
  const teachers = useMemo(
    () => state.teachers ?? [],
    [state.teachers],
  );
  const hrMatchRequests = useMemo(() => state.requests, [state.requests]);
  const currentTeacherId =
    state.currentTeacherId ?? FALLBACK_TEACHER_ID;
  const currentTeacher = state.currentTeacher ?? null;
  const hrOrganization = state.hrOrganization ?? null;
  const teacherApplications = useMemo(
    () => getApplicationsForTeacherFromState(currentTeacherId, state),
    [currentTeacherId, state],
  );

  const isTeacherInterested = useCallback(
    (teacherId: number) => state.interestedTeacherIds.includes(teacherId),
    [state.interestedTeacherIds],
  );

  const isJobApplied = useCallback(
    (jobId: string, teacherId = currentTeacherId) =>
      getApplicationForTeacherAndJobFromState(teacherId, jobId, state)?.status !==
        undefined &&
      getApplicationForTeacherAndJobFromState(teacherId, jobId, state)?.status !==
        "withdrawn",
    [currentTeacherId, state],
  );

  return {
    applyToJob: async (
      jobId: string,
      teacherId = currentTeacherId,
      coverNote = "",
    ) => {
      await mutate("applyToJob", { coverNote, jobId, teacherId });
    },
    archiveTeacherOffer: async (requestId: number) => {
      await mutate("archiveTeacherOffer", { requestId });
    },
    cancelPoolRequest: async (requestId: number) => {
      await mutate("cancelPoolRequest", { requestId });
    },
    completePoolRequestHire: async (requestId: number) => {
      await mutate("completePoolRequestHire", { requestId });
    },
    createJob: async (input: {
      benefits: string[];
      duties: string[];
      employmentType: ResolvedJobPost["employmentType"];
      endDate: string;
      gradeLevel: string;
      isHomeroom: boolean;
      qualificationSubject?: string;
      qualificationType: ResolvedJobPost["qualificationType"];
      requirements: string[];
      schoolAddress: string;
      schoolName: string;
      schoolRegion: string;
      startDate: string;
      summary: string;
    }) => {
      await mutate("createJob", input);
    },
    getApplicationForTeacherAndJob: (teacherId: number, jobId: string) =>
      getApplicationForTeacherAndJobFromState(teacherId, jobId, state),
    getApplicationsForJob: (jobId: string) =>
      getApplicationsForJobFromState(jobId, state),
    getApplicationsForTeacher: (teacherId: number) =>
      getApplicationsForTeacherFromState(teacherId, state),
    getJobById: (jobId: string) => getJobByIdFromState(jobId, state),
    getPoolRequestById: (requestId: number) =>
      getPoolRequestByIdFromState(requestId, state),
    getRequestForTeacherAndJob: (teacherId: number, jobId: string) =>
      getRequestForTeacherAndJobFromState(teacherId, jobId, state),
    getTeacherOffersForTeacher: (teacherId: number) =>
      getTeacherOffersForTeacherFromState(teacherId, state),
    hrMatchRequests,
    hrOrganization,
    currentTeacherId,
    currentTeacher,
    isJobApplied,
    isTeacherInterested,
    jobs,
    loaded,
    loadError,
    liveJobs: jobs.filter((job) => job.status !== "closed"),
    parseListInput,
    refresh,
    scheduleInterviewForApplication: async (
      applicationId: number,
      interview: Omit<InterviewSchedule, "sentAt">,
    ) => {
      await mutate("scheduleInterviewForApplication", {
        applicationId,
        ...interview,
      });
    },
    scheduleInterviewForRequest: async (
      requestId: number,
      interview: Omit<InterviewSchedule, "sentAt">,
    ) => {
      await mutate("scheduleInterviewForRequest", {
        requestId,
        ...interview,
      });
    },
    sendPoolRequest: async (
      jobId: string,
      teacherId: number,
      options?: {
        message?: string;
        note?: string;
      },
    ) => {
      await mutate("sendPoolRequest", {
        jobId,
        message: options?.message,
        note: options?.note,
        teacherId,
      });
    },
    setPoolRequestStatus: async (
      requestId: number,
      status: DemoRequestStatus,
    ) => {
      await mutate("setPoolRequestStatus", { requestId, status });
    },
    state,
    teacherApplications,
    teachers,
    toggleInterestedTeacher: async (teacherId: number) => {
      await mutate("toggleInterestedTeacher", { teacherId });
    },
    updateApplicationStatus: async (
      applicationId: number,
      status: ApplicationStatus,
    ) => {
      await mutate("updateApplicationStatus", { applicationId, status });
    },
    updateJobStatus: async (
      jobId: string,
      status: ResolvedJobPost["status"],
    ) => {
      await mutate("updateJobStatus", { jobId, status });
    },
    updateTeacherVisibility: async (status: "paused" | "seeking") => {
      await mutate("updateTeacherVisibility", { status });
    },
    withdrawApplication: async (applicationId: number) => {
      await mutate("withdrawApplication", { applicationId });
    },
  };
}
