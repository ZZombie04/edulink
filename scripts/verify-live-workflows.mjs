import process from "node:process";

const baseUrl = (
  process.env.EDULINK_VERIFY_BASE_URL ?? "http://127.0.0.1:3208"
).replace(/\/$/, "");
const suffix = Date.now().toString(36);
const password = "LiveFlow1234!";
let passed = 0;

function check(condition, label) {
  if (!condition) {
    throw new Error(`FAILED: ${label}`);
  }

  passed += 1;
  console.log(`PASS ${String(passed).padStart(2, "0")}  ${label}`);
}

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    body:
      options.body === undefined ? undefined : JSON.stringify(options.body),
    headers: {
      ...(options.body === undefined
        ? {}
        : { "Content-Type": "application/json" }),
      ...(options.cookie ? { Cookie: options.cookie } : {}),
    },
    method: options.method ?? "GET",
    redirect: "manual",
  });
  const text = await response.text();
  let body = null;

  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }

  return {
    body,
    cookie: response.headers.get("set-cookie") ?? "",
    status: response.status,
  };
}

function sessionCookie(setCookie) {
  const match = setCookie.match(/(?:^|,\s*)(edulink_session=[^;]+)/);

  if (!match) {
    throw new Error("FAILED: signed session cookie was not returned");
  }

  return match[1];
}

async function login(email, loginPassword = password, next) {
  return request("/api/auth/demo-login", {
    body: { email, next, password: loginPassword },
    method: "POST",
  });
}

function teacherRegistration(email, name) {
  return {
    avatarPreset: "teacher-f-mint",
    availableFrom: "2026-08-01",
    birthDate: "1992-05-14",
    careers: [
      {
        current: false,
        description: "학급 운영과 기초학력 지도를 담당했습니다.",
        employmentType: "기간제 교사",
        endDate: "2025-02-28",
        institutionName: "테스트초등학교",
        institutionType: "초등학교",
        region: "수원",
        role: "담임 교사",
        startDate: "2023-03-01",
      },
    ],
    educationLevel: "학사",
    email,
    graduationYear: 2015,
    introduction: "학생 중심 수업과 안정적인 학급 운영을 지향합니다.",
    major: "초등교육",
    name,
    password,
    phone: "010-1234-5678",
    preferredRegions: ["수원", "화성"],
    preferredTypes: ["기간제 교사"],
    privacyConsent: true,
    qualificationGrade: "2급",
    qualificationNumber: `LIVE-${suffix}`,
    qualificationType: "초등",
    residenceRegion: "수원",
    reservationEnabled: true,
    termsConsent: true,
    thirdPartyConsent: true,
    university: "한국교육대학교",
  };
}

function hrRegistration(email) {
  return {
    birthDate: "1987-08-21",
    department: "교무부",
    email,
    name: "격리 학교 담당자",
    password,
    phone: "010-9876-5432",
    position: "교무부장",
    privacyConsent: true,
    schoolAddress: "경기도 성남시 분당구 테스트로 1",
    schoolCode: `LIVE-${suffix}`,
    schoolName: `격리테스트학교-${suffix}`,
    schoolRegion: "성남",
    schoolType: "중학교",
    termsConsent: true,
    verificationCode: `VERIFY-${suffix}`,
  };
}

async function mutate(cookie, action, payload) {
  return request("/api/hiring/state", {
    body: { action, payload },
    cookie,
    method: "POST",
  });
}

console.log(`Running live workflow verification against ${baseUrl}`);

const guestState = await request("/api/hiring/state");
check(guestState.status === 200, "guest can load public hiring state");
check(
  Array.isArray(guestState.body?.jobs) && guestState.body.jobs.length >= 2,
  "public state contains live job summaries",
);
check(
  guestState.body.applications.length === 0,
  "guest state contains no applications",
);
check(
  guestState.body.requests.length === 0,
  "guest state contains no direct offers",
);
check(
  !JSON.stringify(guestState.body).includes("teacher@email.com"),
  "guest state contains no teacher account email",
);
check(
  !JSON.stringify(guestState.body).toLowerCase().includes('"rating"'),
  "guest state contains no review rating",
);

const guestMutation = await mutate("", "createJob", {});
check(guestMutation.status === 401, "guest mutation is rejected");
const guestReviews = await request("/api/reviews");
check(guestReviews.status === 401, "guest review read is rejected");
const guestApprovals = await request("/api/admin/hr-approvals");
check(guestApprovals.status === 401, "guest approval read is rejected");

const invalidLogin = await login("missing@example.kr", "Wrong1234!");
check(invalidLogin.status === 401, "invalid credentials are rejected");

const teacherDemoLogin = await login(
  "teacher@email.com",
  "edulink123!",
  "//evil.example",
);
check(teacherDemoLogin.status === 200, "demo teacher login succeeds in test mode");
check(
  teacherDemoLogin.body.redirectTo === "/teacher/dashboard",
  "protocol-relative login return is rejected",
);
check(
  teacherDemoLogin.cookie.toLowerCase().includes("httponly"),
  "session cookie is HttpOnly",
);
check(
  teacherDemoLogin.cookie.toLowerCase().includes("samesite=lax"),
  "session cookie uses SameSite=Lax",
);
const demoTeacherCookie = sessionCookie(teacherDemoLogin.cookie);
const tamperedSession = await request("/api/auth/session", {
  cookie: `${demoTeacherCookie}x`,
});
check(tamperedSession.status === 401, "tampered session cookie is rejected");

const activeJobs = guestState.body.jobs.filter(
  (job) => job.status === "open" || job.status === "closing-soon",
);
const applicationJob = activeJobs.find((job) => job.status === "open");
const directOfferJob = activeJobs.find(
  (job) => job.id !== applicationJob?.id,
);
check(Boolean(applicationJob), "an open job exists for application workflow");
check(
  Boolean(directOfferJob),
  "a second active job exists for direct-offer workflow",
);

const teacherEmail = `teacher.live.${suffix}@example.kr`;
const teacherCreated = await request("/api/auth/register/teacher", {
  body: teacherRegistration(teacherEmail, "라이브 지원교사"),
  method: "POST",
});
check(teacherCreated.status === 201, "teacher registration persists");
const teacherCookie = sessionCookie(teacherCreated.cookie);
const teacherSession = await request("/api/auth/session", {
  cookie: teacherCookie,
});
check(
  teacherSession.status === 200 &&
    teacherSession.body.session.email === teacherEmail,
  "new teacher signed session reads back",
);
const duplicateTeacher = await request("/api/auth/register/teacher", {
  body: teacherRegistration(teacherEmail, "중복 지원교사"),
  method: "POST",
});
check(duplicateTeacher.status === 409, "duplicate teacher email is rejected");

const teacherState = await request("/api/hiring/state", {
  cookie: teacherCookie,
});
const teacherId = teacherState.body.currentTeacherId;
check(Number.isInteger(teacherId), "new teacher receives a stable public identifier");
check(
  teacherState.body.applications.length === 0,
  "new teacher sees only their own empty application set",
);
check(
  (await request("/api/reviews", { cookie: teacherCookie })).status === 403,
  "teacher cannot read private reviews",
);
check(
  (await request("/api/admin/hr-approvals", { cookie: teacherCookie })).status ===
    403,
  "teacher cannot read admin approvals",
);

const applyResult = await mutate(teacherCookie, "applyToJob", {
  coverNote: "학생 중심 수업 경험을 바탕으로 지원합니다.",
  jobId: applicationJob.id,
});
check(applyResult.status === 200, "teacher can apply to an open job");
const application = applyResult.body.applications.find(
  (item) => item.jobId === applicationJob.id,
);
check(Boolean(application), "application is returned to its owner");
const applyAgain = await mutate(teacherCookie, "applyToJob", {
  jobId: applicationJob.id,
});
check(applyAgain.status === 200, "application retry is accepted idempotently");
check(
  applyAgain.body.applications.filter(
    (item) => item.jobId === applicationJob.id,
  ).length === 1,
  "application retry creates no duplicate",
);

const teacherReturnLogin = await login(
  teacherEmail,
  password,
  `/jobs/${applicationJob.id}`,
);
check(
  teacherReturnLogin.body.redirectTo === `/jobs/${applicationJob.id}`,
  "teacher login safely returns to the requested job",
);

const hrLogin = await login("hr@school.go.kr", "edulink123!");
check(hrLogin.status === 200, "approved HR login succeeds");
const hrCookie = sessionCookie(hrLogin.cookie);
check(
  (await request("/api/reviews", { cookie: hrCookie })).status === 403,
  "HR cannot read private reviews",
);
check(
  (await request("/api/admin/hr-approvals", { cookie: hrCookie })).status ===
    403,
  "HR cannot read admin approvals",
);
const hrState = await request("/api/hiring/state", { cookie: hrCookie });
const hrApplication = hrState.body.applications.find(
  (item) => item.id === application.id,
);
check(Boolean(hrApplication), "owning school sees the submitted application");

const reviewing = await mutate(hrCookie, "updateApplicationStatus", {
  applicationId: application.id,
  status: "reviewing",
});
check(reviewing.status === 200, "HR can start application review");
const interview = await mutate(hrCookie, "scheduleInterviewForApplication", {
  applicationId: application.id,
  date: "2026-08-05",
  note: "수업 운영 경험을 확인합니다.",
  place: "본관 2층 회의실",
  time: "14:00",
});
check(interview.status === 200, "HR can schedule an application interview");
const teacherInterviewState = await request("/api/hiring/state", {
  cookie: teacherCookie,
});
check(
  teacherInterviewState.body.applications[0].status ===
    "interview-requested",
  "teacher receives the interview-requested state",
);
const confirmed = await mutate(teacherCookie, "updateApplicationStatus", {
  applicationId: application.id,
  status: "interview-confirmed",
});
check(confirmed.status === 200, "teacher can confirm the interview");
const hired = await mutate(hrCookie, "updateApplicationStatus", {
  applicationId: application.id,
  status: "hired",
});
check(hired.status === 200, "HR can finalize application hire and contract");

const reviewCreated = await request("/api/reviews", {
  body: {
    comment: "수업 준비와 협업이 안정적이며 책임감 있게 업무를 수행했습니다.",
    rating: 5,
    teacherId,
  },
  cookie: hrCookie,
  method: "POST",
});
check(reviewCreated.status === 201, "hiring school can submit a private review");
const invalidRating = await request("/api/reviews", {
  body: { rating: 6, teacherId },
  cookie: hrCookie,
  method: "POST",
});
check(invalidRating.status === 422, "out-of-range rating is rejected");

const secondTeacherEmail = `teacher.offer.${suffix}@example.kr`;
const secondTeacherCreated = await request("/api/auth/register/teacher", {
  body: teacherRegistration(secondTeacherEmail, "라이브 제안교사"),
  method: "POST",
});
check(secondTeacherCreated.status === 201, "second teacher registration persists");
const secondTeacherCookie = sessionCookie(secondTeacherCreated.cookie);
const secondTeacherState = await request("/api/hiring/state", {
  cookie: secondTeacherCookie,
});
const secondTeacherId = secondTeacherState.body.currentTeacherId;
const sentOffer = await mutate(hrCookie, "sendPoolRequest", {
  jobId: directOfferJob.id,
  message: "직접 채용 제안을 드립니다.",
  teacherId: secondTeacherId,
});
check(sentOffer.status === 200, "HR can send a direct offer");
const sentRequest = sentOffer.body.requests.find(
  (item) =>
    item.teacherId === secondTeacherId &&
    item.job?.id === directOfferJob.id,
);
check(Boolean(sentRequest), "direct offer is visible to its owning HR");
const receivedOffer = await request("/api/hiring/state", {
  cookie: secondTeacherCookie,
});
check(
  receivedOffer.body.requests.some((item) => item.id === sentRequest.id),
  "direct offer is visible to its target teacher",
);
const acceptedOffer = await mutate(
  secondTeacherCookie,
  "setPoolRequestStatus",
  {
    requestId: sentRequest.id,
    status: "accepted",
  },
);
check(acceptedOffer.status === 200, "target teacher can accept a direct offer");
const directHire = await mutate(hrCookie, "completePoolRequestHire", {
  requestId: sentRequest.id,
});
check(directHire.status === 200, "HR can finalize a direct-offer hire");
const repeatedDirectHire = await mutate(
  hrCookie,
  "completePoolRequestHire",
  { requestId: sentRequest.id },
);
check(
  repeatedDirectHire.status === 200,
  "direct-offer hire retry remains idempotent",
);
const unavailableTeacherOffer = await mutate(hrCookie, "sendPoolRequest", {
  jobId: applicationJob.id,
  message: "이미 채용된 교사에게는 새 제안을 보내면 안 됩니다.",
  teacherId: secondTeacherId,
});
check(
  unavailableTeacherOffer.status === 409 &&
    unavailableTeacherOffer.body?.code === "TEACHER_NOT_AVAILABLE",
  "employed teacher cannot receive another direct offer",
);

const hrEmail = `hr.live.${suffix}@example.kr`;
const pendingHr = await request("/api/auth/register/hr", {
  body: hrRegistration(hrEmail),
  method: "POST",
});
check(pendingHr.status === 202, "HR registration creates a pending account");
const pendingHrLogin = await login(hrEmail);
check(pendingHrLogin.status === 403, "pending HR cannot sign in");

const adminLogin = await login("admin@edulink.kr", "edulink123!");
check(adminLogin.status === 200, "admin login succeeds");
const adminCookie = sessionCookie(adminLogin.cookie);
const approvals = await request("/api/admin/hr-approvals", {
  cookie: adminCookie,
});
check(approvals.status === 200, "admin can read HR approvals");
const pendingApproval = approvals.body.approvals.find(
  (item) => item.email === hrEmail,
);
check(Boolean(pendingApproval), "new HR request appears in admin work queue");
const approvalResult = await request("/api/admin/hr-approvals", {
  body: { decision: "approve", id: pendingApproval.id },
  cookie: adminCookie,
  method: "POST",
});
check(approvalResult.status === 200, "admin can approve the HR account");
const approvedHrLogin = await login(hrEmail);
check(approvedHrLogin.status === 200, "approved HR can sign in");
const approvedHrCookie = sessionCookie(approvedHrLogin.cookie);
const isolatedHrState = await request("/api/hiring/state", {
  cookie: approvedHrCookie,
});
check(
  isolatedHrState.body.applications.length === 0,
  "second school cannot see first school's applications",
);
const crossSchoolMutation = await mutate(
  approvedHrCookie,
  "updateJobStatus",
  { jobId: applicationJob.id, status: "closed" },
);
check(
  crossSchoolMutation.status === 403,
  "second school cannot mutate first school's job",
);

const adminReviews = await request("/api/reviews", {
  cookie: adminCookie,
});
check(adminReviews.status === 200, "admin can read private reviews");
check(
  adminReviews.body.reviews.some(
    (review) =>
      review.teacher.email === teacherEmail &&
      review.rating === 5,
  ),
  "admin review list contains the submitted rating and review",
);
check(
  !JSON.stringify(
    await request("/api/hiring/state", { cookie: approvedHrCookie }),
  ).includes("수업 준비와 협업"),
  "review text never leaks through HR hiring state",
);

const logout = await request("/api/auth/logout", {
  cookie: teacherCookie,
  method: "POST",
});
check(
  logout.status === 200 &&
    /max-age=0/i.test(logout.cookie),
  "logout expires the signed session cookie",
);

console.log(`LIVE WORKFLOW RESULT: ${passed} checks passed`);
