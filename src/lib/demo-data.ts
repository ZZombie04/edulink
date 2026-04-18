import type { AvatarPresetId } from "@/lib/avatar-presets";

export type TeacherStatus = "seeking" | "interviewing" | "employed" | "paused";

export interface TeacherProfile {
  id: number;
  name: string;
  age: number;
  birthYear: number;
  avatarPreset: AvatarPresetId;
  qualification: string;
  qualificationCategory: "초등" | "중등" | "특수";
  subject?: string;
  experience: string;
  residence: string;
  preferredRegions: string[];
  preferredTypes: string[];
  status: TeacherStatus;
  employedUntil?: string;
  interviewCount?: number;
  reservation?: boolean;
  reservationCount?: number;
  summary: string;
  portfolioViews: number;
}

export interface JobPost {
  id: string;
  schoolName: string;
  schoolRegion: string;
  schoolAddress: string;
  employmentType: "기간제 교사" | "시간강사";
  startDate: string;
  endDate: string;
  qualificationType: "초등" | "중등" | "특수";
  qualificationSubject?: string;
  gradeLevel: string;
  isHomeroom: boolean;
  summary: string;
  duties: string[];
  requirements: string[];
  benefits: string[];
  status: "open" | "closing-soon" | "closed";
  postedAt: string;
  deadline: string;
  contactName: string;
  applicants: number;
  views: number;
  image: string;
}

export const gyeonggiRegions = [
  "수원",
  "성남",
  "고양",
  "용인",
  "부천",
  "안산",
  "안양",
  "남양주",
  "화성",
  "평택",
  "의정부",
  "시흥",
  "파주",
  "광명",
  "김포",
  "군포",
  "광주",
  "이천",
  "양주",
  "오산",
  "구리",
  "안성",
  "포천",
  "의왕",
  "하남",
  "여주",
  "동두천",
  "과천",
  "가평",
  "양평",
  "연천",
];

export const secondarySubjects = [
  "국어",
  "수학",
  "영어",
  "사회",
  "역사",
  "과학",
  "물리",
  "화학",
  "생명과학",
  "지구과학",
  "체육",
  "음악",
  "미술",
  "정보",
  "보건",
  "진로",
];

export const featuredTeachers: TeacherProfile[] = [
  {
    id: 1,
    name: "박서영",
    age: 28,
    birthYear: 1998,
    avatarPreset: "teacher-f-rose",
    qualification: "초등 2급 정교사",
    qualificationCategory: "초등",
    experience: "2년 6개월",
    residence: "수원",
    preferredRegions: ["수원", "화성", "용인"],
    preferredTypes: ["기간제", "시간강사"],
    status: "seeking",
    summary: "초등 저학년 담임과 기초학력 보정 수업 경험이 있습니다.",
    portfolioViews: 12,
  },
  {
    id: 2,
    name: "이준호",
    age: 45,
    birthYear: 1981,
    avatarPreset: "teacher-m-navy",
    qualification: "중등 1급 정교사",
    qualificationCategory: "중등",
    subject: "수학",
    experience: "18년 2개월",
    residence: "성남",
    preferredRegions: ["성남", "수원", "용인", "광주"],
    preferredTypes: ["기간제"],
    status: "interviewing",
    interviewCount: 2,
    summary: "고등 수학과 진학 지도 경험이 많습니다.",
    portfolioViews: 26,
  },
  {
    id: 3,
    name: "김도현",
    age: 52,
    birthYear: 1974,
    avatarPreset: "teacher-m-forest",
    qualification: "초등 1급 정교사",
    qualificationCategory: "초등",
    experience: "25년",
    residence: "고양",
    preferredRegions: ["고양", "파주"],
    preferredTypes: ["기간제"],
    status: "employed",
    employedUntil: "2026.08.31",
    reservation: true,
    reservationCount: 1,
    summary: "고학년 담임과 학년 운영 경험이 많습니다.",
    portfolioViews: 18,
  },
  {
    id: 4,
    name: "최하린",
    age: 31,
    birthYear: 1995,
    avatarPreset: "teacher-f-violet",
    qualification: "특수 2급 정교사",
    qualificationCategory: "특수",
    experience: "6년 4개월",
    residence: "안양",
    preferredRegions: ["안양", "군포", "의왕"],
    preferredTypes: ["기간제", "시간강사"],
    status: "paused",
    summary: "통합학급 협력 수업과 개별화교육계획 작성 경험이 있습니다.",
    portfolioViews: 9,
  },
];

export const jobPosts: JobPost[] = [
  {
    id: "1",
    schoolName: "정인초등학교",
    schoolRegion: "수원",
    schoolAddress: "경기도 수원시 영통구 효원로 123",
    employmentType: "기간제 교사",
    startDate: "2026-05-01",
    endDate: "2026-08-31",
    qualificationType: "초등",
    gradeLevel: "3학년 담임",
    isHomeroom: true,
    summary: "3학년 담임과 생활지도를 담당할 기간제 교사를 모집합니다.",
    duties: [
      "3학년 담임 및 학급 운영",
      "국어, 수학, 사회 수업",
      "학부모 상담 및 기초학력 지도",
      "학년 행사 운영",
    ],
    requirements: [
      "초등 2급 정교사 이상",
      "담임 경력 1년 이상 우대",
      "5월 1일부터 근무 가능",
    ],
    benefits: [
      "경기도교육청 기준 보수 적용",
      "멘토 교사 배정",
      "급식 및 교재 지원",
    ],
    status: "open",
    postedAt: "2026-04-15",
    deadline: "2026-04-25",
    contactName: "홍수진 교무부장",
    applicants: 5,
    views: 128,
    image:
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "2",
    schoolName: "서해중학교",
    schoolRegion: "화성",
    schoolAddress: "경기도 화성시 동탄반석로 44",
    employmentType: "시간강사",
    startDate: "2026-04-22",
    endDate: "2026-05-30",
    qualificationType: "중등",
    qualificationSubject: "수학",
    gradeLevel: "1학년 교과",
    isHomeroom: false,
    summary: "중1 수학 수업을 맡을 시간강사를 모집합니다.",
    duties: [
      "주 14시간 수학 수업",
      "평가 문항 검토 및 과제 피드백",
      "방과후 보충수업 1시간 운영",
    ],
    requirements: [
      "중등 수학 정교사 자격",
      "학생 상담 경험 우대",
      "주 3일 이상 출근 가능",
    ],
    benefits: [
      "주차 지원",
      "수업 자료 공동 사용",
      "방과후 운영비 별도 지급",
    ],
    status: "closing-soon",
    postedAt: "2026-04-16",
    deadline: "2026-04-20",
    contactName: "김민석 연구부장",
    applicants: 12,
    views: 211,
    image:
      "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "3",
    schoolName: "늘봄고등학교",
    schoolRegion: "용인",
    schoolAddress: "경기도 용인시 수지구 문정로 88",
    employmentType: "기간제 교사",
    startDate: "2026-03-01",
    endDate: "2027-02-28",
    qualificationType: "중등",
    qualificationSubject: "영어",
    gradeLevel: "2학년 담임",
    isHomeroom: true,
    summary: "영어 수업과 담임 업무를 맡을 기간제 교사를 모집합니다.",
    duties: [
      "2학년 담임 및 생활교육",
      "주당 16시간 영어 수업",
      "학년부 업무와 진학 상담",
    ],
    requirements: [
      "중등 영어 2급 정교사 이상",
      "담임 또는 학년부 경험 우대",
      "정규 학기 운영 가능",
    ],
    benefits: [
      "학년 업무 수당",
      "진학부 자료 지원",
      "교내 어학 프로그램 참여",
    ],
    status: "closed",
    postedAt: "2026-03-11",
    deadline: "2026-03-21",
    contactName: "이예진 인사담당",
    applicants: 19,
    views: 304,
    image:
      "https://images.unsplash.com/photo-1497486751825-1233686d5d80?auto=format&fit=crop&w=1200&q=80",
  },
];

export const teacherMatchRequests = [
  {
    id: 1,
    schoolName: "정인초등학교",
    region: "수원",
    position: "3학년 담임 기간제",
    period: "2026.05.01 - 2026.08.31",
    status: "pending" as const,
    receivedAt: "2시간 전",
  },
  {
    id: 2,
    schoolName: "서해중학교",
    region: "화성",
    position: "수학 시간강사",
    period: "2026.04.22 - 2026.05.30",
    status: "accepted" as const,
    receivedAt: "어제",
  },
  {
    id: 3,
    schoolName: "늘봄고등학교",
    region: "용인",
    position: "영어 기간제",
    period: "2026.03.01 - 2027.02.28",
    status: "rejected" as const,
    receivedAt: "3일 전",
  },
];

export const hrMatchRequests = [
  {
    id: 1,
    teacherName: "박서영",
    qualification: "초등 2급 정교사",
    status: "pending" as const,
    sentAt: "2시간 전",
    position: "정인초등학교 3학년 담임",
  },
  {
    id: 2,
    teacherName: "이준호",
    qualification: "중등 수학 1급 정교사",
    status: "accepted" as const,
    sentAt: "어제",
    position: "서해중학교 수학 시간강사",
  },
  {
    id: 3,
    teacherName: "김도현",
    qualification: "초등 1급 정교사",
    status: "rejected" as const,
    sentAt: "3일 전",
    position: "늘봄초등학교 학년 대체",
  },
];

export const adminApprovals = [
  {
    id: 1,
    name: "홍수진",
    email: "hong@school.go.kr",
    schoolName: "정인초등학교",
    schoolRegion: "수원",
    position: "교무부장",
    requestedAt: "2시간 전",
  },
  {
    id: 2,
    name: "김민석",
    email: "kim@school.go.kr",
    schoolName: "서해중학교",
    schoolRegion: "화성",
    position: "연구부장",
    requestedAt: "5시간 전",
  },
  {
    id: 3,
    name: "이예진",
    email: "lee@school.go.kr",
    schoolName: "늘봄고등학교",
    schoolRegion: "용인",
    position: "인사담당",
    requestedAt: "어제",
  },
];

export const recentUsers = [
  {
    id: 1,
    name: "박서영",
    role: "teacher" as const,
    email: "park@email.com",
    status: "active" as const,
    joinedAt: "2일 전",
  },
  {
    id: 2,
    name: "이준호",
    role: "teacher" as const,
    email: "lee@email.com",
    status: "active" as const,
    joinedAt: "3일 전",
  },
  {
    id: 3,
    name: "홍수진",
    role: "hr" as const,
    email: "hong@school.go.kr",
    status: "pending" as const,
    joinedAt: "2시간 전",
  },
  {
    id: 4,
    name: "최하린",
    role: "teacher" as const,
    email: "choi@email.com",
    status: "inactive" as const,
    joinedAt: "1주 전",
  },
];
