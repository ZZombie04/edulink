"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
} from "lucide-react";

import { AuthShell } from "@/components/auth-shell";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const registered = useSyncExternalStore(
    () => () => undefined,
    () => new URLSearchParams(window.location.search).get("registered"),
    () => null,
  );
  const registrationNotice =
    registered === "teacher"
      ? "교사 가입이 완료되었습니다. 등록한 계정으로 로그인해 주세요."
      : registered === "hr-pending"
        ? "학교 계정 신청이 접수되었습니다. 관리자 승인 후 로그인할 수 있습니다."
        : "";

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!email.trim() || !password) {
      setError("이메일과 비밀번호를 모두 입력해 주세요.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/demo-login", {
        body: JSON.stringify({ email: email.trim(), password }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const result = (await response.json().catch(() => null)) as {
        message?: string;
        redirectTo?: string;
      } | null;

      if (!response.ok || !result?.redirectTo) {
        setError(result?.message ?? "로그인 정보를 다시 확인해 주세요.");
        setLoading(false);
        return;
      }

      // The server validates both origin and role scope. Never re-apply the
      // raw query string here because `//host` is an external navigation.
      window.location.assign(result.redirectTo);
    } catch {
      setError("로그인 서버에 연결하지 못했습니다. 잠시 후 다시 시도해 주세요.");
      setLoading(false);
    }
  };

  return (
    <AuthShell title="로그인" variant="login">
      <div className="mx-auto max-w-lg py-4 sm:py-8 lg:py-12">
        <div className="border-t-2 border-primary-700 bg-surface-contrast px-5 py-7 sm:px-8 sm:py-9">
          <p className="kicker">Welcome back</p>
          <h2 className="mt-4 text-3xl font-bold tracking-[-0.04em] text-ink sm:text-4xl">
            계정에 로그인
          </h2>
          <p className="mt-3 text-sm leading-6 text-ink-soft">
            가입한 역할에 맞는 채용 업무 화면으로 이동합니다.
          </p>

          {registrationNotice ? (
            <div
              className="mt-6 flex items-start gap-3 border border-[#bfd5c7] bg-[#edf5ef] px-4 py-3 text-sm leading-6 text-[#285e43]"
              role="status"
            >
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              {registrationNotice}
            </div>
          ) : null}

          {error ? (
            <div
              className="mt-6 flex items-start gap-3 border border-[#e1b9b2] bg-[var(--danger-soft)] px-4 py-3 text-sm leading-6 text-[#963b33]"
              role="alert"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </div>
          ) : null}

          <form className="mt-7 space-y-5" onSubmit={handleLogin} noValidate>
            <label className="block" htmlFor="email">
              <span className="mb-2 block text-sm font-semibold text-ink">
                이메일
              </span>
              <span className="relative block">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
                <input
                  id="email"
                  autoComplete="email"
                  className="input-surface pl-10"
                  inputMode="email"
                  placeholder="name@school.go.kr"
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setError("");
                  }}
                />
              </span>
            </label>

            <label className="block" htmlFor="password">
              <span className="mb-2 block text-sm font-semibold text-ink">
                비밀번호
              </span>
              <span className="relative block">
                <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
                <input
                  id="password"
                  autoComplete="current-password"
                  className="input-surface px-10"
                  placeholder="비밀번호 입력"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setError("");
                  }}
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center text-ink-muted hover:text-ink"
                  aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
                  onClick={() => setShowPassword((current) => !current)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </span>
            </label>

            <button
              type="submit"
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 bg-primary-700 px-5 text-sm font-bold text-white transition-colors hover:bg-primary-800 disabled:opacity-60"
              disabled={loading}
            >
              {loading ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  로그인 확인 중
                </>
              ) : (
                <>
                  로그인
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <Link
              href="/auth/register/teacher"
              className="inline-flex min-h-11 items-center justify-center border border-outline-strong px-4 text-sm font-semibold text-ink hover:bg-surface-subtle"
            >
              교사 회원가입
            </Link>
            <Link
              href="/auth/register/hr"
              className="inline-flex min-h-11 items-center justify-center border border-outline-strong px-4 text-sm font-semibold text-ink hover:bg-surface-subtle"
            >
              학교 계정 신청
            </Link>
          </div>
        </div>
      </div>
    </AuthShell>
  );
}
