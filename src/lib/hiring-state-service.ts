import "server-only";

import {
  ApprovalStatus,
  EducationLevel,
  MatchDirection,
  MatchStatus,
  PostingStatus,
  Prisma,
  QualificationGrade,
  QualificationType,
  ReservationStatus,
  SeekingStatus,
  TeacherType,
  UserRole,
} from "@prisma/client";

import { DEMO_ACCOUNTS, DEMO_PASSWORD, DEMO_VERIFICATION_CODE } from "@/lib/demo-access";
import {
  featuredTeachers,
  getTeacherById,
  jobPosts,
  secondarySubjects,
  teacherMatchRequests,
  type JobPost,
  type TeacherProfile,
} from "@/lib/demo-data";
import {
  avatarPresets,
  defaultAvatarPreset,
  type AvatarPresetId,
} from "@/lib/avatar-presets";
import type { DemoSession, DemoUserRole } from "@/lib/demo-session";
import {
  getApplicationStatusSummary,
  getRequestStatusSummary,
  type ApplicationStatus,
  type DemoRequestStatus,
  type HiringStatePayload,
  type InterviewSchedule,
  parseListInput,
  type ResolvedApplication,
  type ResolvedJobPost,
  type ResolvedPoolRequest,
} from "@/lib/hiring-shared";
import { hashPassword, verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";

type JobMeta = {
  baseApplicants?: number;
  benefits?: string[];
  contactName?: string;
  deadline?: string;
  duties?: string[];
  isClosingSoon?: boolean;
  postedAt?: string;
  requirements?: string[];
  schoolAddress?: string;
  summary?: string;
  views?: number;
};

type RequestMeta = {
  note?: string;
  sentAt?: string;
};

type ApplicationMeta = {
  interview?: InterviewSchedule;
  submittedAt?: string;
  workflowStatus?: ApplicationStatus;
};

type SessionContext = {
  hrProfileId: string | null;
  role: DemoUserRole | "guest";
  teacherProfileId: string | null;
};

const HR_DEMO_ID = 1;
const DEFAULT_JOB_CONTACT = "홍수진 인사담당";
const avatarPresetIds = new Set<AvatarPresetId>(
  avatarPresets.map((preset) => preset.id),
);

let seedPromise: Promise<void> | null = null;

function formatTimestamp(date = new Date()) {
  return new Intl.DateTimeFormat("ko-KR", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
  }).format(date);
}

function parseExperienceLabel(value: string) {
  const years = Number(value.match(/(\d+)년/)?.[1] ?? 0);
  const months = Number(value.match(/(\d+)개월/)?.[1] ?? 0);

  return { months, years };
}

function formatExperienceLabel(years: number, months: number) {
  if (years > 0 && months > 0) {
    return `${years}년 ${months}개월`;
  }

  if (years > 0) {
    return `${years}년`;
  }

  if (months > 0) {
    return `${months}개월`;
  }

  return "신규";
}

function mapTeacherTypeFromLabel(value: string): TeacherType {
  return value === "시간강사" ? TeacherType.PART_TIME : TeacherType.FIXED_TERM;
}

function mapTeacherTypeToLabel(value: TeacherType) {
  return value === TeacherType.PART_TIME ? "시간강사" : "기간제";
}

function mapQualificationTypeFromLabel(value: string): QualificationType {
  switch (value) {
    case "중등":
      return QualificationType.SECONDARY;
    case "특수":
      return QualificationType.SPECIAL;
    default:
      return QualificationType.ELEMENTARY;
  }
}

function mapQualificationTypeToLabel(value: QualificationType | null | undefined) {
  switch (value) {
    case QualificationType.SECONDARY:
      return "중등";
    case QualificationType.SPECIAL:
      return "특수";
    default:
      return "초등";
  }
}

function mapSeekingStatusFromLabel(value: string): SeekingStatus {
  switch (value) {
    case "interviewing":
      return SeekingStatus.INTERVIEWING;
    case "employed":
      return SeekingStatus.EMPLOYED;
    case "paused":
      return SeekingStatus.NOT_SEEKING;
    default:
      return SeekingStatus.SEEKING;
  }
}

function mapSeekingStatusToLabel(value: SeekingStatus): TeacherProfile["status"] {
  switch (value) {
    case SeekingStatus.INTERVIEWING:
      return "interviewing";
    case SeekingStatus.EMPLOYED:
    case SeekingStatus.RESERVED:
      return "employed";
    case SeekingStatus.NOT_SEEKING:
      return "paused";
    default:
      return "seeking";
  }
}

function mapPostingStatus(
  status: PostingStatus,
  meta: JobMeta,
): JobPost["status"] {
  if (
    status === PostingStatus.CLOSED ||
    status === PostingStatus.CANCELLED ||
    status === PostingStatus.FILLED
  ) {
    return "closed";
  }

  if (meta.isClosingSoon) {
    return "closing-soon";
  }

  return "open";
}

function mapMatchStatusToRequestStatus(status: MatchStatus): DemoRequestStatus {
  switch (status) {
    case MatchStatus.ACCEPTED:
    case MatchStatus.INTERVIEWING:
      return "accepted";
    case MatchStatus.REJECTED:
    case MatchStatus.NOT_HIRED:
      return "rejected";
    case MatchStatus.CANCELLED:
    case MatchStatus.EXPIRED:
      return "cancelled";
    default:
      return "pending";
  }
}

function mapRequestStatusToMatchStatus(status: DemoRequestStatus): MatchStatus {
  switch (status) {
    case "accepted":
      return MatchStatus.ACCEPTED;
    case "rejected":
      return MatchStatus.REJECTED;
    case "cancelled":
    case "archived":
      return MatchStatus.CANCELLED;
    default:
      return MatchStatus.PENDING;
  }
}

function applicationStatusToMatchStatus(status: ApplicationStatus): MatchStatus {
  switch (status) {
    case "interview-requested":
    case "interview-confirmed":
      return MatchStatus.INTERVIEWING;
    case "hired":
      return MatchStatus.HIRED;
    case "rejected":
      return MatchStatus.NOT_HIRED;
    case "withdrawn":
      return MatchStatus.CANCELLED;
    default:
      return MatchStatus.PENDING;
  }
}

function parseJsonObject<T>(value: Prisma.JsonValue | null | undefined): Partial<T> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Partial<T>)
    : {};
}

function toJsonObject(value: Record<string, unknown>): Prisma.InputJsonObject {
  return value as Prisma.InputJsonObject;
}

function parseInterview(value: unknown): InterviewSchedule | undefined {
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
    note: candidate.note,
    place: candidate.place,
    sentAt: candidate.sentAt,
    time: candidate.time,
  };
}

function parseStringArray(value: unknown, fallback?: string) {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }

  if (typeof fallback === "string") {
    return parseListInput(fallback);
  }

  return [];
}

function createTeacherSeedEmail(teacherId: number) {
  if (teacherId === 1) {
    return DEMO_ACCOUNTS[0].email;
  }

  return `teacher${teacherId}@edulink.kr`;
}

function buildTeacherPhone(index: number) {
  return `010-1200-${String(index).padStart(4, "0")}`;
}

function resolveAvatarPreset(
  value?: string | null,
  fallback: AvatarPresetId = defaultAvatarPreset,
): AvatarPresetId {
  if (!value) {
    return fallback;
  }

  return avatarPresetIds.has(value as AvatarPresetId)
    ? (value as AvatarPresetId)
    : fallback;
}

function getQualificationLabel(
  qualificationType: QualificationType,
  qualificationGrade: QualificationGrade,
  subject?: string | null,
) {
  const typeLabel = mapQualificationTypeToLabel(qualificationType);
  const gradeLabel =
    qualificationGrade === QualificationGrade.GRADE_1
      ? "1급 정교사"
      : "2급 정교사";

  return subject ? `${typeLabel} ${gradeLabel}` : `${typeLabel} ${gradeLabel}`;
}

function buildTeacherUiProfile(record: {
  avatarPreset: string;
  demoId: number | null;
  introduction: string | null;
  preferredRegions: string[];
  preferredTypes: TeacherType[];
  qualificationGrade: QualificationGrade;
  qualificationSubject: string | null;
  qualificationType: QualificationType;
  reservationEnabled: boolean;
  residenceRegion: string;
  seekingStatus: SeekingStatus;
  totalExperienceMonths: number;
  totalExperienceYears: number;
  user: {
    birthDate: Date;
    name: string;
  };
}): TeacherProfile {
  const seed = record.demoId ? getTeacherById(record.demoId) : null;
  const currentYear = new Date().getFullYear();
  const birthYear = record.user.birthDate.getFullYear();
  const qualification = seed?.qualification ??
    getQualificationLabel(
      record.qualificationType,
      record.qualificationGrade,
      record.qualificationSubject,
    );

  return {
    age: currentYear - birthYear,
    avatarPreset: resolveAvatarPreset(
      seed?.avatarPreset ?? record.avatarPreset,
      defaultAvatarPreset,
    ),
    birthYear,
    experience:
      seed?.experience ??
      formatExperienceLabel(
        record.totalExperienceYears,
        record.totalExperienceMonths,
      ),
    id: record.demoId ?? 0,
    name: record.user.name,
    portfolioViews: seed?.portfolioViews ?? 0,
    preferredRegions: record.preferredRegions,
    preferredTypes:
      seed?.preferredTypes ??
      record.preferredTypes.map((type) => mapTeacherTypeToLabel(type)),
    qualification,
    qualificationCategory:
      seed?.qualificationCategory ??
      (mapQualificationTypeToLabel(record.qualificationType) as TeacherProfile["qualificationCategory"]),
    reservation: seed?.reservation ?? record.reservationEnabled,
    reservationCount: seed?.reservationCount,
    residence: record.residenceRegion,
    status: seed?.status ?? mapSeekingStatusToLabel(record.seekingStatus),
    subject: seed?.subject ?? record.qualificationSubject ?? undefined,
    summary:
      seed?.summary ??
      record.introduction ??
      `${qualification} 기반으로 채용 제안을 받을 수 있는 교사입니다.`,
  };
}

function buildSessionRole(role: UserRole): DemoUserRole {
  switch (role) {
    case UserRole.HR_MANAGER:
      return "hr";
    case UserRole.SUPER_ADMIN:
    case UserRole.EDU_ADMIN:
      return "admin";
    default:
      return "teacher";
  }
}

function buildRedirectPath(role: DemoUserRole) {
  switch (role) {
    case "hr":
      return "/hr/dashboard";
    case "admin":
      return "/admin/dashboard";
    default:
      return "/teacher/dashboard";
  }
}

export async function ensureDemoPlatformSeed() {
  if (!seedPromise) {
    seedPromise = (async () => {
      const demoPasswordHash = hashPassword(DEMO_PASSWORD);

      for (const teacher of featuredTeachers) {
        const experience = parseExperienceLabel(teacher.experience);
        const email = createTeacherSeedEmail(teacher.id);
        const qualificationGrade = teacher.qualification.includes("1급")
          ? QualificationGrade.GRADE_1
          : QualificationGrade.GRADE_2;
        const qualificationType = mapQualificationTypeFromLabel(
          teacher.qualificationCategory,
        );

        const user = await prisma.user.upsert({
          where: { email },
          update: {
            birthDate: new Date(`${teacher.birthYear}-01-01T00:00:00.000Z`),
            isActive: true,
            isVerified: true,
            name: teacher.name,
            passwordHash: demoPasswordHash,
            phone: buildTeacherPhone(teacher.id),
            privacyConsent: true,
            privacyConsentAt: new Date(),
            role: UserRole.TEACHER,
            termsConsent: true,
            termsConsentAt: new Date(),
          },
          create: {
            birthDate: new Date(`${teacher.birthYear}-01-01T00:00:00.000Z`),
            email,
            isActive: true,
            isVerified: true,
            name: teacher.name,
            passwordHash: demoPasswordHash,
            phone: buildTeacherPhone(teacher.id),
            privacyConsent: true,
            privacyConsentAt: new Date(),
            role: UserRole.TEACHER,
            termsConsent: true,
            termsConsentAt: new Date(),
          },
          select: { id: true },
        });

        await prisma.teacherProfile.upsert({
          where: { userId: user.id },
          update: {
            avatarPreset: teacher.avatarPreset,
            demoId: teacher.id,
            educationLevel: EducationLevel.BACHELOR,
            graduationYear: teacher.birthYear + 22,
            introduction: teacher.summary,
            major:
              qualificationType === QualificationType.SECONDARY
                ? `${teacher.subject ?? secondarySubjects[0]}교육`
                : "초등교육",
            preferredRegions: teacher.preferredRegions,
            preferredTypes: teacher.preferredTypes.map(mapTeacherTypeFromLabel),
            qualificationGrade,
            qualificationNumber: `DEMO-${teacher.id}`,
            qualificationSubject: teacher.subject ?? null,
            qualificationType,
            reservationEnabled: teacher.reservation ?? false,
            residenceAddress: `${teacher.residence} 주소 미입력`,
            residenceRegion: teacher.residence,
            seekingStatus: mapSeekingStatusFromLabel(teacher.status),
            totalExperienceMonths: experience.months,
            totalExperienceYears: experience.years,
            university: qualificationType === QualificationType.SECONDARY ? "교육대학교" : "한국교원대학교",
          },
          create: {
            avatarPreset: teacher.avatarPreset,
            demoId: teacher.id,
            educationLevel: EducationLevel.BACHELOR,
            graduationYear: teacher.birthYear + 22,
            introduction: teacher.summary,
            major:
              qualificationType === QualificationType.SECONDARY
                ? `${teacher.subject ?? secondarySubjects[0]}교육`
                : "초등교육",
            preferredRegions: teacher.preferredRegions,
            preferredTypes: teacher.preferredTypes.map(mapTeacherTypeFromLabel),
            qualificationGrade,
            qualificationNumber: `DEMO-${teacher.id}`,
            qualificationSubject: teacher.subject ?? null,
            qualificationType,
            reservationEnabled: teacher.reservation ?? false,
            residenceAddress: `${teacher.residence} 주소 미입력`,
            residenceRegion: teacher.residence,
            seekingStatus: mapSeekingStatusFromLabel(teacher.status),
            totalExperienceMonths: experience.months,
            totalExperienceYears: experience.years,
            university: qualificationType === QualificationType.SECONDARY ? "교육대학교" : "한국교원대학교",
            userId: user.id,
          },
        });
      }

      const hrUser = await prisma.user.upsert({
        where: { email: DEMO_ACCOUNTS[1].email },
        update: {
          birthDate: new Date("1988-01-01T00:00:00.000Z"),
          isActive: true,
          isVerified: true,
          name: DEMO_ACCOUNTS[1].name,
          passwordHash: demoPasswordHash,
          phone: "010-3400-0001",
          privacyConsent: true,
          privacyConsentAt: new Date(),
          role: UserRole.HR_MANAGER,
          termsConsent: true,
          termsConsentAt: new Date(),
        },
        create: {
          birthDate: new Date("1988-01-01T00:00:00.000Z"),
          email: DEMO_ACCOUNTS[1].email,
          isActive: true,
          isVerified: true,
          name: DEMO_ACCOUNTS[1].name,
          passwordHash: demoPasswordHash,
          phone: "010-3400-0001",
          privacyConsent: true,
          privacyConsentAt: new Date(),
          role: UserRole.HR_MANAGER,
          termsConsent: true,
          termsConsentAt: new Date(),
        },
        select: { id: true },
      });

      const hrProfile = await prisma.hRProfile.upsert({
        where: { userId: hrUser.id },
        update: {
          approvalStatus: ApprovalStatus.APPROVED,
          approvedAt: new Date(),
          demoId: HR_DEMO_ID,
          position: "인사담당",
          schoolAddress: "경기도 수원시 영통구 창룡대로 58",
          schoolCode: "DEMO-7581234",
          schoolName: "성진초등학교",
          schoolRegion: "수원",
          schoolType: "초등학교",
          verificationCode: DEMO_VERIFICATION_CODE,
        },
        create: {
          approvalStatus: ApprovalStatus.APPROVED,
          approvedAt: new Date(),
          demoId: HR_DEMO_ID,
          position: "인사담당",
          schoolAddress: "경기도 수원시 영통구 창룡대로 58",
          schoolCode: "DEMO-7581234",
          schoolName: "성진초등학교",
          schoolRegion: "수원",
          schoolType: "초등학교",
          userId: hrUser.id,
          verificationCode: DEMO_VERIFICATION_CODE,
        },
        select: { id: true },
      });

      await prisma.user.upsert({
        where: { email: DEMO_ACCOUNTS[2].email },
        update: {
          birthDate: new Date("1985-01-01T00:00:00.000Z"),
          isActive: true,
          isVerified: true,
          name: DEMO_ACCOUNTS[2].name,
          passwordHash: demoPasswordHash,
          phone: "010-5600-0001",
          privacyConsent: true,
          privacyConsentAt: new Date(),
          role: UserRole.SUPER_ADMIN,
          termsConsent: true,
          termsConsentAt: new Date(),
        },
        create: {
          birthDate: new Date("1985-01-01T00:00:00.000Z"),
          email: DEMO_ACCOUNTS[2].email,
          isActive: true,
          isVerified: true,
          name: DEMO_ACCOUNTS[2].name,
          passwordHash: demoPasswordHash,
          phone: "010-5600-0001",
          privacyConsent: true,
          privacyConsentAt: new Date(),
          role: UserRole.SUPER_ADMIN,
          termsConsent: true,
          termsConsentAt: new Date(),
        },
      });

      for (const job of jobPosts) {
        await prisma.jobPosting.upsert({
          where: { externalId: job.id },
          update: {
            employmentType: mapTeacherTypeFromLabel(job.employmentType),
            gradeLevel: job.gradeLevel,
            hrProfileId: hrProfile.id,
            isHomeroom: job.isHomeroom,
            memo: job.summary,
            postingStatus:
              job.status === "closed" ? PostingStatus.CLOSED : PostingStatus.OPEN,
            qualificationSubject: job.qualificationSubject ?? null,
            qualificationType: mapQualificationTypeFromLabel(job.qualificationType),
            schoolName: job.schoolName,
            schoolRegion: job.schoolRegion,
            startDate: new Date(`${job.startDate}T00:00:00.000Z`),
            endDate: new Date(`${job.endDate}T00:00:00.000Z`),
            meta: toJsonObject({
              baseApplicants: job.applicants,
              benefits: job.benefits,
              contactName: job.contactName,
              deadline: job.deadline,
              duties: job.duties,
              isClosingSoon: job.status === "closing-soon",
              postedAt: job.postedAt,
              requirements: job.requirements,
              schoolAddress: job.schoolAddress,
              summary: job.summary,
              views: job.views,
            }),
          },
          create: {
            employmentType: mapTeacherTypeFromLabel(job.employmentType),
            endDate: new Date(`${job.endDate}T00:00:00.000Z`),
            externalId: job.id,
            gradeLevel: job.gradeLevel,
            hrProfileId: hrProfile.id,
            isHomeroom: job.isHomeroom,
            memo: job.summary,
            postingStatus:
              job.status === "closed" ? PostingStatus.CLOSED : PostingStatus.OPEN,
            qualificationSubject: job.qualificationSubject ?? null,
            qualificationType: mapQualificationTypeFromLabel(job.qualificationType),
            schoolName: job.schoolName,
            schoolRegion: job.schoolRegion,
            startDate: new Date(`${job.startDate}T00:00:00.000Z`),
            meta: toJsonObject({
              baseApplicants: job.applicants,
              benefits: job.benefits,
              contactName: job.contactName,
              deadline: job.deadline,
              duties: job.duties,
              isClosingSoon: job.status === "closing-soon",
              postedAt: job.postedAt,
              requirements: job.requirements,
              schoolAddress: job.schoolAddress,
              summary: job.summary,
              views: job.views,
            }),
          },
        });
      }

      for (const request of teacherMatchRequests) {
        const teacherProfile = await prisma.teacherProfile.findFirstOrThrow({
          where: { demoId: request.teacherId },
          select: { id: true },
        });

        const jobPosting = await prisma.jobPosting.findFirstOrThrow({
          where: { externalId: request.jobId },
          select: { id: true },
        });

        await prisma.matchRequest.upsert({
          where: { demoId: request.id },
          update: {
            direction: MatchDirection.HR_TO_TEACHER,
            employmentType: jobPosts.find((job) => job.id === request.jobId)?.employmentType === "시간강사"
              ? TeacherType.PART_TIME
              : TeacherType.FIXED_TERM,
            expectedPeriod: request.period,
            hrProfileId: hrProfile.id,
            jobPostingId: jobPosting.id,
            message: request.message,
            status: mapRequestStatusToMatchStatus(
              request.status === "accepted"
                ? "accepted"
                : request.status === "rejected"
                  ? "rejected"
                  : "pending",
            ),
            teacherProfileId: teacherProfile.id,
            meta: toJsonObject({
              note: request.summary,
              sentAt: request.receivedAt,
            }),
          },
          create: {
            demoId: request.id,
            direction: MatchDirection.HR_TO_TEACHER,
            employmentType: jobPosts.find((job) => job.id === request.jobId)?.employmentType === "시간강사"
              ? TeacherType.PART_TIME
              : TeacherType.FIXED_TERM,
            expectedPeriod: request.period,
            hrProfileId: hrProfile.id,
            jobPostingId: jobPosting.id,
            message: request.message,
            status: mapRequestStatusToMatchStatus(
              request.status === "accepted"
                ? "accepted"
                : request.status === "rejected"
                  ? "rejected"
                  : "pending",
            ),
            teacherProfileId: teacherProfile.id,
            meta: toJsonObject({
              note: request.summary,
              sentAt: request.receivedAt,
            }),
          },
        });
      }

      const reviewingTeacher = await prisma.teacherProfile.findFirstOrThrow({
        where: { demoId: 2 },
        select: { id: true },
      });

      const firstJob = await prisma.jobPosting.findFirstOrThrow({
        where: { externalId: "1" },
        select: { id: true },
      });

      await prisma.application.upsert({
        where: { demoId: 1 },
        update: {
          coverLetter:
            "학년 담임 경험과 학부모 상담 운영 경험을 살려 바로 근무에 참여할 수 있습니다.",
          jobPostingId: firstJob.id,
          status: MatchStatus.PENDING,
          teacherProfileId: reviewingTeacher.id,
          meta: toJsonObject({
            submittedAt: "2026.04.19 16:10",
            workflowStatus: "reviewing",
          }),
        },
        create: {
          coverLetter:
            "학년 담임 경험과 학부모 상담 운영 경험을 살려 바로 근무에 참여할 수 있습니다.",
          demoId: 1,
          jobPostingId: firstJob.id,
          status: MatchStatus.PENDING,
          teacherProfileId: reviewingTeacher.id,
          meta: toJsonObject({
            submittedAt: "2026.04.19 16:10",
            workflowStatus: "reviewing",
          }),
        },
      });
    })();
  }

  await seedPromise;
}

async function getSessionContext(session: DemoSession | null): Promise<SessionContext> {
  if (!session) {
    return {
      hrProfileId: null,
      role: "guest",
      teacherProfileId: null,
    };
  }

  await ensureDemoPlatformSeed();

  const user = await prisma.user.findUnique({
    where: { email: session.email },
    include: {
      hrProfile: { select: { id: true } },
      teacherProfile: { select: { id: true } },
    },
  });

  return {
    hrProfileId: user?.hrProfile?.id ?? null,
    role: session.role,
    teacherProfileId: user?.teacherProfile?.id ?? null,
  };
}

function getJobMeta(job: {
  duties: string | null;
  externalId: string | null;
  meta: Prisma.JsonValue | null;
}) {
  const record = parseJsonObject<JobMeta>(job.meta);
  const fallbackJob = job.externalId ? jobPosts.find((item) => item.id === job.externalId) : null;

  return {
    baseApplicants:
      typeof record.baseApplicants === "number"
        ? record.baseApplicants
        : fallbackJob?.applicants ?? 0,
    benefits: parseStringArray(record.benefits, fallbackJob?.benefits.join("\n")),
    contactName:
      typeof record.contactName === "string"
        ? record.contactName
        : fallbackJob?.contactName ?? DEFAULT_JOB_CONTACT,
    deadline:
      typeof record.deadline === "string"
        ? record.deadline
        : fallbackJob?.deadline ??
          fallbackJob?.endDate ??
          new Date().toISOString().slice(0, 10),
    duties: parseStringArray(record.duties, job.duties ?? fallbackJob?.duties.join("\n")),
    isClosingSoon: record.isClosingSoon === true,
    postedAt:
      typeof record.postedAt === "string"
        ? record.postedAt
        : fallbackJob?.postedAt ??
          new Date().toISOString().slice(0, 10),
    requirements: parseStringArray(
      record.requirements,
      fallbackJob?.requirements.join("\n"),
    ),
    schoolAddress:
      typeof record.schoolAddress === "string"
        ? record.schoolAddress
        : fallbackJob?.schoolAddress ?? "",
    summary:
      typeof record.summary === "string"
        ? record.summary
        : fallbackJob?.summary ?? "",
    views:
      typeof record.views === "number" ? record.views : fallbackJob?.views ?? 0,
  };
}

function getRequestMeta(meta: Prisma.JsonValue | null) {
  return parseJsonObject<RequestMeta>(meta);
}

function getApplicationMeta(meta: Prisma.JsonValue | null) {
  return parseJsonObject<ApplicationMeta>(meta);
}

function getApplicationWorkflowStatus(
  application: {
    meta: Prisma.JsonValue | null;
    status: MatchStatus;
  },
) {
  const meta = getApplicationMeta(application.meta);

  if (
    typeof meta.workflowStatus === "string" &&
    [
      "submitted",
      "reviewing",
      "interview-requested",
      "interview-confirmed",
      "hired",
      "rejected",
      "withdrawn",
    ].includes(meta.workflowStatus)
  ) {
    return meta.workflowStatus as ApplicationStatus;
  }

  switch (application.status) {
    case MatchStatus.INTERVIEWING:
      return "interview-requested";
    case MatchStatus.HIRED:
      return "hired";
    case MatchStatus.NOT_HIRED:
      return "rejected";
    case MatchStatus.CANCELLED:
      return "withdrawn";
    default:
      return "submitted";
  }
}

function mapJobRecordToResolved(
  job: {
    createdAt: Date;
    duties: string | null;
    employmentType: TeacherType;
    endDate: Date;
    externalId: string | null;
    gradeLevel: string | null;
    hrProfile: { schoolAddress: string | null } | null;
    id: string;
    isHomeroom: boolean;
    memo: string | null;
    meta: Prisma.JsonValue | null;
    postingStatus: PostingStatus;
    qualificationSubject: string | null;
    qualificationType: QualificationType | null;
    schoolName: string;
    schoolRegion: string;
    startDate: Date;
  },
  applications: Array<{
    jobPostingId: string;
    meta: Prisma.JsonValue | null;
    status: MatchStatus;
  }>,
): ResolvedJobPost {
  const meta = getJobMeta(job);
  const id = job.externalId ?? job.id;
  const activeApplicationCount = applications.filter((application) => {
    if (application.jobPostingId !== job.id) {
      return false;
    }

    const workflowStatus = getApplicationWorkflowStatus(application);
    return !["withdrawn", "rejected"].includes(workflowStatus);
  }).length;

  return {
    activeApplicationCount,
    applicants: meta.baseApplicants + activeApplicationCount,
    benefits: meta.benefits,
    contactName: meta.contactName,
    deadline: meta.deadline,
    duties: meta.duties,
    employmentType:
      job.employmentType === TeacherType.PART_TIME ? "시간강사" : "기간제 교사",
    endDate: job.endDate.toISOString().slice(0, 10),
    gradeLevel: job.gradeLevel ?? "학년 미지정",
    id,
    isHomeroom: job.isHomeroom,
    postedAt: meta.postedAt,
    qualificationSubject: job.qualificationSubject ?? undefined,
    qualificationType: mapQualificationTypeToLabel(job.qualificationType),
    requirements: meta.requirements,
    schoolAddress: meta.schoolAddress || job.hrProfile?.schoolAddress || "",
    schoolName: job.schoolName,
    schoolRegion: job.schoolRegion,
    source: id.startsWith("custom-") ? "custom" : "seed",
    startDate: job.startDate.toISOString().slice(0, 10),
    status: mapPostingStatus(job.postingStatus, meta),
    summary: meta.summary || job.memo || "",
    views: meta.views,
  };
}

function buildInterviewFromRecord(
  fallback: {
    interviewDate?: Date | null;
    interviewLocation?: string | null;
    interviewMemo?: string | null;
    updatedAt?: Date;
  },
  metaInterview?: InterviewSchedule,
) {
  if (metaInterview) {
    return metaInterview;
  }

  if (!fallback.interviewDate || !fallback.interviewLocation) {
    return undefined;
  }

  return {
    date: fallback.interviewDate.toISOString().slice(0, 10),
    note: fallback.interviewMemo ?? "",
    place: fallback.interviewLocation,
    sentAt: fallback.updatedAt ? formatTimestamp(fallback.updatedAt) : formatTimestamp(),
    time: fallback.interviewDate.toISOString().slice(11, 16),
  };
}

function mapMatchRequestRecordToResolved(
  request: {
    createdAt: Date;
    demoId: number | null;
    employmentType: TeacherType;
    expectedPeriod: string | null;
    interviewDate: Date | null;
    interviewLocation: string | null;
    interviewMemo: string | null;
    jobPosting: ResolvedJobPost | null;
    message: string | null;
    meta: Prisma.JsonValue | null;
    status: MatchStatus;
    teacherProfile: TeacherProfile | null;
    teacherProfileId: string;
    updatedAt: Date;
  },
) {
  const meta = getRequestMeta(request.meta);
  const interview = buildInterviewFromRecord(
    {
      interviewDate: request.interviewDate,
      interviewLocation: request.interviewLocation,
      interviewMemo: request.interviewMemo,
      updatedAt: request.updatedAt,
    },
    undefined,
  );
  const status = mapMatchStatusToRequestStatus(request.status);
  const note =
    typeof meta.note === "string"
      ? meta.note
      : "프로필 열람 후 우선 제안을 전달했습니다.";
  const sentAt =
    typeof meta.sentAt === "string" ? meta.sentAt : formatTimestamp(request.createdAt);
  const teacher = request.teacherProfile;

  return {
    id: request.demoId ?? 0,
    interview,
    job: request.jobPosting,
    message:
      request.message ??
      `${teacher?.summary ?? "교사 프로필"} 정보를 검토하고 제안을 전달했습니다.`,
    note,
    position:
      request.jobPosting
        ? `${request.jobPosting.gradeLevel} / ${request.jobPosting.employmentType}`
        : request.expectedPeriod ?? note,
    qualification: teacher?.qualification ?? "교사 자격 확인 필요",
    region: request.jobPosting?.schoolRegion ?? teacher?.residence ?? "경기",
    schoolName: request.jobPosting?.schoolName ?? "학교 정보 없음",
    sentAt,
    status,
    summary: getRequestStatusSummary(status, note, interview),
    teacher,
    teacherId: teacher?.id ?? 0,
  } satisfies ResolvedPoolRequest;
}

function mapApplicationRecordToResolved(
  application: {
    coverLetter: string | null;
    createdAt: Date;
    demoId: number | null;
    jobPosting: ResolvedJobPost | null;
    meta: Prisma.JsonValue | null;
    status: MatchStatus;
    teacherProfile: TeacherProfile | null;
  },
) {
  const meta = getApplicationMeta(application.meta);
  const interview = parseInterview(meta.interview);
  const status = getApplicationWorkflowStatus(application);
  const submittedAt =
    typeof meta.submittedAt === "string"
      ? meta.submittedAt
      : formatTimestamp(application.createdAt);
  const teacher = application.teacherProfile;

  return {
    coverNote: application.coverLetter ?? "",
    id: application.demoId ?? 0,
    interview,
    job: application.jobPosting,
    jobId: application.jobPosting?.id ?? "",
    status,
    submittedAt,
    summary: getApplicationStatusSummary(status, interview),
    teacher,
    teacherId: teacher?.id ?? 0,
  } satisfies ResolvedApplication;
}

async function buildResolvedJobs() {
  const [jobs, applications] = await Promise.all([
    prisma.jobPosting.findMany({
      include: {
        hrProfile: {
          select: {
            schoolAddress: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.application.findMany({
      select: {
        jobPostingId: true,
        meta: true,
        status: true,
      },
    }),
  ]);

  return jobs
    .map((job) => mapJobRecordToResolved(job, applications))
    .sort((left, right) => right.id.localeCompare(left.id));
}

export async function getHiringStateForSession(
  session: DemoSession | null,
): Promise<HiringStatePayload> {
  await ensureDemoPlatformSeed();

  const context = await getSessionContext(session);
  const jobs = await buildResolvedJobs();
  const jobsByDbId = new Map<string, ResolvedJobPost>();

  const rawJobs = await prisma.jobPosting.findMany({
    select: { externalId: true, id: true },
  });

  rawJobs.forEach((job) => {
    const externalId = job.externalId ?? job.id;
    const resolved = jobs.find((item) => item.id === externalId);

    if (resolved) {
      jobsByDbId.set(job.id, resolved);
    }
  });

  const [teacherProfiles, applications, requests, reservations] = await Promise.all([
    prisma.teacherProfile.findMany({
      include: {
        user: true,
      },
    }),
    prisma.application.findMany({
      include: {
        teacherProfile: {
          include: {
            user: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.matchRequest.findMany({
      include: {
        teacherProfile: {
          include: {
            user: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    context.hrProfileId
      ? prisma.reservation.findMany({
          where: {
            hrProfileId: context.hrProfileId,
            status: ReservationStatus.PENDING,
          },
          include: {
            teacherProfile: true,
          },
        })
      : Promise.resolve([]),
  ]);

  const teachersByProfileId = new Map(
    teacherProfiles.map((profile) => [
      profile.id,
      buildTeacherUiProfile(profile),
    ]),
  );

  const resolvedApplications = applications
    .filter((application) => {
      if (context.role === "teacher" && context.teacherProfileId) {
        return application.teacherProfileId === context.teacherProfileId;
      }

      if (context.role === "hr" && context.hrProfileId) {
        const dbJobId = application.jobPostingId;
        const job = jobsByDbId.get(dbJobId);
        return Boolean(job);
      }

      return true;
    })
    .map((application) =>
      mapApplicationRecordToResolved({
        ...application,
        jobPosting: jobsByDbId.get(application.jobPostingId) ?? null,
        teacherProfile: teachersByProfileId.get(application.teacherProfileId) ?? null,
      }),
    );

  const resolvedRequests = requests
    .filter((request) => {
      if (context.role === "teacher" && context.teacherProfileId) {
        return request.teacherProfileId === context.teacherProfileId;
      }

      if (context.role === "hr" && context.hrProfileId) {
        return request.hrProfileId === context.hrProfileId;
      }

      return context.role === "admin";
    })
    .map((request) =>
      mapMatchRequestRecordToResolved({
        ...request,
        jobPosting: request.jobPostingId
          ? jobsByDbId.get(request.jobPostingId) ?? null
          : null,
        teacherProfile: teachersByProfileId.get(request.teacherProfileId) ?? null,
      }),
    );

  return {
    applications: resolvedApplications,
    interestedTeacherIds: reservations
      .map((reservation) => {
        const teacher = teachersByProfileId.get(reservation.teacherProfileId);
        return teacher?.id ?? 0;
      })
      .filter((teacherId) => teacherId > 0),
    jobs,
    requests: resolvedRequests,
  };
}

async function getNextDemoId(
  model: "application" | "matchRequest",
) {
  if (model === "application") {
    const result = await prisma.application.aggregate({
      _max: { demoId: true },
    });

    return (result._max.demoId ?? 0) + 1;
  }

  const result = await prisma.matchRequest.aggregate({
    _max: { demoId: true },
  });

  return (result._max.demoId ?? 0) + 1;
}

async function getNextCustomJobExternalId() {
  const jobs = await prisma.jobPosting.findMany({
    where: { externalId: { startsWith: "custom-" } },
    select: { externalId: true },
  });

  const nextNumber =
    jobs.reduce((max, job) => {
      const value = Number(job.externalId?.replace("custom-", "") ?? "0");
      return Number.isNaN(value) ? max : Math.max(max, value);
    }, 100) + 1;

  return `custom-${nextNumber}`;
}

async function resolveJobPostingByExternalId(jobId: string) {
  return prisma.jobPosting.findFirst({
    where: {
      OR: [{ externalId: jobId }, { id: jobId }],
    },
    include: {
      hrProfile: true,
    },
  });
}

async function resolveTeacherProfileByDemoId(teacherId: number) {
  return prisma.teacherProfile.findFirst({
    where: { demoId: teacherId },
  });
}

async function resolveApplicationByDemoId(applicationId: number) {
  return prisma.application.findFirst({
    where: { demoId: applicationId },
  });
}

async function resolveMatchRequestByDemoId(requestId: number) {
  return prisma.matchRequest.findFirst({
    where: { demoId: requestId },
  });
}

export async function performHiringMutation(
  session: DemoSession | null,
  action: string,
  payload: Record<string, unknown>,
) {
  await ensureDemoPlatformSeed();

  const context = await getSessionContext(session);

  switch (action) {
    case "createJob": {
      if (!context.hrProfileId) {
        throw new Error("학교 계정이 필요합니다.");
      }

      const externalId = await getNextCustomJobExternalId();
      const employmentType =
        payload.employmentType === "시간강사"
          ? TeacherType.PART_TIME
          : TeacherType.FIXED_TERM;

      await prisma.jobPosting.create({
        data: {
          employmentType,
          endDate: new Date(`${String(payload.endDate)}T00:00:00.000Z`),
          externalId,
          gradeLevel: String(payload.gradeLevel ?? ""),
          hrProfileId: context.hrProfileId,
          isHomeroom: payload.isHomeroom === true,
          memo: String(payload.summary ?? ""),
          postingStatus: PostingStatus.OPEN,
          qualificationSubject:
            typeof payload.qualificationSubject === "string" &&
            payload.qualificationSubject.trim()
              ? payload.qualificationSubject
              : null,
          qualificationType: mapQualificationTypeFromLabel(
            String(payload.qualificationType ?? "초등"),
          ),
          schoolName: String(payload.schoolName ?? ""),
          schoolRegion: String(payload.schoolRegion ?? ""),
          startDate: new Date(`${String(payload.startDate)}T00:00:00.000Z`),
          meta: toJsonObject({
            baseApplicants: 0,
            benefits: Array.isArray(payload.benefits) ? payload.benefits : [],
            contactName: DEFAULT_JOB_CONTACT,
            deadline: String(payload.endDate ?? ""),
            duties: Array.isArray(payload.duties) ? payload.duties : [],
            isClosingSoon: false,
            postedAt: formatTimestamp(),
            requirements: Array.isArray(payload.requirements)
              ? payload.requirements
              : [],
            schoolAddress: String(payload.schoolAddress ?? ""),
            summary: String(payload.summary ?? ""),
            views: 0,
          }),
        },
      });
      break;
    }
    case "updateJobStatus": {
      const job = await resolveJobPostingByExternalId(String(payload.jobId ?? ""));

      if (!job) {
        break;
      }

      const meta = getJobMeta(job);
      const nextStatus = String(payload.status ?? "open");

      await prisma.jobPosting.update({
        where: { id: job.id },
        data: {
          postingStatus:
            nextStatus === "closed" ? PostingStatus.CLOSED : PostingStatus.OPEN,
          meta: toJsonObject({
            ...meta,
            isClosingSoon: nextStatus === "closing-soon",
          }),
        },
      });
      break;
    }
    case "applyToJob": {
      if (!context.teacherProfileId) {
        throw new Error("교사 로그인 후 이용해 주세요.");
      }

      const job = await resolveJobPostingByExternalId(String(payload.jobId ?? ""));

      if (!job) {
        break;
      }

      const existing = await prisma.application.findFirst({
        where: {
          jobPostingId: job.id,
          teacherProfileId: context.teacherProfileId,
        },
      });
      const coverNote = String(payload.coverNote ?? "").trim();
      const applicationMeta = toJsonObject({
        submittedAt: formatTimestamp(),
        workflowStatus: "submitted" satisfies ApplicationStatus,
      });

      if (existing) {
        await prisma.application.update({
          where: { id: existing.id },
          data: {
            coverLetter:
              coverNote ||
              `${job.gradeLevel ?? "교사"} 공고에 바로 지원했습니다. 희망 일정과 근무 조건을 확인해 주세요.`,
            meta: applicationMeta,
            status: MatchStatus.PENDING,
          },
        });
        break;
      }

      await prisma.application.create({
        data: {
          coverLetter:
            coverNote ||
            `${job.gradeLevel ?? "교사"} 공고에 바로 지원했습니다. 희망 일정과 근무 조건을 확인해 주세요.`,
          demoId: await getNextDemoId("application"),
          jobPostingId: job.id,
          meta: applicationMeta,
          status: MatchStatus.PENDING,
          teacherProfileId: context.teacherProfileId,
        },
      });
      break;
    }
    case "withdrawApplication": {
      const application = await resolveApplicationByDemoId(
        Number(payload.applicationId ?? 0),
      );

      if (!application) {
        break;
      }

      const meta = getApplicationMeta(application.meta);

      await prisma.application.update({
        where: { id: application.id },
        data: {
          meta: toJsonObject({
            ...meta,
            workflowStatus: "withdrawn",
          }),
          status: MatchStatus.CANCELLED,
        },
      });
      break;
    }
    case "updateApplicationStatus": {
      const application = await resolveApplicationByDemoId(
        Number(payload.applicationId ?? 0),
      );

      if (!application) {
        break;
      }

      const workflowStatus = String(payload.status ?? "submitted") as ApplicationStatus;
      const meta = getApplicationMeta(application.meta);

      await prisma.application.update({
        where: { id: application.id },
        data: {
          meta: toJsonObject({
            ...meta,
            workflowStatus,
          }),
          status: applicationStatusToMatchStatus(workflowStatus),
        },
      });
      break;
    }
    case "scheduleInterviewForApplication": {
      const application = await resolveApplicationByDemoId(
        Number(payload.applicationId ?? 0),
      );

      if (!application) {
        break;
      }

      const interview = {
        date: String(payload.date ?? ""),
        note: String(payload.note ?? ""),
        place: String(payload.place ?? ""),
        sentAt: formatTimestamp(),
        time: String(payload.time ?? ""),
      };
      const meta = getApplicationMeta(application.meta);

      await prisma.application.update({
        where: { id: application.id },
        data: {
          meta: toJsonObject({
            ...meta,
            interview,
            workflowStatus: "interview-requested",
          }),
          status: MatchStatus.INTERVIEWING,
        },
      });
      break;
    }
    case "sendPoolRequest": {
      if (!context.hrProfileId) {
        throw new Error("학교 계정이 필요합니다.");
      }

      const teacherProfile = await resolveTeacherProfileByDemoId(
        Number(payload.teacherId ?? 0),
      );
      const job = await resolveJobPostingByExternalId(String(payload.jobId ?? ""));

      if (!teacherProfile || !job) {
        break;
      }

      const existing = await prisma.matchRequest.findFirst({
        where: {
          hrProfileId: context.hrProfileId,
          jobPostingId: job.id,
          teacherProfileId: teacherProfile.id,
        },
      });

      const nextData = {
        direction: MatchDirection.HR_TO_TEACHER,
        employmentType: job.employmentType,
        expectedPeriod: `${job.startDate.toISOString().slice(0, 10)} - ${job.endDate
          .toISOString()
          .slice(0, 10)}`,
        hrProfileId: context.hrProfileId,
        jobPostingId: job.id,
        message:
          typeof payload.message === "string" && payload.message.trim()
            ? payload.message
            : `${job.schoolName} ${job.gradeLevel ?? ""} 공고와 잘 맞는 후보로 제안을 드립니다.`,
        meta: toJsonObject({
          note:
            typeof payload.note === "string" && payload.note.trim()
              ? payload.note
              : `${job.schoolName} ${job.gradeLevel ?? ""} 공고 기준으로 매칭 제안을 보냈습니다.`,
          sentAt: formatTimestamp(),
        }),
        status: MatchStatus.PENDING,
        teacherProfileId: teacherProfile.id,
      };

      if (existing) {
        await prisma.matchRequest.update({
          where: { id: existing.id },
          data: nextData,
        });
        break;
      }

      await prisma.matchRequest.create({
        data: {
          ...nextData,
          demoId: await getNextDemoId("matchRequest"),
        },
      });
      break;
    }
    case "setPoolRequestStatus":
    case "cancelPoolRequest": {
      const request = await resolveMatchRequestByDemoId(Number(payload.requestId ?? 0));

      if (!request) {
        break;
      }

      const requestedStatus =
        action === "cancelPoolRequest"
          ? "cancelled"
          : String(payload.status ?? "pending");

      await prisma.matchRequest.update({
        where: { id: request.id },
        data: {
          status: mapRequestStatusToMatchStatus(
            requestedStatus as DemoRequestStatus,
          ),
        },
      });
      break;
    }
    case "scheduleInterviewForRequest": {
      const request = await resolveMatchRequestByDemoId(Number(payload.requestId ?? 0));

      if (!request) {
        break;
      }

      const interview = {
        date: String(payload.date ?? ""),
        note: String(payload.note ?? ""),
        place: String(payload.place ?? ""),
        sentAt: formatTimestamp(),
        time: String(payload.time ?? ""),
      };

      await prisma.matchRequest.update({
        where: { id: request.id },
        data: {
          interviewDate: new Date(
            `${interview.date}T${interview.time || "09:00"}:00.000Z`,
          ),
          interviewLocation: interview.place,
          interviewMemo: interview.note,
          status: MatchStatus.ACCEPTED,
        },
      });
      break;
    }
    case "toggleInterestedTeacher": {
      if (!context.hrProfileId) {
        throw new Error("학교 계정이 필요합니다.");
      }

      const teacherProfile = await resolveTeacherProfileByDemoId(
        Number(payload.teacherId ?? 0),
      );

      if (!teacherProfile) {
        break;
      }

      const existing = await prisma.reservation.findFirst({
        where: {
          hrProfileId: context.hrProfileId,
          teacherProfileId: teacherProfile.id,
        },
      });

      if (existing) {
        await prisma.reservation.delete({ where: { id: existing.id } });
        break;
      }

      await prisma.reservation.create({
        data: {
          hrProfileId: context.hrProfileId,
          message: "관심 교사로 저장했습니다.",
          status: ReservationStatus.PENDING,
          teacherProfileId: teacherProfile.id,
        },
      });
      break;
    }
    default:
      break;
  }
}

export async function authenticateUser(
  email: string,
  password: string,
) {
  await ensureDemoPlatformSeed();

  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
    include: {
      hrProfile: true,
      teacherProfile: true,
    },
  });

  if (!user || !verifyPassword(password.trim(), user.passwordHash)) {
    return null;
  }

  const role = buildSessionRole(user.role);
  const teacherProfile = user.teacherProfile;
  const teacherDetail =
    role === "teacher" && teacherProfile
      ? buildTeacherUiProfile({
          ...teacherProfile,
          user,
        }).qualification
      : "등록 교사";

  return {
    avatarPreset: teacherProfile
      ? resolveAvatarPreset(teacherProfile.avatarPreset)
      : undefined,
    detail:
      role === "teacher"
        ? teacherDetail
        : user.hrProfile?.schoolName ?? "시스템 운영",
    email: user.email,
    name: user.name,
    redirectTo: buildRedirectPath(role),
    role,
  } satisfies DemoSession;
}
