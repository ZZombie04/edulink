"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Bell,
  Briefcase,
  CalendarClock,
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
import { featuredTeachers } from "@/lib/demo-data";
import { useDemoHiringState } from "@/lib/demo-hiring-state";

const navItems = [
  { href: "/teacher/dashboard", label: "내 홈", icon: LayoutDashboard, active: true },
  { href: "/", label: "메인", icon: Home },
  { href: "/jobs", label: "채용 공고", icon: Briefcase },
];

function offerTone(status: string) {
  switch (status) {
    case "accepted":
      return "bg-secondary-50 text-secondary-700";
    case "rejected":
      return "bg-[var(--danger-soft)] text-[#9c2f24]";
    case "cancelled":
      return "bg-surface-panel text-ink-soft";
    default:
      return "bg-[var(--warning-soft)] text-[#9a6a00]";
  }
}

function applicationTone(status: string) {
  switch (status) {
    case "interview-requested":
    case "interview-confirmed":
      return "bg-primary-50 text-primary-700";
    case "hired":
      return "bg-secondary-50 text-secondary-700";
    case "rejected":
    case "withdrawn":
      return "bg-surface-panel text-ink-soft";
    default:
      return "bg-[var(--warning-soft)] text-[#9a6a00]";
  }
}

export default function TeacherDashboardPage() {
  const teacher = featuredTeachers[0];
  const {
    getApplicationsForTeacher,
    getTeacherOffersForTeacher,
    updateApplicationStatus,
    withdrawApplication,
  } = useDemoHiringState();
  const [availability, setAvailability] = useState<"seeking" | "paused">(
    teacher.status === "paused" ? "paused" : "seeking",
  );
  const [archivedOfferIds, setArchivedOfferIds] = useState<number[]>([]);

  const applications = getApplicationsForTeacher(teacher.id);
  const offers = getTeacherOffersForTeacher(teacher.id).filter(
    (request) => !archivedOfferIds.includes(request.id),
  );

  const pendingOffers = useMemo(
    () => offers.filter((request) => request.status === "pending"),
    [offers],
  );
  const visibleApplications = useMemo(
    () => applications.filter((application) => application.status !== "withdrawn"),
    [applications],
  );
  const interviewItems = useMemo(
    () =>
      [
        ...visibleApplications.filter((application) => application.interview),
        ...offers.filter((offer) => offer.interview),
      ].sort((left, right) => right.id - left.id),
    [offers, visibleApplications],
  );

  return (
    <PortalShell
      navItems={navItems}
      noticeCount={
        pendingOffers.length +
        visibleApplications.filter(
          (application) => application.status === "interview-requested",
        ).length
      }
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
          <div className="flex min-h-[196px] flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-2 text-sm font-semibold text-white/90">
                <Sparkles className="h-4 w-4" />
                지원 현황
              </div>
              <div className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
                {teacher.name} 선생님
              </div>
              <div className="mt-3 break-keep text-sm leading-6 text-white/82">
                공고 지원, 학교 제안 응답, 면접 일정 확인까지 한 화면에서 이어서
                관리할 수 있습니다.
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
          <div className="text-sm font-semibold text-ink-soft">현재 노출 상태</div>
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
                <div className="mt-1 break-keep text-sm">
                  학교가 인력풀을 보고 직접 제안을 보낼 수 있는 상태입니다.
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
                <div className="mt-1 break-keep text-sm">
                  새 제안은 잠시 멈추고 현재 지원과 면접 일정만 관리합니다.
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
          { label: "대기 중 제안", value: `${pendingOffers.length}건`, Icon: Bell },
          { label: "지원 완료", value: `${visibleApplications.length}건`, Icon: Briefcase },
          { label: "면접 일정", value: `${interviewItems.length}건`, Icon: CalendarClock },
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

      <section className="mt-8 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="panel-surface p-6">
          <div className="flex items-center justify-between">
            <div className="text-xl font-bold text-ink">지원 현황</div>
            <Link href="/jobs" className="text-sm font-semibold text-primary-700">
              공고 더 보기
            </Link>
          </div>

          <div className="mt-6 space-y-4">
            {visibleApplications.length > 0 ? (
              visibleApplications.map((application) => (
                <div
                  key={application.id}
                  className="rounded-lg border border-outline bg-surface p-5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${applicationTone(
                          application.status,
                        )}`}
                      >
                        {application.status === "interview-requested"
                          ? "면접 요청"
                          : application.status === "interview-confirmed"
                            ? "면접 일정 확인"
                            : application.status === "hired"
                              ? "채용 확정"
                              : application.status === "rejected"
                                ? "검토 종료"
                                : "지원 완료"}
                      </span>
                      <div className="mt-3 text-xl font-bold text-ink">
                        {application.job?.schoolName ?? "공고 정보 없음"}
                      </div>
                      <div className="mt-1 break-keep text-sm text-ink-soft">
                        {application.job?.gradeLevel ?? "공고 정보 없음"} / 제출{" "}
                        {application.submittedAt}
                      </div>
                      <div className="mt-2 break-keep text-sm leading-6 text-ink-muted">
                        {application.summary}
                      </div>
                      {application.interview ? (
                        <div className="mt-4 rounded-lg bg-primary-50 px-4 py-3 text-sm text-primary-700">
                          {application.interview.date} {application.interview.time} /{" "}
                          {application.interview.place}
                          <div className="mt-1 break-keep text-primary-700/80">
                            {application.interview.note}
                          </div>
                        </div>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap gap-2 sm:justify-end">
                      {application.status === "interview-requested" ? (
                        <button
                          type="button"
                          className="rounded-lg bg-[linear-gradient(135deg,#0058be,#2170e4)] px-4 py-3 text-sm font-semibold text-white shadow-soft"
                          onClick={() =>
                            updateApplicationStatus(
                              application.id,
                              "interview-confirmed",
                            )
                          }
                        >
                          일정 확인
                        </button>
                      ) : null}
                      {!["rejected", "hired", "withdrawn"].includes(application.status) ? (
                        <button
                          type="button"
                          className="rounded-lg border border-outline px-4 py-3 text-sm font-semibold text-ink-soft"
                          onClick={() => withdrawApplication(application.id)}
                        >
                          지원 취소
                        </button>
                      ) : null}
                      {application.job ? (
                        <Link
                          href={`/jobs/${application.job.id}`}
                          className="rounded-lg border border-outline px-4 py-3 text-sm font-semibold text-primary-700"
                        >
                          공고 보기
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-outline bg-surface-subtle px-4 py-8 text-center text-sm text-ink-soft">
                아직 제출한 지원서가 없습니다. 채용 공고에서 바로 지원을 시작할 수
                있습니다.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="panel-surface p-6">
            <div className="flex items-center justify-between">
              <div className="text-xl font-bold text-ink">받은 제안</div>
              <Link
                href={pendingOffers[0] ? `/teacher/offers/${pendingOffers[0].id}` : "/jobs"}
                className="text-sm font-semibold text-primary-700"
              >
                최근 제안 보기
              </Link>
            </div>

            <div className="mt-6 space-y-4">
              {offers.length > 0 ? (
                offers.map((offer) => (
                  <div
                    key={offer.id}
                    className="rounded-lg border border-outline bg-surface p-5"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${offerTone(
                            offer.status,
                          )}`}
                        >
                          {offer.status === "accepted"
                            ? "응답 완료"
                            : offer.status === "rejected"
                              ? "검토 종료"
                              : offer.status === "cancelled"
                                ? "요청 취소"
                                : "응답 대기"}
                        </span>
                        <div className="mt-3 text-xl font-bold text-ink">
                          {offer.schoolName}
                        </div>
                        <div className="mt-1 break-keep text-sm text-ink-soft">
                          {offer.position}
                        </div>
                        <div className="mt-2 break-keep text-sm leading-6 text-ink-muted">
                          {offer.summary}
                        </div>
                        {offer.interview ? (
                          <div className="mt-4 rounded-lg bg-primary-50 px-4 py-3 text-sm text-primary-700">
                            {offer.interview.date} {offer.interview.time} / {offer.interview.place}
                            <div className="mt-1 break-keep text-primary-700/80">
                              {offer.interview.note}
                            </div>
                          </div>
                        ) : null}
                        <div className="mt-3 inline-flex items-center gap-2 text-sm text-ink-muted">
                          <MapPin className="h-4 w-4 text-primary-600" />
                          {offer.region}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 sm:justify-end">
                        {offer.status === "pending" ? (
                          <>
                            <Link
                              href={`/teacher/offers/${offer.id}`}
                              className="rounded-lg bg-[linear-gradient(135deg,#0058be,#2170e4)] px-4 py-3 text-sm font-semibold text-white shadow-soft"
                            >
                              검토하기
                            </Link>
                            <button
                              type="button"
                              className="rounded-lg border border-outline px-4 py-3 text-sm font-semibold text-ink-soft"
                              onClick={() =>
                                setArchivedOfferIds((current) => [...current, offer.id])
                              }
                            >
                              보관
                            </button>
                          </>
                        ) : (
                          <div className="text-sm text-ink-muted">{offer.sentAt}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-lg border border-dashed border-outline bg-surface-subtle px-4 py-8 text-center text-sm text-ink-soft">
                  보관하지 않은 제안이 없습니다.
                </div>
              )}
            </div>
          </div>

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

            <p className="mt-5 break-keep text-sm leading-6 text-ink-soft">
              {teacher.summary}
            </p>

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
        </div>
      </section>
    </PortalShell>
  );
}
