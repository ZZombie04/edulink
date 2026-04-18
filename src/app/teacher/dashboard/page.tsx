"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  Bell,
  Briefcase,
  Clock3,
  LayoutDashboard,
  MapPin,
  Search,
  ShieldCheck,
  Star,
  User,
} from "lucide-react";

import { CharacterAvatar } from "@/components/character-avatar";
import { PortalShell } from "@/components/portal-shell";
import { featuredTeachers, teacherMatchRequests } from "@/lib/demo-data";

const navItems = [
  { href: "/teacher/dashboard", label: "대시보드", icon: LayoutDashboard, active: true },
  { href: "/jobs", label: "채용 공고", icon: Briefcase },
  { href: "/pool", label: "인재풀", icon: Search },
  { href: "/admin/dashboard", label: "운영 지표", icon: BarChart3 },
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
  const [availability, setAvailability] = useState<"seeking" | "paused">("seeking");

  return (
    <PortalShell
      navItems={navItems}
      noticeCount={2}
      primaryAction={{ href: "/jobs", label: "새 공고 보기", icon: Briefcase }}
      sectionLabel="교사 대시보드"
      user={{
        name: teacher.name,
        role: "등록 교사",
        detail: teacher.qualification,
        avatarPreset: teacher.avatarPreset,
      }}
    >
      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-lg bg-[linear-gradient(135deg,#0058be,#2170e4)] p-8 text-white shadow-soft">
          <span className="kicker text-white/85 before:bg-white">교사 대시보드</span>
          <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
            내 프로필과 받은 제안을
            <br />
            한 화면에서 바로 확인합니다.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/78 sm:text-base">
            구직 상태, 받은 요청, 주목한 학교를 같은 톤으로 정리했습니다. 중요한 정보만
            남기고 시선을 분산시키던 카드 층을 덜어냈습니다.
          </p>
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
                <div className="font-semibold">구직중</div>
                <div className="mt-1 text-sm">학교에서 인재풀을 볼 수 있는 상태입니다.</div>
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
                <div className="font-semibold">휴식중</div>
                <div className="mt-1 text-sm">새 요청은 잠시 멈추고 프로필만 보관합니다.</div>
              </div>
              <Clock3 className="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "프로필 조회", value: "12회", Icon: User },
          { label: "받은 제안", value: "3건", Icon: Bell },
          { label: "관심 학교", value: "5곳", Icon: Star },
          { label: "지금 지원 가능 공고", value: "18건", Icon: Briefcase },
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
            <div>
              <div className="text-xl font-bold text-ink">받은 매칭 요청</div>
              <div className="mt-1 text-sm text-ink-soft">응답이 필요한 순서대로 정리했습니다.</div>
            </div>
            <Link href="/jobs" className="text-sm font-semibold text-primary-700">
              공고 보기
            </Link>
          </div>

          <div className="mt-6 space-y-4">
            {teacherMatchRequests.map((request) => (
              <div
                key={request.id}
                className="rounded-lg border border-outline bg-surface p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${requestTone(
                        request.status
                      )}`}
                    >
                      {request.status === "accepted"
                        ? "응답 수락"
                        : request.status === "rejected"
                        ? "응답 거절"
                        : "응답 대기"}
                    </span>
                    <div className="mt-3 text-xl font-bold text-ink">
                      {request.schoolName}
                    </div>
                    <div className="mt-1 text-sm text-ink-soft">
                      {request.position} · {request.period}
                    </div>
                    <div className="mt-2 inline-flex items-center gap-2 text-sm text-ink-muted">
                      <MapPin className="h-4 w-4 text-primary-600" />
                      {request.region}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {request.status === "pending" ? (
                      <>
                        <button
                          type="button"
                          className="rounded-lg bg-[linear-gradient(135deg,#0058be,#2170e4)] px-4 py-3 text-sm font-semibold text-white shadow-soft"
                        >
                          수락
                        </button>
                        <button
                          type="button"
                          className="rounded-lg border border-outline px-4 py-3 text-sm font-semibold text-ink-soft"
                        >
                          보류
                        </button>
                      </>
                    ) : (
                      <div className="text-sm text-ink-muted">{request.receivedAt}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="panel-surface p-6">
            <div className="text-xl font-bold text-ink">내 프로필 요약</div>
            <div className="mt-6 flex items-center gap-4">
              <CharacterAvatar
                className="h-20 w-20 rounded-lg"
                presetId={teacher.avatarPreset}
                size={80}
              />
              <div>
                <div className="text-2xl font-bold text-ink">{teacher.name}</div>
                <div className="mt-1 text-sm text-ink-soft">
                  {teacher.qualification} · {teacher.residence}
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
            <div className="text-xl font-bold text-ink">다음 액션</div>
            <div className="mt-5 space-y-3">
              {[
                "프로필 소개 문장을 조금 더 구체적으로 다듬기",
                "희망 지역에 화성과 성남을 추가 검토하기",
                "관심 학교 2곳의 새 공고 알림 확인하기",
              ].map((item) => (
                <div key={item} className="rounded-lg bg-surface-subtle px-4 py-3 text-sm text-ink-soft">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </PortalShell>
  );
}
