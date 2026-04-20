"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Briefcase,
  Heart,
  MapPin,
  Search,
  Send,
  ShieldCheck,
} from "lucide-react";

import { CharacterAvatar } from "@/components/character-avatar";
import { PortalShell } from "@/components/portal-shell";
import {
  featuredTeachers,
  getTeacherById,
  type TeacherStatus,
} from "@/lib/demo-data";

const navItems = [
  { href: "/hr/dashboard", label: "채용 운영", icon: Briefcase },
  { href: "/pool", label: "교사 인력풀", icon: Search, active: true },
  { href: "/jobs", label: "채용 공고", icon: ShieldCheck },
];

function statusTone(status: TeacherStatus) {
  switch (status) {
    case "seeking":
      return {
        label: "채용 제안 가능",
        className: "bg-secondary-50 text-secondary-700",
      };
    case "interviewing":
      return {
        label: "면접 진행 중",
        className: "bg-[var(--warning-soft)] text-[#9a6a00]",
      };
    case "employed":
      return {
        label: "근무 중",
        className: "bg-primary-50 text-primary-700",
      };
    default:
      return {
        label: "노출 일시중지",
        className: "bg-surface-panel text-ink-soft",
      };
  }
}

export default function PoolTeacherDetailPage() {
  const params = useParams<{ id: string }>();
  const teacher = getTeacherById(Number(params.id));
  const searchParams = useSearchParams();
  const requestMode = searchParams.get("request") === "true";
  const [interested, setInterested] = useState(false);
  const [requested, setRequested] = useState(requestMode);

  const relatedJobs = useMemo(
    () =>
      featuredTeachers
        .filter((item) => item.id !== teacher?.id)
        .slice(0, 2)
        .map((item) => item.name),
    [teacher?.id],
  );

  if (!teacher) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface px-4 text-center">
        <div>
          <div className="text-2xl font-bold text-ink">교사 정보를 찾을 수 없습니다.</div>
          <Link href="/pool" className="mt-4 inline-flex text-sm font-semibold text-primary-700">
            인력풀로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const status = statusTone(teacher.status);

  return (
    <PortalShell
      navItems={navItems}
      noticeCount={2}
      primaryAction={{ href: "/jobs", label: "채용 공고 확인", icon: Briefcase }}
      sectionLabel="교사 상세 프로필"
      user={{
        name: "홍수진",
        role: "인사담당",
        detail: "성진초등학교",
      }}
    >
      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="panel-surface p-6">
          <Link
            href="/pool"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary-700"
          >
            <ArrowLeft className="h-4 w-4" />
            인력풀로 돌아가기
          </Link>

          <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center">
            <CharacterAvatar
              className="h-28 w-28 rounded-lg"
              presetId={teacher.avatarPreset}
              size={112}
            />
            <div>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}
              >
                {status.label}
              </span>
              <div className="mt-3 text-3xl font-bold text-ink">{teacher.name}</div>
              <div className="mt-2 text-sm font-semibold text-primary-700">
                {teacher.qualification}
                {teacher.subject ? ` / ${teacher.subject}` : ""}
              </div>
              <div className="mt-2 text-sm text-ink-soft">
                {teacher.residence} / 경력 {teacher.experience}
              </div>
            </div>
          </div>

          <p className="mt-6 text-sm leading-7 text-ink-soft">{teacher.summary}</p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg bg-surface-subtle px-4 py-3 text-sm text-ink-soft">
              희망 근무 형태 {teacher.preferredTypes.join(", ")}
            </div>
            <div className="rounded-lg bg-surface-subtle px-4 py-3 text-sm text-ink-soft">
              프로필 조회 {teacher.portfolioViews}회
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {teacher.preferredRegions.map((region) => (
              <span
                key={region}
                className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-2 text-xs font-medium text-ink-soft ring-1 ring-outline"
              >
                <MapPin className="h-3 w-3" />
                {region}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="panel-surface p-6">
            <div className="text-xl font-bold text-ink">학교 담당자 작업</div>
            <div className="mt-5 grid gap-3">
              <button
                type="button"
                className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold ${
                  interested
                    ? "bg-primary-50 text-primary-700"
                    : "border border-outline text-ink-soft"
                }`}
                onClick={() => setInterested((current) => !current)}
              >
                <Heart className="h-4 w-4" />
                {interested ? "관심 등록됨" : "관심 등록"}
              </button>

              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[linear-gradient(135deg,#0058be,#2170e4)] px-4 py-3 text-sm font-semibold text-white shadow-soft"
                onClick={() => setRequested(true)}
              >
                <Send className="h-4 w-4" />
                {requested ? "매칭 요청 전송 완료" : "매칭 요청 보내기"}
              </button>
            </div>

            <div className="mt-4 rounded-lg bg-surface-subtle px-4 py-4 text-sm leading-6 text-ink-soft">
              {requested
                ? "정인초등학교 3학년 담임 공고 기준으로 제안이 전송된 상태로 더미 데이터가 연결되었습니다."
                : "이 교사의 희망 지역과 자격 조건을 기준으로 바로 매칭 요청을 전송할 수 있습니다."}
            </div>
          </div>

          <div className="panel-surface p-6">
            <div className="text-xl font-bold text-ink">검토 포인트</div>
            <div className="mt-4 space-y-3">
              <div className="rounded-lg bg-surface-subtle px-4 py-3 text-sm text-ink-soft">
                최근 적합 공고: 정인초등학교 3학년 담임
              </div>
              <div className="rounded-lg bg-surface-subtle px-4 py-3 text-sm text-ink-soft">
                희망 지역: {teacher.preferredRegions.join(", ")}
              </div>
              <div className="rounded-lg bg-surface-subtle px-4 py-3 text-sm text-ink-soft">
                유사 경력 참고: {relatedJobs.join(", ")}
              </div>
            </div>
          </div>
        </div>
      </section>
    </PortalShell>
  );
}
