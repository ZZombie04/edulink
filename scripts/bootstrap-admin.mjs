import "dotenv/config";

import { randomBytes, scryptSync } from "node:crypto";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, UserRole } from "@prisma/client";

const databaseUrl = process.env.DATABASE_URL?.trim();
const email = process.env.EDULINK_BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.EDULINK_BOOTSTRAP_ADMIN_PASSWORD ?? "";
const name = process.env.EDULINK_BOOTSTRAP_ADMIN_NAME?.trim() ?? "";
const phone = process.env.EDULINK_BOOTSTRAP_ADMIN_PHONE?.trim() ?? "";
const confirmation = process.env.EDULINK_BOOTSTRAP_CONFIRM;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required.");
}

if (confirmation !== "CREATE_EDULINK_SUPER_ADMIN") {
  throw new Error(
    "Set EDULINK_BOOTSTRAP_CONFIRM=CREATE_EDULINK_SUPER_ADMIN to confirm this one-time operation.",
  );
}

if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  throw new Error("EDULINK_BOOTSTRAP_ADMIN_EMAIL must be a valid email.");
}

if (password.length < 16) {
  throw new Error(
    "EDULINK_BOOTSTRAP_ADMIN_PASSWORD must contain at least 16 characters.",
  );
}

if (!name || name.length > 80) {
  throw new Error(
    "EDULINK_BOOTSTRAP_ADMIN_NAME is required and must be at most 80 characters.",
  );
}

if (!/^01\d-\d{3,4}-\d{4}$/.test(phone)) {
  throw new Error(
    "EDULINK_BOOTSTRAP_ADMIN_PHONE must use a Korean mobile format such as 010-1234-5678.",
  );
}

const salt = randomBytes(16).toString("hex");
const passwordHash = `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
const adapter = new PrismaPg({ connectionString: databaseUrl });
const prisma = new PrismaClient({ adapter });

try {
  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true, role: true },
  });

  if (existing) {
    throw new Error(
      `A user already exists for ${email}; refusing to overwrite credentials.`,
    );
  }

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
    select: { email: true, id: true, role: true },
  });

  console.log(
    `Created ${admin.role} ${admin.email} (${admin.id}). The password was not printed.`,
  );
} finally {
  await prisma.$disconnect();
}
