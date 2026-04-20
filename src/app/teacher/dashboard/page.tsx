"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Bell,
  Briefcase,
  Clock3,
  Home,
  LayoutDashboard,
  MapPin,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";

import { CharacterAvatar } from "@/components/character-avatar";
import { PortalShell } from "@/components/portal-shell";
import {
  featuredTeachers,
  jobPosts,
} from "@/lib/demo-data";
import { getResolvedTeacherOffersForTeacher, useDemoHiringState } from "@/lib/demo-hiring-state";

const navItems = [
  { href: "/teacher/dashboard", label: "내 홈", icon: LayoutDashboard, active: true },
  { href: "/", label: "메인", icon: Home },
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

export default function TeacherDashboardPage() {
  const teacher = featuredTeachers[0];
  const { appliedJobs, state } = useDemoHiringState();
  const [availability, setAvailability] = useState<"seeking" | "paused">(
    teacher.status === "paused" ? "paused" : "seeking",
  );
  const [archivedRequestIds, setArchivedRequestIds] = useState<number[]>([]);

  const teacherRequests = useMemo(
    () =>
      getResolvedTeacherOffersForTeacher(teacher.id, state).filter(
        (request) => !archivedRequestIds.includes(request.id),
      ),
    [archivedRequestIds, state, teacher.id],
  );

  const pendingRequests = useMemo(
    () => teacherRequests.filter((request) => request.status === "pending"),
    [teacherRequests],
  );
  const processedRequests = useMemo(
    () => teacherRequests.filter((request) => request.status !== "pending"),
    [teacherRequests],
  );
  const openJobCount = jobPosts.filter((job) => job.status !== "closed").length;

  return (
    <PortalShell
      navItems={navItems}
      noticeCount={pendingRequests.length}
      primaryAction={{ href: "/jobs", label: "채용 공고 보기", icon: Briefcase }}
      sectionLabel="교사 홈"
      user={{
        name: teacher.name,
        role: "등록 교사",
        detail: teacher.qualification,
        avatarPreset: teacher.avatarPreset,
      }}
    >
      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="self-start rounded-lg bg-[linear-gradient(135deg,#0058be,#2170e4)] p-6 text-white shadow-soft">
          <div className="flex min-h-[176px] flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-2 text-sm font-semibold text-white/90">
                <Sparkles className="h-4 w-4" />
                내 홈
              </div>
              <div className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
                {teacher.name} 선생님
              </div>
              <div className="mt-3 text-sm leading-6 text-white/82">
                받은 제안과 현재 노출 상태, 희망 근무 조건을 한 화면에서 바로
                확인할 수 있습니다.
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/jobs"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-primary-700"
              >
                <Briefcase className="h-4 w-4" />
                채용 공고 보기
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/18 bg-white/10 px-5 py-3 text-sm font-semibold text-white"
              >
                <Home className="h-4 w-4" />
                메인으로
              </Link>
            </div>
          </div>
        </div>

        <div className="panel-surface p-6">
          <div className="text-sm font-semibold text-ink-soft">현재 상태</div>
          <div className="mt-5 space-y-3">
            <button
              type="button"
              className={`flex w-full items-center justify-between rounded-lg px-4 py-4 text-left ${
                availability === "seeking"
                  ? "bg-primary-50 text-primary-700"
                  : "bg-surface-subtle text-ink-soft"
              }`}
              onClick={() => setAvailability("seeking")}
            >
              <div>
                <div className="font-semibold">채용 제안 가능</div>
                <div className="mt-1 text-sm">
                  학교에서 프로필을 확인하고 제안을 보낼 수 있는 상태입니다.
                </div>
              </div>
              <ShieldCheck className="h-5 w-5" />
            </button>

            <button
              type="button"
              className={`flex w-full items-center justify-between rounded-lg px-4 py-4 text-left ${
                availability === "paused"
                  ? "bg-primary-50 text-primary-700"
                  : "bg-surface-subtle text-ink-soft"
              }`}
              onClick={() => setAvailability("paused")}
            >
              <div>
                <div className="font-semibold">노출 일시중지</div>
                <div className="mt-1 text-sm">
                  새 제안은 잠시 멈추고 프로필만 보관합니다.
                </div>
              </div>
              <Clock3 className="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "프로필 조회", value: `${teacher.portfolioViews}회`, Icon: UserRound },
          { label: "받은 제안", value: `${teacherRequests.length}건`, Icon: Bell },
          { label: "희망 지역", value: `${teacher.preferredRegions.length}곳`, Icon: MapPin },
          {
            label: appliedJobs.length > 0 ? "지원 완료" : "지원 가능한 공고",
            value: appliedJobs.length > 0 ? `${appliedJobs.length}건` : `${openJobCount}건`,
            Icon: Briefcase,
          },
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

      <section className="mt-8 grid gap-6 xl:grid-cols-[1fr_0.95fr]">
        <div className="panel-surface p-6">
          <div className="flex items-center justify-between">
            <div className="text-xl font-bold text-ink">최근 받은 제안</div>
            <Link
              href={
                pendingRequests[0]
                  ? `/teacher/offers/${pendingRequests[0].id}`
                  : "/jobs"
              }
              className="text-sm font-semibold text-primary-700"
            >
              최근 제안 보기
            </Link>
          </div>

          <div className="mt-6 space-y-4">
            {teacherRequests.map((request) => (
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
                      {request.schoolName}
                    </div>
                    <div className="mt-1 text-sm text-ink-soft">
                      {request.position} / {request.period}
                    </div>
                    <div className="mt-2 text-sm text-ink-muted">
                      {request.summary}
                    </div>
                    <div className="mt-2 inline-flex items-center gap-2 text-sm text-ink-muted">
                      <MapPin className="h-4 w-4 text-primary-600" />
                      {request.region}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {request.status === "pending" ? (
                      <>
                        <Link
                          href={`/teacher/offers/${request.id}`}
                          className="rounded-lg bg-[linear-gradient(135deg,#0058be,#2170e4)] px-4 py-3 text-sm font-semibold text-white shadow-soft"
                        >
                          검토하기
                        </Link>
                        <button
                          type="button"
                          className="rounded-lg border border-outline px-4 py-3 text-sm font-semibold text-ink-soft"
                          onClick={() =>
                            setArchivedRequestIds((current) => [
                              ...current,
                              request.id,
                            ])
                          }
                        >
                          보관
                        </button>
                      </>
                    ) : (
                      <div className="text-sm text-ink-muted">{request.receivedAt}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {teacherRequests.length === 0 ? (
              <div className="rounded-lg border border-dashed border-outline bg-surface-subtle px-4 py-8 text-center text-sm text-ink-soft">
                보관하지 않은 제안이 없습니다.
              </div>
            ) : null}
          </div>
        </div>

        <div className="space-y-6">
          <div className="panel-surface p-6">
            <div className="text-xl font-bold text-ink">내 프로필</div>

            <div className="mt-6 flex items-center gap-4">
              <CharacterAvatar
                className="h-20 w-20 rounded-lg"
                presetId={teacher.avatarPreset}
                size={80}
              />
              <div>
                <div className="text-2xl font-bold text-ink">{teacher.name}</div>
                <div className="mt-1 text-sm text-ink-soft">
                  {teacher.qualification} / {teacher.residence}
                </div>
                <div className="mt-2 text-sm font-medium text-primary-700">
                  경력 {teacher.experience}
                </div>
              </div>
            </div>

            <p className="mt-5 text-sm leading-6 text-ink-soft">{teacher.summary}</p>

            <div className="mt-5 flex flex-wrap gap-2">
              {teacher.preferredRegions.map((region) => (
                <span
                  key={region}
                  className="rounded-full bg-surface-subtle px-3 py-2 text-xs font-medium text-ink-soft"
                >
                  {region}
                </span>
              ))}
            </div>
          </div>

          <div className="panel-surface p-6">
            <div className="text-xl font-bold text-ink">근무 조건</div>

            <div className="mt-5">
              <div className="text-sm font-semibold text-ink">희망 형태</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {teacher.preferredTypes.map((type) => (
                  <span
                    key={type}
                    className="rounded-full bg-primary-50 px-3 py-2 text-xs font-medium text-primary-700"
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <div className="text-sm font-semibold text-ink">처리 완료 제안</div>
              <div className="mt-3 grid gap-3">
                {processedRequests.map((request) => (
                  <div
                    key={request.id}
                    className="rounded-lg bg-surface-subtle px-4 py-3 text-sm text-ink-soft"
                  >
                    {request.schoolName} / {request.position}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <div className="text-sm font-semibold text-ink">지원 완료 공고</div>
              <div className="mt-3 grid gap-3">
                {appliedJobs.length > 0 ? (
                  appliedJobs.map((job) => (
                    <Link
                      key={job.id}
                      href={`/jobs/${job.id}`}
                      className="rounded-lg bg-primary-50 px-4 py-3 text-sm font-medium text-primary-700"
                    >
                      {job.schoolName} / {job.gradeLevel}
                    </Link>
                  ))
                ) : (
                  <div className="rounded-lg bg-surface-subtle px-4 py-3 text-sm text-ink-soft">
                    채용 공고에서 바로 지원하면 이곳에 기록됩니다.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </PortalShell>
  );
}
