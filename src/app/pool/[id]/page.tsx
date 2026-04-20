"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
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
import { useDemoHiringState } from "@/lib/demo-hiring-state";

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
  const {
    cancelPoolRequest,
    getRequestForTeacherAndJob,
    hrMatchRequests,
    isTeacherInterested,
    liveJobs,
    sendPoolRequest,
    toggleInterestedTeacher,
  } = useDemoHiringState();
  const [selectedJobId, setSelectedJobId] = useState(liveJobs[0]?.id ?? "");

  const relatedTeachers = useMemo(
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

  const selectedJob = liveJobs.find((job) => job.id === selectedJobId) ?? liveJobs[0] ?? null;
  const activeRequest = selectedJob
    ? getRequestForTeacherAndJob(teacher.id, selectedJob.id)
    : null;
  const interested = isTeacherInterested(teacher.id);
  const status = statusTone(teacher.status);

  return (
    <PortalShell
      navItems={navItems}
      noticeCount={hrMatchRequests.filter((request) => request.status === "pending").length}
      primaryAction={{ href: "/jobs", label: "채용 공고 확인", icon: Briefcase }}
      sectionLabel="교사 상세 프로필"
      user={{
        name: "홍수진",
        role: "인사담당",
        detail: "성진초등학교",
      }}
    >
      <section className="grid gap-6 xl:grid-cols-[1.04fr_0.96fr]">
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
              <div className="mt-3 break-keep text-3xl font-bold text-ink">
                {teacher.name}
              </div>
              <div className="mt-2 break-keep text-sm font-semibold text-primary-700">
                {teacher.qualification}
                {teacher.subject ? ` / ${teacher.subject}` : ""}
              </div>
              <div className="mt-2 text-sm text-ink-soft">
                {teacher.residence} / 경력 {teacher.experience}
              </div>
            </div>
          </div>

          <p className="mt-6 break-keep text-sm leading-7 text-ink-soft">
            {teacher.summary}
          </p>

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
            <div className="mt-5 space-y-4">
              <button
                type="button"
                className={`inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold ${
                  interested
                    ? "bg-primary-50 text-primary-700"
                    : "border border-outline bg-white text-ink-soft"
                }`}
                onClick={() => toggleInterestedTeacher(teacher.id)}
              >
                <Heart className="h-4 w-4" />
                {interested ? "관심 등록 해제" : "관심 등록"}
              </button>

              <label className="block">
                <div className="mb-2 text-sm font-semibold text-ink">
                  연결할 채용 공고
                </div>
                <select
                  className="input-surface"
                  value={selectedJob?.id ?? ""}
                  onChange={(event) => setSelectedJobId(event.target.value)}
                >
                  {liveJobs.map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.schoolName} / {job.gradeLevel}
                    </option>
                  ))}
                </select>
              </label>

              {selectedJob ? (
                <div className="rounded-lg bg-surface-subtle px-4 py-4 text-sm text-ink-soft">
                  <div className="font-semibold text-ink">
                    {selectedJob.schoolName} / {selectedJob.gradeLevel}
                  </div>
                  <div className="mt-2 break-keep leading-6">
                    {selectedJob.summary}
                  </div>
                </div>
              ) : null}

              {selectedJob ? (
                activeRequest &&
                !["rejected", "cancelled", "archived"].includes(activeRequest.status) ? (
                  <div className="grid gap-3">
                    <div className="rounded-lg bg-primary-50 px-4 py-4 text-sm text-primary-700">
                      {activeRequest.summary}
                    </div>
                    {activeRequest.status === "pending" ? (
                      <button
                        type="button"
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-outline bg-white px-4 py-3 text-sm font-semibold text-ink-soft"
                        onClick={() => cancelPoolRequest(activeRequest.id)}
                      >
                        <Send className="h-4 w-4" />
                        매칭 요청 취소
                      </button>
                    ) : (
                      <Link
                        href={`/teacher/offers/${activeRequest.id}`}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-outline bg-white px-4 py-3 text-sm font-semibold text-primary-700"
                      >
                        교사 화면에서 상태 확인
                      </Link>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[linear-gradient(135deg,#0058be,#2170e4)] px-4 py-3 text-sm font-semibold text-white shadow-soft"
                    onClick={() => sendPoolRequest(selectedJob.id, teacher.id)}
                  >
                    <Send className="h-4 w-4" />
                    매칭 요청 보내기
                  </button>
                )
              ) : (
                <div className="rounded-lg bg-surface-subtle px-4 py-4 text-sm text-ink-soft">
                  먼저 연결할 공고를 선택해 주세요.
                </div>
              )}
            </div>
          </div>

          <div className="panel-surface p-6">
            <div className="text-xl font-bold text-ink">검토 포인트</div>
            <div className="mt-4 space-y-3">
              <div className="rounded-lg bg-surface-subtle px-4 py-3 text-sm text-ink-soft">
                희망 지역: {teacher.preferredRegions.join(", ")}
              </div>
              <div className="rounded-lg bg-surface-subtle px-4 py-3 text-sm text-ink-soft">
                희망 근무 형태: {teacher.preferredTypes.join(", ")}
              </div>
              <div className="rounded-lg bg-surface-subtle px-4 py-3 text-sm text-ink-soft">
                유사 검토 대상: {relatedTeachers.join(", ")}
              </div>
            </div>
          </div>
        </div>
      </section>
    </PortalShell>
  );
}
