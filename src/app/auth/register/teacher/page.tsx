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

import { CharacterAvatar } from "@/components/character-avatar";
import { avatarPresets, defaultAvatarPreset, type AvatarPresetId } from "@/lib/avatar-presets";
import { gyeonggiRegions, secondarySubjects } from "@/lib/demo-data";

const steps = [
  { id: 1, title: "필수 동의", icon: ShieldCheck },
  { id: 2, title: "기본 정보", icon: User },
  { id: 3, title: "자격 정보", icon: GraduationCap },
  { id: 4, title: "근무 조건", icon: MapPin },
];

const qualificationTypes = ["초등", "중등", "특수"] as const;

export default function TeacherRegisterPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [thirdPartyConsent, setThirdPartyConsent] = useState(false);
  const [termsConsent, setTermsConsent] = useState(false);
  const [selectedAvatarId, setSelectedAvatarId] = useState<AvatarPresetId>(defaultAvatarPreset);
  const [qualificationType, setQualificationType] =
    useState<(typeof qualificationTypes)[number]>("초등");
  const [selectedRegions, setSelectedRegions] = useState<string[]>(["수원", "성남", "용인"]);

  const allConsents = privacyConsent && thirdPartyConsent && termsConsent;

  const toggleRegion = (region: string) => {
    setSelectedRegions((current) =>
      current.includes(region)
        ? current.filter((item) => item !== region)
        : [...current, region]
    );
  };

  return (
    <div className="min-h-screen bg-surface text-ink">
      <div className="grid min-h-screen lg:grid-cols-[0.78fr_1.22fr]">
        <section className="relative hidden overflow-hidden lg:block">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,#08172f,#0058be,#1e9156)]" />
          <div className="relative flex h-full flex-col justify-between p-10">
            <Link href="/" className="flex items-center gap-3 text-white">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/12">
                <Building2 className="h-5 w-5" />
              </div>
              <div className="text-lg font-bold tracking-tight">EduLink</div>
            </Link>

            <div className="grid grid-cols-3 gap-4">
              {avatarPresets.map((avatar) => (
                <div
                  key={avatar.id}
                  className="flex items-center justify-center rounded-lg border border-white/12 bg-white/10 p-4 backdrop-blur"
                >
                  <CharacterAvatar
                    className="h-24 w-24 rounded-lg border-0 shadow-none"
                    presetId={avatar.id}
                    size={96}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-10 sm:px-6">
          <div className="mx-auto w-full max-w-2xl">
            <Link href="/" className="mb-8 flex items-center gap-3 lg:hidden">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
                <Building2 className="h-5 w-5" />
              </div>
              <div className="text-lg font-bold tracking-tight">EduLink</div>
            </Link>

            <div className="mb-8 flex items-center justify-between gap-3 overflow-x-auto">
              {steps.map((step) => {
                const Icon = step.icon;
                const isActive = currentStep === step.id;
                const isDone = currentStep > step.id;

                return (
                  <div key={step.id} className="flex min-w-[132px] items-center gap-3">
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

                  <div className="mt-6 space-y-4">
                    {[
                      {
                        checked: privacyConsent,
                        setter: setPrivacyConsent,
                        title: "개인정보 수집 및 이용 동의",
                      },
                      {
                        checked: thirdPartyConsent,
                        setter: setThirdPartyConsent,
                        title: "학교 담당자 제공 동의",
                      },
                      {
                        checked: termsConsent,
                        setter: setTermsConsent,
                        title: "서비스 이용약관 동의",
                      },
                    ].map((item) => (
                      <label
                        key={item.title}
                        className="flex cursor-pointer items-center gap-4 rounded-lg bg-surface-subtle p-5"
                      >
                        <input
                          checked={item.checked}
                          className="h-4 w-4"
                          type="checkbox"
                          onChange={(event) => item.setter(event.target.checked)}
                        />
                        <div className="font-semibold text-ink">{item.title}</div>
                      </label>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[linear-gradient(135deg,#0058be,#2170e4)] px-4 py-3 text-sm font-semibold text-white shadow-soft disabled:opacity-50"
                    disabled={!allConsents}
                    onClick={() => setCurrentStep(2)}
                  >
                    다음
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </>
              ) : null}

              {currentStep === 2 ? (
                <>
                  <div className="text-3xl font-bold text-ink">기본 정보</div>

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

                  <div className="mt-8 rounded-lg border border-outline bg-surface-subtle p-5">
                    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                      {avatarPresets.map((avatar) => (
                        <button
                          key={avatar.id}
                          type="button"
                          aria-label={avatar.name}
                          className={`rounded-lg border p-2 transition-colors ${
                            selectedAvatarId === avatar.id
                              ? "border-primary-300 bg-white shadow-panel"
                              : "border-transparent bg-white/70 hover:border-primary-100"
                          }`}
                          onClick={() => setSelectedAvatarId(avatar.id)}
                        >
                          <CharacterAvatar
                            className="h-full w-full rounded-lg"
                            presetId={avatar.id}
                            size={88}
                          />
                        </button>
                      ))}
                    </div>
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
                  <div className="text-3xl font-bold text-ink">자격 정보</div>

                  <div className="mt-6 space-y-5">
                    <div>
                      <div className="mb-3 text-sm font-semibold text-ink">자격 유형</div>
                      <div className="grid gap-3 sm:grid-cols-3">
                        {qualificationTypes.map((type) => (
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
                          <option>2급 정교사</option>
                          <option>1급 정교사</option>
                        </select>
                      </label>
                      {qualificationType === "중등" ? (
                        <label className="block">
                          <div className="mb-2 text-sm font-semibold text-ink">과목</div>
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
                        <input className="input-surface" placeholder="가온초등학교" />
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
                  <div className="text-3xl font-bold text-ink">근무 조건</div>

                  <div className="mt-6 space-y-5">
                    <div>
                      <div className="mb-3 text-sm font-semibold text-ink">희망 지역</div>
                      <div className="flex max-h-[280px] flex-wrap gap-2 overflow-y-auto pr-1">
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
                        <div className="mb-2 text-sm font-semibold text-ink">희망 형태</div>
                        <select className="input-surface">
                          <option>기간제와 시간강사 모두</option>
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
                      <div className="mb-2 text-sm font-semibold text-ink">자기소개</div>
                      <textarea
                        className="input-surface textarea-surface"
                        placeholder="강점과 수업 경험을 입력해 주세요."
                      />
                    </label>

                    <div className="flex justify-center rounded-lg border border-outline bg-surface-subtle p-5">
                      <CharacterAvatar
                        className="h-24 w-24 rounded-lg"
                        presetId={selectedAvatarId}
                        size={96}
                      />
                    </div>
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
