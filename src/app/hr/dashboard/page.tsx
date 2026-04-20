"use client";

import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  LayoutDashboard,
  Search,
  Send,
  ShieldCheck,
  Users,
} from "lucide-react";

import { CharacterAvatar } from "@/components/character-avatar";
import { JobVisual } from "@/components/job-visual";
import { PortalShell } from "@/components/portal-shell";
import {
  featuredTeachers,
  getMatchedTeachersForJob,
  hrMatchRequests,
  jobPosts,
  jobTeacherMatches,
} from "@/lib/demo-data";
import { useViewerRole } from "@/lib/demo-session-client";
import { getTeacherDisplayName } from "@/lib/privacy";

const navItems = [
  {
    href: "/hr/dashboard",
    label: "채용 운영",
    icon: LayoutDashboard,
    active: true,
  },
  { href: "/pool", label: "교사 인력풀", icon: Search },
  { href: "/jobs", label: "채용 공고", icon: Briefcase },
];

function requestTone(status: string) {
  switch (status) {
    case "accepted":
      return "bg-secondary-50 text-secondary-700";
    case "rejected":
      return "bg-[var(--danger-soft)] text-[#9c2f24]";
    default:
      return "bg-[var(--warning-soft)] text-[#9a6a00]";
  }
}

export default function HRDashboardPage() {
  const viewerRole = useViewerRole("hr");
  const liveJobs = jobPosts.filter((job) => job.status !== "closed");
  const pendingMatches = hrMatchRequests.filter(
    (request) => request.status === "pending",
  );

  return (
    <PortalShell
      navItems={navItems}
      noticeCount={pendingMatches.length}
      primaryAction={{ href: "/pool", label: "교사 인력풀 보기", icon: Search }}
      sectionLabel="학교 채용 운영"
      user={{
        name: "홍수진",
        role: "인사담당",
        detail: "성진초등학교",
      }}
    >
      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="self-start rounded-lg bg-[linear-gradient(135deg,#0058be,#2170e4)] p-6 text-white shadow-soft">
          <div className="flex min-h-[176px] flex-col justify-between">
            <div>
              <div className="inline-flex rounded-full bg-white/12 px-3 py-2 text-sm font-semibold text-white/90">
                채용 운영
              </div>
              <div className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
                학교 채용 관리
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/pool"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-primary-700"
              >
                <Search className="h-4 w-4" />
                교사 인력풀 보기
              </Link>
              <Link
                href="/jobs"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/18 bg-white/10 px-5 py-3 text-sm font-semibold text-white"
              >
                <Briefcase className="h-4 w-4" />
                채용 공고 관리
              </Link>
            </div>
          </div>
        </div>

        <div className="panel-surface p-6">
          <div className="text-sm font-semibold text-ink-soft">운영 메모</div>
          <div className="mt-5 space-y-3">
            {[
              "면접 진행 중인 후보 2명에 대한 응답 확인이 필요합니다.",
              "성진초 3학년 담임 공고는 마감까지 5일 남았습니다.",
              "조건에 맞는 신규 등록 교사 4명이 오늘 추가되었습니다.",
            ].map((note) => (
              <div
                key={note}
                className="rounded-lg bg-surface-subtle px-4 py-3 text-sm text-ink-soft"
              >
                {note}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "보낸 요청", value: `${hrMatchRequests.length}건`, Icon: Users },
          { label: "응답 대기", value: `${pendingMatches.length}건`, Icon: Send },
          { label: "진행 중 공고", value: `${liveJobs.length}건`, Icon: Briefcase },
          { label: "신규 등록 교사", value: "4명", Icon: ShieldCheck },
        ].map((item) => (
          <div key={item.label} className="panel-surface p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
              <item.Icon className="h-5 w-5" />
            </div>
            <div className="mt-4 text-3xl font-bold text-ink">{item.value}</div>
            <div className="mt-1 text-sm text-ink-soft">{item.label}</div>
          </div>
        ))}
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="panel-surface p-6">
          <div className="flex items-center justify-between">
            <div className="text-xl font-bold text-ink">최근 보낸 매칭 요청</div>
            <Link href="/pool" className="text-sm font-semibold text-primary-700">
              교사 인력풀
            </Link>
          </div>

          <div className="mt-6 space-y-4">
            {hrMatchRequests.map((request) => (
              <div
                key={request.id}
                className="rounded-lg border border-outline bg-surface p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${requestTone(
                        request.status,
                      )}`}
                    >
                      {request.status === "accepted"
                        ? "응답 완료"
                        : request.status === "rejected"
                          ? "검토 종료"
                          : "응답 대기"}
                    </span>
                    <div className="mt-3 text-xl font-bold text-ink">
                      {getTeacherDisplayName(request.teacherName, viewerRole)}
                    </div>
                    <div className="mt-1 text-sm text-ink-soft">
                      {request.qualification} / {request.position}
                    </div>
                    <div className="mt-2 text-sm text-ink-muted">
                      {request.note}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-sm text-ink-muted">{request.sentAt}</div>
                    <Link
                      href={`/pool/${request.teacherId}`}
                      className="text-sm font-semibold text-primary-700"
                    >
                      프로필 보기
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel-surface p-6">
          <div className="flex items-center justify-between">
            <div className="text-xl font-bold text-ink">진행 중인 채용 공고</div>
            <Link href="/jobs" className="text-sm font-semibold text-primary-700">
              전체 공고
            </Link>
          </div>

          <div className="mt-6 space-y-4">
            {liveJobs.map((job) => {
              const matchedTeachers = getMatchedTeachersForJob(job.id);
              const matchStage =
                jobTeacherMatches.find((item) => item.jobId === job.id) ?? null;

              return (
                <Link
                key={job.id}
                href={`/jobs/${job.id}`}
                className="block rounded-lg border border-outline bg-surface p-5 transition-colors hover:bg-surface-subtle"
              >
                <div className="flex gap-4">
                  <JobVisual
                    className="h-20 w-20 shrink-0"
                    employmentType={job.employmentType}
                    gradeLevel={job.gradeLevel}
                    id={job.id}
                    qualificationSubject={job.qualificationSubject}
                    qualificationType={job.qualificationType}
                    schoolName={job.schoolName}
                    schoolRegion={job.schoolRegion}
                    variant="mini"
                  />
                  <div className="flex-1">
                    <div className="text-lg font-bold text-ink">{job.schoolName}</div>
                    <div className="mt-1 text-sm text-ink-soft">
                      {job.gradeLevel} / {job.employmentType}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-3 text-sm text-ink-muted">
                      <span>지원자 {job.applicants}명</span>
                      <span>조회 {job.views}</span>
                      <span>마감 {job.deadline}</span>
                    </div>
                    {matchedTeachers.length > 0 ? (
                      <div className="mt-4 rounded-lg bg-surface-subtle px-3 py-3">
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="text-xs font-semibold text-primary-700">
                            {matchStage?.stage ?? "검토 진행"}
                          </div>
                          <div className="flex flex-wrap items-center gap-3">
                            {matchedTeachers.map((teacher) => (
                              <div
                                key={teacher.id}
                                className="flex items-center gap-2"
                              >
                                <CharacterAvatar
                                  className="h-9 w-9 rounded-lg"
                                  presetId={teacher.avatarPreset}
                                  size={36}
                                />
                                <span className="text-sm font-medium text-ink-soft">
                                  {getTeacherDisplayName(
                                    teacher.name,
                                    viewerRole,
                                  )}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mt-8 panel-surface p-6">
        <div className="flex items-center justify-between">
          <div className="text-xl font-bold text-ink">추천 교사</div>
          <Link
            href="/pool"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary-700"
          >
            전체 보기
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {featuredTeachers.slice(0, 3).map((teacher) => (
            <Link
              key={teacher.id}
              href={`/pool/${teacher.id}`}
              className="block rounded-lg border border-outline bg-surface p-5 transition-colors hover:bg-surface-subtle"
            >
              <div className="flex items-start gap-4">
                <CharacterAvatar
                  className="h-16 w-16 rounded-lg"
                  presetId={teacher.avatarPreset}
                  size={64}
                />
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-ink">
                    {getTeacherDisplayName(teacher.name, viewerRole)}
                  </div>
                  <div className="mt-1 text-sm text-ink-soft">
                    {teacher.qualification}
                  </div>
                  <div className="mt-1 text-sm text-ink-muted">
                    {teacher.residence}
                  </div>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-surface-subtle px-3 py-2 text-xs font-medium text-ink-soft">
                  경력 {teacher.experience}
                </span>
                {teacher.preferredTypes.slice(0, 1).map((type) => (
                  <span
                    key={type}
                    className="rounded-full bg-primary-50 px-3 py-2 text-xs font-medium text-primary-700"
                  >
                    {type}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </PortalShell>
  );
}
