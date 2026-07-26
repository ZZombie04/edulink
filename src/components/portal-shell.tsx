"use client";

import type { FormEvent, ReactNode } from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  ChevronDown,
  HelpCircle,
  Search,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

import { BrandLockup, BrandMark } from "@/components/brand";
import { CharacterAvatar } from "@/components/character-avatar";
import { LogoutButton } from "@/components/logout-button";
import type { AvatarPresetId } from "@/lib/avatar-presets";
import { cn } from "@/lib/utils";

export interface PortalNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  active?: boolean;
  badge?: string;
}

interface PortalShellProps {
  children: ReactNode;
  navItems: PortalNavItem[];
  user: {
    name: string;
    role: string;
    detail?: string;
    avatarPreset?: AvatarPresetId;
  };
  sectionLabel?: string;
  primaryAction?: {
    href: string;
    label: string;
    icon?: LucideIcon;
  };
  noticeCount?: number;
}

function UserAvatar({
  name,
  avatarPreset,
}: {
  name: string;
  avatarPreset?: AvatarPresetId;
}) {
  if (avatarPreset) {
    return (
      <CharacterAvatar
        className="h-10 w-10 rounded-md"
        presetId={avatarPreset}
        size={40}
      />
    );
  }

  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#6a574f] text-sm font-semibold text-white">
      {name.slice(0, 1)}
    </div>
  );
}

export function PortalShell({
  children,
  navItems,
  user,
  sectionLabel,
  primaryAction,
  noticeCount = 0,
}: PortalShellProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextQuery = searchQuery.trim();
    router.push(nextQuery ? `/jobs?query=${encodeURIComponent(nextQuery)}` : "/jobs");
  };

  return (
    <div className="min-h-screen bg-[#f7f6f1] text-[#17231e]">
      <a
        className="fixed left-4 top-3 z-[70] -translate-y-20 rounded-md bg-[#0b4a37] px-4 py-2 text-sm font-semibold text-white transition-transform focus:translate-y-0"
        href="#portal-main"
      >
        본문으로 바로가기
      </a>

      <aside className="fixed inset-y-0 left-0 z-50 hidden w-[264px] flex-col border-r border-[#dfddd5] bg-[#fbfaf6] px-5 py-6 lg:flex">
        <Link
          className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b4a37] focus-visible:ring-offset-2"
          href="/"
        >
          <BrandLockup textClassName="text-[#17231e]" />
        </Link>

        {primaryAction ? (
          <Link
            className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#0b4a37] px-4 py-3 text-sm font-semibold text-white shadow-[0_8px_22px_rgba(11,74,55,0.16)] transition-colors hover:bg-[#083a2c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b4a37] focus-visible:ring-offset-2"
            href={primaryAction.href}
          >
            {primaryAction.icon ? (
              <primaryAction.icon aria-hidden="true" className="h-4 w-4" />
            ) : null}
            {primaryAction.label}
          </Link>
        ) : null}

        <nav aria-label="주요 메뉴" className="mt-8 flex flex-col gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              aria-current={item.active ? "page" : undefined}
              className={cn(
                "flex min-h-11 items-center justify-between rounded-md px-3.5 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b4a37] focus-visible:ring-offset-2",
                item.active
                  ? "bg-[#ebe9e2] text-[#0b4a37]"
                  : "text-[#525b56] hover:bg-[#f0eee8] hover:text-[#17231e]",
              )}
              href={item.href}
            >
              <span className="flex items-center gap-3">
                <item.icon aria-hidden="true" className="h-[18px] w-[18px]" />
                {item.label}
              </span>
              {item.badge ? (
                <span className="flex min-h-6 min-w-6 items-center justify-center rounded-full bg-[#e4e2da] px-1.5 text-[11px] font-semibold text-[#39433e]">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          ))}
        </nav>

        <div className="mt-auto space-y-4">
          <div className="rounded-md border border-[#dedbd1] bg-[#f7f5ef] p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#26322d]">
              <ShieldCheck aria-hidden="true" className="h-4 w-4 text-[#0b4a37]" />
              개인정보 보호 안내
            </div>
            <p className="mt-2 break-keep text-xs leading-5 text-[#69716d]">
              채용 정보는 권한과 진행 단계에 따라 필요한 범위에서만 표시됩니다.
            </p>
          </div>
          <Link
            className="inline-flex items-center gap-2 rounded-md px-2 py-2 text-xs font-medium text-[#69716d] hover:text-[#17231e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b4a37]"
            href="/"
          >
            <HelpCircle aria-hidden="true" className="h-4 w-4" />
            이용 가이드
          </Link>
        </div>
      </aside>

      <div className="lg:pl-[264px]">
        <header className="sticky top-0 z-40 border-b border-[#dfddd5] bg-[#fbfaf6]/95 backdrop-blur">
          <div className="flex min-h-[72px] items-center gap-4 px-4 sm:px-6 xl:px-8">
            <Link
              className="flex shrink-0 items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b4a37] lg:hidden"
              href="/"
            >
              <BrandMark className="h-9 w-9" />
              <span className="font-bold tracking-tight text-[#17231e]">
                EduLink
              </span>
            </Link>

            <form
              className="relative hidden w-full max-w-[500px] md:block"
              onSubmit={submitSearch}
              role="search"
            >
              <label className="sr-only" htmlFor="portal-search">
                채용 공고 검색
              </label>
              <input
                id="portal-search"
                className="h-11 w-full rounded-md border border-[#d8d5cc] bg-white px-4 pr-11 text-sm text-[#17231e] outline-none placeholder:text-[#858b87] focus:border-[#0b4a37] focus:ring-2 focus:ring-[#0b4a37]/15"
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="과목, 지역, 학교명으로 채용 공고 검색"
                type="search"
                value={searchQuery}
              />
              <button
                aria-label="검색"
                className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-[#4c5751] hover:bg-[#f0eee8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b4a37]"
                type="submit"
              >
                <Search aria-hidden="true" className="h-[18px] w-[18px]" />
              </button>
            </form>

            {sectionLabel ? (
              <span className="hidden shrink-0 text-sm font-semibold text-[#626a66] xl:inline-flex">
                {sectionLabel}
              </span>
            ) : null}

            <div className="ml-auto flex items-center gap-2">
              <Link
                aria-label={`알림 ${noticeCount}건`}
                href={navItems[0]?.href ?? "/"}
                className="relative flex h-10 w-10 items-center justify-center rounded-md text-[#4f5954] transition-colors hover:bg-[#efede7] hover:text-[#17231e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b4a37]"
              >
                <Bell aria-hidden="true" className="h-[19px] w-[19px]" />
                {noticeCount > 0 ? (
                  <span className="absolute right-0 top-0 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#0b4a37] px-1 text-[10px] font-bold text-white">
                    {noticeCount > 99 ? "99+" : noticeCount}
                  </span>
                ) : null}
              </Link>

              <div className="hidden h-8 w-px bg-[#dfddd5] sm:block" />

              <div className="hidden items-center gap-3 sm:flex">
                <UserAvatar avatarPreset={user.avatarPreset} name={user.name} />
                <div className="hidden min-w-0 xl:block">
                  <div className="max-w-36 truncate text-sm font-semibold text-[#17231e]">
                    {user.name}
                  </div>
                  <div className="max-w-40 truncate text-xs text-[#757c78]">
                    {[user.detail, user.role].filter(Boolean).join(" · ")}
                  </div>
                </div>
                <ChevronDown aria-hidden="true" className="hidden h-4 w-4 text-[#6f7672] xl:block" />
              </div>

              <LogoutButton
                className="hidden border border-[#d8d5cc] bg-white text-[#4b5650] hover:bg-[#f0eee8] hover:text-[#17231e] sm:inline-flex"
                label="나가기"
              />
            </div>
          </div>
        </header>

        <main
          className="mx-auto w-full max-w-[1540px] px-4 pb-16 pt-5 sm:px-6 sm:pt-7 xl:px-8"
          id="portal-main"
        >
          <div className="mb-5 flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {navItems.map((item) => (
              <Link
                key={item.href}
                aria-current={item.active ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-10 shrink-0 items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b4a37]",
                  item.active
                    ? "border-[#a8b8b0] bg-[#e7eee9] text-[#0b4a37]"
                    : "border-[#dcd9d0] bg-white text-[#56605b]",
                )}
                href={item.href}
              >
                <item.icon aria-hidden="true" className="h-4 w-4" />
                {item.label}
                {item.badge ? (
                  <span className="rounded-full bg-[#dfddd5] px-1.5 text-[10px]">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            ))}
            <LogoutButton className="inline-flex min-h-10 shrink-0 border border-[#dcd9d0] bg-white text-[#56605b]" />
          </div>

          {primaryAction ? (
            <Link
              className="mb-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-[#0b4a37] px-4 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(11,74,55,0.14)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b4a37] focus-visible:ring-offset-2 lg:hidden"
              href={primaryAction.href}
            >
              {primaryAction.icon ? (
                <primaryAction.icon aria-hidden="true" className="h-4 w-4" />
              ) : null}
              {primaryAction.label}
            </Link>
          ) : null}

          {children}
        </main>
      </div>
    </div>
  );
}
