import "dotenv/config";

import { randomBytes, scryptSync } from "node:crypto";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, UserRole } from "@prisma/client";

// Runs once per deploy/start as part of `npm start` (see package.json).
// Designed to NEVER fail the deploy: any misconfiguration or error is
// logged and swallowed so `next start` always still runs afterward.
//
// Both steps below are opt-in only and never overwrite an existing
// account/record — they only create rows that don't exist yet.

async function bootstrapAdmin() {
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

  if (password.length < 1) {
    console.warn("[deploy-bootstrap] EDULINK_BOOTSTRAP_ADMIN_PASSWORD is required, skipping.");
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

function seedDummyData() {
  if (process.env.EDULINK_AUTO_SEED_DUMMY_DATA !== "true") {
    return;
  }

  if (!process.env.DATABASE_URL?.trim()) {
    console.warn("[deploy-bootstrap] DATABASE_URL missing, skipping dummy data seed.");
    return;
  }

  console.log("[deploy-bootstrap] EDULINK_AUTO_SEED_DUMMY_DATA=true, seeding dummy data...");

  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  const seedScript = path.join(scriptDir, "seed-dummy-data.mjs");

  const result = spawnSync(process.execPath, [seedScript], {
    env: {
      ...process.env,
      EDULINK_SEED_ALLOW_PRODUCTION: "true",
      EDULINK_SEED_CONFIRM: "SEED_EDULINK_DUMMY_DATA",
    },
    stdio: "inherit",
  });

  if (result.error || result.status !== 0) {
    console.error(
      "[deploy-bootstrap] Dummy data seed did not complete successfully, continuing startup.",
      result.error ?? `exit code ${result.status}`,
    );
  }
}

async function main() {
  await bootstrapAdmin();
  seedDummyData();
}

main().catch((error) => {
  console.error("[deploy-bootstrap] Unexpected failure, continuing startup:", error);
});
