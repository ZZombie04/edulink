import "server-only";

import {
  ApprovalStatus,
  ContractStatus,
  EducationLevel,
  MatchDirection,
  MatchStatus,
  NotificationType,
  PostingStatus,
  Prisma,
  QualificationGrade,
  QualificationType,
  ReservationStatus,
  SeekingStatus,
  TeacherType,
  UserRole,
} from "@prisma/client";

import {
  DEMO_ACCOUNTS,
  DEMO_PASSWORD,
  DEMO_VERIFICATION_CODE,
  isDemoSeedEnabled,
  isReservedDemoEmail,
} from "@/lib/demo-access";
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
import {
  mapDatabaseRoleToDemoRole,
  type DemoSession,
  type DemoUserRole,
} from "@/lib/demo-session";
import {
  canTransitionApplicationStatus,
  canTransitionRequestStatus,
  getApplicationStatusSummary,
  getRequestStatusSummary,
  isHiringActionAllowed,
  isHiringMutationAction,
  type ApplicationStatus,
  type DemoRequestStatus,
  type HRRegistrationInput,
  type HiringStatePayload,
  type InterviewSchedule,
  type TeacherRegistrationInput,
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
  teacherArchived?: boolean;
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
  userId: string | null;
};

export class HiringServiceError extends Error {
  code: string;
  status: number;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "HiringServiceError";
    this.code = code;
    this.status = status;
  }
}

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
    case MatchStatus.HIRED:
      return "hired";
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
    case "hired":
      return MatchStatus.HIRED;
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
  availableFrom?: Date | null;
  avatarPreset: string;
  careers?: Array<{
    description: string | null;
    employmentType: TeacherType;
    endDate: Date | null;
    position: string;
    region: string | null;
    schoolName: string;
    startDate: Date;
    subject: string | null;
  }>;
  demoId: number | null;
  educationLevel?: EducationLevel;
  graduationYear?: number;
  introduction: string | null;
  major?: string;
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
  university?: string;
  user: {
    birthDate: Date;
    name: string;
  };
}): TeacherProfile {
  const seed = record.demoId ? getTeacherById(record.demoId) : null;
  const currentYear = new Date().getFullYear();
  const birthYear = record.user.birthDate.getFullYear();
  const qualification = getQualificationLabel(
    record.qualificationType,
    record.qualificationGrade,
    record.qualificationSubject,
  );
  const educationLevel =
    record.educationLevel === EducationLevel.DOCTOR
      ? "박사"
      : record.educationLevel === EducationLevel.MASTER
        ? "석사"
        : "학사";

  return {
    age: currentYear - birthYear,
    availableFrom: record.availableFrom?.toISOString().slice(0, 10),
    avatarPreset: resolveAvatarPreset(record.avatarPreset, defaultAvatarPreset),
    birthYear,
    careerHighlights: record.careers?.map((career) => ({
      description: career.description ?? undefined,
      employmentType: mapTeacherTypeToLabel(career.employmentType),
      endDate: career.endDate?.toISOString().slice(0, 10),
      position: career.position,
      region: career.region ?? undefined,
      schoolName: career.schoolName,
      startDate: career.startDate.toISOString().slice(0, 10),
      subject: career.subject ?? undefined,
    })),
    education:
      record.university && record.major
        ? `${record.university} · ${record.major} ${educationLevel}`
        : undefined,
    experience: formatExperienceLabel(
      record.totalExperienceYears,
      record.totalExperienceMonths,
    ),
    graduationYear: record.graduationYear,
    id: record.demoId ?? 0,
    name: record.user.name,
    portfolioViews: seed?.portfolioViews ?? 0,
    preferredRegions: record.preferredRegions,
    preferredTypes: record.preferredTypes.map((type) =>
      mapTeacherTypeToLabel(type),
    ),
    qualification,
    qualificationCategory: mapQualificationTypeToLabel(
      record.qualificationType,
    ) as TeacherProfile["qualificationCategory"],
    reservation: record.reservationEnabled,
    reservationCount: seed?.reservationCount,
    residence: record.residenceRegion,
    status: mapSeekingStatusToLabel(record.seekingStatus),
    subject: record.qualificationSubject ?? undefined,
    summary:
      record.introduction ??
      `${qualification} 기반으로 채용 제안을 받을 수 있는 교사입니다.`,
  };
}

function buildSessionRole(role: UserRole): DemoUserRole {
  const mappedRole = mapDatabaseRoleToDemoRole(role);

  if (!mappedRole) {
    throw new HiringServiceError(
      403,
      "UNSUPPORTED_ROLE",
      "이 계정의 권한으로는 서비스를 이용할 수 없습니다.",
    );
  }

  return mappedRole;
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
  if (!isDemoSeedEnabled()) {
    return;
  }

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
          update: {},
          create: {
            availableFrom: teacher.availableFrom
              ? new Date(`${teacher.availableFrom}T00:00:00.000Z`)
              : null,
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
          update: {},
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
          update: {},
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
        update: {},
        create: {
          coverLetter:
            "학년 담임 경험과 학부모 상담 운영 경험을 살려 바로 근무에 참여할 수 있습니다.",
          demoId: 1,
          jobPostingId: firstJob.id,
          status: MatchStatus.PENDING,
          teacherProfileId: reviewingTeacher.id,
          meta: toJsonObject({
            submittedAt: "2026.07.24 16:10",
            workflowStatus: "reviewing",
          }),
        },
      });
    })();
  }

  await seedPromise;
}

async function getSessionContext(session: DemoSession | null): Promise<SessionContext> {
  const guestContext: SessionContext = {
    hrProfileId: null,
    role: "guest",
    teacherProfileId: null,
    userId: null,
  };

  if (!session) {
    return guestContext;
  }

  await ensureDemoPlatformSeed();

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      hrProfile: {
        select: {
          approvalStatus: true,
          id: true,
        },
      },
      teacherProfile: { select: { id: true } },
    },
  });

  if (
    !user ||
    !user.isActive ||
    !user.isVerified ||
    user.email.toLowerCase() !== session.email.toLowerCase()
  ) {
    return guestContext;
  }

  const role = mapDatabaseRoleToDemoRole(user.role);

  if (
    !role ||
    (role === "hr" &&
      user.hrProfile?.approvalStatus !== ApprovalStatus.APPROVED)
  ) {
    return guestContext;
  }

  return {
    hrProfileId: user?.hrProfile?.id ?? null,
    role,
    teacherProfileId: user?.teacherProfile?.id ?? null,
    userId: user.id,
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
  const status =
    meta.teacherArchived === true &&
    request.status !== MatchStatus.HIRED
      ? "archived"
      : mapMatchStatusToRequestStatus(request.status);
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
    select: { externalId: true, hrProfileId: true, id: true },
  });
  const jobOwnerByDbId = new Map(
    rawJobs.map((job) => [job.id, job.hrProfileId]),
  );

  rawJobs.forEach((job) => {
    const externalId = job.externalId ?? job.id;
    const resolved = jobs.find((item) => item.id === externalId);

    if (resolved) {
      jobsByDbId.set(job.id, resolved);
    }
  });

  const [
    teacherProfiles,
    applications,
    requests,
    reservations,
    hrOrganization,
  ] = await Promise.all([
    prisma.teacherProfile.findMany({
      include: {
        careers: {
          orderBy: { startDate: "desc" },
        },
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
    context.hrProfileId
      ? prisma.hRProfile.findUnique({
          where: { id: context.hrProfileId },
          select: {
            schoolAddress: true,
            schoolName: true,
            schoolRegion: true,
          },
        })
      : Promise.resolve(null),
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
        return (
          jobOwnerByDbId.get(application.jobPostingId) ===
          context.hrProfileId
        );
      }

      return context.role === "admin";
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
    currentTeacher:
      context.role === "teacher" && context.teacherProfileId
        ? teachersByProfileId.get(context.teacherProfileId) ?? null
        : undefined,
    currentTeacherId:
      context.role === "teacher" && context.teacherProfileId
        ? teachersByProfileId.get(context.teacherProfileId)?.id
        : undefined,
    hrOrganization:
      context.role === "hr" && hrOrganization
        ? hrOrganization
        : undefined,
    interestedTeacherIds: reservations
      .map((reservation) => {
        const teacher = teachersByProfileId.get(reservation.teacherProfileId);
        return teacher?.id ?? 0;
      })
      .filter((teacherId) => teacherId > 0),
    jobs,
    requests: resolvedRequests,
    teacherVisibility:
      context.role === "teacher" && context.teacherProfileId
        ? teacherProfiles.find(
            (profile) => profile.id === context.teacherProfileId,
          )?.seekingStatus === SeekingStatus.NOT_SEEKING
          ? "paused"
          : "seeking"
        : undefined,
    teachers:
      context.role === "hr"
        ? teacherProfiles
            .filter(
              (profile) =>
                profile.seekingStatus !== SeekingStatus.NOT_SEEKING,
            )
            .map((profile) => teachersByProfileId.get(profile.id))
            .filter(
              (profile): profile is TeacherProfile =>
                profile !== undefined,
            )
        : undefined,
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
    include: {
      jobPosting: true,
    },
  });
}

async function resolveMatchRequestByDemoId(requestId: number) {
  return prisma.matchRequest.findFirst({
    where: { demoId: requestId },
    include: {
      jobPosting: true,
    },
  });
}

function serviceError(
  status: number,
  code: string,
  message: string,
): never {
  throw new HiringServiceError(status, code, message);
}

function readNonEmptyString(
  payload: Record<string, unknown>,
  key: string,
  label: string,
  maxLength = 500,
) {
  const value = payload[key];

  if (
    typeof value !== "string" ||
    !value.trim() ||
    value.trim().length > maxLength
  ) {
    serviceError(
      422,
      "INVALID_INPUT",
      `${label} 값을 올바르게 입력해 주세요.`,
    );
  }

  return value.trim();
}

function readOptionalString(value: unknown, maxLength = 2000) {
  if (value === undefined || value === null || value === "") {
    return "";
  }

  if (typeof value !== "string" || value.trim().length > maxLength) {
    serviceError(422, "INVALID_INPUT", "입력값의 형식이 올바르지 않습니다.");
  }

  return value.trim();
}

function readDate(
  value: unknown,
  label: string,
  endOfDay = false,
) {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    serviceError(
      422,
      "INVALID_DATE",
      `${label} 날짜를 올바르게 입력해 주세요.`,
    );
  }

  const date = new Date(
    `${value}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}Z`,
  );

  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value
  ) {
    serviceError(
      422,
      "INVALID_DATE",
      `${label} 날짜를 올바르게 입력해 주세요.`,
    );
  }

  return date;
}

function assertDateOrder(startDate: Date, endDate: Date) {
  if (startDate.getTime() > endDate.getTime()) {
    serviceError(
      422,
      "INVALID_DATE_RANGE",
      "종료일은 시작일보다 빠를 수 없습니다.",
    );
  }
}

function getSeoulDateString(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Asia/Seoul",
    year: "numeric",
  }).formatToParts(date);
  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );

  return `${values.year}-${values.month}-${values.day}`;
}

function assertTodayOrFuture(date: Date, label: string) {
  if (date.toISOString().slice(0, 10) < getSeoulDateString()) {
    serviceError(
      422,
      "DATE_IN_THE_PAST",
      `${label}은(는) 오늘보다 빠를 수 없습니다.`,
    );
  }
}

async function finalizeApplicationHire(
  applicationId: string,
  actorUserId: string,
  meta: ApplicationMeta,
) {
  await prisma.$transaction(async (transaction) => {
    const application = await transaction.application.findUnique({
      where: { id: applicationId },
      select: {
        id: true,
        jobPostingId: true,
        status: true,
        teacherProfileId: true,
      },
    });

    if (!application) {
      serviceError(404, "APPLICATION_NOT_FOUND", "지원서를 찾을 수 없습니다.");
    }

    const jobPosting = await transaction.jobPosting.findUnique({
      where: { id: application.jobPostingId },
      select: {
        closedAt: true,
        employmentType: true,
        endDate: true,
        hrProfileId: true,
        schoolName: true,
        startDate: true,
      },
    });
    const teacherProfile = await transaction.teacherProfile.findUnique({
      where: { id: application.teacherProfileId },
      select: { userId: true },
    });
    const existingContract = await transaction.contract.findUnique({
      where: { applicationId: application.id },
      select: { id: true },
    });

    if (!jobPosting || !teacherProfile) {
      serviceError(
        500,
        "HIRING_RELATIONSHIP_INVALID",
        "채용 관계 데이터를 확인할 수 없습니다.",
      );
    }

    const wasHired = application.status === MatchStatus.HIRED;
    const contractData = {
      employmentType: jobPosting.employmentType,
      endDate: jobPosting.endDate,
      hrProfileId: jobPosting.hrProfileId,
      schoolName: jobPosting.schoolName,
      startDate: jobPosting.startDate,
      status: ContractStatus.ACTIVE,
      teacherProfileId: application.teacherProfileId,
      welcomeMessage: `${jobPosting.schoolName} 채용이 확정되었습니다.`,
    };

    if (existingContract) {
      await transaction.contract.update({
        where: { id: existingContract.id },
        data: contractData,
      });
    } else {
      await transaction.contract.create({
        data: {
          ...contractData,
          applicationId: application.id,
        },
      });
    }

    await transaction.application.update({
      where: { id: application.id },
      data: {
        meta: toJsonObject({
          ...meta,
          workflowStatus: "hired",
        }),
        status: MatchStatus.HIRED,
      },
    });

    await transaction.teacherProfile.update({
      where: { id: application.teacherProfileId },
      data: { seekingStatus: SeekingStatus.EMPLOYED },
    });
    await transaction.jobPosting.update({
      where: { id: application.jobPostingId },
      data: {
        closedAt: jobPosting.closedAt ?? new Date(),
        postingStatus: PostingStatus.FILLED,
      },
    });

    if (!wasHired) {
      await transaction.notification.create({
        data: {
          message: `${jobPosting.schoolName} 채용과 계약 정보가 확정되었습니다.`,
          title: "채용 확정",
          type: NotificationType.HIRED,
          userId: teacherProfile.userId,
        },
      });
      await transaction.activityLog.create({
        data: {
          action: "APPLICATION_HIRED",
          entityId: application.id,
          entityType: "Application",
          userId: actorUserId,
        },
      });
    }
  });
}

async function finalizeRequestHire(
  requestId: string,
  actorUserId: string,
) {
  await prisma.$transaction(async (transaction) => {
    const matchRequest = await transaction.matchRequest.findUnique({
      where: { id: requestId },
      select: {
        contractId: true,
        employmentType: true,
        hrProfileId: true,
        id: true,
        jobPostingId: true,
        status: true,
        teacherProfileId: true,
      },
    });

    if (!matchRequest) {
      serviceError(404, "REQUEST_NOT_FOUND", "채용 요청을 찾을 수 없습니다.");
    }

    const hrProfile = await transaction.hRProfile.findUnique({
      where: { id: matchRequest.hrProfileId },
      select: { schoolName: true },
    });
    const teacherProfile = await transaction.teacherProfile.findUnique({
      where: { id: matchRequest.teacherProfileId },
      select: { userId: true },
    });
    const jobPosting = matchRequest.jobPostingId
      ? await transaction.jobPosting.findUnique({
          where: { id: matchRequest.jobPostingId },
          select: {
            closedAt: true,
            endDate: true,
            schoolName: true,
            startDate: true,
          },
        })
      : null;

    if (!hrProfile || !teacherProfile) {
      serviceError(
        500,
        "HIRING_RELATIONSHIP_INVALID",
        "채용 관계 데이터를 확인할 수 없습니다.",
      );
    }

    const wasHired = matchRequest.status === MatchStatus.HIRED;
    const fallbackStartDate = new Date();
    const fallbackEndDate = new Date(
      fallbackStartDate.getTime() + 30 * 24 * 60 * 60 * 1000,
    );
    const contractData = {
      employmentType: matchRequest.employmentType,
      endDate: jobPosting?.endDate ?? fallbackEndDate,
      hrProfileId: matchRequest.hrProfileId,
      schoolName: jobPosting?.schoolName ?? hrProfile.schoolName,
      startDate: jobPosting?.startDate ?? fallbackStartDate,
      status: ContractStatus.ACTIVE,
      teacherProfileId: matchRequest.teacherProfileId,
      welcomeMessage: `${
        jobPosting?.schoolName ?? hrProfile.schoolName
      } 채용이 확정되었습니다.`,
    };

    if (matchRequest.contractId) {
      await transaction.contract.update({
        where: { id: matchRequest.contractId },
        data: contractData,
      });
      await transaction.matchRequest.update({
        where: { id: matchRequest.id },
        data: { status: MatchStatus.HIRED },
      });
    } else {
      const contract = await transaction.contract.create({
        data: contractData,
        select: { id: true },
      });
      await transaction.matchRequest.update({
        where: { id: matchRequest.id },
        data: {
          contractId: contract.id,
          status: MatchStatus.HIRED,
        },
      });
    }

    await transaction.teacherProfile.update({
      where: { id: matchRequest.teacherProfileId },
      data: { seekingStatus: SeekingStatus.EMPLOYED },
    });

    if (matchRequest.jobPostingId) {
      await transaction.jobPosting.update({
        where: { id: matchRequest.jobPostingId },
        data: {
          closedAt: jobPosting?.closedAt ?? new Date(),
          postingStatus: PostingStatus.FILLED,
        },
      });
    }

    if (!wasHired) {
      await transaction.notification.create({
        data: {
          message: `${
            jobPosting?.schoolName ?? hrProfile.schoolName
          } 채용과 계약 정보가 확정되었습니다.`,
          title: "채용 확정",
          type: NotificationType.HIRED,
          userId: teacherProfile.userId,
        },
      });
      await transaction.activityLog.create({
        data: {
          action: "MATCH_REQUEST_HIRED",
          entityId: matchRequest.id,
          entityType: "MatchRequest",
          userId: actorUserId,
        },
      });
    }
  });
}

export async function performHiringMutation(
  session: DemoSession | null,
  action: string,
  payload: Record<string, unknown>,
) {
  await ensureDemoPlatformSeed();

  const context = await getSessionContext(session);

  if (!isHiringMutationAction(action)) {
    serviceError(
      400,
      "UNKNOWN_ACTION",
      "지원하지 않는 채용 변경 요청입니다.",
    );
  }

  if (!isHiringActionAllowed(context.role, action)) {
    serviceError(
      context.role === "guest" ? 401 : 403,
      context.role === "guest" ? "AUTHENTICATION_REQUIRED" : "FORBIDDEN",
      context.role === "guest"
        ? "로그인 후 이용해 주세요."
        : "이 작업을 수행할 권한이 없습니다.",
    );
  }

  if (!context.userId) {
    serviceError(401, "AUTHENTICATION_REQUIRED", "로그인 후 이용해 주세요.");
  }

  switch (action) {
    case "createJob": {
      if (!context.hrProfileId) {
        serviceError(403, "HR_ACCOUNT_REQUIRED", "학교 계정이 필요합니다.");
      }

      const hrProfile = await prisma.hRProfile.findUnique({
        where: { id: context.hrProfileId },
      });

      if (
        !hrProfile ||
        hrProfile.approvalStatus !== ApprovalStatus.APPROVED
      ) {
        serviceError(
          403,
          "HR_APPROVAL_REQUIRED",
          "승인된 학교 계정만 공고를 등록할 수 있습니다.",
        );
      }

      const externalId = await getNextCustomJobExternalId();
      const employmentType =
        payload.employmentType === "시간강사"
          ? TeacherType.PART_TIME
          : TeacherType.FIXED_TERM;
      const startDate = readDate(payload.startDate, "근무 시작일");
      const endDate = readDate(payload.endDate, "근무 종료일", true);
      assertTodayOrFuture(startDate, "근무 시작일");
      assertDateOrder(startDate, endDate);
      const gradeLevel = readNonEmptyString(
        payload,
        "gradeLevel",
        "담당 학년",
        100,
      );
      const summary = readNonEmptyString(
        payload,
        "summary",
        "공고 요약",
        2000,
      );

      await prisma.jobPosting.create({
        data: {
          employmentType,
          endDate,
          externalId,
          gradeLevel,
          hrProfileId: context.hrProfileId,
          isHomeroom: payload.isHomeroom === true,
          memo: summary,
          postingStatus: PostingStatus.OPEN,
          qualificationSubject:
            typeof payload.qualificationSubject === "string" &&
            payload.qualificationSubject.trim()
              ? payload.qualificationSubject
              : null,
          qualificationType: mapQualificationTypeFromLabel(
            String(payload.qualificationType ?? "초등"),
          ),
          schoolName: hrProfile.schoolName,
          schoolRegion: hrProfile.schoolRegion,
          startDate,
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
            schoolAddress: hrProfile.schoolAddress,
            summary,
            views: 0,
          }),
        },
      });
      break;
    }
    case "updateJobStatus": {
      const job = await resolveJobPostingByExternalId(String(payload.jobId ?? ""));

      if (!job) {
        serviceError(404, "JOB_NOT_FOUND", "채용 공고를 찾을 수 없습니다.");
      }

      if (job.hrProfileId !== context.hrProfileId) {
        serviceError(
          403,
          "JOB_OWNERSHIP_REQUIRED",
          "본인 학교가 등록한 공고만 변경할 수 있습니다.",
        );
      }

      const meta = getJobMeta(job);
      const nextStatus = String(payload.status ?? "open");

      if (!["open", "closing-soon", "closed"].includes(nextStatus)) {
        serviceError(
          422,
          "INVALID_JOB_STATUS",
          "공고 상태 값이 올바르지 않습니다.",
        );
      }

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
        serviceError(404, "JOB_NOT_FOUND", "채용 공고를 찾을 수 없습니다.");
      }

      if (job.postingStatus !== PostingStatus.OPEN) {
        serviceError(
          409,
          "JOB_NOT_OPEN",
          "현재 지원할 수 없는 공고입니다.",
        );
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
        const existingStatus = getApplicationWorkflowStatus(existing);

        if (existingStatus === "hired") {
          serviceError(
            409,
            "APPLICATION_ALREADY_HIRED",
            "이미 채용이 확정된 지원서입니다.",
          );
        }

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
        serviceError(
          404,
          "APPLICATION_NOT_FOUND",
          "지원서를 찾을 수 없습니다.",
        );
      }

      if (application.teacherProfileId !== context.teacherProfileId) {
        serviceError(
          403,
          "APPLICATION_OWNERSHIP_REQUIRED",
          "본인의 지원서만 취소할 수 있습니다.",
        );
      }

      const meta = getApplicationMeta(application.meta);
      const currentStatus = getApplicationWorkflowStatus(application);

      if (
        !canTransitionApplicationStatus(
          context.role,
          currentStatus,
          "withdrawn",
        )
      ) {
        serviceError(
          409,
          "INVALID_APPLICATION_TRANSITION",
          "현재 단계에서는 지원을 취소할 수 없습니다.",
        );
      }

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
        serviceError(
          404,
          "APPLICATION_NOT_FOUND",
          "지원서를 찾을 수 없습니다.",
        );
      }

      if (
        context.role === "teacher" &&
        application.teacherProfileId !== context.teacherProfileId
      ) {
        serviceError(
          403,
          "APPLICATION_OWNERSHIP_REQUIRED",
          "본인의 지원서만 변경할 수 있습니다.",
        );
      }

      if (
        context.role === "hr" &&
        application.jobPosting.hrProfileId !== context.hrProfileId
      ) {
        serviceError(
          403,
          "APPLICATION_OWNERSHIP_REQUIRED",
          "본인 학교 공고의 지원서만 변경할 수 있습니다.",
        );
      }

      const workflowStatus = String(
        payload.status ?? "",
      ) as ApplicationStatus;

      if (
        ![
          "submitted",
          "reviewing",
          "interview-requested",
          "interview-confirmed",
          "hired",
          "rejected",
          "withdrawn",
        ].includes(workflowStatus)
      ) {
        serviceError(
          422,
          "INVALID_APPLICATION_STATUS",
          "지원서 상태 값이 올바르지 않습니다.",
        );
      }

      const meta = getApplicationMeta(application.meta);
      const currentStatus = getApplicationWorkflowStatus(application);

      if (
        !canTransitionApplicationStatus(
          context.role,
          currentStatus,
          workflowStatus,
        )
      ) {
        serviceError(
          409,
          "INVALID_APPLICATION_TRANSITION",
          "현재 단계에서 요청한 지원 상태로 변경할 수 없습니다.",
        );
      }

      if (workflowStatus === "hired") {
        await finalizeApplicationHire(
          application.id,
          context.userId,
          meta,
        );
      } else {
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
      }
      break;
    }
    case "scheduleInterviewForApplication": {
      const application = await resolveApplicationByDemoId(
        Number(payload.applicationId ?? 0),
      );

      if (!application) {
        serviceError(
          404,
          "APPLICATION_NOT_FOUND",
          "지원서를 찾을 수 없습니다.",
        );
      }

      if (application.jobPosting.hrProfileId !== context.hrProfileId) {
        serviceError(
          403,
          "APPLICATION_OWNERSHIP_REQUIRED",
          "본인 학교 공고의 지원서만 변경할 수 있습니다.",
        );
      }

      const currentStatus = getApplicationWorkflowStatus(application);

      if (
        !canTransitionApplicationStatus(
          context.role,
          currentStatus,
          "interview-requested",
        )
      ) {
        serviceError(
          409,
          "INVALID_APPLICATION_TRANSITION",
          "현재 단계에서는 면접을 요청할 수 없습니다.",
        );
      }

      const interviewDate = readDate(payload.date, "면접일");
      assertTodayOrFuture(interviewDate, "면접일");
      const interviewTime = readNonEmptyString(
        payload,
        "time",
        "면접 시간",
        5,
      );

      if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(interviewTime)) {
        serviceError(
          422,
          "INVALID_INTERVIEW_TIME",
          "면접 시간을 올바르게 입력해 주세요.",
        );
      }

      const interview = {
        date: interviewDate.toISOString().slice(0, 10),
        note: readOptionalString(payload.note, 2000),
        place: readNonEmptyString(
          payload,
          "place",
          "면접 장소",
          300,
        ),
        sentAt: formatTimestamp(),
        time: interviewTime,
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
        serviceError(
          404,
          "MATCH_TARGET_NOT_FOUND",
          "교사 또는 채용 공고를 찾을 수 없습니다.",
        );
      }

      if (
        teacherProfile.seekingStatus !== SeekingStatus.SEEKING &&
        teacherProfile.seekingStatus !== SeekingStatus.INTERVIEWING
      ) {
        serviceError(
          409,
          "TEACHER_NOT_AVAILABLE",
          "현재 채용 제안을 받을 수 없는 교사입니다.",
        );
      }

      if (job.hrProfileId !== context.hrProfileId) {
        serviceError(
          403,
          "JOB_OWNERSHIP_REQUIRED",
          "본인 학교가 등록한 공고로만 제안할 수 있습니다.",
        );
      }

      if (job.postingStatus !== PostingStatus.OPEN) {
        serviceError(
          409,
          "JOB_NOT_OPEN",
          "현재 제안을 보낼 수 없는 공고입니다.",
        );
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
    case "archiveTeacherOffer": {
      const request = await resolveMatchRequestByDemoId(
        Number(payload.requestId ?? 0),
      );

      if (!request) {
        serviceError(404, "REQUEST_NOT_FOUND", "채용 제안을 찾을 수 없습니다.");
      }

      if (request.teacherProfileId !== context.teacherProfileId) {
        serviceError(
          403,
          "REQUEST_OWNERSHIP_REQUIRED",
          "본인에게 도착한 제안만 보관할 수 있습니다.",
        );
      }

      if (
        request.status === MatchStatus.HIRED ||
        request.status === MatchStatus.NOT_HIRED ||
        request.status === MatchStatus.CANCELLED
      ) {
        serviceError(
          409,
          "INVALID_REQUEST_TRANSITION",
          "현재 상태의 제안은 보관할 수 없습니다.",
        );
      }

      const meta = getRequestMeta(request.meta);

      await prisma.matchRequest.update({
        where: { id: request.id },
        data: {
          meta: toJsonObject({
            ...meta,
            teacherArchived: true,
          }),
        },
      });
      break;
    }
    case "setPoolRequestStatus": {
      const request = await resolveMatchRequestByDemoId(
        Number(payload.requestId ?? 0),
      );

      if (!request) {
        serviceError(404, "REQUEST_NOT_FOUND", "채용 제안을 찾을 수 없습니다.");
      }

      const requestedStatus = String(
        payload.status ?? "",
      ) as DemoRequestStatus;

      if (
        ![
          "pending",
          "accepted",
          "rejected",
          "archived",
          "cancelled",
          "hired",
        ].includes(requestedStatus)
      ) {
        serviceError(
          422,
          "INVALID_REQUEST_STATUS",
          "채용 제안 상태 값이 올바르지 않습니다.",
        );
      }

      if (
        context.role === "teacher" &&
        request.teacherProfileId !== context.teacherProfileId
      ) {
        serviceError(
          403,
          "REQUEST_OWNERSHIP_REQUIRED",
          "본인에게 도착한 제안만 변경할 수 있습니다.",
        );
      }

      if (
        context.role === "hr" &&
        request.hrProfileId !== context.hrProfileId
      ) {
        serviceError(
          403,
          "REQUEST_OWNERSHIP_REQUIRED",
          "본인 학교가 보낸 제안만 변경할 수 있습니다.",
        );
      }

      if (requestedStatus === "archived") {
        if (context.role !== "teacher") {
          serviceError(
            403,
            "FORBIDDEN",
            "교사만 제안을 보관할 수 있습니다.",
          );
        }

        if (
          request.status === MatchStatus.HIRED ||
          request.status === MatchStatus.NOT_HIRED ||
          request.status === MatchStatus.CANCELLED
        ) {
          serviceError(
            409,
            "INVALID_REQUEST_TRANSITION",
            "현재 상태의 제안은 보관할 수 없습니다.",
          );
        }

        const meta = getRequestMeta(request.meta);
        await prisma.matchRequest.update({
          where: { id: request.id },
          data: {
            meta: toJsonObject({
              ...meta,
              teacherArchived: true,
            }),
          },
        });
        break;
      }

      const currentStatus = mapMatchStatusToRequestStatus(request.status);

      if (
        !canTransitionRequestStatus(
          context.role,
          currentStatus,
          requestedStatus,
        )
      ) {
        serviceError(
          409,
          "INVALID_REQUEST_TRANSITION",
          "현재 단계에서 요청한 제안 상태로 변경할 수 없습니다.",
        );
      }

      if (requestedStatus === "hired") {
        await finalizeRequestHire(request.id, context.userId);
      } else {
        const meta = getRequestMeta(request.meta);
        await prisma.matchRequest.update({
          where: { id: request.id },
          data: {
            meta: toJsonObject({
              ...meta,
              teacherArchived: false,
            }),
            status: mapRequestStatusToMatchStatus(requestedStatus),
          },
        });
      }
      break;
    }
    case "cancelPoolRequest": {
      const request = await resolveMatchRequestByDemoId(
        Number(payload.requestId ?? 0),
      );

      if (!request) {
        serviceError(404, "REQUEST_NOT_FOUND", "채용 제안을 찾을 수 없습니다.");
      }

      if (request.hrProfileId !== context.hrProfileId) {
        serviceError(
          403,
          "REQUEST_OWNERSHIP_REQUIRED",
          "본인 학교가 보낸 제안만 취소할 수 있습니다.",
        );
      }

      const currentStatus = mapMatchStatusToRequestStatus(request.status);

      if (
        !canTransitionRequestStatus(
          context.role,
          currentStatus,
          "cancelled",
        )
      ) {
        serviceError(
          409,
          "INVALID_REQUEST_TRANSITION",
          "현재 단계에서는 채용 제안을 취소할 수 없습니다.",
        );
      }

      const meta = getRequestMeta(request.meta);
      await prisma.matchRequest.update({
        where: { id: request.id },
        data: {
          meta: toJsonObject({
            ...meta,
            teacherArchived: false,
          }),
          status: MatchStatus.CANCELLED,
        },
      });
      break;
    }
    case "completePoolRequestHire": {
      const request = await resolveMatchRequestByDemoId(
        Number(payload.requestId ?? 0),
      );

      if (!request) {
        serviceError(404, "REQUEST_NOT_FOUND", "채용 제안을 찾을 수 없습니다.");
      }

      if (request.hrProfileId !== context.hrProfileId) {
        serviceError(
          403,
          "REQUEST_OWNERSHIP_REQUIRED",
          "본인 학교가 보낸 제안만 채용 확정할 수 있습니다.",
        );
      }

      const currentStatus = mapMatchStatusToRequestStatus(request.status);

      if (
        !canTransitionRequestStatus(context.role, currentStatus, "hired")
      ) {
        serviceError(
          409,
          "INVALID_REQUEST_TRANSITION",
          "교사가 수락한 제안만 채용 확정할 수 있습니다.",
        );
      }

      await finalizeRequestHire(request.id, context.userId);
      break;
    }
    case "scheduleInterviewForRequest": {
      const request = await resolveMatchRequestByDemoId(Number(payload.requestId ?? 0));

      if (!request) {
        serviceError(404, "REQUEST_NOT_FOUND", "채용 제안을 찾을 수 없습니다.");
      }

      if (request.hrProfileId !== context.hrProfileId) {
        serviceError(
          403,
          "REQUEST_OWNERSHIP_REQUIRED",
          "본인 학교가 보낸 제안만 변경할 수 있습니다.",
        );
      }

      if (
        request.status !== MatchStatus.ACCEPTED &&
        request.status !== MatchStatus.INTERVIEWING
      ) {
        serviceError(
          409,
          "INVALID_REQUEST_TRANSITION",
          "교사가 수락한 제안에만 면접 일정을 등록할 수 있습니다.",
        );
      }

      const interviewDate = readDate(payload.date, "면접일");
      assertTodayOrFuture(interviewDate, "면접일");
      const interviewTime = readNonEmptyString(
        payload,
        "time",
        "면접 시간",
        5,
      );

      if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(interviewTime)) {
        serviceError(
          422,
          "INVALID_INTERVIEW_TIME",
          "면접 시간을 올바르게 입력해 주세요.",
        );
      }

      const interview = {
        date: interviewDate.toISOString().slice(0, 10),
        note: readOptionalString(payload.note, 2000),
        place: readNonEmptyString(
          payload,
          "place",
          "면접 장소",
          300,
        ),
        sentAt: formatTimestamp(),
        time: interviewTime,
      };

      await prisma.matchRequest.update({
        where: { id: request.id },
        data: {
          interviewDate: new Date(
            `${interview.date}T${interview.time || "09:00"}:00.000Z`,
          ),
          interviewLocation: interview.place,
          interviewMemo: interview.note,
          status: MatchStatus.INTERVIEWING,
        },
      });
      break;
    }
    case "toggleInterestedTeacher": {
      if (!context.hrProfileId) {
        serviceError(403, "HR_ACCOUNT_REQUIRED", "학교 계정이 필요합니다.");
      }

      const teacherProfile = await resolveTeacherProfileByDemoId(
        Number(payload.teacherId ?? 0),
      );

      if (!teacherProfile) {
        serviceError(404, "TEACHER_NOT_FOUND", "교사 프로필을 찾을 수 없습니다.");
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
    case "updateTeacherVisibility": {
      if (!context.teacherProfileId) {
        serviceError(
          403,
          "TEACHER_ACCOUNT_REQUIRED",
          "교사 계정이 필요합니다.",
        );
      }

      const status = String(payload.status ?? "");

      if (!["seeking", "paused"].includes(status)) {
        serviceError(
          422,
          "INVALID_TEACHER_VISIBILITY",
          "인재풀 공개 상태 값이 올바르지 않습니다.",
        );
      }

      await prisma.teacherProfile.update({
        where: { id: context.teacherProfileId },
        data: {
          seekingStatus:
            status === "paused"
              ? SeekingStatus.NOT_SEEKING
              : SeekingStatus.SEEKING,
        },
      });
      break;
    }
    default:
      serviceError(
        400,
        "UNKNOWN_ACTION",
        "지원하지 않는 채용 변경 요청입니다.",
      );
  }
}

function normalizeEmail(value: string) {
  const email = value.trim().toLowerCase();

  if (
    email.length > 320 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    serviceError(
      422,
      "INVALID_EMAIL",
      "이메일 주소를 올바르게 입력해 주세요.",
    );
  }

  return email;
}

function validateRegistrationPassword(value: string) {
  if (
    typeof value !== "string" ||
    value.length < 8 ||
    value.length > 128 ||
    !/[A-Za-z]/.test(value) ||
    !/\d/.test(value)
  ) {
    serviceError(
      422,
      "WEAK_PASSWORD",
      "비밀번호는 영문과 숫자를 포함해 8자 이상 입력해 주세요.",
    );
  }

  return value;
}

function normalizeStringList(
  value: unknown,
  label: string,
  required = true,
) {
  if (!Array.isArray(value)) {
    if (required) {
      serviceError(
        422,
        "INVALID_INPUT",
        `${label}을(를) 한 개 이상 선택해 주세요.`,
      );
    }

    return [];
  }

  const items = [
    ...new Set(
      value
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ];

  if ((required && items.length === 0) || items.length > 30) {
    serviceError(
      422,
      "INVALID_INPUT",
      `${label} 선택값을 확인해 주세요.`,
    );
  }

  return items;
}

function mapQualificationGradeFromLabel(value: string) {
  return value.includes("1") || value === QualificationGrade.GRADE_1
    ? QualificationGrade.GRADE_1
    : QualificationGrade.GRADE_2;
}

function mapEducationLevelFromLabel(value?: string) {
  switch (value) {
    case "박사":
    case EducationLevel.DOCTOR:
      return EducationLevel.DOCTOR;
    case "석사":
    case EducationLevel.MASTER:
      return EducationLevel.MASTER;
    default:
      return EducationLevel.BACHELOR;
  }
}

async function getNextTeacherDemoId() {
  const result = await prisma.teacherProfile.aggregate({
    _max: { demoId: true },
  });

  return (result._max.demoId ?? 0) + 1;
}

async function getNextHrDemoId() {
  const result = await prisma.hRProfile.aggregate({
    _max: { demoId: true },
  });

  return (result._max.demoId ?? 0) + 1;
}

export async function registerTeacher(
  input: TeacherRegistrationInput,
): Promise<DemoSession> {
  await ensureDemoPlatformSeed();

  if (
    input.privacyConsent !== true ||
    input.termsConsent !== true ||
    input.thirdPartyConsent !== true
  ) {
    serviceError(
      422,
      "CONSENT_REQUIRED",
      "필수 동의 항목을 모두 확인해 주세요.",
    );
  }

  const email = normalizeEmail(input.email);

  if (isReservedDemoEmail(email)) {
    serviceError(
      409,
      "RESERVED_DEMO_EMAIL",
      "서비스에서 예약한 이메일은 가입에 사용할 수 없습니다.",
    );
  }

  const password = validateRegistrationPassword(input.password);
  const name = readNonEmptyString(
    input as unknown as Record<string, unknown>,
    "name",
    "이름",
    80,
  );
  const phone = readNonEmptyString(
    input as unknown as Record<string, unknown>,
    "phone",
    "휴대전화",
    30,
  );
  const birthDate = readDate(input.birthDate, "생년월일");
  const currentYear = new Date().getUTCFullYear();
  const age = currentYear - birthDate.getUTCFullYear();

  if (age < 18 || age > 80) {
    serviceError(
      422,
      "INVALID_BIRTH_DATE",
      "생년월일을 다시 확인해 주세요.",
    );
  }

  const preferredRegions = normalizeStringList(
    input.preferredRegions,
    "희망 지역",
  );
  const preferredTypes = normalizeStringList(
    input.preferredTypes,
    "희망 근무 형태",
  ).map(mapTeacherTypeFromLabel);
  const qualificationType = mapQualificationTypeFromLabel(
    readNonEmptyString(
      input as unknown as Record<string, unknown>,
      "qualificationType",
      "자격 유형",
      30,
    ),
  );
  const qualificationGrade = mapQualificationGradeFromLabel(
    readNonEmptyString(
      input as unknown as Record<string, unknown>,
      "qualificationGrade",
      "자격 급수",
      30,
    ),
  );
  const qualificationNumber = readNonEmptyString(
    input as unknown as Record<string, unknown>,
    "qualificationNumber",
    "자격증 번호",
    100,
  );
  const residenceRegion = readNonEmptyString(
    input as unknown as Record<string, unknown>,
    "residenceRegion",
    "거주 지역",
    100,
  );
  const university = readNonEmptyString(
    input as unknown as Record<string, unknown>,
    "university",
    "출신 대학",
    150,
  );
  const major = readNonEmptyString(
    input as unknown as Record<string, unknown>,
    "major",
    "전공",
    150,
  );
  const graduationYear =
    Number.isInteger(input.graduationYear) &&
    Number(input.graduationYear) >= 1950 &&
    Number(input.graduationYear) <= currentYear + 10
      ? Number(input.graduationYear)
      : birthDate.getUTCFullYear() + 22;
  const availableFrom = input.availableFrom
    ? readDate(input.availableFrom, "근무 가능일")
    : null;
  const careers = Array.isArray(input.careers) ? input.careers : [];
  const parsedCareers = careers.map((career, index) => {
    const record = career as unknown as Record<string, unknown>;
    const startDate = readDate(career.startDate, `경력 ${index + 1} 시작일`);
    const endDate = career.current
      ? null
      : readDate(career.endDate, `경력 ${index + 1} 종료일`, true);

    if (endDate) {
      assertDateOrder(startDate, endDate);
    }

    return {
      description: readOptionalString(career.description, 2000) || null,
      employmentType: mapTeacherTypeFromLabel(career.employmentType),
      endDate,
      position: readNonEmptyString(
        record,
        "role",
        `경력 ${index + 1} 담당 업무`,
        150,
      ),
      region: readOptionalString(career.region, 100) || null,
      schoolName: readNonEmptyString(
        record,
        "institutionName",
        `경력 ${index + 1} 기관명`,
        200,
      ),
      schoolType: readNonEmptyString(
        record,
        "institutionType",
        `경력 ${index + 1} 기관 유형`,
        80,
      ),
      startDate,
      subject: readOptionalString(career.subject, 100) || null,
    };
  });
  const totalExperienceMonths = parsedCareers.reduce((total, career) => {
    const endDate = career.endDate ?? new Date();
    const months = Math.max(
      0,
      (endDate.getUTCFullYear() - career.startDate.getUTCFullYear()) * 12 +
        endDate.getUTCMonth() -
        career.startDate.getUTCMonth(),
    );
    return total + months;
  }, 0);

  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existingUser) {
    serviceError(
      409,
      "EMAIL_ALREADY_REGISTERED",
      "이미 가입된 이메일입니다.",
    );
  }

  const now = new Date();
  const demoId = await getNextTeacherDemoId();
  const user = await prisma.$transaction(async (transaction) => {
    const createdUser = await transaction.user.create({
      data: {
        birthDate,
        email,
        isActive: true,
        isVerified: true,
        name,
        passwordHash: hashPassword(password),
        phone,
        privacyConsent: true,
        privacyConsentAt: now,
        role: UserRole.TEACHER,
        termsConsent: true,
        termsConsentAt: now,
        thirdPartyConsent: true,
        thirdPartyConsentAt: now,
        teacherProfile: {
          create: {
            availableFrom,
            avatarPreset: resolveAvatarPreset(input.avatarPreset),
            careers: {
              create: parsedCareers,
            },
            demoId,
            educationLevel: mapEducationLevelFromLabel(input.educationLevel),
            graduationYear,
            introduction: readOptionalString(input.introduction, 5000) || null,
            major,
            preferredRegions,
            preferredTypes,
            qualificationGrade,
            qualificationNumber,
            qualificationSubject:
              readOptionalString(input.qualificationSubject, 100) || null,
            qualificationType,
            reservationEnabled: input.reservationEnabled === true,
            residenceAddress:
              readOptionalString(input.residenceAddress, 300) || null,
            residenceRegion,
            seekingStatus: SeekingStatus.SEEKING,
            specialSkills:
              readOptionalString(input.specialSkills, 5000) || null,
            totalExperienceMonths: totalExperienceMonths % 12,
            totalExperienceYears: Math.floor(totalExperienceMonths / 12),
            university,
          },
        },
      },
      include: {
        teacherProfile: true,
      },
    });

    await transaction.activityLog.create({
      data: {
        action: "TEACHER_REGISTERED",
        entityId: createdUser.teacherProfile?.id ?? createdUser.id,
        entityType: "TeacherProfile",
        userId: createdUser.id,
      },
    });

    return createdUser;
  });

  const role: DemoUserRole = "teacher";

  return {
    avatarPreset: resolveAvatarPreset(user.teacherProfile?.avatarPreset),
    detail: user.teacherProfile
      ? getQualificationLabel(
          user.teacherProfile.qualificationType,
          user.teacherProfile.qualificationGrade,
          user.teacherProfile.qualificationSubject,
        )
      : "등록 교사",
    email: user.email,
    name: user.name,
    redirectTo: buildRedirectPath(role),
    role,
    userId: user.id,
  };
}

export async function registerHR(input: HRRegistrationInput) {
  await ensureDemoPlatformSeed();

  if (input.privacyConsent !== true || input.termsConsent !== true) {
    serviceError(
      422,
      "CONSENT_REQUIRED",
      "필수 동의 항목을 모두 확인해 주세요.",
    );
  }

  const email = normalizeEmail(input.email);

  if (isReservedDemoEmail(email)) {
    serviceError(
      409,
      "RESERVED_DEMO_EMAIL",
      "서비스에서 예약한 이메일은 가입에 사용할 수 없습니다.",
    );
  }

  const password = validateRegistrationPassword(input.password);
  const record = input as unknown as Record<string, unknown>;
  const birthDate = readDate(input.birthDate, "생년월일");
  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existingUser) {
    serviceError(
      409,
      "EMAIL_ALREADY_REGISTERED",
      "이미 가입된 이메일입니다.",
    );
  }

  const now = new Date();
  const demoId = await getNextHrDemoId();
  const user = await prisma.$transaction(async (transaction) => {
    const createdUser = await transaction.user.create({
      data: {
        birthDate,
        email,
        isActive: true,
        isVerified: false,
        name: readNonEmptyString(record, "name", "담당자 이름", 80),
        passwordHash: hashPassword(password),
        phone: readNonEmptyString(record, "phone", "휴대전화", 30),
        privacyConsent: true,
        privacyConsentAt: now,
        role: UserRole.HR_MANAGER,
        termsConsent: true,
        termsConsentAt: now,
        hrProfile: {
          create: {
            approvalStatus: ApprovalStatus.PENDING,
            department: readOptionalString(input.department, 100) || null,
            demoId,
            position: readNonEmptyString(record, "position", "직위", 100),
            schoolAddress: readNonEmptyString(
              record,
              "schoolAddress",
              "학교 주소",
              300,
            ),
            schoolCode: readNonEmptyString(
              record,
              "schoolCode",
              "학교 코드",
              100,
            ),
            schoolName: readNonEmptyString(
              record,
              "schoolName",
              "학교명",
              200,
            ),
            schoolRegion: readNonEmptyString(
              record,
              "schoolRegion",
              "학교 지역",
              100,
            ),
            schoolType: readNonEmptyString(
              record,
              "schoolType",
              "학교 유형",
              80,
            ),
            verificationCode: readNonEmptyString(
              record,
              "verificationCode",
              "가입 인증번호",
              100,
            ),
          },
        },
      },
      include: {
        hrProfile: true,
      },
    });

    await transaction.activityLog.create({
      data: {
        action: "HR_REGISTRATION_REQUESTED",
        entityId: createdUser.hrProfile?.id ?? createdUser.id,
        entityType: "HRProfile",
        userId: createdUser.id,
      },
    });

    return createdUser;
  });

  return {
    email: user.email,
    id: user.hrProfile?.id,
    status: "pending" as const,
  };
}

export async function listHrApprovals(session: DemoSession | null) {
  const context = await getSessionContext(session);

  if (context.role !== "admin") {
    serviceError(
      context.role === "guest" ? 401 : 403,
      context.role === "guest" ? "AUTHENTICATION_REQUIRED" : "FORBIDDEN",
      "관리자만 학교 계정 신청을 조회할 수 있습니다.",
    );
  }

  const profiles = await prisma.hRProfile.findMany({
    include: {
      user: {
        select: {
          createdAt: true,
          email: true,
          name: true,
          phone: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return profiles.map((profile) => ({
    createdAt: profile.createdAt.toISOString(),
    department: profile.department,
    email: profile.user.email,
    id: profile.id,
    name: profile.user.name,
    phone: profile.user.phone,
    position: profile.position,
    rejectionReason: profile.rejectionReason,
    schoolAddress: profile.schoolAddress,
    schoolCode: profile.schoolCode,
    schoolName: profile.schoolName,
    schoolRegion: profile.schoolRegion,
    schoolType: profile.schoolType,
    status: profile.approvalStatus.toLowerCase(),
    verificationCode: profile.verificationCode,
  }));
}

export async function decideHrApproval(
  session: DemoSession | null,
  profileId: string,
  decision: "approve" | "reject",
  rejectionReason?: string,
) {
  const context = await getSessionContext(session);

  if (context.role !== "admin" || !context.userId) {
    serviceError(
      context.role === "guest" ? 401 : 403,
      context.role === "guest" ? "AUTHENTICATION_REQUIRED" : "FORBIDDEN",
      "관리자만 학교 계정 신청을 처리할 수 있습니다.",
    );
  }
  const actorUserId = context.userId;

  if (decision !== "approve" && decision !== "reject") {
    serviceError(
      422,
      "INVALID_APPROVAL_DECISION",
      "승인 또는 반려 결정을 선택해 주세요.",
    );
  }

  const reason = readOptionalString(rejectionReason, 1000);

  if (decision === "reject" && !reason) {
    serviceError(
      422,
      "REJECTION_REASON_REQUIRED",
      "반려 사유를 입력해 주세요.",
    );
  }

  const profile = await prisma.hRProfile.findUnique({
    where: { id: profileId },
    include: { user: true },
  });

  if (!profile) {
    serviceError(
      404,
      "HR_APPLICATION_NOT_FOUND",
      "학교 계정 신청을 찾을 수 없습니다.",
    );
  }

  const nextStatus =
    decision === "approve"
      ? ApprovalStatus.APPROVED
      : ApprovalStatus.REJECTED;
  const statusChanged = profile.approvalStatus !== nextStatus;
  const now = new Date();

  await prisma.$transaction(async (transaction) => {
    await transaction.hRProfile.update({
      where: { id: profile.id },
      data: {
        approvalStatus: nextStatus,
        approvedAt: decision === "approve" ? now : null,
        approvedBy: actorUserId,
        rejectionReason: decision === "reject" ? reason : null,
      },
    });
    await transaction.user.update({
      where: { id: profile.userId },
      data: { isVerified: decision === "approve" },
    });

    if (statusChanged) {
      await transaction.notification.create({
        data: {
          message:
            decision === "approve"
              ? "학교 담당자 계정이 승인되었습니다. 이제 로그인할 수 있습니다."
              : `학교 담당자 계정 신청이 반려되었습니다. 사유: ${reason}`,
          title:
            decision === "approve"
              ? "학교 계정 승인"
              : "학교 계정 반려",
          type:
            decision === "approve"
              ? NotificationType.HR_ACCOUNT_APPROVED
              : NotificationType.HR_ACCOUNT_REJECTED,
          userId: profile.userId,
        },
      });
      await transaction.activityLog.create({
        data: {
          action:
            decision === "approve"
              ? "HR_ACCOUNT_APPROVED"
              : "HR_ACCOUNT_REJECTED",
          entityId: profile.id,
          entityType: "HRProfile",
          userId: actorUserId,
        },
      });
    }
  });

  return {
    id: profile.id,
    status: nextStatus.toLowerCase(),
  };
}

export async function submitTeacherReview(
  session: DemoSession | null,
  input: {
    comment?: string;
    contractId?: string;
    rating: number;
    teacherId?: number;
  },
) {
  const context = await getSessionContext(session);

  if (context.role !== "hr" || !context.hrProfileId || !context.userId) {
    serviceError(
      context.role === "guest" ? 401 : 403,
      context.role === "guest" ? "AUTHENTICATION_REQUIRED" : "FORBIDDEN",
      "승인된 학교 담당자만 평가를 제출할 수 있습니다.",
    );
  }
  const actorUserId = context.userId;
  const hrProfileId = context.hrProfileId;

  if (!Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5) {
    serviceError(
      422,
      "INVALID_RATING",
      "별점은 1점부터 5점까지 선택해 주세요.",
    );
  }

  const comment = readOptionalString(input.comment, 3000);
  const contract = await prisma.contract.findFirst({
    where: {
      ...(input.contractId
        ? { id: input.contractId }
        : input.teacherId
          ? {
              teacherProfile: {
                demoId: input.teacherId,
              },
            }
          : { id: "__missing_contract__" }),
      hrProfileId,
      status: {
        in: [ContractStatus.ACTIVE, ContractStatus.COMPLETED],
      },
    },
    include: {
      application: true,
      matchRequest: true,
      teacherProfile: {
        include: {
          user: {
            select: { name: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  if (
    !contract ||
    (contract.application?.status !== MatchStatus.HIRED &&
      contract.matchRequest?.status !== MatchStatus.HIRED)
  ) {
    serviceError(
      403,
      "HIRED_RELATIONSHIP_REQUIRED",
      "채용 확정 및 계약 관계가 확인된 교사만 평가할 수 있습니다.",
    );
  }

  const review = await prisma.$transaction(async (transaction) => {
    const savedReview = await transaction.review.upsert({
      where: { contractId: contract.id },
      create: {
        comment: comment || null,
        contractId: contract.id,
        hrProfileId,
        rating: input.rating,
        teacherProfileId: contract.teacherProfileId,
      },
      update: {
        comment: comment || null,
        rating: input.rating,
      },
    });

    await transaction.activityLog.create({
      data: {
        action: "TEACHER_REVIEW_SUBMITTED",
        entityId: savedReview.id,
        entityType: "Review",
        userId: actorUserId,
      },
    });

    return savedReview;
  });

  return {
    id: review.id,
    submittedAt: review.updatedAt.toISOString(),
  };
}

export async function listTeacherReviews(session: DemoSession | null) {
  const context = await getSessionContext(session);

  if (context.role !== "admin") {
    serviceError(
      context.role === "guest" ? 401 : 403,
      context.role === "guest" ? "AUTHENTICATION_REQUIRED" : "FORBIDDEN",
      "관리자만 교사 평가를 조회할 수 있습니다.",
    );
  }

  const reviews = await prisma.review.findMany({
    include: {
      contract: true,
      hrProfile: {
        include: {
          user: {
            select: { name: true },
          },
        },
      },
      teacherProfile: {
        include: {
          user: {
            select: {
              email: true,
              name: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  const aggregateByTeacher = new Map<
    string,
    { averageRating: number; reviewCount: number }
  >();

  for (const review of reviews) {
    const current = aggregateByTeacher.get(review.teacherProfileId) ?? {
      averageRating: 0,
      reviewCount: 0,
    };
    const nextCount = current.reviewCount + 1;
    aggregateByTeacher.set(review.teacherProfileId, {
      averageRating:
        (current.averageRating * current.reviewCount + review.rating) /
        nextCount,
      reviewCount: nextCount,
    });
  }

  return reviews.map((review) => ({
    comment: review.comment,
    contract: {
      endDate: review.contract.endDate.toISOString().slice(0, 10),
      id: review.contract.id,
      schoolName: review.contract.schoolName,
      startDate: review.contract.startDate.toISOString().slice(0, 10),
    },
    createdAt: review.createdAt.toISOString(),
    hr: {
      id: review.hrProfileId,
      name: review.hrProfile.user.name,
      schoolName: review.hrProfile.schoolName,
    },
    id: review.id,
    rating: review.rating,
    teacher: {
      demoId: review.teacherProfile.demoId,
      email: review.teacherProfile.user.email,
      id: review.teacherProfileId,
      name: review.teacherProfile.user.name,
      ...aggregateByTeacher.get(review.teacherProfileId),
    },
    updatedAt: review.updatedAt.toISOString(),
  }));
}

export async function authenticateUser(
  email: string,
  password: string,
) {
  await ensureDemoPlatformSeed();
  const normalizedEmail = email.trim().toLowerCase();

  if (
    !isDemoSeedEnabled() &&
    isReservedDemoEmail(normalizedEmail)
  ) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    include: {
      hrProfile: true,
      teacherProfile: true,
    },
  });

  if (!user || !verifyPassword(password, user.passwordHash)) {
    return null;
  }

  if (!user.isActive) {
    serviceError(
      403,
      "ACCOUNT_DISABLED",
      "비활성화된 계정입니다. 관리자에게 문의해 주세요.",
    );
  }

  const role = buildSessionRole(user.role);

  if (role === "hr") {
    if (user.hrProfile?.approvalStatus === ApprovalStatus.PENDING) {
      serviceError(
        403,
        "HR_APPROVAL_PENDING",
        "학교 계정 승인 검토가 진행 중입니다.",
      );
    }

    if (user.hrProfile?.approvalStatus === ApprovalStatus.REJECTED) {
      serviceError(
        403,
        "HR_APPROVAL_REJECTED",
        user.hrProfile.rejectionReason
          ? `학교 계정 신청이 반려되었습니다: ${user.hrProfile.rejectionReason}`
          : "학교 계정 신청이 반려되었습니다.",
      );
    }
  }

  if (!user.isVerified) {
    serviceError(
      403,
      "ACCOUNT_NOT_VERIFIED",
      "계정 확인이 완료되지 않았습니다.",
    );
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });
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
    userId: user.id,
  } satisfies DemoSession;
}
