"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  KeyRound,
  School,
  ShieldCheck,
} from "lucide-react";

import { AuthShell } from "@/components/auth-shell";
import {
  DEMO_ACCOUNTS,
  DEMO_PASSWORD,
  DEMO_VERIFICATION_CODE,
} from "@/lib/demo-access";
import { gyeonggiRegions } from "@/lib/demo-data";

const steps = [
  { id: 1, title: "기관 확인", icon: KeyRound },
  { id: 2, title: "필수 동의", icon: ShieldCheck },
  { id: 3, title: "학교 정보", icon: School },
];

export default function HRRegisterPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [verificationCode, setVerificationCode] = useState("");
  const [verified, setVerified] = useState(false);
  const [verificationError, setVerificationError] = useState("");
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [termsConsent, setTermsConsent] = useState(false);

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
          {currentStep === 1 ? (
            <>
              <div className="text-3xl font-bold text-ink">기관 확인</div>
              <div className="mt-2 text-sm leading-6 text-ink-soft">
                교육청 또는 운영 기관에서 받은 확인 코드를 입력해 주세요.
              </div>

              <div className="mt-6 space-y-4">
                <div className="rounded-lg bg-surface-subtle p-4 text-sm text-ink-soft">
                  <div className="font-semibold text-ink">
                    테스트용 인증 번호
                  </div>
                  <div className="mt-3 rounded-lg bg-white px-4 py-3">
                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-muted">
                      인증 번호
                    </div>
                    <div className="mt-2 text-base font-bold text-ink">
                      {DEMO_VERIFICATION_CODE}
                    </div>
                  </div>
                  <div className="mt-3 rounded-lg bg-white px-4 py-3">
                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-muted">
                      학교 계정 로그인
                    </div>
                    <div className="mt-2 text-sm font-semibold text-ink">
                      {DEMO_ACCOUNTS[1].email}
                    </div>
                    <div className="mt-1 text-sm text-ink-soft">
                      비밀번호 {DEMO_PASSWORD}
                    </div>
                  </div>
                </div>

                <label className="block">
                  <div className="mb-2 text-sm font-semibold text-ink">
                    확인 코드
                  </div>
                  <input
                    className="input-surface text-center text-lg tracking-[0.35em]"
                    placeholder={DEMO_VERIFICATION_CODE}
                    value={verificationCode}
                    onChange={(event) => {
                      setVerificationCode(event.target.value.toUpperCase());
                      setVerified(false);
                      setVerificationError("");
                    }}
                  />
                </label>

                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-outline px-4 py-3 text-sm font-semibold text-primary-700"
                    onClick={() => {
                      setVerificationCode(DEMO_VERIFICATION_CODE);
                      setVerified(false);
                      setVerificationError("");
                    }}
                  >
                    데모 번호 입력
                  </button>

                  <button
                    type="button"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-outline px-4 py-3 text-sm font-semibold text-primary-700"
                    onClick={() => {
                      if (
                        verificationCode.trim().toUpperCase() ===
                        DEMO_VERIFICATION_CODE
                      ) {
                        setVerified(true);
                        setVerificationError("");
                        return;
                      }

                      setVerified(false);
                      setVerificationError(
                        "테스트용 인증 번호를 다시 확인해 주세요.",
                      );
                    }}
                  >
                    코드 확인
                  </button>
                </div>

                {verified ? (
                  <div className="rounded-lg bg-secondary-50 px-4 py-3 text-sm text-secondary-700">
                    기관 확인이 완료되었습니다. 다음 단계로 이동할 수 있습니다.
                  </div>
                ) : null}

                {verificationError ? (
                  <div className="rounded-lg bg-[var(--danger-soft)] px-4 py-3 text-sm text-[#9c2f24]">
                    {verificationError}
                  </div>
                ) : null}
              </div>

              <button
                type="button"
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[linear-gradient(135deg,#0058be,#2170e4)] px-4 py-3 text-sm font-semibold text-white shadow-soft disabled:opacity-50"
                disabled={!verified}
                onClick={() => setCurrentStep(2)}
              >
                다음 단계
                <ArrowRight className="h-4 w-4" />
              </button>
            </>
          ) : null}

          {currentStep === 2 ? (
            <>
              <div className="text-3xl font-bold text-ink">필수 동의</div>
              <div className="mt-2 text-sm leading-6 text-ink-soft">
                학교 계정 승인과 공고 운영에 필요한 기본 항목입니다.
              </div>

              <div className="mt-6 space-y-4">
                {[
                  {
                    checked: privacyConsent,
                    setter: setPrivacyConsent,
                    title: "개인정보 수집 및 이용 동의",
                    detail:
                      "담당자 연락처와 학교 정보를 계정 승인 및 운영 안내에 사용합니다.",
                  },
                  {
                    checked: termsConsent,
                    setter: setTermsConsent,
                    title: "서비스 이용약관 동의",
                    detail:
                      "공고 등록, 매칭 요청, 승인 절차에 필요한 기본 약관입니다.",
                  },
                ].map((item) => (
                  <label
                    key={item.title}
                    className="flex cursor-pointer gap-4 rounded-lg bg-surface-subtle p-5"
                  >
                    <input
                      checked={item.checked}
                      className="mt-1 h-4 w-4"
                      type="checkbox"
                      onChange={(event) => item.setter(event.target.checked)}
                    />
                    <div>
                      <div className="font-semibold text-ink">{item.title}</div>
                      <div className="mt-1 text-sm leading-6 text-ink-soft">
                        {item.detail}
                      </div>
                    </div>
                  </label>
                ))}
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
                  onClick={() => setCurrentStep(3)}
                >
                  다음
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </>
          ) : null}

          {currentStep === 3 ? (
            <>
              <div className="text-3xl font-bold text-ink">학교 정보</div>
              <div className="mt-2 text-sm leading-6 text-ink-soft">
                승인 담당자가 빠르게 검토할 수 있도록 꼭 필요한 정보만
                정리했습니다.
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
                    NEIS 코드
                  </div>
                  <input className="input-surface" placeholder="7581234" />
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
                  onClick={() => setCurrentStep(2)}
                >
                  <ArrowLeft className="h-4 w-4" />
                  이전
                </button>
                <button
                  type="button"
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-[linear-gradient(135deg,#0058be,#2170e4)] px-4 py-3 text-sm font-semibold text-white shadow-soft"
                >
                  학교 계정 신청
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
