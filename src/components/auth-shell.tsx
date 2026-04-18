"use client";

import type { ReactNode } from "react";
import Link from "next/link";

import { CharacterAvatar } from "@/components/character-avatar";
import { BrandLockup } from "@/components/brand";
import { JobVisual } from "@/components/job-visual";
import type { AvatarPresetId } from "@/lib/avatar-presets";
import { featuredTeachers, jobPosts } from "@/lib/demo-data";

type AuthVariant = "login" | "school" | "teacher";

interface AuthShellProps {
  children: ReactNode;
  title: string;
  variant: AuthVariant;
  avatarPreset?: AvatarPresetId;
}

function AuthShowcase({
  variant,
  avatarPreset,
}: {
  variant: AuthVariant;
  avatarPreset?: AvatarPresetId;
}) {
  if (variant === "teacher") {
    const choices = Array.from(
      new Set(
        avatarPreset
          ? [
              avatarPreset,
              "teacher-m-navy",
              "teacher-f-mint",
              "teacher-c-aqua",
              "teacher-c-cocoa",
            ]
          : [
              "teacher-f-rose",
              "teacher-m-navy",
              "teacher-f-mint",
              "teacher-c-aqua",
              "teacher-c-cocoa",
            ],
      ),
    );

    return (
      <div className="rounded-[30px] border border-white/12 bg-white/10 p-6 shadow-[0_24px_60px_rgba(7,18,43,0.28)] backdrop-blur-sm">
        <div className="grid gap-4 md:grid-cols-[1.08fr_0.92fr]">
          <div className="rounded-[26px] bg-white/12 p-6">
            <div className="flex min-h-[260px] items-center justify-center rounded-[24px] bg-white/8">
              <CharacterAvatar
                className="rounded-[36px] border-white/55 shadow-[0_30px_60px_rgba(16,28,52,0.24)]"
                presetId={choices[0] as AvatarPresetId}
                size={198}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {choices.slice(1, 5).map((choice) => (
              <div
                key={choice}
                className="flex aspect-square items-center justify-center rounded-[22px] bg-white/12 p-4"
              >
                <CharacterAvatar
                  className="rounded-[22px] border-white/55 shadow-[0_18px_36px_rgba(16,28,52,0.2)]"
                  presetId={choice as AvatarPresetId}
                  size={84}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (variant === "school") {
    return (
      <div className="flex flex-col items-center gap-4">
        <JobVisual
          className="min-h-[280px] w-full"
          employmentType="학교 계정 승인"
          gradeLevel="기관 확인과 계정 등록"
          id={jobPosts[0].id}
          qualificationType="운영 계정"
          schoolName="학교 가입"
          schoolRegion="경기"
          variant="hero"
        />
        <div className="grid w-full max-w-[420px] gap-4 sm:grid-cols-2">
          {[
            ["기관 확인", "확인 코드 검증"],
            ["계정 신청", "학교 정보 입력"],
          ].map(([title, detail]) => (
            <div
              key={title}
              className="rounded-[22px] border border-white/12 bg-white/10 px-4 py-4 backdrop-blur-sm"
            >
              <div className="text-center text-sm font-semibold text-white">
                {title}
              </div>
              <div className="mt-2 text-center text-sm text-white">
                {detail}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
      <JobVisual
        className="min-h-[300px]"
        employmentType={jobPosts[0].employmentType}
        gradeLevel={jobPosts[0].gradeLevel}
        id={jobPosts[0].id}
        qualificationType={jobPosts[0].qualificationType}
        schoolName={jobPosts[0].schoolName}
        schoolRegion={jobPosts[0].schoolRegion}
        variant="hero"
      />

      <div className="space-y-4">
        <div className="rounded-[24px] border border-white/12 bg-white/10 p-5 backdrop-blur-sm">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-white/66">
            Teacher
          </div>
          <div className="mt-4 flex items-center gap-3">
            <CharacterAvatar
              className="h-16 w-16 rounded-[18px]"
              presetId={featuredTeachers[0].avatarPreset}
              size={64}
            />
            <div>
              <div className="text-lg font-bold text-white">
                {featuredTeachers[0].name}
              </div>
              <div className="text-sm text-white/72">
                {featuredTeachers[0].qualification}
              </div>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {featuredTeachers[0].preferredRegions.map((region) => (
              <span
                key={region}
                className="rounded-full bg-white/12 px-3 py-2 text-xs font-semibold text-white/78"
              >
                {region}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            ["인재풀", "빠른 탐색"],
            ["채용 공고", "조건 확인"],
            ["승인 운영", "계정 관리"],
            ["매칭 요청", "즉시 제안"],
          ].map(([title, detail]) => (
            <div
              key={title}
              className="rounded-[20px] border border-white/12 bg-white/10 px-4 py-4 backdrop-blur-sm"
            >
              <div className="text-sm font-semibold text-white">{title}</div>
              <div className="mt-1 text-xs text-white/70">{detail}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AuthShell({
  children,
  title,
  variant,
  avatarPreset,
}: AuthShellProps) {
  return (
    <div className="min-h-screen bg-surface text-ink">
      <div className="grid min-h-screen lg:grid-cols-[0.96fr_1.04fr]">
        <section className="relative hidden overflow-hidden lg:block">
          <div className="absolute inset-0 bg-[linear-gradient(145deg,#071b3a,#0b4fa6,#17917b)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.14),transparent_34%)]" />

          <div className="relative flex h-full flex-col px-10 py-9 text-white">
            <Link href="/">
              <BrandLockup textClassName="text-white" />
            </Link>

            <div className="mt-16 text-5xl font-bold leading-tight">
              {title}
            </div>

            <div className="mt-10 flex flex-1 items-center justify-center">
              <div className="w-full max-w-[560px]">
                <AuthShowcase avatarPreset={avatarPreset} variant={variant} />
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-10 sm:px-6">
          <div className="mx-auto w-full max-w-3xl">
            <Link href="/" className="inline-flex lg:hidden">
              <BrandLockup className="mb-8" />
            </Link>
            {children}
          </div>
        </section>
      </div>
    </div>
  );
}
