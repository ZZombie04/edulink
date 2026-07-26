"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  Heart,
  LayoutDashboard,
  LoaderCircle,
  MapPin,
  Search,
  Send,
  ShieldCheck,
} from "lucide-react";

import { CharacterAvatar } from "@/components/character-avatar";
import { HiringStateError } from "@/components/hiring-state-error";
import { PortalShell } from "@/components/portal-shell";
import type { TeacherStatus } from "@/lib/demo-data";
import { useDemoHiringState } from "@/lib/demo-hiring-state";
import { useDemoSession } from "@/lib/demo-session-client";

const navItems = [
  { href: "/hr/dashboard", label: "채용 운영", icon: LayoutDashboard },
  { href: "/pool", label: "교사 인력풀", icon: Search, active: true },
  { href: "/jobs", label: "채용 공고", icon: Briefcase },
];

function statusTone(status: TeacherStatus) {
  switch (status) {
    case "seeking":
      return {
        label: "채용 제안 가능",
        className: "border-[#b9cec1] bg-[#edf4ef] text-[#1f6248]",
      };
    case "interviewing":
      return {
        label: "면접 진행 중",
        className: "border-[#e6d1a2] bg-[#fff7e6] text-[#865d13]",
      };
    case "employed":
      return {
        label: "근무 중",
        className: "border-[#c9d1cf] bg-[#eef1f0] text-[#58635e]",
      };
    default:
      return {
        label: "노출 일시중지",
        className: "border-[#d8d5cc] bg-[#f0eee8] text-[#666e69]",
      };
  }
}

export default function PoolTeacherDetailPage() {
  const params = useParams<{ id: string }>();
  const session = useDemoSession();
  const {
    cancelPoolRequest,
    getRequestForTeacherAndJob,
    hrMatchRequests,
    isTeacherInterested,
    liveJobs,
    loaded,
    loadError,
    refresh,
    sendPoolRequest,
    teachers,
    toggleInterestedTeacher,
  } = useDemoHiringState();
  const teacher =
    teachers.find((item) => item.id === Number(params.id)) ?? null;
  const [selectedJobId, setSelectedJobId] = useState("");
  const [message, setMessage] = useState("");
  const [note, setNote] = useState("");
  const [pendingAction, setPendingAction] = useState<
    "interest" | "send" | "cancel" | null
  >(null);
  const [feedback, setFeedback] = useState<{
    tone: "error" | "success";
    message: string;
  } | null>(null);

  const relatedTeachers = useMemo(
    () =>
      teachers
        .filter((item) => item.id !== teacher?.id)
        .filter(
          (item) =>
            item.qualificationCategory === teacher?.qualificationCategory,
        )
        .slice(0, 2)
        .map((item) => item.name),
    [teacher, teachers],
  );

  if (!loaded) {
    return (
      <div
        aria-live="polite"
        className="flex min-h-screen items-center justify-center bg-[#f7f6f1] px-4"
      >
        <div className="h-[540px] w-full max-w-5xl animate-pulse rounded-md border border-[#e0ddd5] bg-[#eeece6]">
          <span className="sr-only">교사 프로필을 불러오는 중입니다.</span>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f6f1] px-4">
        <div className="w-full max-w-xl">
          <HiringStateError message={loadError} onRetry={refresh} />
        </div>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f6f1] px-4 text-center">
        <div className="max-w-lg rounded-md border border-[#dedbd2] bg-[#fbfaf6] p-8">
          <h1 className="text-2xl font-bold text-[#17231e]">
            교사 정보를 찾을 수 없습니다
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#68706c]">
            공개가 종료되었거나 존재하지 않는 프로필입니다.
          </p>
          <Link
            className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-md bg-[#0b4a37] px-4 py-2 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b4a37] focus-visible:ring-offset-2"
            href="/pool"
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            인력풀로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const effectiveJobId = selectedJobId || liveJobs[0]?.id || "";
  const selectedJob =
    liveJobs.find((job) => job.id === effectiveJobId) ?? liveJobs[0] ?? null;
  const activeRequest = selectedJob
    ? getRequestForTeacherAndJob(teacher.id, selectedJob.id)
    : null;
  const interested = isTeacherInterested(teacher.id);
  const status = statusTone(teacher.status);
  const canReceiveOffer =
    teacher.status === "seeking" || teacher.status === "interviewing";

  const handleInterest = async () => {
    setFeedback(null);
    setPendingAction("interest");

    try {
      await toggleInterestedTeacher(teacher.id);
      setFeedback({
        tone: "success",
        message: interested
          ? "관심 후보에서 해제했습니다."
          : "관심 후보로 저장했습니다.",
      });
    } catch (error) {
      setFeedback({
        tone: "error",
        message:
          error instanceof Error
            ? error.message
            : "관심 상태를 저장하지 못했습니다.",
      });
    } finally {
      setPendingAction(null);
    }
  };

  const handleSendRequest = async () => {
    if (!selectedJob) {
      return;
    }

    setFeedback(null);
    setPendingAction("send");

    try {
      await sendPoolRequest(selectedJob.id, teacher.id, {
        message: message.trim() || undefined,
        note: note.trim() || undefined,
      });
      setFeedback({
        tone: "success",
        message: `${teacher.name} 교사에게 채용 제안을 보냈습니다.`,
      });
    } catch (error) {
      setFeedback({
        tone: "error",
        message:
          error instanceof Error
            ? error.message
            : "채용 제안을 보내지 못했습니다.",
      });
    } finally {
      setPendingAction(null);
    }
  };

  const handleCancelRequest = async () => {
    if (!activeRequest) {
      return;
    }

    setFeedback(null);
    setPendingAction("cancel");

    try {
      await cancelPoolRequest(activeRequest.id);
      setFeedback({
        tone: "success",
        message: "대기 중인 채용 제안을 취소했습니다.",
      });
    } catch (error) {
      setFeedback({
        tone: "error",
        message:
          error instanceof Error
            ? error.message
            : "채용 제안을 취소하지 못했습니다.",
      });
    } finally {
      setPendingAction(null);
    }
  };

  return (
    <PortalShell
      navItems={navItems}
      noticeCount={
        hrMatchRequests.filter((request) => request.status === "pending").length
      }
      primaryAction={{
        href: "/hr/dashboard",
        label: "채용 운영으로 이동",
        icon: LayoutDashboard,
      }}
      sectionLabel="교사 상세 프로필"
      user={{
        name: session?.name ?? "학교 담당자",
        role: "인사담당",
        detail: session?.detail ?? "소속 학교",
      }}
    >
      <Link
        className="inline-flex items-center gap-2 rounded-md text-sm font-semibold text-[#0b4a37] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b4a37]"
        href="/pool"
      >
        <ArrowLeft aria-hidden="true" className="h-4 w-4" />
        인력풀로 돌아가기
      </Link>

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

      <section className="mt-5 grid gap-6 xl:grid-cols-[minmax(0,1.12fr)_420px]">
        <div className="space-y-5">
          <div className="rounded-md border border-[#dedbd2] bg-[#fbfaf6] p-6 sm:p-7">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
              <CharacterAvatar
                className="h-28 w-28 shrink-0 rounded-md"
                presetId={teacher.avatarPreset}
                priority
                size={112}
              />

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${status.className}`}
                  >
                    {status.label}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-[#d8d5cc] bg-white px-2.5 py-1 text-xs font-medium text-[#59635d]">
                    <ShieldCheck aria-hidden="true" className="h-3.5 w-3.5 text-[#0b4a37]" />
                    자격 정보 확인
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap items-end gap-x-4 gap-y-2">
                  <h1 className="text-3xl font-bold tracking-[-0.03em] text-[#17231e]">
                    {teacher.name}
                  </h1>
                  <span className="pb-1 text-sm font-semibold text-[#0b4a37]">
                    {teacher.qualification}
                    {teacher.subject ? ` · ${teacher.subject}` : ""}
                  </span>
                </div>

                <p className="mt-4 max-w-3xl break-keep text-sm leading-7 text-[#5d6761]">
                  {teacher.summary}
                </p>

                <dl className="mt-5 flex flex-wrap gap-x-8 gap-y-3 border-t border-[#e1ded6] pt-5 text-sm">
                  <div>
                    <dt className="text-xs text-[#7b837f]">총 경력</dt>
                    <dd className="mt-1 font-semibold text-[#344039]">
                      {teacher.experience}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-[#7b837f]">현재 거주</dt>
                    <dd className="mt-1 font-semibold text-[#344039]">
                      {teacher.residence}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-[#7b837f]">희망 근무</dt>
                    <dd className="mt-1 font-semibold text-[#344039]">
                      {teacher.preferredTypes.join(", ")}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-[#7b837f]">프로필 조회</dt>
                    <dd className="mt-1 font-semibold text-[#344039]">
                      {teacher.portfolioViews}회
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {teacher.preferredRegions.map((region) => (
                <span
                  key={region}
                  className="inline-flex items-center gap-1 rounded-full border border-[#ddd9d0] bg-white px-3 py-2 text-xs font-medium text-[#5d6761]"
                >
                  <MapPin aria-hidden="true" className="h-3.5 w-3.5 text-[#0b4a37]" />
                  희망 지역 · {region}
                </span>
              ))}
            </div>
          </div>

          <section className="rounded-md border border-[#dedbd2] bg-[#fbfaf6] p-6">
            <h2 className="text-lg font-bold text-[#17231e]">채용 검토 요약</h2>
            <dl className="mt-5 divide-y divide-[#e2dfd7] text-sm">
              <div className="grid gap-1 py-3 first:pt-0 sm:grid-cols-[140px_1fr]">
                <dt className="text-[#7a827e]">교원 자격</dt>
                <dd className="font-medium text-[#344039]">
                  {teacher.qualification}
                  {teacher.subject ? ` · 담당 과목 ${teacher.subject}` : ""}
                </dd>
              </div>
              <div className="grid gap-1 py-3 sm:grid-cols-[140px_1fr]">
                <dt className="text-[#7a827e]">희망 지역</dt>
                <dd className="font-medium text-[#344039]">
                  {teacher.preferredRegions.join(", ")}
                </dd>
              </div>
              <div className="grid gap-1 py-3 sm:grid-cols-[140px_1fr]">
                <dt className="text-[#7a827e]">희망 근무 형태</dt>
                <dd className="font-medium text-[#344039]">
                  {teacher.preferredTypes.join(", ")}
                </dd>
              </div>
              <div className="grid gap-1 py-3 sm:grid-cols-[140px_1fr]">
                <dt className="text-[#7a827e]">최종 학력</dt>
                <dd className="font-medium text-[#344039]">
                  {teacher.education ?? "학력 정보 확인 중"}
                  {teacher.graduationYear
                    ? ` · ${teacher.graduationYear}년 졸업`
                    : ""}
                </dd>
              </div>
              <div className="grid gap-1 py-3 sm:grid-cols-[140px_1fr]">
                <dt className="text-[#7a827e]">근무 가능일</dt>
                <dd className="font-medium text-[#344039]">
                  {teacher.availableFrom
                    ? teacher.availableFrom.replaceAll("-", ".")
                    : "학교와 일정 협의"}
                </dd>
              </div>
              <div className="grid gap-1 py-3 sm:grid-cols-[140px_1fr]">
                <dt className="text-[#7a827e]">최근 경력</dt>
                <dd className="font-medium text-[#344039]">
                  {teacher.careerHighlights?.[0]
                    ? [
                        teacher.careerHighlights[0].schoolName,
                        teacher.careerHighlights[0].position,
                        teacher.careerHighlights[0].subject,
                      ]
                        .filter(Boolean)
                        .join(" · ")
                    : `등록된 합산 경력 ${teacher.experience}`}
                </dd>
              </div>
              <div className="grid gap-1 py-3 last:pb-0 sm:grid-cols-[140px_1fr]">
                <dt className="text-[#7a827e]">함께 검토할 후보</dt>
                <dd className="font-medium text-[#344039]">
                  {relatedTeachers.length > 0
                    ? relatedTeachers.join(", ")
                    : "동일 자격 후보 없음"}
                </dd>
              </div>
            </dl>
          </section>
        </div>

        <aside className="h-fit rounded-md border border-[#d5d2c9] bg-[#fbfaf6] p-6 shadow-[0_14px_36px_rgba(31,44,37,0.07)] xl:sticky xl:top-24">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#0b4a37]">
                HIRING ACTION
              </div>
              <h2 className="mt-2 text-xl font-bold text-[#17231e]">
                {canReceiveOffer ? "채용 제안 보내기" : "현재 제안 불가"}
              </h2>
            </div>
            <button
              aria-label={interested ? "관심 후보 해제" : "관심 후보 등록"}
              aria-pressed={interested}
              className={`flex h-10 w-10 items-center justify-center rounded-md border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b4a37] disabled:opacity-60 ${
                interested
                  ? "border-[#c9bda9] bg-[#f6eee4] text-[#775431]"
                  : "border-[#d5d1c7] bg-white text-[#59635d]"
              }`}
              disabled={pendingAction !== null}
              onClick={() => void handleInterest()}
              type="button"
            >
              {pendingAction === "interest" ? (
                <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" />
              ) : (
                <Heart
                  aria-hidden="true"
                  className={`h-4 w-4 ${interested ? "fill-current" : ""}`}
                />
              )}
            </button>
          </div>

          {!canReceiveOffer ? (
            <div className="mt-6 rounded-md border border-[#d8d5cc] bg-[#f4f2ec] p-5 text-sm leading-6 text-[#65706a]">
              현재 근무 중인 교사에게는 새 채용 제안을 보낼 수 없습니다.
              교사가 채용 제안 가능 상태로 전환하면 이 화면에서 다시 제안할
              수 있습니다.
            </div>
          ) : liveJobs.length === 0 ? (
            <div className="mt-6 rounded-md border border-dashed border-[#c9c5ba] bg-[#f4f2ec] p-5 text-sm leading-6 text-[#65706a]">
              진행 중인 채용 공고가 없습니다. 먼저 공고를 등록한 뒤 교사에게
              제안을 보내세요.
              <Link
                className="mt-4 inline-flex font-semibold text-[#0b4a37]"
                href="/hr/dashboard"
              >
                공고 등록으로 이동
              </Link>
            </div>
          ) : (
            <div className="mt-6 space-y-5">
              <label className="block" htmlFor="pool-job-select">
                <span className="mb-2 block text-sm font-semibold text-[#344039]">
                  연결할 채용 공고
                </span>
                <select
                  id="pool-job-select"
                  className="min-h-11 w-full rounded-md border border-[#d8d5cc] bg-white px-3 py-2 text-sm text-[#17231e] outline-none focus:border-[#0b4a37] focus:ring-2 focus:ring-[#0b4a37]/15"
                  onChange={(event) => setSelectedJobId(event.target.value)}
                  value={selectedJob?.id ?? ""}
                >
                  {liveJobs.map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.schoolName} · {job.gradeLevel}
                    </option>
                  ))}
                </select>
              </label>

              {selectedJob ? (
                <div className="rounded-md border border-[#dfddd5] bg-[#f4f2ec] p-4">
                  <div className="font-semibold text-[#2f3b35]">
                    {selectedJob.schoolName} · {selectedJob.gradeLevel}
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-xs text-[#6e7772]">
                    <CalendarDays aria-hidden="true" className="h-3.5 w-3.5" />
                    {selectedJob.startDate} — {selectedJob.endDate}
                  </div>
                  <p className="mt-2 line-clamp-2 break-keep text-xs leading-5 text-[#66706a]">
                    {selectedJob.summary}
                  </p>
                </div>
              ) : null}

              {activeRequest &&
              !["rejected", "cancelled", "archived"].includes(
                activeRequest.status,
              ) ? (
                <div className="space-y-3">
                  <div className="rounded-md border border-[#b9cec1] bg-[#edf4ef] px-4 py-4 text-sm text-[#24533f]">
                    <div className="flex items-center gap-2 font-semibold">
                      <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
                      {activeRequest.status === "pending"
                        ? "교사 응답 대기"
                        : "교사가 제안을 수락했습니다"}
                    </div>
                    <p className="mt-2 break-keep leading-6">
                      {activeRequest.summary}
                    </p>
                  </div>
                  {activeRequest.status === "pending" ? (
                    <button
                      className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-[#d5d1c7] bg-white px-4 py-2 text-sm font-semibold text-[#5c6660] hover:bg-[#f2f0ea] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b4a37] disabled:opacity-60"
                      disabled={pendingAction !== null}
                      onClick={() => void handleCancelRequest()}
                      type="button"
                    >
                      {pendingAction === "cancel" ? (
                        <LoaderCircle
                          aria-hidden="true"
                          className="h-4 w-4 animate-spin"
                        />
                      ) : (
                        <Send aria-hidden="true" className="h-4 w-4" />
                      )}
                      {pendingAction === "cancel" ? "취소 처리 중" : "제안 취소"}
                    </button>
                  ) : (
                    <Link
                      className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-[#0b4a37] px-4 py-2 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b4a37] focus-visible:ring-offset-2"
                      href="/hr/dashboard"
                    >
                      면접 절차 이어가기
                    </Link>
                  )}
                </div>
              ) : (
                <>
                  <label className="block" htmlFor="pool-message">
                    <span className="mb-2 block text-sm font-semibold text-[#344039]">
                      교사에게 보낼 메시지
                    </span>
                    <textarea
                      id="pool-message"
                      className="min-h-24 w-full resize-y rounded-md border border-[#d8d5cc] bg-white px-3 py-3 text-sm leading-6 text-[#17231e] outline-none placeholder:text-[#858c88] focus:border-[#0b4a37] focus:ring-2 focus:ring-[#0b4a37]/15"
                      onChange={(event) => setMessage(event.target.value)}
                      placeholder="담당 학년, 기대 역할, 연락 가능한 시간을 간단히 안내하세요."
                      value={message}
                    />
                  </label>
                  <label className="block" htmlFor="pool-note">
                    <span className="mb-2 block text-sm font-semibold text-[#344039]">
                      내부 검토 메모
                      <span className="ml-1 font-normal text-[#858c88]">
                        선택
                      </span>
                    </span>
                    <input
                      id="pool-note"
                      className="h-11 w-full rounded-md border border-[#d8d5cc] bg-white px-3 text-sm text-[#17231e] outline-none placeholder:text-[#858c88] focus:border-[#0b4a37] focus:ring-2 focus:ring-[#0b4a37]/15"
                      onChange={(event) => setNote(event.target.value)}
                      placeholder="담당자만 확인하는 메모"
                      value={note}
                    />
                  </label>
                  <button
                    className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-[#0b4a37] px-4 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(11,74,55,0.16)] hover:bg-[#083a2c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b4a37] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={!selectedJob || pendingAction !== null}
                    onClick={() => void handleSendRequest()}
                    type="button"
                  >
                    {pendingAction === "send" ? (
                      <LoaderCircle
                        aria-hidden="true"
                        className="h-4 w-4 animate-spin"
                      />
                    ) : (
                      <Send aria-hidden="true" className="h-4 w-4" />
                    )}
                    {pendingAction === "send" ? "제안 전송 중" : "채용 제안 보내기"}
                  </button>
                </>
              )}
            </div>
          )}
        </aside>
      </section>
    </PortalShell>
  );
}
