import { describe, expect, it } from "vitest";

import {
  canTransitionApplicationStatus,
  canTransitionRequestStatus,
  isHiringActionAllowed,
  isHiringMutationAction,
  type ApplicationStatus,
  type DemoRequestStatus,
  type HiringActorRole,
} from "../src/lib/hiring-shared";

describe("hiring action RBAC", () => {
  it.each([
    ["teacher", "applyToJob", true],
    ["guest", "applyToJob", false],
    ["hr", "applyToJob", false],
    ["teacher", "withdrawApplication", true],
    ["hr", "withdrawApplication", false],
    ["hr", "createJob", true],
    ["teacher", "createJob", false],
    ["hr", "updateJobStatus", true],
    ["teacher", "updateJobStatus", false],
    ["hr", "sendPoolRequest", true],
    ["teacher", "sendPoolRequest", false],
    ["hr", "cancelPoolRequest", true],
    ["teacher", "cancelPoolRequest", false],
    ["hr", "scheduleInterviewForApplication", true],
    ["teacher", "scheduleInterviewForApplication", false],
    ["hr", "scheduleInterviewForRequest", true],
    ["teacher", "scheduleInterviewForRequest", false],
    ["hr", "toggleInterestedTeacher", true],
    ["guest", "toggleInterestedTeacher", false],
    ["admin", "toggleInterestedTeacher", false],
    ["teacher", "unknownAction", false],
    ["admin", "unknownAction", false],
  ] as const)(
    "%s / %s -> %s",
    (role, action, expected) => {
      expect(isHiringActionAllowed(role, action)).toBe(expected);
    },
  );

  it("rejects unknown mutation names", () => {
    expect(isHiringMutationAction("dropAllTables")).toBe(false);
  });
});

describe("application state transitions", () => {
  const cases: Array<{
    current: ApplicationStatus;
    expected: boolean;
    next: ApplicationStatus;
    role: HiringActorRole;
  }> = [
    {
      role: "teacher",
      current: "submitted",
      next: "withdrawn",
      expected: true,
    },
    {
      role: "teacher",
      current: "reviewing",
      next: "withdrawn",
      expected: true,
    },
    {
      role: "teacher",
      current: "interview-requested",
      next: "interview-confirmed",
      expected: true,
    },
    {
      role: "teacher",
      current: "hired",
      next: "withdrawn",
      expected: false,
    },
    {
      role: "teacher",
      current: "rejected",
      next: "withdrawn",
      expected: false,
    },
    {
      role: "teacher",
      current: "submitted",
      next: "hired",
      expected: false,
    },
    {
      role: "hr",
      current: "submitted",
      next: "reviewing",
      expected: true,
    },
    {
      role: "hr",
      current: "reviewing",
      next: "interview-requested",
      expected: true,
    },
    {
      role: "hr",
      current: "interview-confirmed",
      next: "hired",
      expected: true,
    },
    {
      role: "hr",
      current: "reviewing",
      next: "rejected",
      expected: true,
    },
    {
      role: "hr",
      current: "hired",
      next: "reviewing",
      expected: false,
    },
    {
      role: "hr",
      current: "withdrawn",
      next: "hired",
      expected: false,
    },
    {
      role: "guest",
      current: "submitted",
      next: "reviewing",
      expected: false,
    },
    {
      role: "admin",
      current: "submitted",
      next: "hired",
      expected: false,
    },
  ];

  it.each(cases)(
    "$role cannot bypass $current -> $next = $expected",
    ({ current, expected, next, role }) => {
      expect(canTransitionApplicationStatus(role, current, next)).toBe(expected);
    },
  );
});

describe("direct-offer state transitions", () => {
  const cases: Array<{
    current: DemoRequestStatus;
    expected: boolean;
    next: DemoRequestStatus;
    role: HiringActorRole;
  }> = [
    {
      role: "teacher",
      current: "pending",
      next: "accepted",
      expected: true,
    },
    {
      role: "teacher",
      current: "pending",
      next: "rejected",
      expected: true,
    },
    {
      role: "teacher",
      current: "pending",
      next: "archived",
      expected: true,
    },
    {
      role: "teacher",
      current: "accepted",
      next: "rejected",
      expected: false,
    },
    {
      role: "hr",
      current: "pending",
      next: "cancelled",
      expected: true,
    },
    {
      role: "hr",
      current: "accepted",
      next: "hired",
      expected: true,
    },
    {
      role: "hr",
      current: "rejected",
      next: "cancelled",
      expected: false,
    },
    {
      role: "hr",
      current: "hired",
      next: "cancelled",
      expected: false,
    },
    {
      role: "guest",
      current: "pending",
      next: "accepted",
      expected: false,
    },
    {
      role: "admin",
      current: "accepted",
      next: "hired",
      expected: false,
    },
  ];

  it.each(cases)(
    "$role / $current -> $next = $expected",
    ({ current, expected, next, role }) => {
      expect(canTransitionRequestStatus(role, current, next)).toBe(expected);
    },
  );
});
