/** 경기도 31개 시·군 목록 */
export const GYEONGGI_REGIONS = [
  { code: "GG01", name: "수원시" },
  { code: "GG02", name: "성남시" },
  { code: "GG03", name: "고양시" },
  { code: "GG04", name: "용인시" },
  { code: "GG05", name: "부천시" },
  { code: "GG06", name: "안산시" },
  { code: "GG07", name: "안양시" },
  { code: "GG08", name: "남양주시" },
  { code: "GG09", name: "화성시" },
  { code: "GG10", name: "평택시" },
  { code: "GG11", name: "의정부시" },
  { code: "GG12", name: "시흥시" },
  { code: "GG13", name: "파주시" },
  { code: "GG14", name: "김포시" },
  { code: "GG15", name: "광명시" },
  { code: "GG16", name: "광주시" },
  { code: "GG17", name: "군포시" },
  { code: "GG18", name: "오산시" },
  { code: "GG19", name: "이천시" },
  { code: "GG20", name: "양주시" },
  { code: "GG21", name: "안성시" },
  { code: "GG22", name: "구리시" },
  { code: "GG23", name: "포천시" },
  { code: "GG24", name: "의왕시" },
  { code: "GG25", name: "하남시" },
  { code: "GG26", name: "여주시" },
  { code: "GG27", name: "양평군" },
  { code: "GG28", name: "동두천시" },
  { code: "GG29", name: "과천시" },
  { code: "GG30", name: "가평군" },
  { code: "GG31", name: "연천군" },
] as const;

/** 중등 교과목 목록 */
export const SECONDARY_SUBJECTS = [
  "국어", "수학", "영어", "사회", "역사", "도덕",
  "과학", "물리학", "화학", "생명과학", "지구과학",
  "기술·가정", "정보", "체육", "음악", "미술",
  "한문", "일본어", "중국어", "독일어", "프랑스어", "스페인어",
  "보건", "진로와직업", "환경", "상업정보",
  "특수(초등)", "특수(중등)", "사서", "영양", "전문상담",
] as const;

/** 구직 상태 라벨 매핑 */
export const SEEKING_STATUS_LABELS: Record<string, { label: string; emoji: string; color: string }> = {
  SEEKING: { label: "구직중", emoji: "🟢", color: "bg-seeking" },
  INTERVIEWING: { label: "면접진행중", emoji: "🟡", color: "bg-interviewing" },
  EMPLOYED: { label: "재직중", emoji: "🔵", color: "bg-employed" },
  NOT_SEEKING: { label: "구직중지", emoji: "⚫", color: "bg-not-seeking" },
  RESERVED: { label: "예약확정", emoji: "🟣", color: "bg-reserved" },
};

/**
 * 이름 마스킹 처리
 * 2글자: 김○
 * 3글자: 김○현
 * 4글자 이상: 김○○현
 */
export function maskName(name: string): string {
  if (name.length <= 1) return name;
  if (name.length === 2) return name[0] + "○";
  if (name.length === 3) return name[0] + "○" + name[2];
  return name[0] + "○".repeat(name.length - 2) + name[name.length - 1];
}

/** 만 나이 계산 */
export function calculateAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}
