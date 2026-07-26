-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('TEACHER', 'HR_MANAGER', 'EDU_ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "QualificationType" AS ENUM ('ELEMENTARY', 'SECONDARY', 'SPECIAL');

-- CreateEnum
CREATE TYPE "QualificationGrade" AS ENUM ('GRADE_1', 'GRADE_2');

-- CreateEnum
CREATE TYPE "EducationLevel" AS ENUM ('BACHELOR', 'MASTER', 'DOCTOR');

-- CreateEnum
CREATE TYPE "SeekingStatus" AS ENUM ('SEEKING', 'INTERVIEWING', 'EMPLOYED', 'NOT_SEEKING', 'RESERVED');

-- CreateEnum
CREATE TYPE "TeacherType" AS ENUM ('FIXED_TERM', 'PART_TIME');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "MatchDirection" AS ENUM ('HR_TO_TEACHER', 'TEACHER_TO_HR');

-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'INTERVIEWING', 'HIRED', 'NOT_HIRED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "PostingStatus" AS ENUM ('OPEN', 'CLOSED', 'FILLED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ContractStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'TERMINATED');

-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'CONVERTED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('MATCH_REQUEST', 'MATCH_ACCEPTED', 'MATCH_REJECTED', 'INTERVIEW_SCHEDULED', 'HIRED', 'NOT_HIRED', 'CONTRACT_TERMINATED', 'CONTRACT_EXPIRING_SOON', 'RESERVATION_REQUEST', 'RESERVATION_ACCEPTED', 'JOB_POSTING_NEW', 'APPLICATION_RECEIVED', 'HR_ACCOUNT_APPROVED', 'HR_ACCOUNT_REJECTED', 'SYSTEM_NOTICE');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "privacyConsent" BOOLEAN NOT NULL DEFAULT false,
    "privacyConsentAt" TIMESTAMP(3),
    "termsConsent" BOOLEAN NOT NULL DEFAULT false,
    "termsConsentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLoginAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teacher_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "demoId" INTEGER,
    "qualificationType" "QualificationType" NOT NULL,
    "qualificationGrade" "QualificationGrade" NOT NULL,
    "qualificationSubject" TEXT,
    "qualificationNumber" TEXT NOT NULL,
    "qualificationFileUrl" TEXT,
    "totalExperienceYears" INTEGER NOT NULL DEFAULT 0,
    "totalExperienceMonths" INTEGER NOT NULL DEFAULT 0,
    "university" TEXT NOT NULL,
    "major" TEXT NOT NULL,
    "graduationYear" INTEGER NOT NULL,
    "educationLevel" "EducationLevel" NOT NULL,
    "residenceRegion" TEXT NOT NULL,
    "residenceAddress" TEXT,
    "preferredRegions" TEXT[],
    "avatarPreset" TEXT NOT NULL DEFAULT 'teacher-f-rose',
    "seekingStatus" "SeekingStatus" NOT NULL DEFAULT 'SEEKING',
    "reservationEnabled" BOOLEAN NOT NULL DEFAULT false,
    "introduction" TEXT,
    "specialSkills" TEXT,
    "preferredTypes" "TeacherType"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teacher_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "careers" (
    "id" TEXT NOT NULL,
    "teacherProfileId" TEXT NOT NULL,
    "schoolName" TEXT NOT NULL,
    "schoolType" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "subject" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "employmentType" "TeacherType" NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "careers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "demoId" INTEGER,
    "schoolName" TEXT NOT NULL,
    "schoolCode" TEXT NOT NULL,
    "schoolType" TEXT NOT NULL,
    "schoolRegion" TEXT NOT NULL,
    "schoolAddress" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "department" TEXT,
    "verificationCode" TEXT NOT NULL,
    "approvalStatus" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hr_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_requests" (
    "id" TEXT NOT NULL,
    "demoId" INTEGER,
    "hrProfileId" TEXT NOT NULL,
    "teacherProfileId" TEXT NOT NULL,
    "direction" "MatchDirection" NOT NULL,
    "status" "MatchStatus" NOT NULL DEFAULT 'PENDING',
    "employmentType" "TeacherType" NOT NULL,
    "expectedPeriod" TEXT,
    "message" TEXT,
    "meta" JSONB,
    "interviewDate" TIMESTAMP(3),
    "interviewLocation" TEXT,
    "interviewMemo" TEXT,
    "resultMessage" TEXT,
    "jobPostingId" TEXT,
    "contractId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "match_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_postings" (
    "id" TEXT NOT NULL,
    "hrProfileId" TEXT NOT NULL,
    "externalId" TEXT,
    "schoolName" TEXT NOT NULL,
    "schoolRegion" TEXT NOT NULL,
    "employmentType" "TeacherType" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "qualificationType" "QualificationType",
    "qualificationSubject" TEXT,
    "gradeLevel" TEXT,
    "isHomeroom" BOOLEAN NOT NULL DEFAULT false,
    "duties" TEXT,
    "memo" TEXT,
    "meta" JSONB,
    "postingStatus" "PostingStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "closedAt" TIMESTAMP(3),

    CONSTRAINT "job_postings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applications" (
    "id" TEXT NOT NULL,
    "demoId" INTEGER,
    "teacherProfileId" TEXT NOT NULL,
    "jobPostingId" TEXT NOT NULL,
    "status" "MatchStatus" NOT NULL DEFAULT 'PENDING',
    "coverLetter" TEXT,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contracts" (
    "id" TEXT NOT NULL,
    "teacherProfileId" TEXT NOT NULL,
    "hrProfileId" TEXT NOT NULL,
    "schoolName" TEXT NOT NULL,
    "employmentType" "TeacherType" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "ContractStatus" NOT NULL DEFAULT 'ACTIVE',
    "welcomeMessage" TEXT,
    "requiredDocs" TEXT,
    "reportDate" TIMESTAMP(3),
    "terminatedAt" TIMESTAMP(3),
    "terminationReason" TEXT,
    "terminatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservations" (
    "id" TEXT NOT NULL,
    "teacherProfileId" TEXT NOT NULL,
    "hrProfileId" TEXT NOT NULL,
    "status" "ReservationStatus" NOT NULL DEFAULT 'PENDING',
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reservations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_codes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "usedBy" TEXT,
    "issuedBy" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usedAt" TIMESTAMP(3),

    CONSTRAINT "verification_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_isActive_idx" ON "users"("role", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "teacher_profiles_userId_key" ON "teacher_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "teacher_profiles_demoId_key" ON "teacher_profiles"("demoId");

-- CreateIndex
CREATE INDEX "teacher_profiles_seekingStatus_idx" ON "teacher_profiles"("seekingStatus");

-- CreateIndex
CREATE INDEX "teacher_profiles_preferredRegions_idx" ON "teacher_profiles"("preferredRegions");

-- CreateIndex
CREATE UNIQUE INDEX "hr_profiles_userId_key" ON "hr_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "hr_profiles_demoId_key" ON "hr_profiles"("demoId");

-- CreateIndex
CREATE INDEX "hr_profiles_approvalStatus_idx" ON "hr_profiles"("approvalStatus");

-- CreateIndex
CREATE INDEX "hr_profiles_schoolRegion_idx" ON "hr_profiles"("schoolRegion");

-- CreateIndex
CREATE UNIQUE INDEX "match_requests_demoId_key" ON "match_requests"("demoId");

-- CreateIndex
CREATE UNIQUE INDEX "match_requests_contractId_key" ON "match_requests"("contractId");

-- CreateIndex
CREATE INDEX "match_requests_hrProfileId_status_idx" ON "match_requests"("hrProfileId", "status");

-- CreateIndex
CREATE INDEX "match_requests_teacherProfileId_status_idx" ON "match_requests"("teacherProfileId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "job_postings_externalId_key" ON "job_postings"("externalId");

-- CreateIndex
CREATE INDEX "job_postings_postingStatus_schoolRegion_idx" ON "job_postings"("postingStatus", "schoolRegion");

-- CreateIndex
CREATE INDEX "job_postings_employmentType_idx" ON "job_postings"("employmentType");

-- CreateIndex
CREATE UNIQUE INDEX "applications_demoId_key" ON "applications"("demoId");

-- CreateIndex
CREATE UNIQUE INDEX "applications_teacherProfileId_jobPostingId_key" ON "applications"("teacherProfileId", "jobPostingId");

-- CreateIndex
CREATE INDEX "contracts_teacherProfileId_status_idx" ON "contracts"("teacherProfileId", "status");

-- CreateIndex
CREATE INDEX "contracts_endDate_idx" ON "contracts"("endDate");

-- CreateIndex
CREATE UNIQUE INDEX "reservations_teacherProfileId_hrProfileId_key" ON "reservations"("teacherProfileId", "hrProfileId");

-- CreateIndex
CREATE INDEX "notifications_userId_isRead_createdAt_idx" ON "notifications"("userId", "isRead", "createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "verification_codes_code_key" ON "verification_codes"("code");

-- CreateIndex
CREATE INDEX "verification_codes_code_isUsed_idx" ON "verification_codes"("code", "isUsed");

-- CreateIndex
CREATE INDEX "activity_logs_userId_createdAt_idx" ON "activity_logs"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "activity_logs_entityType_entityId_idx" ON "activity_logs"("entityType", "entityId");

-- AddForeignKey
ALTER TABLE "teacher_profiles" ADD CONSTRAINT "teacher_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "careers" ADD CONSTRAINT "careers_teacherProfileId_fkey" FOREIGN KEY ("teacherProfileId") REFERENCES "teacher_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr_profiles" ADD CONSTRAINT "hr_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_requests" ADD CONSTRAINT "match_requests_hrProfileId_fkey" FOREIGN KEY ("hrProfileId") REFERENCES "hr_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_requests" ADD CONSTRAINT "match_requests_teacherProfileId_fkey" FOREIGN KEY ("teacherProfileId") REFERENCES "teacher_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_requests" ADD CONSTRAINT "match_requests_jobPostingId_fkey" FOREIGN KEY ("jobPostingId") REFERENCES "job_postings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_requests" ADD CONSTRAINT "match_requests_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "contracts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_postings" ADD CONSTRAINT "job_postings_hrProfileId_fkey" FOREIGN KEY ("hrProfileId") REFERENCES "hr_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_teacherProfileId_fkey" FOREIGN KEY ("teacherProfileId") REFERENCES "teacher_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_jobPostingId_fkey" FOREIGN KEY ("jobPostingId") REFERENCES "job_postings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_teacherProfileId_fkey" FOREIGN KEY ("teacherProfileId") REFERENCES "teacher_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_hrProfileId_fkey" FOREIGN KEY ("hrProfileId") REFERENCES "hr_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_teacherProfileId_fkey" FOREIGN KEY ("teacherProfileId") REFERENCES "teacher_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_hrProfileId_fkey" FOREIGN KEY ("hrProfileId") REFERENCES "hr_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
