import type { ReactNode } from "react";
import Link from "next/link";
import { Bell, BookOpen, ChevronRight, type LucideIcon } from "lucide-react";

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
    avatar?: string;
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
  avatar,
}: {
  name: string;
  avatar?: string;
}) {
  if (avatar) {
    return (
      <img
        alt={name}
        className="h-11 w-11 rounded-lg object-cover"
        src={avatar}
      />
    );
  }

  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-50 text-sm font-bold text-primary-700">
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
  return (
    <div className="min-h-screen bg-surface text-ink">
      <aside className="fixed inset-y-0 left-0 hidden w-72 flex-col border-r border-outline bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(242,243,253,0.94))] px-6 py-6 lg:flex">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-50 text-primary-700 shadow-panel">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <div className="text-lg font-bold tracking-tight text-ink">EduLink</div>
            <div className="text-xs font-medium text-ink-muted">
              학교 교원 매칭 플랫폼
            </div>
          </div>
        </Link>

        {primaryAction ? (
          <Link
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-lg bg-[linear-gradient(135deg,#0058be,#2170e4)] px-4 py-3 text-sm font-semibold text-white shadow-soft transition-transform hover:-translate-y-px"
            href={primaryAction.href}
          >
            {primaryAction.icon ? <primaryAction.icon className="h-4 w-4" /> : null}
            {primaryAction.label}
          </Link>
        ) : null}

        <nav className="mt-8 flex flex-col gap-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              className={cn(
                "flex items-center justify-between rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                item.active
                  ? "bg-white text-primary-700 shadow-panel"
                  : "text-ink-soft hover:bg-white/80 hover:text-ink"
              )}
              href={item.href}
            >
              <span className="flex items-center gap-3">
                <item.icon className="h-4 w-4" />
                {item.label}
              </span>
              {item.badge ? (
                <span className="rounded-full bg-primary-50 px-2 py-0.5 text-[11px] font-semibold text-primary-700">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          ))}
        </nav>

        <div className="mt-auto panel-surface p-4">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-muted">
            운영 포인트
          </div>
          <div className="mt-3 text-sm leading-6 text-ink-soft">
            검색, 매칭, 공고 관리 흐름을 한 화면에서 빠르게 이어갈 수 있게 정리했습니다.
          </div>
          <Link
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary-700"
            href="/jobs"
          >
            공고 현황 보기
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-40 border-b border-outline bg-white/85 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <Link className="flex items-center gap-2 lg:hidden" href="/">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
                  <BookOpen className="h-4 w-4" />
                </div>
                <span className="font-bold tracking-tight text-ink">EduLink</span>
              </Link>
              {sectionLabel ? (
                <span className="hidden text-sm font-semibold text-ink-soft sm:inline-flex">
                  {sectionLabel}
                </span>
              ) : null}
            </div>

            <div className="flex items-center gap-3">
              <button
                className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-outline bg-white text-ink-soft transition-colors hover:text-ink"
                type="button"
              >
                <Bell className="h-4 w-4" />
                {noticeCount > 0 ? (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-700 px-1 text-[10px] font-bold text-white">
                    {noticeCount}
                  </span>
                ) : null}
              </button>

              <div className="hidden items-center gap-3 rounded-lg border border-outline bg-white px-3 py-2 sm:flex">
                <UserAvatar avatar={user.avatar} name={user.name} />
                <div>
                  <div className="text-sm font-semibold text-ink">{user.name}</div>
                  <div className="text-xs text-ink-muted">
                    {[user.role, user.detail].filter(Boolean).join(" · ")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6">
          <div className="mb-6 flex gap-2 overflow-x-auto lg:hidden">
            {navItems.map((item) => (
              <Link
                key={item.href}
                className={cn(
                  "inline-flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium",
                  item.active
                    ? "border-primary-200 bg-primary-50 text-primary-700"
                    : "border-outline bg-white text-ink-soft"
                )}
                href={item.href}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
