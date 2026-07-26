-- AlterTable
ALTER TABLE "users" ADD COLUMN     "thirdPartyConsent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "thirdPartyConsentAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "teacher_profiles" ADD COLUMN     "availableFrom" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "careers" ADD COLUMN     "region" TEXT;

-- AlterTable
ALTER TABLE "contracts" ADD COLUMN     "applicationId" TEXT;

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "teacherProfileId" TEXT NOT NULL,
    "hrProfileId" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "reviews_rating_range" CHECK ("rating" BETWEEN 1 AND 5)
);

-- CreateIndex
CREATE UNIQUE INDEX "reviews_contractId_key" ON "reviews"("contractId");

-- CreateIndex
CREATE INDEX "reviews_teacherProfileId_createdAt_idx" ON "reviews"("teacherProfileId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "reviews_hrProfileId_createdAt_idx" ON "reviews"("hrProfileId", "createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "contracts_applicationId_key" ON "contracts"("applicationId");

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "applications"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_teacherProfileId_fkey" FOREIGN KEY ("teacherProfileId") REFERENCES "teacher_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_hrProfileId_fkey" FOREIGN KEY ("hrProfileId") REFERENCES "hr_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "contracts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
