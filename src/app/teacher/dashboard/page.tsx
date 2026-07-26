"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Bell,
  Briefcase,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Home,
  LayoutDashboard,
  LoaderCircle,
  MapPin,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { CharacterAvatar } from "@/components/character-avatar";
import { HiringStateError } from "@/components/hiring-state-error";
import { PortalShell } from "@/components/portal-shell";
import { featuredTeachers } from "@/lib/demo-data";
import { useDemoHiringState } from "@/lib/demo-hiring-state";
import { useDemoSession } from "@/lib/demo-session-client";

const navItems = [
  {
    href: "/teacher/dashboard",
    label: "내 홈",
    icon: LayoutDashboard,
    active: true,
  },
  { href: "/jobs", label: "채용 공고", icon: Briefcase },
  { href: "/", label: "메인", icon: Home },
];

type VisibilityStatus = "seeking" | "paused";

function offerTone(status: string) {
  switch (status) {
    case "accepted":
      return "border-[#b9cec1] bg-[#edf4ef] text-[#1f6248]";
    case "rejected":
      return "border-[#e4b8ae] bg-[#fff3f0] text-[#8b3328]";
    case "cancelled":
    case "archived":
      return "border-[#d8d5cc] bg-[#f0eee8] text-[#666e69]";
    default:
      return "border-[#e6d1a2] bg-[#fff7e6] text-[#865d13]";
  }
}

function applicationTone(status: string) {
  switch (status) {
    case "interview-requested":
    case "interview-confirmed":
      return "border-[#b8c9c0] bg-[#edf2ef] text-[#24533f]";
    case "hired":
      return "border-[#a9c8b7] bg-[#e6f2ea] text-[#155c3c]";
    case "rejected":
    case "withdrawn":
      return "border-[#d8d5cc] bg-[#f0eee8] text-[#666e69]";
    default:
      return "border-[#e6d1a2] bg-[#fff7e6] text-[#865d13]";
  }
}

function applicationLabel(status: string) {
  switch (status) {
    case "reviewing":
      return "서류 검토 중";
    case "interview-requested":
      return "면접 요청";
    case "interview-confirmed":
      return "면접 일정 확인";
    case "hired":
      return "채용 확정";
    case "rejected":
      return "검토 종료";
    default:
      return "지원 완료";
  }
}

function offerLabel(status: string) {
  switch (status) {
    case "accepted":
      return "제안 수락";
    case "rejected":
      return "제안 보류";
    case "cancelled":
      return "학교 요청 취소";
    default:
      return "응답 대기";
  }
}

export default function TeacherDashboardPage() {
  const session = useDemoSession();
  const hiring = useDemoHiringState();
  const teacher = hiring.currentTeacher ?? featuredTeachers[0];
  const extendedHiring = hiring as typeof hiring & {
    archiveTeacherOffer?: (requestId: number) => Promise<void>;
    updateTeacherVisibility?: (status: VisibilityStatus) => Promise<void>;
  };
  const extendedState = hiring.state as typeof hiring.state & {
    teacherVisibility?: VisibilityStatus;
  };
  const [availabilityOverride, setAvailabilityOverride] =
    useState<VisibilityStatus | null>(null);
  const [pendingAction, setPendingAction] = useState("");
  const [feedback, setFeedback] = useState<{
    tone: "error" | "success";
    message: string;
  } | null>(null);

  const availability =
    availabilityOverride ??
    extendedState.teacherVisibility ??
    (teacher.status === "paused" ? "paused" : "seeking");

  // The server already scopes these collections to the signed-in teacher.
  const applications = hiring.state.applications;
  const offers = hiring.state.requests.filter(
    (request) => request.status !== "archived",
  );

  const pendingOffers = useMemo(
    () => offers.filter((request) => request.status === "pending"),
    [offers],
  );
  const visibleApplications = useMemo(
    () =>
      applications.filter(
        (application) => application.status !== "withdrawn",
      ),
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

  const displayName = session?.name ?? teacher.name;
  const displayQualification = session?.detail ?? teacher.qualification;
  const displayAvatar = session?.avatarPreset ?? teacher.avatarPreset;

  const saveVisibility = async (status: VisibilityStatus) => {
    if (status === availability || pendingAction) {
      return;
    }

    setFeedback(null);
    setPendingAction("visibility");

    try {
      if (!extendedHiring.updateTeacherVisibility) {
        throw new Error("프로필 공개 상태 저장 기능을 불러오지 못했습니다.");
      }
      await extendedHiring.updateTeacherVisibility(status);
      setAvailabilityOverride(status);
      setFeedback({
        tone: "success",
        message:
          status === "seeking"
            ? "인력풀 공개를 시작했습니다."
            : "인력풀 노출을 일시중지했습니다.",
      });
    } catch (error) {
      setFeedback({
        tone: "error",
        message:
          error instanceof Error
            ? error.message
            : "프로필 공개 상태를 저장하지 못했습니다.",
      });
    } finally {
      setPendingAction("");
    }
  };

  const confirmInterview = async (applicationId: number) => {
    setFeedback(null);
    setPendingAction(`confirm-${applicationId}`);

    try {
      await hiring.updateApplicationStatus(
        applicationId,
        "interview-confirmed",
      );
      setFeedback({
        tone: "success",
        message: "면접 일정을 확인했습니다. 학교 담당자에게 상태가 전달됩니다.",
      });
    } catch (error) {
      setFeedback({
        tone: "error",
        message:
          error instanceof Error
            ? error.message
            : "면접 일정을 확인하지 못했습니다.",
      });
    } finally {
      setPendingAction("");
    }
  };

  const withdraw = async (applicationId: number) => {
    setFeedback(null);
    setPendingAction(`withdraw-${applicationId}`);

    try {
      await hiring.withdrawApplication(applicationId);
      setFeedback({
        tone: "success",
        message: "지원 취소가 처리되었습니다.",
      });
    } catch (error) {
      setFeedback({
        tone: "error",
        message:
          error instanceof Error
            ? error.message
            : "지원 취소를 처리하지 못했습니다.",
      });
    } finally {
      setPendingAction("");
    }
  };

  const archiveOffer = async (requestId: number) => {
    setFeedback(null);
    setPendingAction(`archive-${requestId}`);

    try {
      if (!extendedHiring.archiveTeacherOffer) {
        throw new Error("제안 보관 기능을 불러오지 못했습니다.");
      }
      await extendedHiring.archiveTeacherOffer(requestId);
      setFeedback({
        tone: "success",
        message: "제안을 보관했습니다. 학교의 요청 상태는 변경되지 않습니다.",
      });
    } catch (error) {
      setFeedback({
        tone: "error",
        message:
          error instanceof Error
            ? error.message
            : "제안을 보관하지 못했습니다.",
      });
    } finally {
      setPendingAction("");
    }
  };

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
        name: displayName,
        role: "등록 교사",
        detail: displayQualification,
        avatarPreset: displayAvatar,
      }}
    >
      {hiring.loadError ? (
        <div className="mb-5">
          <HiringStateError
            message={hiring.loadError}
            onRetry={hiring.refresh}
          />
        </div>
      ) : null}

      <section className="border-b border-[#dcd9d0] pb-7">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="flex items-start gap-4">
            <CharacterAvatar
              className="h-16 w-16 shrink-0 rounded-md"
              presetId={displayAvatar}
              priority
              size={64}
            />
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0b4a37]">
                TEACHER WORKSPACE
              </div>
              <h1 className="mt-2 text-3xl font-bold tracking-[-0.03em] text-[#17231e] sm:text-4xl">
                {displayName} 선생님
              </h1>
              <p className="mt-2 break-keep text-sm leading-6 text-[#65706a]">
                지원과 학교 제안, 면접 일정을 한 흐름에서 확인하세요.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#0b4a37] px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(11,74,55,0.14)] hover:bg-[#083a2c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b4a37] focus-visible:ring-offset-2"
              href="/jobs"
            >
              <Briefcase aria-hidden="true" className="h-4 w-4" />
              새 공고 찾기
            </Link>
            <Link
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[#d3d0c7] bg-white px-4 py-2 text-sm font-semibold text-[#4f5954] hover:bg-[#f0eee8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b4a37]"
              href="/"
            >
              <Home aria-hidden="true" className="h-4 w-4" />
              메인
            </Link>
          </div>
        </div>
      </section>

      {feedback ? (
        <div
          className={`mt-5 flex items-start gap-2 rounded-md border px-4 py-3 text-sm ${
            feedback.tone === "error"
              ? "border-[#e4b8ae] bg-[#fff3f0] text-[#8b3328]"
              : "border-[#b9cec1] bg-[#edf4ef] text-[#1f6248]"
          }`}
          role={feedback.tone === "error" ? "alert" : "status"}
        >
          {feedback.tone === "error" ? (
            <AlertCircle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
          ) : (
            <CheckCircle2 aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
          )}
          {feedback.message}
        </div>
      ) : null}

      <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "프로필 조회",
            value: `${teacher.portfolioViews}회`,
            Icon: UserRound,
          },
          {
            label: "응답 대기 제안",
            value: `${pendingOffers.length}건`,
            Icon: Bell,
          },
          {
            label: "진행 중 지원",
            value: `${visibleApplications.length}건`,
            Icon: Briefcase,
          },
          {
            label: "면접 일정",
            value: `${interviewItems.length}건`,
            Icon: CalendarClock,
          },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-md border border-[#dedbd2] bg-[#fbfaf6] p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm text-[#737b77]">{item.label}</div>
                <div className="mt-2 text-2xl font-bold text-[#17231e]">
                  {item.value}
                </div>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#e8f0eb] text-[#0b4a37]">
                <item.Icon aria-hidden="true" className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <section className="rounded-md border border-[#dedbd2] bg-[#fbfaf6] p-6">
            <div className="flex items-end justify-between gap-4 border-b border-[#e1ded6] pb-4">
              <div>
                <h2 className="text-xl font-bold text-[#17231e]">지원 현황</h2>
                <p className="mt-1 text-sm text-[#727a76]">
                  학교 검토와 면접 진행 상태
                </p>
              </div>
              <Link
                className="rounded-md text-sm font-semibold text-[#0b4a37] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b4a37]"
                href="/jobs"
              >
                공고 더 보기
              </Link>
            </div>

            {!hiring.loaded ? (
              <div className="mt-5 h-44 animate-pulse rounded-md bg-[#eeece6]">
                <span className="sr-only">지원 현황을 불러오는 중입니다.</span>
              </div>
            ) : visibleApplications.length === 0 ? (
              <div className="mt-5 rounded-md border border-dashed border-[#c9c5ba] bg-[#f4f2ec] px-5 py-10 text-center">
                <Briefcase
                  aria-hidden="true"
                  className="mx-auto h-7 w-7 text-[#7a827e]"
                />
                <h3 className="mt-3 font-semibold text-[#344039]">
                  아직 제출한 지원서가 없습니다
                </h3>
                <Link
                  className="mt-4 inline-flex text-sm font-semibold text-[#0b4a37]"
                  href="/jobs"
                >
                  채용 공고 확인하기
                </Link>
              </div>
            ) : (
              <div className="mt-5 divide-y divide-[#e2dfd7]">
                {visibleApplications.map((application) => (
                  <article
                    key={application.id}
                    className="py-5 first:pt-0 last:pb-0"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${applicationTone(
                            application.status,
                          )}`}
                        >
                          {applicationLabel(application.status)}
                        </span>
                        <h3 className="mt-3 text-lg font-bold text-[#17231e]">
                          {application.job?.schoolName ?? "공고 정보 없음"}
                        </h3>
                        <p className="mt-1 break-keep text-sm text-[#65706a]">
                          {application.job?.gradeLevel ?? "공고 정보 없음"} · 제출{" "}
                          {application.submittedAt}
                        </p>
                        <p className="mt-2 break-keep text-sm leading-6 text-[#727a76]">
                          {application.summary}
                        </p>
                        {application.interview ? (
                          <div className="mt-4 rounded-md border border-[#bfd0c5] bg-[#edf4ef] px-4 py-3 text-sm text-[#24533f]">
                            <div className="font-semibold">
                              {application.interview.date}{" "}
                              {application.interview.time} ·{" "}
                              {application.interview.place}
                            </div>
                            <div className="mt-1 break-keep leading-6">
                              {application.interview.note}
                            </div>
                          </div>
                        ) : null}
                      </div>

                      <div className="flex shrink-0 flex-wrap gap-2">
                        {application.status === "interview-requested" ? (
                          <button
                            className="inline-flex min-h-10 items-center gap-2 rounded-md bg-[#0b4a37] px-3 py-2 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b4a37] focus-visible:ring-offset-2 disabled:opacity-60"
                            disabled={Boolean(pendingAction)}
                            onClick={() => void confirmInterview(application.id)}
                            type="button"
                          >
                            {pendingAction === `confirm-${application.id}` ? (
                              <LoaderCircle
                                aria-hidden="true"
                                className="h-4 w-4 animate-spin"
                              />
                            ) : (
                              <CheckCircle2
                                aria-hidden="true"
                                className="h-4 w-4"
                              />
                            )}
                            일정 확인
                          </button>
                        ) : null}
                        {!["rejected", "hired", "withdrawn"].includes(
                          application.status,
                        ) ? (
                          <button
                            className="min-h-10 rounded-md border border-[#d3d0c7] bg-white px-3 py-2 text-sm font-semibold text-[#5b6560] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b4a37] disabled:opacity-60"
                            disabled={Boolean(pendingAction)}
                            onClick={() => void withdraw(application.id)}
                            type="button"
                          >
                            {pendingAction === `withdraw-${application.id}`
                              ? "처리 중"
                              : "지원 취소"}
                          </button>
                        ) : null}
                        {application.job ? (
                          <Link
                            className="inline-flex min-h-10 items-center rounded-md border border-[#d3d0c7] bg-white px-3 py-2 text-sm font-semibold text-[#0b4a37] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b4a37]"
                            href={`/jobs/${application.job.id}`}
                          >
                            공고 보기
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-md border border-[#dedbd2] bg-[#fbfaf6] p-6">
            <div className="flex items-end justify-between gap-4 border-b border-[#e1ded6] pb-4">
              <div>
                <h2 className="text-xl font-bold text-[#17231e]">받은 제안</h2>
                <p className="mt-1 text-sm text-[#727a76]">
                  학교가 보낸 직접 채용 제안
                </p>
              </div>
              {pendingOffers[0] ? (
                <Link
                  className="text-sm font-semibold text-[#0b4a37]"
                  href={`/teacher/offers/${pendingOffers[0].id}`}
                >
                  최근 제안
                </Link>
              ) : null}
            </div>

            {!hiring.loaded ? (
              <div className="mt-5 h-40 animate-pulse rounded-md bg-[#eeece6]" />
            ) : offers.length === 0 ? (
              <div className="mt-5 rounded-md border border-dashed border-[#c9c5ba] bg-[#f4f2ec] px-5 py-9 text-center text-sm text-[#65706a]">
                현재 확인할 제안이 없습니다.
              </div>
            ) : (
              <div className="mt-5 divide-y divide-[#e2dfd7]">
                {offers.map((offer) => (
                  <article key={offer.id} className="py-5 first:pt-0 last:pb-0">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${offerTone(
                            offer.status,
                          )}`}
                        >
                          {offerLabel(offer.status)}
                        </span>
                        <h3 className="mt-3 text-lg font-bold text-[#17231e]">
                          {offer.schoolName}
                        </h3>
                        <p className="mt-1 text-sm text-[#65706a]">
                          {offer.position}
                        </p>
                        <p className="mt-2 break-keep text-sm leading-6 text-[#727a76]">
                          {offer.summary}
                        </p>
                        <div className="mt-3 inline-flex items-center gap-2 text-sm text-[#65706a]">
                          <MapPin
                            aria-hidden="true"
                            className="h-4 w-4 text-[#0b4a37]"
                          />
                          {offer.region}
                        </div>
                        {offer.interview ? (
                          <div className="mt-4 rounded-md border border-[#bfd0c5] bg-[#edf4ef] px-4 py-3 text-sm text-[#24533f]">
                            {offer.interview.date} {offer.interview.time} ·{" "}
                            {offer.interview.place}
                          </div>
                        ) : null}
                      </div>

                      <div className="flex shrink-0 flex-wrap gap-2">
                        {offer.status === "pending" ? (
                          <>
                            <Link
                              className="inline-flex min-h-10 items-center rounded-md bg-[#0b4a37] px-3 py-2 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b4a37] focus-visible:ring-offset-2"
                              href={`/teacher/offers/${offer.id}`}
                            >
                              검토하기
                            </Link>
                            <button
                              className="min-h-10 rounded-md border border-[#d3d0c7] bg-white px-3 py-2 text-sm font-semibold text-[#5b6560] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b4a37] disabled:opacity-60"
                              disabled={Boolean(pendingAction)}
                              onClick={() => void archiveOffer(offer.id)}
                              type="button"
                            >
                              {pendingAction === `archive-${offer.id}`
                                ? "보관 중"
                                : "보관"}
                            </button>
                          </>
                        ) : (
                          <span className="text-xs text-[#7a827e]">
                            {offer.sentAt}
                          </span>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-5">
          <section className="rounded-md border border-[#d5d2c9] bg-[#fbfaf6] p-6 shadow-[0_14px_36px_rgba(31,44,37,0.06)]">
            <div className="flex items-center gap-2">
              <ShieldCheck aria-hidden="true" className="h-5 w-5 text-[#0b4a37]" />
              <h2 className="text-lg font-bold text-[#17231e]">인력풀 공개 상태</h2>
            </div>
            <p className="mt-2 break-keep text-sm leading-6 text-[#6b746f]">
              변경 내용은 저장되며 학교 인력풀 노출에 반영됩니다.
            </p>

            <div className="mt-5 space-y-2">
              <button
                aria-pressed={availability === "seeking"}
                className={`flex w-full items-start justify-between gap-3 rounded-md border p-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b4a37] disabled:opacity-60 ${
                  availability === "seeking"
                    ? "border-[#9eb8a9] bg-[#e7efe9] text-[#0b4a37]"
                    : "border-[#dedbd2] bg-white text-[#59635d]"
                }`}
                disabled={Boolean(pendingAction)}
                onClick={() => void saveVisibility("seeking")}
                type="button"
              >
                <span>
                  <span className="block text-sm font-semibold">채용 제안 가능</span>
                  <span className="mt-1 block break-keep text-xs leading-5">
                    학교가 내 프로필을 확인하고 제안할 수 있습니다.
                  </span>
                </span>
                {pendingAction === "visibility" ? (
                  <LoaderCircle
                    aria-hidden="true"
                    className="h-5 w-5 shrink-0 animate-spin"
                  />
                ) : (
                  <ShieldCheck aria-hidden="true" className="h-5 w-5 shrink-0" />
                )}
              </button>
              <button
                aria-pressed={availability === "paused"}
                className={`flex w-full items-start justify-between gap-3 rounded-md border p-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b4a37] disabled:opacity-60 ${
                  availability === "paused"
                    ? "border-[#9eb8a9] bg-[#e7efe9] text-[#0b4a37]"
                    : "border-[#dedbd2] bg-white text-[#59635d]"
                }`}
                disabled={Boolean(pendingAction)}
                onClick={() => void saveVisibility("paused")}
                type="button"
              >
                <span>
                  <span className="block text-sm font-semibold">노출 일시중지</span>
                  <span className="mt-1 block break-keep text-xs leading-5">
                    기존 지원과 면접만 관리하고 새 제안은 받지 않습니다.
                  </span>
                </span>
                <Clock3 aria-hidden="true" className="h-5 w-5 shrink-0" />
              </button>
            </div>
          </section>

          <section className="rounded-md border border-[#dedbd2] bg-[#fbfaf6] p-6">
            <h2 className="text-lg font-bold text-[#17231e]">내 프로필 요약</h2>
            <div className="mt-5 flex items-center gap-4">
              <CharacterAvatar
                className="h-16 w-16 rounded-md"
                presetId={displayAvatar}
                size={64}
              />
              <div>
                <div className="text-xl font-bold text-[#17231e]">{displayName}</div>
                <div className="mt-1 text-sm text-[#626c66]">
                  {displayQualification}
                </div>
                <div className="mt-1 text-sm font-medium text-[#0b4a37]">
                  경력 {teacher.experience}
                </div>
              </div>
            </div>
            <p className="mt-5 break-keep text-sm leading-6 text-[#626c66]">
              {teacher.summary}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {teacher.preferredRegions.map((region) => (
                <span
                  key={region}
                  className="rounded-full border border-[#ddd9d0] bg-white px-2.5 py-1.5 text-xs font-medium text-[#626b66]"
                >
                  {region}
                </span>
              ))}
            </div>
          </section>
        </aside>
      </section>
    </PortalShell>
  );
}
