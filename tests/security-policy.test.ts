import { describe, expect, it } from "vitest";

import {
  getSafePostLoginRedirect,
  isAuthorizedRole,
  mapDatabaseRoleToDemoRole,
  sanitizeNextRedirect,
} from "../src/lib/demo-session";
import {
  isDemoSeedEnabled,
  isReservedDemoEmail,
} from "../src/lib/demo-access";

describe("demo seed policy", () => {
  it("never enables known-password demo seeds in production", () => {
    expect(isDemoSeedEnabled("production", "true")).toBe(false);
    expect(isDemoSeedEnabled("production", undefined)).toBe(false);
  });

  it("allows non-production demo flows unless explicitly disabled", () => {
    expect(isDemoSeedEnabled("development", undefined)).toBe(true);
    expect(isDemoSeedEnabled("test", "true")).toBe(true);
    expect(isDemoSeedEnabled("development", "false")).toBe(false);
  });

  it("reserves every known demo login address", () => {
    expect(isReservedDemoEmail("TEACHER@email.com")).toBe(true);
    expect(isReservedDemoEmail("hr@school.go.kr")).toBe(true);
    expect(isReservedDemoEmail("admin@edulink.kr")).toBe(true);
    expect(isReservedDemoEmail("new-user@example.com")).toBe(false);
  });
});

describe("safe redirect policy", () => {
  const cases: Array<{
    expected: string;
    fallback?: string;
    label: string;
    value: unknown;
  }> = [
    {
      label: "keeps an internal absolute path",
      value: "/jobs/1",
      expected: "/jobs/1",
    },
    {
      label: "keeps query and hash fragments",
      value: "/jobs?region=수원#results",
      expected: "/jobs?region=%EC%88%98%EC%9B%90#results",
    },
    {
      label: "rejects a protocol-relative URL",
      value: "//evil.example",
      expected: "/",
    },
    {
      label: "rejects an absolute HTTPS URL",
      value: "https://evil.example",
      expected: "/",
    },
    {
      label: "rejects an absolute HTTP URL",
      value: "http://evil.example",
      expected: "/",
    },
    {
      label: "rejects a backslash redirect",
      value: "/\\evil.example",
      expected: "/",
    },
    {
      label: "rejects a decoded backslash redirect",
      value: "/%5Cevil.example",
      expected: "/",
    },
    {
      label: "rejects leading whitespace",
      value: " /jobs",
      expected: "/",
    },
    {
      label: "rejects trailing whitespace",
      value: "/jobs ",
      expected: "/",
    },
    {
      label: "rejects a newline",
      value: "/jobs\n/evil",
      expected: "/",
    },
    {
      label: "rejects a non-string",
      value: 123,
      expected: "/",
    },
    {
      label: "uses an explicit safe fallback",
      value: null,
      fallback: "/auth/login",
      expected: "/auth/login",
    },
    {
      label: "normalizes an unsafe fallback",
      value: null,
      fallback: "//evil.example",
      expected: "/",
    },
  ];

  it.each(cases)("$label", ({ expected, fallback, value }) => {
    expect(sanitizeNextRedirect(value, fallback)).toBe(expected);
  });

  it.each([
    ["teacher", "/teacher/offers/1", "/teacher/offers/1"],
    ["teacher", "/hr/dashboard", "/teacher/dashboard"],
    ["teacher", "/jobs/1", "/jobs/1"],
    ["hr", "/pool/1", "/pool/1"],
    ["hr", "/hr/dashboard?tab=jobs", "/hr/dashboard?tab=jobs"],
    ["hr", "/admin/dashboard", "/hr/dashboard"],
    ["admin", "/admin/dashboard", "/admin/dashboard"],
    ["admin", "//evil.example", "/admin/dashboard"],
  ] as const)(
    "scopes %s redirects: %s",
    (role, requested, expected) => {
      expect(getSafePostLoginRedirect(role, requested)).toBe(expected);
    },
  );
});

describe("role mapping and route authorization", () => {
  it.each([
    ["TEACHER", "teacher"],
    ["HR_MANAGER", "hr"],
    ["EDU_ADMIN", "admin"],
    ["SUPER_ADMIN", "admin"],
    ["UNKNOWN", null],
    [null, null],
  ] as const)("maps database role %s", (databaseRole, expected) => {
    expect(mapDatabaseRoleToDemoRole(databaseRole)).toBe(expected);
  });

  it.each([
    ["teacher", ["teacher"], true],
    ["teacher", ["hr"], false],
    ["hr", ["hr"], true],
    ["hr", ["admin"], false],
    ["admin", ["admin"], true],
    ["admin", ["teacher", "hr"], false],
    ["guest", ["teacher", "hr", "admin"], false],
  ] as const)("authorizes %s against %j", (role, allowed, expected) => {
    expect(isAuthorizedRole(role, [...allowed])).toBe(expected);
  });
});
