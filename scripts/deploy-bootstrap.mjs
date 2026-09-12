import "dotenv/config";

import { randomBytes, scryptSync } from "node:crypto";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, UserRole } from "@prisma/client";

// Runs once per deploy/start as part of `npm start` (see package.json).
// Designed to NEVER fail the deploy: any misconfiguration or error is
// logged and swallowed so `next start` always still runs afterward.
//
// Opt-in only. Does nothing unless EDULINK_AUTO_BOOTSTRAP_ADMIN="true" and
// the EDULINK_BOOTSTRAP_ADMIN_* variables are set on the host (Railway,
// etc.). Never overwrites an existing account.

async function main() {
  if (process.env.EDULINK_AUTO_BOOTSTRAP_ADMIN !== "true") {
    return;
  }

  const databaseUrl = process.env.DATABASE_URL?.trim();
  const email = process.env.EDULINK_BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.EDULINK_BOOTSTRAP_ADMIN_PASSWORD ?? "";
  const name = process.env.EDULINK_BOOTSTRAP_ADMIN_NAME?.trim() ?? "";
  const phone = process.env.EDULINK_BOOTSTRAP_ADMIN_PHONE?.trim() ?? "";

  if (!databaseUrl) {
    console.warn("[deploy-bootstrap] DATABASE_URL missing, skipping admin bootstrap.");
    return;
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.warn("[deploy-bootstrap] EDULINK_BOOTSTRAP_ADMIN_EMAIL invalid, skipping.");
    return;
  }

  if (password.length < 16) {
    console.warn(
      "[deploy-bootstrap] EDULINK_BOOTSTRAP_ADMIN_PASSWORD must be at least 16 characters, skipping.",
    );
    return;
  }

  if (!name || name.length > 80) {
    console.warn("[deploy-bootstrap] EDULINK_BOOTSTRAP_ADMIN_NAME invalid, skipping.");
    return;
  }

  if (!/^01\d-\d{3,4}-\d{4}$/.test(phone)) {
    console.warn("[deploy-bootstrap] EDULINK_BOOTSTRAP_ADMIN_PHONE invalid, skipping.");
    return;
  }

  const adapter = new PrismaPg({ connectionString: databaseUrl });
  const prisma = new PrismaClient({ adapter });

  try {
    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existing) {
      console.log(`[deploy-bootstrap] ${email} already exists, skipping.`);
      return;
    }

    const salt = randomBytes(16).toString("hex");
    const passwordHash = `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
    const now = new Date();

    const admin = await prisma.user.create({
      data: {
        birthDate: new Date("1970-01-01T00:00:00.000Z"),
        email,
        isActive: true,
        isVerified: true,
        name,
        passwordHash,
        phone,
        privacyConsent: true,
        privacyConsentAt: now,
        role: UserRole.SUPER_ADMIN,
        termsConsent: true,
        termsConsentAt: now,
        thirdPartyConsent: false,
      },
      select: { email: true, id: true },
    });

    console.log(`[deploy-bootstrap] Created SUPER_ADMIN ${admin.email} (${admin.id}).`);
  } catch (error) {
    console.error("[deploy-bootstrap] Skipping admin bootstrap after error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("[deploy-bootstrap] Unexpected failure, continuing startup:", error);
});
