import "dotenv/config";

import { randomBytes, scryptSync } from "node:crypto";

import { PrismaPg } from "@prisma/adapter-pg";
import {
  ApprovalStatus,
  ContractStatus,
  EducationLevel,
  MatchDirection,
  MatchStatus,
  PostingStatus,
  PrismaClient,
  QualificationGrade,
  QualificationType,
  SeekingStatus,
  TeacherType,
  UserRole,
} from "@prisma/client";

// One-off, idempotent sample-data loader for a realistic multi-school
// pilot: several teacher accounts and several school (HR_MANAGER)
// accounts, plus job postings, applications, direct offers and a couple
// of completed hiring cycles with reviews.
//
// Safe to re-run: every record is upserted on a stable key, so running
// this twice updates the same rows instead of duplicating them. Emails
// live under the *.dummy.edulink.local domain so they can never collide
// with a real user's own signup.
//
// Requires an explicit confirmation flag so it is never triggered by
// accident against the wrong database, and an extra flag to allow
// running against a database where NODE_ENV=production.

const databaseUrl = process.env.DATABASE_URL?.trim();
const confirmation = process.env.EDULINK_SEED_CONFIRM;
const allowProduction = process.env.EDULINK_SEED_ALLOW_PRODUCTION === "true";
const DUMMY_PASSWORD = process.env.EDULINK_DUMMY_PASSWORD?.trim() || "Edulink2026!Demo!";
const DEMO_ID_TEACHER_BASE = 9000;
const DEMO_ID_HR_BASE = 9100;
const DEMO_ID_MATCH_BASE = 9200;
const DEMO_ID_APPLICATION_BASE = 9300;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required.");
}

if (confirmation !== "SEED_EDULINK_DUMMY_DATA") {
  throw new Error(
    "Set EDULINK_SEED_CONFIRM=SEED_EDULINK_DUMMY_DATA to confirm this operation.",
  );
}

if (process.env.NODE_ENV === "production" && !allowProduction) {
  throw new Error(
    "Refusing to seed dummy data into a production database. Set " +
      "EDULINK_SEED_ALLOW_PRODUCTION=true if this is intentional.",
  );
}

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");

  return `${salt}:${hash}`;
}

const SCHOOLS = [
  {
    key: "hanbit-es",
    schoolName: "한빛초등학교",
    schoolCode: "SEL-ES-1001",
    schoolType: "초등학교",
    schoolRegion: "서울 강남구",
    schoolAddress: "서울특별시 강남구 테헤란로 152",
    hrEmail: "hr.hanbit@dummy.edulink.local",
    hrName: "김민지",
    hrPhone: "010-2001-1001",
    hrPosition: "교무부장",
    hrBirth: "1982-03-11",
  },
  {
    key: "neulpureun-ms",
    schoolName: "늘푸른중학교",
    schoolCode: "GYG-MS-2002",
    schoolType: "중학교",
    schoolRegion: "경기 성남시",
    schoolAddress: "경기도 성남시 분당구 판교역로 235",
    hrEmail: "hr.neulpureun@dummy.edulink.local",
    hrName: "이준호",
    hrPhone: "010-2002-1002",
    hrPosition: "행정실장",
    hrBirth: "1979-07-22",
  },
  {
    key: "baekyang-hs",
    schoolName: "백양고등학교",
    schoolCode: "BSN-HS-3003",
    schoolType: "고등학교",
    schoolRegion: "부산 해운대구",
    schoolAddress: "부산광역시 해운대구 센텀중앙로 90",
    hrEmail: "hr.baekyang@dummy.edulink.local",
    hrName: "박수연",
    hrPhone: "010-2003-1003",
    hrPosition: "교감",
    hrBirth: "1975-11-05",
  },
  {
    key: "eunha-es",
    schoolName: "은하초등학교",
    schoolCode: "ICN-ES-4004",
    schoolType: "초등학교",
    schoolRegion: "인천 연수구",
    schoolAddress: "인천광역시 연수구 컨벤시아대로 165",
    hrEmail: "hr.eunha@dummy.edulink.local",
    hrName: "최동현",
    hrPhone: "010-2004-1004",
    hrPosition: "교무부장",
    hrBirth: "1985-01-30",
  },
  {
    key: "jeongwon-ms",
    schoolName: "정원중학교",
    schoolCode: "DJN-MS-5005",
    schoolType: "중학교",
    schoolRegion: "대전 유성구",
    schoolAddress: "대전광역시 유성구 대학로 99",
    hrEmail: "hr.jeongwon@dummy.edulink.local",
    hrName: "정하늘",
    hrPhone: "010-2005-1005",
    hrPosition: "행정실장",
    hrBirth: "1988-09-14",
  },
];

const TEACHERS = [
  {
    key: "kim-seojun",
    name: "김서준",
    email: "teacher.kimseojun@dummy.edulink.local",
    phone: "010-3001-1001",
    birth: "1992-04-12",
    qualificationType: QualificationType.ELEMENTARY,
    qualificationGrade: QualificationGrade.GRADE_2,
    qualificationSubject: null,
    university: "한국교원대학교",
    major: "초등교육",
    graduationYear: 2015,
    educationLevel: EducationLevel.BACHELOR,
    residenceRegion: "서울 노원구",
    preferredRegions: ["서울", "경기"],
    preferredTypes: [TeacherType.FIXED_TERM],
    seekingStatus: SeekingStatus.SEEKING,
    experienceYears: 6,
    experienceMonths: 3,
    introduction: "초등 저학년 담임 경험이 풍부한 교사입니다.",
    specialSkills: "학급 경영, 학부모 상담",
    avatarPreset: "teacher-m-navy",
    careers: [
      {
        schoolName: "서울행복초등학교",
        schoolType: "초등학교",
        position: "담임교사",
        startDate: "2019-03-01",
        endDate: "2024-02-28",
        employmentType: TeacherType.FIXED_TERM,
        description: "3학년 담임, 학년부장 보조",
        region: "서울",
      },
    ],
  },
  {
    key: "lee-jiwoo",
    name: "이지우",
    email: "teacher.leejiwoo@dummy.edulink.local",
    phone: "010-3002-1002",
    birth: "1990-08-02",
    qualificationType: QualificationType.SECONDARY,
    qualificationGrade: QualificationGrade.GRADE_1,
    qualificationSubject: "국어",
    university: "서울대학교",
    major: "국어교육",
    graduationYear: 2013,
    educationLevel: EducationLevel.MASTER,
    residenceRegion: "경기 성남시",
    preferredRegions: ["경기", "서울"],
    preferredTypes: [TeacherType.FIXED_TERM, TeacherType.PART_TIME],
    seekingStatus: SeekingStatus.INTERVIEWING,
    experienceYears: 9,
    experienceMonths: 0,
    introduction: "고등 국어 논술 지도 경력 다수.",
    specialSkills: "논술 지도, 방과후 프로그램 운영",
    avatarPreset: "teacher-f-rose",
    careers: [
      {
        schoolName: "성남고등학교",
        schoolType: "고등학교",
        position: "교과전담",
        startDate: "2016-03-01",
        endDate: "2023-02-28",
        employmentType: TeacherType.FIXED_TERM,
        description: "고3 국어, 논술반 지도",
        region: "경기",
      },
    ],
  },
  {
    key: "park-haeun",
    name: "박하은",
    email: "teacher.parkhaeun@dummy.edulink.local",
    phone: "010-3003-1003",
    birth: "1994-01-19",
    qualificationType: QualificationType.SECONDARY,
    qualificationGrade: QualificationGrade.GRADE_2,
    qualificationSubject: "수학",
    university: "부산대학교",
    major: "수학교육",
    graduationYear: 2017,
    educationLevel: EducationLevel.BACHELOR,
    residenceRegion: "부산 해운대구",
    preferredRegions: ["부산", "울산"],
    preferredTypes: [TeacherType.PART_TIME],
    seekingStatus: SeekingStatus.SEEKING,
    experienceYears: 4,
    experienceMonths: 6,
    introduction: "중등 수학 기초반부터 심화반까지 지도 가능합니다.",
    specialSkills: "수준별 수업 설계",
    avatarPreset: "teacher-f-mint",
    careers: [
      {
        schoolName: "해운대중학교",
        schoolType: "중학교",
        position: "시간강사",
        startDate: "2021-03-01",
        endDate: "2024-02-28",
        employmentType: TeacherType.PART_TIME,
        description: "1~2학년 수학 교과",
        region: "부산",
      },
    ],
  },
  {
    key: "choi-minjun",
    name: "최민준",
    email: "teacher.choiminjun@dummy.edulink.local",
    phone: "010-3004-1004",
    birth: "1988-06-25",
    qualificationType: QualificationType.ELEMENTARY,
    qualificationGrade: QualificationGrade.GRADE_1,
    qualificationSubject: null,
    university: "인천교육대학교",
    major: "초등교육",
    graduationYear: 2011,
    educationLevel: EducationLevel.BACHELOR,
    residenceRegion: "인천 연수구",
    preferredRegions: ["인천"],
    preferredTypes: [TeacherType.FIXED_TERM],
    seekingStatus: SeekingStatus.EMPLOYED,
    experienceYears: 12,
    experienceMonths: 1,
    introduction: "고학년 담임 및 학년부장 경력 보유.",
    specialSkills: "체육 특기, 방송반 지도",
    avatarPreset: "teacher-m-forest",
    careers: [
      {
        schoolName: "인천중앙초등학교",
        schoolType: "초등학교",
        position: "학년부장",
        startDate: "2018-03-01",
        endDate: null,
        employmentType: TeacherType.FIXED_TERM,
        description: "6학년 담임, 학년부장",
        region: "인천",
      },
    ],
  },
  {
    key: "jung-yejin",
    name: "정예진",
    email: "teacher.jungyejin@dummy.edulink.local",
    phone: "010-3005-1005",
    birth: "1996-02-08",
    qualificationType: QualificationType.SECONDARY,
    qualificationGrade: QualificationGrade.GRADE_2,
    qualificationSubject: "영어",
    university: "충남대학교",
    major: "영어교육",
    graduationYear: 2019,
    educationLevel: EducationLevel.BACHELOR,
    residenceRegion: "대전 유성구",
    preferredRegions: ["대전", "세종"],
    preferredTypes: [TeacherType.FIXED_TERM],
    seekingStatus: SeekingStatus.SEEKING,
    experienceYears: 3,
    experienceMonths: 0,
    introduction: "원어민 협력 수업 경험이 있는 영어 교사입니다.",
    specialSkills: "영어 회화 지도, 원어민 협력수업",
    avatarPreset: "teacher-f-sky",
    careers: [
      {
        schoolName: "유성중학교",
        schoolType: "중학교",
        position: "교과전담",
        startDate: "2022-03-01",
        endDate: "2024-02-28",
        employmentType: TeacherType.FIXED_TERM,
        description: "1학년 영어, 원어민 협력수업",
        region: "대전",
      },
    ],
  },
  {
    key: "kang-doyoon",
    name: "강도윤",
    email: "teacher.kangdoyoon@dummy.edulink.local",
    phone: "010-3006-1006",
    birth: "1991-10-17",
    qualificationType: QualificationType.SECONDARY,
    qualificationGrade: QualificationGrade.GRADE_1,
    qualificationSubject: "과학",
    university: "고려대학교",
    major: "물리교육",
    graduationYear: 2014,
    educationLevel: EducationLevel.MASTER,
    residenceRegion: "서울 노원구",
    preferredRegions: ["서울"],
    preferredTypes: [TeacherType.FIXED_TERM],
    seekingStatus: SeekingStatus.NOT_SEEKING,
    experienceYears: 8,
    experienceMonths: 5,
    introduction: "물리 실험 수업 설계 전문.",
    specialSkills: "실험 수업 설계, 과학동아리 지도",
    avatarPreset: "teacher-m-plum",
    careers: [
      {
        schoolName: "노원고등학교",
        schoolType: "고등학교",
        position: "교과전담",
        startDate: "2017-03-01",
        endDate: "2023-08-31",
        employmentType: TeacherType.FIXED_TERM,
        description: "물리, 과학동아리 지도",
        region: "서울",
      },
    ],
  },
  {
    key: "jo-sua",
    name: "조수아",
    email: "teacher.josua@dummy.edulink.local",
    phone: "010-3007-1007",
    birth: "1993-12-03",
    qualificationType: QualificationType.ELEMENTARY,
    qualificationGrade: QualificationGrade.GRADE_2,
    qualificationSubject: null,
    university: "경인교육대학교",
    major: "초등교육",
    graduationYear: 2016,
    educationLevel: EducationLevel.BACHELOR,
    residenceRegion: "경기 성남시",
    preferredRegions: ["경기"],
    preferredTypes: [TeacherType.FIXED_TERM, TeacherType.PART_TIME],
    seekingStatus: SeekingStatus.SEEKING,
    experienceYears: 5,
    experienceMonths: 2,
    introduction: "저학년 한글, 기초학습 지도 경험 다수.",
    specialSkills: "기초학습 부진아 지도",
    avatarPreset: "teacher-f-violet",
    careers: [
      {
        schoolName: "판교초등학교",
        schoolType: "초등학교",
        position: "담임교사",
        startDate: "2020-03-01",
        endDate: "2024-02-28",
        employmentType: TeacherType.FIXED_TERM,
        description: "1학년 담임",
        region: "경기",
      },
    ],
  },
  {
    key: "yoon-jiho",
    name: "윤지호",
    email: "teacher.yoonjiho@dummy.edulink.local",
    phone: "010-3008-1008",
    birth: "1989-05-29",
    qualificationType: QualificationType.SECONDARY,
    qualificationGrade: QualificationGrade.GRADE_2,
    qualificationSubject: "체육",
    university: "부경대학교",
    major: "체육교육",
    graduationYear: 2012,
    educationLevel: EducationLevel.BACHELOR,
    residenceRegion: "부산 해운대구",
    preferredRegions: ["부산", "경남"],
    preferredTypes: [TeacherType.PART_TIME],
    seekingStatus: SeekingStatus.SEEKING,
    experienceYears: 10,
    experienceMonths: 0,
    introduction: "체육대회 및 방과후 스포츠클럽 운영 경험.",
    specialSkills: "축구부 지도, 방과후 스포츠클럽 운영",
    avatarPreset: "teacher-m-amber",
    careers: [
      {
        schoolName: "해운대고등학교",
        schoolType: "고등학교",
        position: "시간강사",
        startDate: "2019-03-01",
        endDate: "2024-02-28",
        employmentType: TeacherType.PART_TIME,
        description: "체육 교과, 축구부 지도",
        region: "부산",
      },
    ],
  },
  {
    key: "lim-chaewon",
    name: "임채원",
    email: "teacher.limchaewon@dummy.edulink.local",
    phone: "010-3009-1009",
    birth: "1995-09-09",
    qualificationType: QualificationType.SECONDARY,
    qualificationGrade: QualificationGrade.GRADE_1,
    qualificationSubject: "음악",
    university: "인천대학교",
    major: "음악교육",
    graduationYear: 2018,
    educationLevel: EducationLevel.BACHELOR,
    residenceRegion: "인천 연수구",
    preferredRegions: ["인천", "서울"],
    preferredTypes: [TeacherType.FIXED_TERM],
    seekingStatus: SeekingStatus.INTERVIEWING,
    experienceYears: 4,
    experienceMonths: 0,
    introduction: "합창부 및 오케스트라 지도 경험 보유.",
    specialSkills: "합창 지도, 오케스트라 지도",
    avatarPreset: "teacher-n-coral",
    careers: [
      {
        schoolName: "연수중학교",
        schoolType: "중학교",
        position: "교과전담",
        startDate: "2021-03-01",
        endDate: "2024-02-28",
        employmentType: TeacherType.FIXED_TERM,
        description: "음악 교과, 합창부 지도",
        region: "인천",
      },
    ],
  },
  {
    key: "han-seoyeon",
    name: "한서연",
    email: "teacher.hanseoyeon@dummy.edulink.local",
    phone: "010-3010-1010",
    birth: "1987-03-21",
    qualificationType: QualificationType.ELEMENTARY,
    qualificationGrade: QualificationGrade.GRADE_1,
    qualificationSubject: null,
    university: "공주교육대학교",
    major: "초등교육",
    graduationYear: 2010,
    educationLevel: EducationLevel.BACHELOR,
    residenceRegion: "대전 유성구",
    preferredRegions: ["대전", "세종", "충남"],
    preferredTypes: [TeacherType.FIXED_TERM],
    seekingStatus: SeekingStatus.SEEKING,
    experienceYears: 13,
    experienceMonths: 4,
    introduction: "고학년 담임 및 진로교육 경력 다수.",
    specialSkills: "진로교육, 학부모 상담",
    avatarPreset: "teacher-n-cloud",
    careers: [
      {
        schoolName: "유성초등학교",
        schoolType: "초등학교",
        position: "담임교사",
        startDate: "2015-03-01",
        endDate: "2024-02-28",
        employmentType: TeacherType.FIXED_TERM,
        description: "5~6학년 담임, 진로교육 담당",
        region: "대전",
      },
    ],
  },
];

const JOBS = [
  {
    externalId: "dummy-job-hanbit-1",
    schoolKey: "hanbit-es",
    employmentType: TeacherType.FIXED_TERM,
    startDate: "2026-03-02",
    endDate: "2027-02-28",
    qualificationType: QualificationType.ELEMENTARY,
    qualificationSubject: null,
    gradeLevel: "3학년",
    isHomeroom: true,
    duties: "3학년 담임, 학년 공동 업무",
    memo: "출산휴가 대체 기간제 교사를 모집합니다.",
    postingStatus: PostingStatus.OPEN,
  },
  {
    externalId: "dummy-job-neulpureun-1",
    schoolKey: "neulpureun-ms",
    employmentType: TeacherType.FIXED_TERM,
    startDate: "2026-03-02",
    endDate: "2026-08-31",
    qualificationType: QualificationType.SECONDARY,
    qualificationSubject: "국어",
    gradeLevel: "2학년",
    isHomeroom: false,
    duties: "국어 교과, 방과후 논술반",
    memo: "1학기 국어 기간제 교사 모집.",
    postingStatus: PostingStatus.OPEN,
  },
  {
    externalId: "dummy-job-baekyang-1",
    schoolKey: "baekyang-hs",
    employmentType: TeacherType.PART_TIME,
    startDate: "2026-03-02",
    endDate: "2026-07-17",
    qualificationType: QualificationType.SECONDARY,
    qualificationSubject: "수학",
    gradeLevel: "1학년",
    isHomeroom: false,
    duties: "수학 교과 시간강사",
    memo: "주 12시간 수학 시간강사 모집.",
    postingStatus: PostingStatus.OPEN,
  },
  {
    externalId: "dummy-job-eunha-1",
    schoolKey: "eunha-es",
    employmentType: TeacherType.FIXED_TERM,
    startDate: "2025-09-01",
    endDate: "2026-02-28",
    qualificationType: QualificationType.ELEMENTARY,
    qualificationSubject: null,
    gradeLevel: "6학년",
    isHomeroom: true,
    duties: "6학년 담임, 학년부장 보조",
    memo: "육아휴직 대체 기간제 교사 채용 완료.",
    postingStatus: PostingStatus.FILLED,
  },
  {
    externalId: "dummy-job-jeongwon-1",
    schoolKey: "jeongwon-ms",
    employmentType: TeacherType.FIXED_TERM,
    startDate: "2026-03-02",
    endDate: "2027-02-28",
    qualificationType: QualificationType.SECONDARY,
    qualificationSubject: "영어",
    gradeLevel: "1학년",
    isHomeroom: false,
    duties: "영어 교과, 원어민 협력수업",
    memo: "1년 계약 영어 기간제 교사 모집.",
    postingStatus: PostingStatus.OPEN,
  },
  {
    externalId: "dummy-job-baekyang-2",
    schoolKey: "baekyang-hs",
    employmentType: TeacherType.PART_TIME,
    startDate: "2026-03-02",
    endDate: "2026-07-17",
    qualificationType: QualificationType.SECONDARY,
    qualificationSubject: "체육",
    gradeLevel: "전학년",
    isHomeroom: false,
    duties: "체육 교과, 방과후 스포츠클럽",
    memo: "체육 시간강사 모집, 축구부 지도 가능자 우대.",
    postingStatus: PostingStatus.OPEN,
  },
];

const APPLICATIONS = [
  {
    teacherKey: "kim-seojun",
    jobExternalId: "dummy-job-hanbit-1",
    status: MatchStatus.INTERVIEWING,
    coverLetter: "저학년 담임 경력을 바탕으로 안정적인 학급 운영을 하겠습니다.",
  },
  {
    teacherKey: "jo-sua",
    jobExternalId: "dummy-job-hanbit-1",
    status: MatchStatus.PENDING,
    coverLetter: "1학년 담임 경험을 살려 3학년 학급 운영에도 기여하고 싶습니다.",
  },
  {
    teacherKey: "lee-jiwoo",
    jobExternalId: "dummy-job-neulpureun-1",
    status: MatchStatus.PENDING,
    coverLetter: "고등 논술 지도 경험을 중학교 국어 수업에 적용하겠습니다.",
  },
  {
    teacherKey: "park-haeun",
    jobExternalId: "dummy-job-baekyang-1",
    status: MatchStatus.HIRED,
    coverLetter: "중등 수학 시간강사로 성실히 임하겠습니다.",
  },
  {
    teacherKey: "choi-minjun",
    jobExternalId: "dummy-job-eunha-1",
    status: MatchStatus.HIRED,
    coverLetter: "고학년 담임 및 학년부장 경력으로 공백 없이 업무를 이어가겠습니다.",
  },
  {
    teacherKey: "jung-yejin",
    jobExternalId: "dummy-job-jeongwon-1",
    status: MatchStatus.REJECTED,
    coverLetter: "원어민 협력수업 경험을 살려 영어 교과를 맡고 싶습니다.",
  },
  {
    teacherKey: "yoon-jiho",
    jobExternalId: "dummy-job-baekyang-2",
    status: MatchStatus.PENDING,
    coverLetter: "방과후 스포츠클럽 운영 경험을 살려 지도하겠습니다.",
  },
];

const MATCH_REQUESTS = [
  {
    demoId: DEMO_ID_MATCH_BASE + 1,
    schoolKey: "hanbit-es",
    teacherKey: "kang-doyoon",
    status: MatchStatus.PENDING,
    employmentType: TeacherType.FIXED_TERM,
    expectedPeriod: "2026.03 ~ 2026.08",
    message: "물리 실험 수업 설계 경력을 보고 직접 제안드립니다.",
  },
  {
    demoId: DEMO_ID_MATCH_BASE + 2,
    schoolKey: "jeongwon-ms",
    teacherKey: "lim-chaewon",
    status: MatchStatus.ACCEPTED,
    employmentType: TeacherType.FIXED_TERM,
    expectedPeriod: "2026.03 ~ 2027.02",
    message: "합창부 지도 경력을 높이 평가하여 제안드립니다.",
  },
];

// applicationExternalJobId + teacherKey pairs that should also get a
// completed Contract + admin-only Review to show the full lifecycle.
const CONTRACTS = [
  {
    teacherKey: "park-haeun",
    jobExternalId: "dummy-job-baekyang-1",
    schoolKey: "baekyang-hs",
    status: ContractStatus.ACTIVE,
    startDate: "2026-03-02",
    endDate: "2026-07-17",
    welcomeMessage: "새 학기 잘 부탁드립니다. 개학 전 오리엔테이션에 참석해 주세요.",
    requiredDocs: "신원조회 동의서, 건강진단서, 통장 사본",
    reportDate: "2026-02-25",
    review: {
      rating: 5,
      comment: "수업 준비가 철저하고 학생 소통 능력이 뛰어났습니다.",
    },
  },
  {
    teacherKey: "choi-minjun",
    jobExternalId: "dummy-job-eunha-1",
    schoolKey: "eunha-es",
    status: ContractStatus.COMPLETED,
    startDate: "2025-09-01",
    endDate: "2026-02-28",
    welcomeMessage: "학년부장 업무 인수인계 자료를 첨부드립니다.",
    requiredDocs: "신원조회 동의서, 건강진단서",
    reportDate: "2025-08-25",
    review: {
      rating: 4,
      comment: "학년 업무 전반을 안정적으로 이끌어 주셨습니다.",
    },
  },
];

function toDate(value) {
  return new Date(`${value}T00:00:00.000Z`);
}

async function main() {
  const adapter = new PrismaPg({ connectionString: databaseUrl });
  const prisma = new PrismaClient({ adapter });
  const now = new Date();
  const hrProfileIdByKey = new Map();
  const teacherProfileIdByKey = new Map();
  const jobPostingIdByExternalId = new Map();

  try {
    console.log(`Seeding dummy data with shared password: ${DUMMY_PASSWORD}`);

    for (const [index, school] of SCHOOLS.entries()) {
      const user = await prisma.user.upsert({
        where: { email: school.hrEmail },
        update: {
          isActive: true,
          isVerified: true,
          name: school.hrName,
          passwordHash: hashPassword(DUMMY_PASSWORD),
          phone: school.hrPhone,
          role: UserRole.HR_MANAGER,
        },
        create: {
          birthDate: toDate(school.hrBirth),
          email: school.hrEmail,
          isActive: true,
          isVerified: true,
          name: school.hrName,
          passwordHash: hashPassword(DUMMY_PASSWORD),
          phone: school.hrPhone,
          privacyConsent: true,
          privacyConsentAt: now,
          role: UserRole.HR_MANAGER,
          termsConsent: true,
          termsConsentAt: now,
        },
        select: { id: true },
      });

      const hrProfile = await prisma.hRProfile.upsert({
        where: { userId: user.id },
        update: {
          approvalStatus: ApprovalStatus.APPROVED,
          approvedAt: now,
          demoId: DEMO_ID_HR_BASE + index + 1,
          position: school.hrPosition,
          schoolAddress: school.schoolAddress,
          schoolCode: school.schoolCode,
          schoolName: school.schoolName,
          schoolRegion: school.schoolRegion,
          schoolType: school.schoolType,
        },
        create: {
          approvalStatus: ApprovalStatus.APPROVED,
          approvedAt: now,
          demoId: DEMO_ID_HR_BASE + index + 1,
          position: school.hrPosition,
          schoolAddress: school.schoolAddress,
          schoolCode: school.schoolCode,
          schoolName: school.schoolName,
          schoolRegion: school.schoolRegion,
          schoolType: school.schoolType,
          userId: user.id,
          verificationCode: `DUMMY-${school.schoolCode}`,
        },
        select: { id: true },
      });

      hrProfileIdByKey.set(school.key, hrProfile.id);
      console.log(`  school ready: ${school.schoolName} (${school.hrEmail})`);
    }

    for (const [index, teacher] of TEACHERS.entries()) {
      const user = await prisma.user.upsert({
        where: { email: teacher.email },
        update: {
          isActive: true,
          isVerified: true,
          name: teacher.name,
          passwordHash: hashPassword(DUMMY_PASSWORD),
          phone: teacher.phone,
          role: UserRole.TEACHER,
        },
        create: {
          birthDate: toDate(teacher.birth),
          email: teacher.email,
          isActive: true,
          isVerified: true,
          name: teacher.name,
          passwordHash: hashPassword(DUMMY_PASSWORD),
          phone: teacher.phone,
          privacyConsent: true,
          privacyConsentAt: now,
          role: UserRole.TEACHER,
          termsConsent: true,
          termsConsentAt: now,
        },
        select: { id: true },
      });

      const teacherProfile = await prisma.teacherProfile.upsert({
        where: { userId: user.id },
        update: {
          avatarPreset: teacher.avatarPreset,
          demoId: DEMO_ID_TEACHER_BASE + index + 1,
          educationLevel: teacher.educationLevel,
          graduationYear: teacher.graduationYear,
          introduction: teacher.introduction,
          major: teacher.major,
          preferredRegions: teacher.preferredRegions,
          preferredTypes: teacher.preferredTypes,
          qualificationGrade: teacher.qualificationGrade,
          qualificationNumber: `DUMMY-${teacher.key}`,
          qualificationSubject: teacher.qualificationSubject,
          qualificationType: teacher.qualificationType,
          residenceAddress: `${teacher.residenceRegion} 상세주소 미입력`,
          residenceRegion: teacher.residenceRegion,
          seekingStatus: teacher.seekingStatus,
          specialSkills: teacher.specialSkills,
          totalExperienceMonths: teacher.experienceMonths,
          totalExperienceYears: teacher.experienceYears,
          university: teacher.university,
        },
        create: {
          avatarPreset: teacher.avatarPreset,
          demoId: DEMO_ID_TEACHER_BASE + index + 1,
          educationLevel: teacher.educationLevel,
          graduationYear: teacher.graduationYear,
          introduction: teacher.introduction,
          major: teacher.major,
          preferredRegions: teacher.preferredRegions,
          preferredTypes: teacher.preferredTypes,
          qualificationGrade: teacher.qualificationGrade,
          qualificationNumber: `DUMMY-${teacher.key}`,
          qualificationSubject: teacher.qualificationSubject,
          qualificationType: teacher.qualificationType,
          residenceAddress: `${teacher.residenceRegion} 상세주소 미입력`,
          residenceRegion: teacher.residenceRegion,
          seekingStatus: teacher.seekingStatus,
          specialSkills: teacher.specialSkills,
          totalExperienceMonths: teacher.experienceMonths,
          totalExperienceYears: teacher.experienceYears,
          university: teacher.university,
          userId: user.id,
        },
        select: { id: true },
      });

      teacherProfileIdByKey.set(teacher.key, teacherProfile.id);

      const existingCareers = await prisma.career.count({
        where: { teacherProfileId: teacherProfile.id },
      });

      if (existingCareers === 0 && teacher.careers.length > 0) {
        await prisma.career.createMany({
          data: teacher.careers.map((career) => ({
            description: career.description,
            employmentType: career.employmentType,
            endDate: career.endDate ? toDate(career.endDate) : null,
            position: career.position,
            region: career.region,
            schoolName: career.schoolName,
            schoolType: career.schoolType,
            startDate: toDate(career.startDate),
            teacherProfileId: teacherProfile.id,
          })),
        });
      }

      console.log(`  teacher ready: ${teacher.name} (${teacher.email})`);
    }

    for (const job of JOBS) {
      const hrProfileId = hrProfileIdByKey.get(job.schoolKey);
      const school = SCHOOLS.find((item) => item.key === job.schoolKey);

      const posting = await prisma.jobPosting.upsert({
        where: { externalId: job.externalId },
        update: {
          duties: job.duties,
          employmentType: job.employmentType,
          endDate: toDate(job.endDate),
          gradeLevel: job.gradeLevel,
          isHomeroom: job.isHomeroom,
          memo: job.memo,
          postingStatus: job.postingStatus,
          qualificationSubject: job.qualificationSubject,
          qualificationType: job.qualificationType,
          schoolName: school.schoolName,
          schoolRegion: school.schoolRegion,
          startDate: toDate(job.startDate),
        },
        create: {
          duties: job.duties,
          employmentType: job.employmentType,
          endDate: toDate(job.endDate),
          externalId: job.externalId,
          gradeLevel: job.gradeLevel,
          hrProfileId,
          isHomeroom: job.isHomeroom,
          memo: job.memo,
          postingStatus: job.postingStatus,
          qualificationSubject: job.qualificationSubject,
          qualificationType: job.qualificationType,
          schoolName: school.schoolName,
          schoolRegion: school.schoolRegion,
          startDate: toDate(job.startDate),
        },
        select: { id: true },
      });

      jobPostingIdByExternalId.set(job.externalId, posting.id);
    }

    console.log(`  job postings ready: ${JOBS.length}`);

    for (const application of APPLICATIONS) {
      const teacherProfileId = teacherProfileIdByKey.get(application.teacherKey);
      const jobPostingId = jobPostingIdByExternalId.get(application.jobExternalId);

      await prisma.application.upsert({
        where: {
          teacherProfileId_jobPostingId: {
            teacherProfileId,
            jobPostingId,
          },
        },
        update: {
          coverLetter: application.coverLetter,
          status: application.status,
        },
        create: {
          coverLetter: application.coverLetter,
          jobPostingId,
          status: application.status,
          teacherProfileId,
        },
      });
    }

    console.log(`  applications ready: ${APPLICATIONS.length}`);

    for (const request of MATCH_REQUESTS) {
      const hrProfileId = hrProfileIdByKey.get(request.schoolKey);
      const teacherProfileId = teacherProfileIdByKey.get(request.teacherKey);

      await prisma.matchRequest.upsert({
        where: { demoId: request.demoId },
        update: {
          employmentType: request.employmentType,
          expectedPeriod: request.expectedPeriod,
          message: request.message,
          status: request.status,
        },
        create: {
          demoId: request.demoId,
          direction: MatchDirection.HR_TO_TEACHER,
          employmentType: request.employmentType,
          expectedPeriod: request.expectedPeriod,
          hrProfileId,
          message: request.message,
          status: request.status,
          teacherProfileId,
        },
      });
    }

    console.log(`  direct offers ready: ${MATCH_REQUESTS.length}`);

    for (const contractSeed of CONTRACTS) {
      const teacherProfileId = teacherProfileIdByKey.get(contractSeed.teacherKey);
      const hrProfileId = hrProfileIdByKey.get(contractSeed.schoolKey);
      const jobPostingId = jobPostingIdByExternalId.get(contractSeed.jobExternalId);
      const school = SCHOOLS.find((item) => item.key === contractSeed.schoolKey);

      const application = await prisma.application.findUnique({
        where: {
          teacherProfileId_jobPostingId: {
            teacherProfileId,
            jobPostingId,
          },
        },
        select: { id: true },
      });

      if (!application) {
        continue;
      }

      const contract = await prisma.contract.upsert({
        where: { applicationId: application.id },
        update: {
          endDate: toDate(contractSeed.endDate),
          reportDate: toDate(contractSeed.reportDate),
          requiredDocs: contractSeed.requiredDocs,
          startDate: toDate(contractSeed.startDate),
          status: contractSeed.status,
          welcomeMessage: contractSeed.welcomeMessage,
        },
        create: {
          applicationId: application.id,
          employmentType:
            JOBS.find((job) => job.externalId === contractSeed.jobExternalId)
              ?.employmentType ?? TeacherType.FIXED_TERM,
          endDate: toDate(contractSeed.endDate),
          hrProfileId,
          reportDate: toDate(contractSeed.reportDate),
          requiredDocs: contractSeed.requiredDocs,
          schoolName: school.schoolName,
          startDate: toDate(contractSeed.startDate),
          status: contractSeed.status,
          teacherProfileId,
          welcomeMessage: contractSeed.welcomeMessage,
        },
        select: { id: true },
      });

      await prisma.review.upsert({
        where: { contractId: contract.id },
        update: {
          comment: contractSeed.review.comment,
          rating: contractSeed.review.rating,
        },
        create: {
          comment: contractSeed.review.comment,
          contractId: contract.id,
          hrProfileId,
          rating: contractSeed.review.rating,
          teacherProfileId,
        },
      });
    }

    console.log(`  contracts + reviews ready: ${CONTRACTS.length}`);

    console.log("\nDummy data seeding complete.");
    console.log(`Shared password for every dummy account: ${DUMMY_PASSWORD}`);
    console.log("\nSchool (HR_MANAGER) accounts:");
    for (const school of SCHOOLS) {
      console.log(`  ${school.schoolName.padEnd(10, " ")} ${school.hrEmail}`);
    }
    console.log("\nTeacher accounts:");
    for (const teacher of TEACHERS) {
      console.log(`  ${teacher.name.padEnd(6, " ")} ${teacher.email}`);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
