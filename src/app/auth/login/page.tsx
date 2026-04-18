"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowRight, LockKeyhole, Mail } from "lucide-react";

import { AuthShell } from "@/components/auth-shell";
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from "@/lib/demo-access";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!email || !password) {
      setError("이메일과 비밀번호를 모두 입력해 주세요.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/demo-login", {
        body: JSON.stringify({ email, password }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      const result = (await response.json().catch(() => null)) as {
        message?: string;
        redirectTo?: string;
      } | null;

      if (!response.ok || !result?.redirectTo) {
        setLoading(false);
        setError(result?.message ?? "로그인 처리 중 오류가 발생했습니다.");
        return;
      }

      const nextPath =
        typeof window === "undefined"
          ? null
          : new URLSearchParams(window.location.search).get("next");
      const destination =
        nextPath && nextPath.startsWith("/") ? nextPath : result.redirectTo;

      router.push(destination);
      router.refresh();
    } catch {
      setLoading(false);
      setError("로그인 처리 중 오류가 발생했습니다.");
    }
  };

  return (
    <AuthShell title="로그인" variant="login">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md items-center">
        <div className="panel-surface w-full p-8">
          <div className="text-3xl font-bold text-ink">로그인</div>

          {error ? (
            <div className="mt-6 rounded-lg bg-[var(--danger-soft)] px-4 py-3 text-sm text-[#9c2f24]">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            </div>
          ) : null}

          <form className="mt-6 space-y-4" onSubmit={handleLogin}>
            <label className="block">
              <div className="mb-2 text-sm font-semibold text-ink">이메일</div>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
                <input
                  className="input-surface pl-11"
                  placeholder="name@school.go.kr"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
            </label>

            <label className="block">
              <div className="mb-2 text-sm font-semibold text-ink">
                비밀번호
              </div>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
                <input
                  className="input-surface pl-11"
                  placeholder="비밀번호 입력"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>
            </label>

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[linear-gradient(135deg,#0058be,#2170e4)] px-4 py-3 text-sm font-semibold text-white shadow-soft"
              disabled={loading}
            >
              {loading ? "로그인 중..." : "로그인"}
              {!loading ? <ArrowRight className="h-4 w-4" /> : null}
            </button>
          </form>

          <div className="mt-6 rounded-lg bg-surface-subtle p-4 text-sm text-ink-soft">
            <div className="font-semibold text-ink">데모 로그인 예시</div>
            <div className="mt-3 rounded-lg bg-white px-4 py-3 text-ink">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-muted">
                공통 비밀번호
              </div>
              <div className="mt-2 text-base font-bold">{DEMO_PASSWORD}</div>
            </div>
            <div className="mt-3 space-y-2">
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.email}
                  type="button"
                  className="flex w-full items-center justify-between rounded-lg border border-outline bg-white px-4 py-3 text-left"
                  onClick={() => {
                    setEmail(account.email);
                    setPassword(account.password);
                    setError("");
                  }}
                >
                  <div>
                    <div className="text-sm font-semibold text-ink">
                      {account.label}
                    </div>
                    <div className="mt-1 text-sm text-ink-soft">
                      {account.email}
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-primary-700">
                    입력
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Link
              href="/auth/register/teacher"
              className="inline-flex items-center justify-center rounded-lg border border-outline px-4 py-3 text-sm font-semibold text-ink-soft"
            >
              교사 가입
            </Link>
            <Link
              href="/auth/register/hr"
              className="inline-flex items-center justify-center rounded-lg border border-outline px-4 py-3 text-sm font-semibold text-ink-soft"
            >
              학교 가입
            </Link>
          </div>
        </div>
      </div>
    </AuthShell>
  );
}
