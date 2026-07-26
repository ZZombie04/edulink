import { beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

beforeAll(() => {
  process.env.EDULINK_SESSION_SECRET =
    "test-only-edulink-session-secret-with-at-least-32-characters";
});

describe("signed session tokens", () => {
  it("round-trips a valid signed session", async () => {
    const { signDemoSession, verifyDemoSessionToken } = await import(
      "../src/lib/demo-session-signing"
    );
    const now = Date.UTC(2026, 6, 26, 1, 0, 0);
    const token = signDemoSession(
      {
        email: "teacher@example.com",
        name: "테스트 교사",
        redirectTo: "/teacher/dashboard",
        role: "teacher",
        userId: "user_1",
      },
      now,
    );

    expect(verifyDemoSessionToken(token, now + 1_000)).toMatchObject({
      email: "teacher@example.com",
      role: "teacher",
      userId: "user_1",
    });
  });

  it("rejects a payload that was changed after signing", async () => {
    const { signDemoSession, verifyDemoSessionToken } = await import(
      "../src/lib/demo-session-signing"
    );
    const token = signDemoSession({
      email: "teacher@example.com",
      name: "테스트 교사",
      redirectTo: "/teacher/dashboard",
      role: "teacher",
      userId: "user_1",
    });
    const [payload, signature] = token.split(".");
    const tamperedPayload = `${payload.slice(0, -1)}${
      payload.endsWith("A") ? "B" : "A"
    }`;

    expect(
      verifyDemoSessionToken(`${tamperedPayload}.${signature}`),
    ).toBeNull();
  });

  it("rejects a changed signature", async () => {
    const { signDemoSession, verifyDemoSessionToken } = await import(
      "../src/lib/demo-session-signing"
    );
    const token = signDemoSession({
      email: "hr@example.com",
      name: "테스트 담당자",
      redirectTo: "/hr/dashboard",
      role: "hr",
      userId: "user_2",
    });
    const [payload, signature] = token.split(".");
    const tamperedSignature = `${signature.slice(0, -1)}${
      signature.endsWith("A") ? "B" : "A"
    }`;

    expect(
      verifyDemoSessionToken(`${payload}.${tamperedSignature}`),
    ).toBeNull();
  });

  it("rejects an expired token", async () => {
    const { signDemoSession, verifyDemoSessionToken } = await import(
      "../src/lib/demo-session-signing"
    );
    const now = Date.UTC(2026, 6, 26, 1, 0, 0);
    const token = signDemoSession(
      {
        email: "admin@example.com",
        name: "관리자",
        redirectTo: "/admin/dashboard",
        role: "admin",
        userId: "user_3",
      },
      now,
      60,
    );

    expect(verifyDemoSessionToken(token, now + 61_000)).toBeNull();
  });

  it.each(["", "one-part", "a.b.c", "x".repeat(9000)])(
    "rejects a malformed token: %s",
    async (token) => {
      const { verifyDemoSessionToken } = await import(
        "../src/lib/demo-session-signing"
      );

      expect(verifyDemoSessionToken(token)).toBeNull();
    },
  );
});
