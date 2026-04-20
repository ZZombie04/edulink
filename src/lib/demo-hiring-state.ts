"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  getJobById,
  getTeacherOffersForTeacher,
  type JobPost,
  type MatchRequestStatus,
  type TeacherOffer,
} from "@/lib/demo-data";

const STORAGE_KEY = "edulink_demo_hiring_state";
const STORAGE_EVENT = "edulink-demo-hiring-state";

export interface DemoHiringState {
  appliedJobIds: string[];
  offerStatuses: Partial<Record<number, MatchRequestStatus>>;
}

const DEFAULT_STATE: DemoHiringState = {
  appliedJobIds: [],
  offerStatuses: {},
};

function sanitizeHiringState(value: unknown): DemoHiringState {
  if (typeof value !== "object" || value === null) {
    return DEFAULT_STATE;
  }

  const candidate = value as {
    appliedJobIds?: unknown;
    offerStatuses?: Record<string, unknown>;
  };

  const appliedJobIds = Array.isArray(candidate.appliedJobIds)
    ? candidate.appliedJobIds.filter(
        (jobId): jobId is string =>
          typeof jobId === "string" && getJobById(jobId) !== null,
      )
    : [];

  const validStatuses: MatchRequestStatus[] = [
    "pending",
    "accepted",
    "rejected",
    "archived",
  ];
  const offerStatuses = Object.fromEntries(
    Object.entries(candidate.offerStatuses ?? {}).flatMap(([offerId, status]) => {
      const parsedId = Number(offerId);

      if (!Number.isInteger(parsedId) || !validStatuses.includes(status as MatchRequestStatus)) {
        return [];
      }

      return [[parsedId, status as MatchRequestStatus]];
    }),
  ) as Partial<Record<number, MatchRequestStatus>>;

  return {
    appliedJobIds: [...new Set(appliedJobIds)],
    offerStatuses,
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

export function resolveTeacherOfferStatus(
  offer: Pick<TeacherOffer, "id" | "status">,
  state?: DemoHiringState | null,
) {
  return state?.offerStatuses[offer.id] ?? offer.status;
}

export function getOfferStatusSummary(
  status: MatchRequestStatus,
  fallbackSummary: string,
) {
  switch (status) {
    case "accepted":
      return "제안을 수락했고 학교와 다음 절차를 이어가는 상태입니다.";
    case "rejected":
      return "이번 제안은 보류로 정리되었고 다른 제안은 계속 검토할 수 있습니다.";
    case "archived":
      return "제안을 보관한 상태입니다.";
    default:
      return fallbackSummary;
  }
}

export function getResolvedTeacherOffersForTeacher(
  teacherId: number,
  state?: DemoHiringState | null,
) {
  return getTeacherOffersForTeacher(teacherId).map((offer) => {
    const status = resolveTeacherOfferStatus(offer, state);

    return {
      ...offer,
      status,
      summary: getOfferStatusSummary(status, offer.summary),
    };
  });
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

  const applyToJob = useCallback(
    (jobId: string) => {
      updateState((current) => {
        if (current.appliedJobIds.includes(jobId)) {
          return current;
        }

        return {
          ...current,
          appliedJobIds: [...current.appliedJobIds, jobId],
        };
      });
    },
    [updateState],
  );

  const setOfferStatus = useCallback(
    (offerId: number, status: MatchRequestStatus) => {
      updateState((current) => ({
        ...current,
        offerStatuses: {
          ...current.offerStatuses,
          [offerId]: status,
        },
      }));
    },
    [updateState],
  );

  const appliedJobs = useMemo(
    () =>
      state.appliedJobIds
        .map((jobId) => getJobById(jobId))
        .filter((job): job is JobPost => job !== null),
    [state.appliedJobIds],
  );

  const isJobApplied = useCallback(
    (jobId: string) => state.appliedJobIds.includes(jobId),
    [state.appliedJobIds],
  );

  return {
    appliedJobs,
    applyToJob,
    isJobApplied,
    setOfferStatus,
    state,
  };
}
