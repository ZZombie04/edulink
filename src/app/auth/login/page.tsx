"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowRight, LockKeyhole, Mail } from "lucide-react";

import { AuthShell } from "@/components/auth-shell";

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
            <div className="mt-3 space-y-2">
              <div>
                <span className="font-semibold text-ink">
                  teacher@email.com
                </span>{" "}
                → 교사 대시보드
              </div>
              <div>
                <span className="font-semibold text-ink">hr@school.go.kr</span>{" "}
                → 학교 담당자 대시보드
              </div>
              <div>
                <span className="font-semibold text-ink">admin@edulink.kr</span>{" "}
                → 관리자 대시보드
              </div>
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
