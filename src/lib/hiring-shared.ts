import type { JobPost, MatchRequestStatus, TeacherProfile } from "@/lib/demo-data";

export type DemoRequestStatus =
  | MatchRequestStatus
  | "cancelled"
  | "hired";
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

export interface HiringStatePayload {
  applications: ResolvedApplication[];
  currentTeacher?: TeacherProfile | null;
  currentTeacherId?: number;
  hrOrganization?: {
    schoolAddress: string;
    schoolName: string;
    schoolRegion: string;
  };
  interestedTeacherIds: number[];
  jobs: ResolvedJobPost[];
  requests: ResolvedPoolRequest[];
  teacherVisibility?: "paused" | "seeking";
  teachers?: TeacherProfile[];
}

export type HiringActorRole = "teacher" | "hr" | "admin" | "guest";

export type HiringMutationAction =
  | "applyToJob"
  | "archiveTeacherOffer"
  | "cancelPoolRequest"
  | "completePoolRequestHire"
  | "createJob"
  | "scheduleInterviewForApplication"
  | "scheduleInterviewForRequest"
  | "sendPoolRequest"
  | "setPoolRequestStatus"
  | "toggleInterestedTeacher"
  | "updateApplicationStatus"
  | "updateJobStatus"
  | "updateTeacherVisibility"
  | "withdrawApplication";

export interface TeacherRegistrationCareerInput {
  current?: boolean;
  description?: string;
  employmentType: string;
  endDate?: string;
  institutionName: string;
  institutionType: string;
  region?: string;
  role: string;
  startDate: string;
  subject?: string;
}

export interface TeacherRegistrationInput {
  avatarPreset?: string;
  availableFrom?: string;
  birthDate: string;
  careers?: TeacherRegistrationCareerInput[];
  educationLevel?: string;
  email: string;
  graduationYear?: number;
  introduction?: string;
  major: string;
  name: string;
  password: string;
  phone: string;
  preferredRegions: string[];
  preferredTypes: string[];
  privacyConsent: boolean;
  qualificationGrade: string;
  qualificationNumber: string;
  qualificationSubject?: string;
  qualificationType: string;
  residenceAddress?: string;
  residenceRegion: string;
  reservationEnabled?: boolean;
  specialSkills?: string;
  termsConsent: boolean;
  thirdPartyConsent: boolean;
  university: string;
}

export interface HRRegistrationInput {
  birthDate: string;
  department?: string;
  email: string;
  name: string;
  password: string;
  phone: string;
  position: string;
  privacyConsent: boolean;
  schoolAddress: string;
  schoolCode: string;
  schoolName: string;
  schoolRegion: string;
  schoolType: string;
  termsConsent: boolean;
  verificationCode: string;
}

const ACTION_ROLES: Record<HiringMutationAction, HiringActorRole[]> = {
  applyToJob: ["teacher"],
  archiveTeacherOffer: ["teacher"],
  cancelPoolRequest: ["hr"],
  completePoolRequestHire: ["hr"],
  createJob: ["hr"],
  scheduleInterviewForApplication: ["hr"],
  scheduleInterviewForRequest: ["hr"],
  sendPoolRequest: ["hr"],
  setPoolRequestStatus: ["teacher", "hr"],
  toggleInterestedTeacher: ["hr"],
  updateApplicationStatus: ["teacher", "hr"],
  updateJobStatus: ["hr"],
  updateTeacherVisibility: ["teacher"],
  withdrawApplication: ["teacher"],
};

export function isHiringMutationAction(
  value: string,
): value is HiringMutationAction {
  return Object.hasOwn(ACTION_ROLES, value);
}

export function isHiringActionAllowed(
  role: HiringActorRole,
  action: string,
) {
  return (
    isHiringMutationAction(action) &&
    ACTION_ROLES[action].includes(role)
  );
}

export function canTransitionApplicationStatus(
  role: HiringActorRole,
  current: ApplicationStatus,
  next: ApplicationStatus,
) {
  if (current === next) {
    return role === "teacher" || role === "hr";
  }

  if (role === "teacher") {
    return (
      (next === "withdrawn" &&
        !["hired", "rejected", "withdrawn"].includes(current)) ||
      (current === "interview-requested" &&
        next === "interview-confirmed")
    );
  }

  if (role === "hr") {
    if (["hired", "rejected", "withdrawn"].includes(current)) {
      return false;
    }

    return [
      "reviewing",
      "interview-requested",
      "hired",
      "rejected",
    ].includes(next);
  }

  return false;
}

export function canTransitionRequestStatus(
  role: HiringActorRole,
  current: DemoRequestStatus,
  next: DemoRequestStatus,
) {
  if (current === next) {
    return role === "teacher" || role === "hr";
  }

  if (role === "teacher") {
    return (
      current === "pending" &&
      ["accepted", "rejected", "archived"].includes(next)
    );
  }

  if (role === "hr") {
    if (next === "cancelled") {
      return !["cancelled", "rejected", "hired"].includes(current);
    }

    return (
      next === "hired" &&
      ["accepted"].includes(current)
    );
  }

  return false;
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

export function getRequestStatusSummary(
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
    case "hired":
      return "최종 채용이 확정되어 계약 정보가 등록되었습니다.";
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
