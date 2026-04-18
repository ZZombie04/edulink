import {
  BarChart3,
  Briefcase,
  LayoutDashboard,
  Search,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react";

import { PortalShell } from "@/components/portal-shell";
import { adminApprovals, recentUsers } from "@/lib/demo-data";

const navItems = [
  { href: "/admin/dashboard", label: "운영 개요", icon: LayoutDashboard, active: true },
  { href: "/pool", label: "인재풀", icon: Search },
  { href: "/jobs", label: "공고 관리", icon: Briefcase },
  { href: "/hr/dashboard", label: "학교 운영", icon: BarChart3 },
];

function userTone(status: string) {
  switch (status) {
    case "active":
      return "bg-secondary-50 text-secondary-700";
    case "pending":
      return "bg-[var(--warning-soft)] text-[#9a6a00]";
    default:
      return "bg-surface-panel text-ink-soft";
  }
}

export default function AdminDashboardPage() {
  return (
    <PortalShell
      navItems={navItems}
      noticeCount={adminApprovals.length}
      primaryAction={{ href: "/hr/dashboard", label: "승인 대기 확인", icon: ShieldCheck }}
      sectionLabel="운영 관리자"
      user={{
        name: "관리자",
        role: "시스템 운영",
        detail: "승인 및 지표 관리",
      }}
    >
      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="self-start rounded-lg bg-[linear-gradient(135deg,#1d2433,#0058be)] p-6 text-white shadow-soft">
          <div className="flex min-h-[176px] flex-col justify-end">
            <div className="text-3xl font-bold tracking-tight sm:text-4xl">운영 개요</div>
          </div>
        </div>

        <div className="panel-surface p-6">
          <div className="text-sm font-semibold text-ink-soft">운영 알림</div>
          <div className="mt-5 space-y-3">
            {[
              `${adminApprovals.length}건의 학교 계정이 승인 대기 중입니다.`,
              "이번 주 신규 교사 가입은 전주 대비 18% 늘었습니다.",
              "마감 임박 공고가 3건 있어 운영 검토가 필요합니다.",
            ].map((note) => (
              <div key={note} className="rounded-lg bg-surface-subtle px-4 py-3 text-sm text-ink-soft">
                {note}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "전체 교사", value: "247명", Icon: Users },
          { label: "학교 담당자", value: "63명", Icon: ShieldCheck },
          { label: "활성 공고", value: "18건", Icon: Briefcase },
          { label: "이번 주 매칭", value: "42건", Icon: TrendingUp },
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

      <section className="mt-8 grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="panel-surface p-6">
          <div className="text-xl font-bold text-ink">승인 대기 학교 계정</div>

          <div className="mt-6 space-y-4">
            {adminApprovals.map((approval) => (
              <div
                key={approval.id}
                className="rounded-lg border border-outline bg-surface p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-xl font-bold text-ink">{approval.name}</div>
                    <div className="mt-1 text-sm text-ink-soft">{approval.email}</div>
                    <div className="mt-3 text-sm text-ink-muted">
                      {approval.schoolName} · {approval.schoolRegion} · {approval.position}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="rounded-lg bg-[linear-gradient(135deg,#0058be,#2170e4)] px-4 py-3 text-sm font-semibold text-white shadow-soft"
                    >
                      승인
                    </button>
                    <button
                      type="button"
                      className="rounded-lg border border-outline px-4 py-3 text-sm font-semibold text-ink-soft"
                    >
                      보류
                    </button>
                  </div>
                </div>
                <div className="mt-3 text-sm text-ink-muted">{approval.requestedAt}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel-surface p-6">
          <div className="text-xl font-bold text-ink">최근 가입 사용자</div>

          <div className="mt-6 space-y-4">
            {recentUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between rounded-lg border border-outline bg-surface p-4"
              >
                <div>
                  <div className="font-semibold text-ink">{user.name}</div>
                  <div className="mt-1 text-sm text-ink-soft">
                    {user.role === "teacher" ? "교사" : "학교 담당자"} · {user.email}
                  </div>
                </div>
                <div className="text-right">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${userTone(user.status)}`}>
                    {user.status === "active"
                      ? "활성"
                      : user.status === "pending"
                      ? "승인 대기"
                      : "휴면"}
                  </span>
                  <div className="mt-2 text-sm text-ink-muted">{user.joinedAt}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </PortalShell>
  );
}
