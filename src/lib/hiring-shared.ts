import type { JobPost, MatchRequestStatus, TeacherProfile } from "@/lib/demo-data";

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
  interestedTeacherIds: number[];
  jobs: ResolvedJobPost[];
  requests: ResolvedPoolRequest[];
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
