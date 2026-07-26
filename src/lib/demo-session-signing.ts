import "server-only";

import {
  createHmac,
  timingSafeEqual,
} from "node:crypto";

import {
  DEMO_SESSION_MAX_AGE_SECONDS,
  getSafePostLoginRedirect,
  parseDemoUserRole,
  type DemoSession,
} from "@/lib/demo-session";

const TOKEN_VERSION = 1;
const CLOCK_SKEW_SECONDS = 30;
const DEVELOPMENT_SECRET =
  "edulink-local-development-session-secret-change-before-production";

interface SessionClaims extends DemoSession {
  exp: number;
  iat: number;
  v: typeof TOKEN_VERSION;
}

function getSessionSecret() {
  const secret =
    process.env.EDULINK_SESSION_SECRET?.trim() ||
    process.env.AUTH_SECRET?.trim() ||
    process.env.NEXTAUTH_SECRET?.trim();

  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error(
      "EDULINK_SESSION_SECRET 환경 변수가 운영 환경에 설정되어 있지 않습니다.",
    );
  }

  const resolved = secret || DEVELOPMENT_SECRET;

  if (
    resolved.length < 32 ||
    (process.env.NODE_ENV === "production" &&
      (resolved.length < 48 ||
        resolved === "replace-with-a-long-random-secret"))
  ) {
    throw new Error(
      process.env.NODE_ENV === "production"
        ? "운영 세션 서명 키는 예측 불가능한 48자 이상의 값이어야 합니다."
        : "세션 서명 키는 32자 이상이어야 합니다.",
    );
  }

  return resolved;
}

function signPayload(encodedPayload: string) {
  return createHmac("sha256", getSessionSecret())
    .update(encodedPayload)
    .digest("base64url");
}

function isSafeText(value: unknown, maxLength: number) {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.length <= maxLength &&
    !/[\u0000-\u001f\u007f]/.test(value)
  );
}

export function signDemoSession(
  session: DemoSession,
  now = Date.now(),
  maxAgeSeconds = DEMO_SESSION_MAX_AGE_SECONDS,
) {
  const issuedAt = Math.floor(now / 1000);
  const claims: SessionClaims = {
    ...session,
    redirectTo: getSafePostLoginRedirect(session.role, session.redirectTo),
    exp: issuedAt + maxAgeSeconds,
    iat: issuedAt,
    v: TOKEN_VERSION,
  };
  const encodedPayload = Buffer.from(JSON.stringify(claims)).toString(
    "base64url",
  );

  return `${encodedPayload}.${signPayload(encodedPayload)}`;
}

export function verifyDemoSessionToken(
  token?: string | null,
  now = Date.now(),
): DemoSession | null {
  if (!token || token.length > 8192) {
    return null;
  }

  const [encodedPayload, encodedSignature, extra] = token.split(".");

  if (!encodedPayload || !encodedSignature || extra) {
    return null;
  }

  const expectedSignature = Buffer.from(
    signPayload(encodedPayload),
    "base64url",
  );
  const providedSignature = Buffer.from(encodedSignature, "base64url");

  if (
    providedSignature.toString("base64url") !== encodedSignature ||
    expectedSignature.length !== providedSignature.length ||
    !timingSafeEqual(expectedSignature, providedSignature)
  ) {
    return null;
  }

  try {
    const claims = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8"),
    ) as Partial<SessionClaims>;
    const role = parseDemoUserRole(claims.role);
    const nowSeconds = Math.floor(now / 1000);

    if (
      claims.v !== TOKEN_VERSION ||
      !role ||
      !Number.isInteger(claims.iat) ||
      !Number.isInteger(claims.exp) ||
      Number(claims.iat) > nowSeconds + CLOCK_SKEW_SECONDS ||
      Number(claims.exp) <= nowSeconds ||
      Number(claims.exp) - Number(claims.iat) >
        DEMO_SESSION_MAX_AGE_SECONDS ||
      !isSafeText(claims.userId, 191) ||
      !isSafeText(claims.email, 320) ||
      !isSafeText(claims.name, 120)
    ) {
      return null;
    }

    return {
      avatarPreset: claims.avatarPreset,
      detail:
        typeof claims.detail === "string"
          ? claims.detail.slice(0, 160)
          : undefined,
      email: String(claims.email),
      name: String(claims.name),
      redirectTo: getSafePostLoginRedirect(role, claims.redirectTo),
      role,
      userId: String(claims.userId),
    };
  } catch {
    return null;
  }
}
