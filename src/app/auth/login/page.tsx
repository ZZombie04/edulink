"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowRight, Building2, LockKeyhole, Mail } from "lucide-react";

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

    await new Promise((resolve) => setTimeout(resolve, 800));

    if (email.includes("admin")) {
      router.push("/admin/dashboard");
    } else if (email.includes("school") || email.includes("hr")) {
      router.push("/hr/dashboard");
    } else {
      router.push("/teacher/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-surface text-ink">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden overflow-hidden lg:block">
          <img
            alt="학교 복도에서 회의하는 교사들"
            className="absolute inset-0 h-full w-full object-cover"
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1400&q=80"
          />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(7,18,43,0.88),rgba(0,88,190,0.76),rgba(0,110,47,0.42))]" />
          <div className="relative flex h-full flex-col justify-between p-10 text-white">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/12">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <div className="text-lg font-bold tracking-tight">EduLink</div>
                <div className="text-xs text-white/65">학교 교원 매칭 플랫폼</div>
              </div>
            </Link>

            <div className="max-w-xl">
              <span className="kicker text-white/85 before:bg-white">다시 돌아온 운영 화면</span>
              <h1 className="mt-5 text-5xl font-bold leading-tight">
                역할에 맞는 운영 화면으로
                <br />
                바로 이어집니다.
              </h1>
              <p className="mt-5 text-base leading-7 text-white/78">
                교사, 학교 담당자, 관리자 각각의 흐름을 하나의 브랜드 언어로 정리했습니다.
                로그인 후 즉시 필요한 화면으로 이동합니다.
              </p>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center px-4 py-10 sm:px-6">
          <div className="w-full max-w-md">
            <Link href="/" className="mb-8 flex items-center gap-3 lg:hidden">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <div className="text-lg font-bold tracking-tight">EduLink</div>
                <div className="text-xs text-ink-muted">학교 교원 매칭 플랫폼</div>
              </div>
            </Link>

            <div className="panel-surface p-8">
              <div>
                <div className="text-3xl font-bold text-ink">로그인</div>
                <div className="mt-2 text-sm leading-6 text-ink-soft">
                  역할별 운영 화면으로 바로 이동합니다.
                </div>
              </div>

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
                  <div className="mb-2 text-sm font-semibold text-ink">비밀번호</div>
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
                <div className="mt-3 space-y-2">
                  <div>`teacher@email.com` → 교사 대시보드</div>
                  <div>`hr@school.go.kr` → 학교 담당자 대시보드</div>
                  <div>`admin@edulink.kr` → 관리자 대시보드</div>
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
        </section>
      </div>
    </div>
  );
}
