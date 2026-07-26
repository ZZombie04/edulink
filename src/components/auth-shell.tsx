"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  BriefcaseBusiness,
  Check,
  LockKeyhole,
  ShieldCheck,
  UserRoundCheck,
} from "lucide-react";

import { BrandLockup } from "@/components/brand";
import type { AvatarPresetId } from "@/lib/avatar-presets";

type AuthVariant = "login" | "school" | "teacher";

interface AuthShellProps {
  children: ReactNode;
  title: string;
  variant: AuthVariant;
  avatarPreset?: AvatarPresetId;
}

const variantContent = {
  login: {
    eyebrow: "안전한 교육 채용 네트워크",
    headline: "한 번의 로그인으로\n채용 과정을 이어가세요.",
    description:
      "교사는 받은 제안과 지원 현황을, 학교 담당자는 인재풀과 채용 진행 상황을 한곳에서 확인합니다.",
    items: [
      { Icon: LockKeyhole, label: "권한별 정보 접근" },
      { Icon: BriefcaseBusiness, label: "채용 진행 이력 관리" },
      { Icon: ShieldCheck, label: "민감 정보 단계별 공개" },
    ],
  },
  teacher: {
    eyebrow: "교사 회원",
    headline: "경력은 선명하게,\n기회는 더 가깝게.",
    description:
      "검증 가능한 자격과 희망 조건을 등록하면 승인된 학교 담당자가 적합한 채용 제안을 보낼 수 있습니다.",
    items: [
      { Icon: UserRoundCheck, label: "자격과 경력 프로필" },
      { Icon: BriefcaseBusiness, label: "학교의 직접 채용 제안" },
      { Icon: ShieldCheck, label: "수락 전 연락처 비공개" },
    ],
  },
  school: {
    eyebrow: "학교·교육기관",
    headline: "신뢰할 수 있는 교사를\n더 빠르게 만나세요.",
    description:
      "학교 인증 후 인재풀 열람, 채용 공고 등록, 제안 전송과 지원자 검토를 하나의 흐름으로 운영합니다.",
    items: [
      { Icon: Building2, label: "관리자 승인 학교 계정" },
      { Icon: UserRoundCheck, label: "검증 정보 기반 인재 검색" },
      { Icon: ShieldCheck, label: "관리자 전용 채용 리뷰" },
    ],
  },
} satisfies Record<
  AuthVariant,
  {
    eyebrow: string;
    headline: string;
    description: string;
    items: Array<{ Icon: typeof Check; label: string }>;
  }
>;

export function AuthShell({
  children,
  title,
  variant,
}: AuthShellProps) {
  const content = variantContent[variant];

  return (
    <div className="min-h-screen bg-surface text-ink">
      <div className="grid min-h-screen lg:grid-cols-[minmax(360px,0.76fr)_minmax(0,1.24fr)]">
        <aside className="relative hidden min-h-screen bg-primary-900 text-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col">
          <div className="flex h-full flex-col px-10 py-9 xl:px-14 xl:py-11">
            <Link
              href="/"
              className="w-fit focus-visible:outline-white/60"
              aria-label="EduLink 홈으로 이동"
            >
              <BrandLockup
                className="[&>span:first-child]:text-[#c6d9ce]"
                textClassName="text-white"
              />
            </Link>

            <div className="my-auto max-w-lg py-14">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#a8c5b6]">
                {content.eyebrow}
              </p>
              <h1 className="mt-5 whitespace-pre-line text-[clamp(2.4rem,4vw,4rem)] font-bold leading-[1.12] tracking-[-0.045em] text-white">
                {content.headline}
              </h1>
              <p className="mt-6 max-w-md break-keep text-base leading-7 text-white/70">
                {content.description}
              </p>

              <div className="mt-10 border-y border-white/15">
                {content.items.map(({ Icon, label }) => (
                  <div
                    key={label}
                    className="flex items-center gap-3 border-b border-white/15 py-4 last:border-b-0"
                  >
                    <Icon
                      className="h-5 w-5 text-[#b8d0c3]"
                      strokeWidth={1.7}
                    />
                    <span className="text-sm font-semibold text-white/88">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs leading-5 text-white/48">
              EduLink는 역할과 채용 단계에 따라 필요한 정보만 제공합니다.
            </p>
          </div>
        </aside>

        <main className="min-w-0 px-4 py-6 sm:px-7 sm:py-9 lg:px-10 xl:px-16">
          <div className="mx-auto w-full max-w-4xl">
            <div className="mb-10 flex items-center justify-between gap-4 border-b border-outline pb-5">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm font-semibold text-ink-soft transition-colors hover:text-primary-700"
              >
                <ArrowLeft className="h-4 w-4" />
                홈으로
              </Link>
              <span className="text-sm font-semibold text-ink-muted">
                {title}
              </span>
            </div>

            <Link
              href="/"
              className="mb-9 inline-flex lg:hidden"
              aria-label="EduLink 홈으로 이동"
            >
              <BrandLockup />
            </Link>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
