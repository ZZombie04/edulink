"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  School,
  ShieldCheck,
} from "lucide-react";

import { AuthShell } from "@/components/auth-shell";
import {
  DEMO_ACCOUNTS,
  DEMO_PASSWORD,
} from "@/lib/demo-access";
import { gyeonggiRegions } from "@/lib/demo-data";
import { hrConsentSections } from "@/lib/hr-consents";

const steps = [
  { id: 1, title: "필수 동의", icon: ShieldCheck },
  { id: 2, title: "학교 정보", icon: School },
];

export default function HRRegisterPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [termsConsent, setTermsConsent] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  return (
    <AuthShell title="학교 가입" variant="school">
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-8 flex items-center justify-between gap-3 overflow-x-auto">
          {steps.map((step) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isDone = currentStep > step.id;

            return (
              <div
                key={step.id}
                className="flex min-w-[140px] items-center gap-3"
              >
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-lg text-sm font-bold ${
                    isActive || isDone
                      ? "bg-primary-50 text-primary-700"
                      : "bg-surface-panel text-ink-muted"
                  }`}
                >
                  {isDone ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>
                <div>
                  <div className="text-sm font-semibold text-ink">
                    {step.title}
                  </div>
                  <div className="text-xs text-ink-muted">{step.id}단계</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="panel-surface p-8">
          {submitError ? (
            <div className="mb-6 rounded-lg bg-[var(--danger-soft)] px-4 py-3 text-sm text-[#9c2f24]">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {submitError}
              </div>
            </div>
          ) : null}

          {currentStep === 1 ? (
            <>
              <div className="text-3xl font-bold text-ink">필수 동의</div>
              <div className="mt-2 text-sm leading-6 text-ink-soft">
                학교 계정 운영과 채용 공고 등록을 위해 필요한 필수 동의입니다.
              </div>

              <div className="mt-6 space-y-4">
                {hrConsentSections.map((section) => {
                  const checked =
                    section.id === "privacy" ? privacyConsent : termsConsent;
                  const onChange =
                    section.id === "privacy"
                      ? setPrivacyConsent
                      : setTermsConsent;

                  return (
                    <div
                      key={section.id}
                      className="overflow-hidden rounded-[20px] border border-outline bg-surface-subtle"
                    >
                      <div className="flex items-center gap-3 px-5 py-4">
                        <input
                          checked={checked}
                          className="h-4 w-4"
                          type="checkbox"
                          onChange={(event) => onChange(event.target.checked)}
                        />
                        <div className="font-semibold text-ink">
                          {section.title}
                        </div>
                      </div>

                      <details className="border-t border-outline/70">
                        <summary className="cursor-pointer list-none px-5 py-3 text-xs font-semibold text-primary-700">
                          내용 보기
                        </summary>
                        <div className="space-y-4 px-5 pb-5 text-sm leading-6 text-ink-soft">
                          <div>
                            <div className="font-semibold text-ink">
                              {section.heading}
                            </div>
                            <ul className="mt-2 list-disc space-y-1 pl-5">
                              {section.points.map((point) => (
                                <li key={point}>{point}</li>
                              ))}
                            </ul>
                          </div>

                          {section.sections.map((detail) => (
                            <div
                              key={detail.title}
                              className="rounded-xl bg-white px-4 py-3"
                            >
                              <div className="font-semibold text-ink">
                                {detail.title}
                              </div>
                              <div className="mt-1 text-sm leading-6 text-ink-soft">
                                {detail.body}
                              </div>
                            </div>
                          ))}
                        </div>
                      </details>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-outline px-4 py-3 text-sm font-semibold text-ink-soft"
                  onClick={() => setCurrentStep(1)}
                >
                  <ArrowLeft className="h-4 w-4" />
                  이전
                </button>
                <button
                  type="button"
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-[linear-gradient(135deg,#0058be,#2170e4)] px-4 py-3 text-sm font-semibold text-white shadow-soft disabled:opacity-50"
                  disabled={!privacyConsent || !termsConsent}
                  onClick={() => setCurrentStep(2)}
                >
                  다음
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </>
          ) : null}

          {currentStep === 2 ? (
            <>
              <div className="text-3xl font-bold text-ink">학교 정보</div>
              <div className="mt-2 text-sm leading-6 text-ink-soft">
                승인 담당자가 빠르게 검토할 수 있도록 꼭 필요한 정보만
                정리했습니다.
              </div>

              <div className="mt-6 rounded-lg bg-surface-subtle p-4 text-sm text-ink-soft">
                <div className="font-semibold text-ink">시연용 학교 계정</div>
                <div className="mt-3 rounded-lg bg-white px-4 py-3">
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-muted">
                    로그인 아이디
                  </div>
                  <div className="mt-2 text-sm font-semibold text-ink">
                    {DEMO_ACCOUNTS[1].email}
                  </div>
                  <div className="mt-1 text-sm text-ink-soft">
                    비밀번호 {DEMO_PASSWORD}
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <div className="mb-2 text-sm font-semibold text-ink">
                    담당자 이름
                  </div>
                  <input className="input-surface" placeholder="홍수진" />
                </label>
                <label className="block">
                  <div className="mb-2 text-sm font-semibold text-ink">
                    담당자 이메일
                  </div>
                  <input
                    className="input-surface"
                    placeholder="name@school.go.kr"
                  />
                </label>
                <label className="block">
                  <div className="mb-2 text-sm font-semibold text-ink">
                    학교명
                  </div>
                  <input className="input-surface" placeholder="정인초등학교" />
                </label>
                <label className="block">
                  <div className="mb-2 text-sm font-semibold text-ink">
                    학교 유형
                  </div>
                  <select className="input-surface">
                    <option>초등학교</option>
                    <option>중학교</option>
                    <option>고등학교</option>
                    <option>특수학교</option>
                  </select>
                </label>
                <label className="block">
                  <div className="mb-2 text-sm font-semibold text-ink">
                    지역
                  </div>
                  <select className="input-surface">
                    {gyeonggiRegions.map((region) => (
                      <option key={region}>{region}</option>
                    ))}
                  </select>
                </label>
                <label className="block sm:col-span-2">
                  <div className="mb-2 text-sm font-semibold text-ink">
                    학교 주소
                  </div>
                  <input
                    className="input-surface"
                    placeholder="경기도 수원시 영통구 ..."
                  />
                </label>
              </div>

              <div className="mt-6 rounded-lg bg-surface-subtle p-4 text-sm leading-6 text-ink-soft">
                가입 요청 후 운영 관리자 확인을 거쳐 계정이 활성화됩니다. 보통
                영업일 기준 1~2일 안에 검토됩니다.
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-outline px-4 py-3 text-sm font-semibold text-ink-soft"
                  onClick={() => setCurrentStep(1)}
                >
                  <ArrowLeft className="h-4 w-4" />
                  이전
                </button>
                <button
                  type="button"
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-[linear-gradient(135deg,#0058be,#2170e4)] px-4 py-3 text-sm font-semibold text-white shadow-soft"
                  disabled={submitting}
                  onClick={async () => {
                    setSubmitError("");
                    setSubmitting(true);

                    try {
                      const response = await fetch("/api/auth/demo-login", {
                        body: JSON.stringify({
                          email: DEMO_ACCOUNTS[1].email,
                          password: DEMO_PASSWORD,
                        }),
                        headers: {
                          "Content-Type": "application/json",
                        },
                        method: "POST",
                      });

                      const result = (await response.json().catch(() => null)) as
                        | { message?: string; redirectTo?: string }
                        | null;

                      if (!response.ok || !result?.redirectTo) {
                        setSubmitError(
                          result?.message ??
                            "학교 계정 신청을 완료하지 못했습니다.",
                        );
                        setSubmitting(false);
                        return;
                      }

                      window.location.assign(result.redirectTo);
                    } catch {
                      setSubmitError(
                        "학교 계정 신청을 완료하지 못했습니다.",
                      );
                      setSubmitting(false);
                    }
                  }}
                >
                  {submitting ? "학교 계정 생성 중..." : "학교 계정 신청"}
                  <Check className="h-4 w-4" />
                </button>
              </div>
            </>
          ) : null}
        </div>

        <div className="mt-6 text-center text-sm text-ink-soft">
          이미 계정이 있다면{" "}
          <Link href="/auth/login" className="font-semibold text-primary-700">
            로그인
          </Link>
        </div>
      </div>
    </AuthShell>
  );
}
