"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  Home,
  LayoutDashboard,
  LoaderCircle,
  MapPin,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { useParams } from "next/navigation";

import { PortalShell } from "@/components/portal-shell";
import { HiringStateError } from "@/components/hiring-state-error";
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

function offerTone(status: string) {
  switch (status) {
    case "accepted":
      return {
        label: "제안 수락",
        className: "border-[#b9cec1] bg-[#edf4ef] text-[#1f6248]",
      };
    case "rejected":
      return {
        label: "제안 보류",
        className: "border-[#e4b8ae] bg-[#fff3f0] text-[#8b3328]",
      };
    case "cancelled":
      return {
        label: "학교 요청 취소",
        className: "border-[#d8d5cc] bg-[#f0eee8] text-[#666e69]",
      };
    default:
      return {
        label: "응답 대기",
        className: "border-[#e6d1a2] bg-[#fff7e6] text-[#865d13]",
      };
  }
}

export default function TeacherOfferDetailPage() {
  const params = useParams<{ id: string }>();
  const session = useDemoSession();
  const {
    currentTeacher,
    getPoolRequestById,
    loaded,
    loadError,
    refresh,
    state,
    setPoolRequestStatus,
  } = useDemoHiringState();
  const teacher = currentTeacher ?? featuredTeachers[0];
  const offer = getPoolRequestById(Number(params.id));
  const [pendingStatus, setPendingStatus] = useState<
    "accepted" | "rejected" | null
  >(null);
  const [errorMessage, setErrorMessage] = useState("");

  if (!loaded) {
    return (
      <div
        aria-live="polite"
        className="flex min-h-screen items-center justify-center bg-[#f7f6f1] px-4"
      >
        <div className="h-80 w-full max-w-4xl animate-pulse rounded-md border border-[#e0ddd5] bg-[#eeece6]">
          <span className="sr-only">제안 정보를 불러오는 중입니다.</span>
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

  if (!offer) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f6f1] px-4 text-center">
        <div className="max-w-lg rounded-md border border-[#dedbd2] bg-[#fbfaf6] p-8">
          <h1 className="text-2xl font-bold text-[#17231e]">
            제안 정보를 찾을 수 없습니다
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#68706c]">
            보관되었거나 접근 권한이 없는 제안일 수 있습니다.
          </p>
          <Link
            className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-md bg-[#0b4a37] px-4 py-2 text-sm font-semibold text-white"
            href="/teacher/dashboard"
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            교사 홈으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const pendingOfferCount = state.requests.filter(
    (item) => item.status === "pending",
  ).length;
  const tone = offerTone(offer.status);
  const responseSummary =
    offer.status === "accepted"
      ? "제안을 수락했습니다. 학교 담당자가 면접 또는 다음 절차를 안내합니다."
      : offer.status === "rejected"
        ? "이번 제안을 보류했습니다. 다른 공고와 제안은 계속 확인할 수 있습니다."
        : offer.status === "cancelled"
          ? "학교가 이 요청을 취소했습니다. 별도의 응답은 필요하지 않습니다."
          : "근무 조건과 연결 공고를 확인한 뒤 수락 또는 보류로 응답해 주세요.";

  const respond = async (status: "accepted" | "rejected") => {
    setErrorMessage("");
    setPendingStatus(status);

    try {
      await setPoolRequestStatus(offer.id, status);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "제안 응답을 저장하지 못했습니다.",
      );
    } finally {
      setPendingStatus(null);
    }
  };

  return (
    <PortalShell
      navItems={navItems}
      noticeCount={pendingOfferCount}
      primaryAction={{ href: "/jobs", label: "채용 공고 보기", icon: Briefcase }}
      sectionLabel="제안 상세"
      user={{
        name: session?.name ?? teacher.name,
        role: "등록 교사",
        detail: session?.detail ?? teacher.qualification,
        avatarPreset: session?.avatarPreset ?? teacher.avatarPreset,
      }}
    >
      <Link
        className="inline-flex items-center gap-2 rounded-md text-sm font-semibold text-[#0b4a37] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b4a37]"
        href="/teacher/dashboard"
      >
        <ArrowLeft aria-hidden="true" className="h-4 w-4" />
        교사 홈으로 돌아가기
      </Link>

      {errorMessage ? (
        <div
          className="mt-5 flex items-start gap-2 rounded-md border border-[#e4b8ae] bg-[#fff3f0] px-4 py-3 text-sm text-[#8b3328]"
          role="alert"
        >
          <AlertCircle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
          {errorMessage}
        </div>
      ) : null}

      <section className="mt-5 grid gap-6 xl:grid-cols-[minmax(0,1fr)_400px]">
        <div className="space-y-5">
          <article className="rounded-md border border-[#dedbd2] bg-[#fbfaf6] p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${tone.className}`}
              >
                {tone.label}
              </span>
              <span className="text-xs text-[#727a76]">받은 날짜 {offer.sentAt}</span>
            </div>

            <h1 className="mt-5 break-keep text-3xl font-bold tracking-[-0.03em] text-[#17231e] sm:text-4xl">
              {offer.schoolName}
            </h1>
            <p className="mt-2 break-keep text-lg font-semibold text-[#0b4a37]">
              {offer.position}
            </p>
            <p className="mt-5 max-w-3xl break-keep text-sm leading-7 text-[#5f6963]">
              {offer.message}
            </p>

            <dl className="mt-6 grid gap-4 border-t border-[#e1ded6] pt-6 sm:grid-cols-2">
              <div className="flex gap-3">
                <MapPin
                  aria-hidden="true"
                  className="mt-0.5 h-5 w-5 shrink-0 text-[#0b4a37]"
                />
                <div>
                  <dt className="text-xs text-[#7a827e]">근무 지역</dt>
                  <dd className="mt-1 text-sm font-medium text-[#344039]">
                    {offer.region}
                  </dd>
                </div>
              </div>
              <div className="flex gap-3">
                <CalendarDays
                  aria-hidden="true"
                  className="mt-0.5 h-5 w-5 shrink-0 text-[#0b4a37]"
                />
                <div>
                  <dt className="text-xs text-[#7a827e]">제안 상태</dt>
                  <dd className="mt-1 text-sm font-medium text-[#344039]">
                    {offer.summary}
                  </dd>
                </div>
              </div>
            </dl>
          </article>

          {offer.job ? (
            <section className="rounded-md border border-[#dedbd2] bg-[#fbfaf6] p-6">
              <div className="flex items-center gap-2">
                <Briefcase aria-hidden="true" className="h-5 w-5 text-[#0b4a37]" />
                <h2 className="text-lg font-bold text-[#17231e]">
                  연결된 채용 공고
                </h2>
              </div>
              <h3 className="mt-4 font-semibold text-[#344039]">
                {offer.job.schoolName} · {offer.job.gradeLevel}
              </h3>
              <p className="mt-2 break-keep text-sm leading-6 text-[#65706a]">
                {offer.job.summary}
              </p>
              <Link
                className="mt-5 inline-flex min-h-10 items-center rounded-md border border-[#d3d0c7] bg-white px-4 py-2 text-sm font-semibold text-[#0b4a37] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b4a37]"
                href={`/jobs/${offer.job.id}`}
              >
                공고 상세 보기
              </Link>
            </section>
          ) : null}
        </div>

        <aside className="h-fit rounded-md border border-[#d5d2c9] bg-[#fbfaf6] p-6 shadow-[0_14px_36px_rgba(31,44,37,0.07)] xl:sticky xl:top-24">
          <div className="flex items-center gap-2">
            <ShieldCheck aria-hidden="true" className="h-5 w-5 text-[#0b4a37]" />
            <h2 className="text-xl font-bold text-[#17231e]">제안 응답</h2>
          </div>
          <p className="mt-3 break-keep text-sm leading-6 text-[#65706a]">
            {responseSummary}
          </p>

          {offer.interview ? (
            <div className="mt-5 rounded-md border border-[#bfd0c5] bg-[#edf4ef] p-4 text-sm text-[#24533f]">
              <div className="font-semibold">학교 면접 요청</div>
              <div className="mt-2">
                {offer.interview.date} {offer.interview.time}
              </div>
              <div className="mt-1">{offer.interview.place}</div>
              <div className="mt-2 break-keep leading-6">
                {offer.interview.note}
              </div>
            </div>
          ) : null}

          {offer.status === "pending" ? (
            <div className="mt-6 grid gap-2">
              <button
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#0b4a37] px-4 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(11,74,55,0.16)] hover:bg-[#083a2c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b4a37] focus-visible:ring-offset-2 disabled:opacity-60"
                disabled={pendingStatus !== null}
                onClick={() => void respond("accepted")}
                type="button"
              >
                {pendingStatus === "accepted" ? (
                  <LoaderCircle
                    aria-hidden="true"
                    className="h-4 w-4 animate-spin"
                  />
                ) : (
                  <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
                )}
                {pendingStatus === "accepted" ? "응답 저장 중" : "제안 수락"}
              </button>
              <button
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[#d5d1c7] bg-white px-4 py-2 text-sm font-semibold text-[#5c6660] hover:bg-[#f2f0ea] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b4a37] disabled:opacity-60"
                disabled={pendingStatus !== null}
                onClick={() => void respond("rejected")}
                type="button"
              >
                {pendingStatus === "rejected" ? (
                  <LoaderCircle
                    aria-hidden="true"
                    className="h-4 w-4 animate-spin"
                  />
                ) : (
                  <XCircle aria-hidden="true" className="h-4 w-4" />
                )}
                {pendingStatus === "rejected" ? "응답 저장 중" : "이번 제안 보류"}
              </button>
            </div>
          ) : (
            <div
              className={`mt-6 rounded-md border px-4 py-3 text-sm ${
                offer.status === "accepted"
                  ? "border-[#b9cec1] bg-[#edf4ef] text-[#1f6248]"
                  : offer.status === "cancelled"
                    ? "border-[#d8d5cc] bg-[#f0eee8] text-[#666e69]"
                    : "border-[#e4b8ae] bg-[#fff3f0] text-[#8b3328]"
              }`}
            >
              현재 응답은 저장되었습니다.
            </div>
          )}
        </aside>
      </section>
    </PortalShell>
  );
}
