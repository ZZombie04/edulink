"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  GraduationCap,
  MapPin,
  ShieldCheck,
  User,
} from "lucide-react";

import { gyeonggiRegions, secondarySubjects } from "@/lib/demo-data";

const steps = [
  { id: 1, title: "동의", icon: ShieldCheck },
  { id: 2, title: "기본 정보", icon: User },
  { id: 3, title: "자격", icon: GraduationCap },
  { id: 4, title: "선호 조건", icon: MapPin },
];

export default function TeacherRegisterPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [thirdPartyConsent, setThirdPartyConsent] = useState(false);
  const [termsConsent, setTermsConsent] = useState(false);
  const [qualificationType, setQualificationType] = useState<"초등" | "중등" | "특수">(
    "초등"
  );
  const [selectedRegions, setSelectedRegions] = useState<string[]>(["수원", "화성"]);

  const toggleRegion = (region: string) => {
    setSelectedRegions((prev) =>
      prev.includes(region) ? prev.filter((item) => item !== region) : [...prev, region]
    );
  };

  const allConsents = privacyConsent && thirdPartyConsent && termsConsent;

  return (
    <div className="min-h-screen bg-surface text-ink">
      <div className="grid min-h-screen lg:grid-cols-[0.9fr_1.1fr]">
        <section className="relative hidden overflow-hidden lg:block">
          <img
            alt="교실 안에서 준비 중인 교사"
            className="absolute inset-0 h-full w-full object-cover"
            src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1400&q=80"
          />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(7,18,43,0.88),rgba(0,88,190,0.74),rgba(0,110,47,0.36))]" />
          <div className="relative flex h-full flex-col justify-between p-10 text-white">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/12">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <div className="text-lg font-bold tracking-tight">EduLink</div>
                <div className="text-xs text-white/65">교사 회원가입</div>
              </div>
            </Link>

            <div className="max-w-xl">
              <span className="kicker text-white/85 before:bg-white">교사 가입</span>
              <h1 className="mt-5 text-5xl font-bold leading-tight">
                프로필이 바로
                <br />
                검색 가능한 인재풀로 이어집니다.
              </h1>
              <p className="mt-5 text-base leading-7 text-white/78">
                자격, 경력, 희망 지역을 한 번에 정리하면 학교 담당자가 같은 시선으로 읽을
                수 있게 구조를 맞췄습니다.
              </p>
            </div>
          </div>
        </section>

        <section className="px-4 py-10 sm:px-6">
          <div className="mx-auto w-full max-w-2xl">
            <Link href="/" className="mb-8 flex items-center gap-3 lg:hidden">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <div className="text-lg font-bold tracking-tight">EduLink</div>
                <div className="text-xs text-ink-muted">교사 회원가입</div>
              </div>
            </Link>

            <div className="mb-8 flex items-center justify-between gap-3 overflow-x-auto">
              {steps.map((step) => {
                const Icon = step.icon;
                const isActive = currentStep === step.id;
                const isDone = currentStep > step.id;

                return (
                  <div key={step.id} className="flex min-w-[120px] items-center gap-3">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-lg text-sm font-bold ${
                        isActive || isDone
                          ? "bg-primary-50 text-primary-700"
                          : "bg-surface-panel text-ink-muted"
                      }`}
                    >
                      {isDone ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-ink">{step.title}</div>
                      <div className="text-xs text-ink-muted">{step.id}단계</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="panel-surface p-8">
              {currentStep === 1 ? (
                <>
                  <div className="text-3xl font-bold text-ink">필수 동의</div>
                  <div className="mt-2 text-sm leading-6 text-ink-soft">
                    인재풀 공개와 매칭 진행에 필요한 항목입니다.
                  </div>

                  <div className="mt-6 space-y-4">
                    {[
                      {
                        checked: privacyConsent,
                        setter: setPrivacyConsent,
                        title: "개인정보 수집 및 이용 동의",
                        detail:
                          "성명, 연락처, 자격, 경력, 희망 지역 정보를 인재풀 운영에 사용합니다.",
                      },
                      {
                        checked: thirdPartyConsent,
                        setter: setThirdPartyConsent,
                        title: "학교 담당자 대상 정보 제공 동의",
                        detail:
                          "연락처는 수락 이후 공개하고, 요약 정보는 학교 담당자가 먼저 확인합니다.",
                      },
                      {
                        checked: termsConsent,
                        setter: setTermsConsent,
                        title: "서비스 이용약관 동의",
                        detail: "가입과 매칭 요청 처리에 필요한 기본 약관입니다.",
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

                  <button
                    type="button"
                    className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[linear-gradient(135deg,#0058be,#2170e4)] px-4 py-3 text-sm font-semibold text-white shadow-soft disabled:opacity-50"
                    disabled={!allConsents}
                    onClick={() => setCurrentStep(2)}
                  >
                    다음 단계
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </>
              ) : null}

              {currentStep === 2 ? (
                <>
                  <div className="text-3xl font-bold text-ink">기본 정보</div>
                  <div className="mt-2 text-sm leading-6 text-ink-soft">
                    학교에서 가장 먼저 보게 될 기본 프로필입니다.
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <div className="mb-2 text-sm font-semibold text-ink">이름</div>
                      <input className="input-surface" placeholder="홍길동" />
                    </label>
                    <label className="block">
                      <div className="mb-2 text-sm font-semibold text-ink">생년월일</div>
                      <input className="input-surface" type="date" />
                    </label>
                    <label className="block">
                      <div className="mb-2 text-sm font-semibold text-ink">이메일</div>
                      <input className="input-surface" placeholder="teacher@email.com" />
                    </label>
                    <label className="block">
                      <div className="mb-2 text-sm font-semibold text-ink">휴대전화</div>
                      <input className="input-surface" placeholder="010-0000-0000" />
                    </label>
                    <label className="block sm:col-span-2">
                      <div className="mb-2 text-sm font-semibold text-ink">거주 지역</div>
                      <select className="input-surface">
                        {gyeonggiRegions.map((region) => (
                          <option key={region}>{region}</option>
                        ))}
                      </select>
                    </label>
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
                  <div className="text-3xl font-bold text-ink">자격과 경력</div>
                  <div className="mt-2 text-sm leading-6 text-ink-soft">
                    검색 결과에서 바로 읽히는 항목을 먼저 정리합니다.
                  </div>

                  <div className="mt-6 space-y-5">
                    <div>
                      <div className="mb-3 text-sm font-semibold text-ink">자격 유형</div>
                      <div className="grid gap-3 sm:grid-cols-3">
                        {(["초등", "중등", "특수"] as const).map((type) => (
                          <button
                            key={type}
                            type="button"
                            className={`rounded-lg px-4 py-3 text-sm font-semibold ${
                              qualificationType === type
                                ? "bg-primary-50 text-primary-700"
                                : "bg-surface-subtle text-ink-soft"
                            }`}
                            onClick={() => setQualificationType(type)}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="block">
                        <div className="mb-2 text-sm font-semibold text-ink">자격 급수</div>
                        <select className="input-surface">
                          <option>2정교사</option>
                          <option>1정교사</option>
                        </select>
                      </label>
                      {qualificationType === "중등" ? (
                        <label className="block">
                          <div className="mb-2 text-sm font-semibold text-ink">교과</div>
                          <select className="input-surface">
                            {secondarySubjects.map((subject) => (
                              <option key={subject}>{subject}</option>
                            ))}
                          </select>
                        </label>
                      ) : (
                        <label className="block">
                          <div className="mb-2 text-sm font-semibold text-ink">전공</div>
                          <input className="input-surface" placeholder="초등교육과" />
                        </label>
                      )}
                      <label className="block">
                        <div className="mb-2 text-sm font-semibold text-ink">총 경력</div>
                        <input className="input-surface" placeholder="2년 6개월" />
                      </label>
                      <label className="block">
                        <div className="mb-2 text-sm font-semibold text-ink">최근 근무 학교</div>
                        <input className="input-surface" placeholder="정인초등학교" />
                      </label>
                    </div>
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
                      onClick={() => setCurrentStep(4)}
                    >
                      다음
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </>
              ) : null}

              {currentStep === 4 ? (
                <>
                  <div className="text-3xl font-bold text-ink">선호 조건</div>
                  <div className="mt-2 text-sm leading-6 text-ink-soft">
                    학교가 요청을 보낼 때 가장 중요하게 보는 조건입니다.
                  </div>

                  <div className="mt-6 space-y-5">
                    <div>
                      <div className="mb-3 text-sm font-semibold text-ink">희망 지역</div>
                      <div className="flex flex-wrap gap-2">
                        {gyeonggiRegions.map((region) => (
                          <button
                            key={region}
                            type="button"
                            className={`rounded-full px-3 py-2 text-sm font-medium ${
                              selectedRegions.includes(region)
                                ? "bg-primary-50 text-primary-700"
                                : "bg-surface-subtle text-ink-soft"
                            }`}
                            onClick={() => toggleRegion(region)}
                          >
                            {region}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="block">
                        <div className="mb-2 text-sm font-semibold text-ink">선호 형태</div>
                        <select className="input-surface">
                          <option>기간제 + 시간강사</option>
                          <option>기간제만</option>
                          <option>시간강사만</option>
                        </select>
                      </label>
                      <label className="block">
                        <div className="mb-2 text-sm font-semibold text-ink">즉시 근무 가능일</div>
                        <input className="input-surface" type="date" />
                      </label>
                    </div>

                    <label className="block">
                      <div className="mb-2 text-sm font-semibold text-ink">한 줄 소개</div>
                      <textarea
                        className="input-surface textarea-surface"
                        placeholder="학교에서 바로 파악할 수 있게 강점과 경험을 짧게 정리해 주세요."
                      />
                    </label>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <button
                      type="button"
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-outline px-4 py-3 text-sm font-semibold text-ink-soft"
                      onClick={() => setCurrentStep(3)}
                    >
                      <ArrowLeft className="h-4 w-4" />
                      이전
                    </button>
                    <button
                      type="button"
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-[linear-gradient(135deg,#0058be,#2170e4)] px-4 py-3 text-sm font-semibold text-white shadow-soft"
                    >
                      인재풀 등록 완료
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
        </section>
      </div>
    </div>
  );
}
