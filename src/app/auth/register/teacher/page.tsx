"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  GraduationCap,
  MapPin,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";

import { CharacterAvatar } from "@/components/character-avatar";
import {
  avatarGenderLabels,
  defaultAvatarPresetByGender,
  getAvatarPreset,
  getAvatarPresetsByGender,
  type AvatarGender,
  type AvatarPresetId,
} from "@/lib/avatar-presets";
import { gyeonggiRegions, secondarySubjects } from "@/lib/demo-data";

const steps = [
  { id: 1, title: "약관 동의", icon: ShieldCheck },
  { id: 2, title: "기본 정보", icon: User },
  { id: 3, title: "자격 정보", icon: GraduationCap },
  { id: 4, title: "근무 조건", icon: MapPin },
];

const qualificationTypes = ["초등", "중등", "특수"] as const;
const genderOptions: AvatarGender[] = ["female", "male", "neutral"];

export default function TeacherRegisterPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [thirdPartyConsent, setThirdPartyConsent] = useState(false);
  const [termsConsent, setTermsConsent] = useState(false);
  const [gender, setGender] = useState<AvatarGender>("female");
  const [selectedAvatarId, setSelectedAvatarId] = useState<AvatarPresetId>(
    defaultAvatarPresetByGender.female
  );
  const [qualificationType, setQualificationType] = useState<(typeof qualificationTypes)[number]>(
    "초등"
  );
  const [selectedRegions, setSelectedRegions] = useState<string[]>(["수원", "성남", "용인"]);

  const allConsents = privacyConsent && thirdPartyConsent && termsConsent;
  const visibleAvatars = useMemo(() => getAvatarPresetsByGender(gender), [gender]);
  const selectedAvatar = getAvatarPreset(selectedAvatarId);

  const handleGenderChange = (nextGender: AvatarGender) => {
    setGender(nextGender);
    setSelectedAvatarId(defaultAvatarPresetByGender[nextGender]);
  };

  const toggleRegion = (region: string) => {
    setSelectedRegions((current) =>
      current.includes(region)
        ? current.filter((item) => item !== region)
        : [...current, region]
    );
  };

  return (
    <div className="min-h-screen bg-surface text-ink">
      <div className="grid min-h-screen lg:grid-cols-[0.95fr_1.05fr]">
        <section className="relative hidden overflow-hidden lg:block">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,#08172f,#0058be,#1e9156)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.14),transparent_36%)]" />

          <div className="relative flex h-full flex-col justify-between p-10 text-white">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/12">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <div className="text-lg font-bold tracking-tight">EduLink</div>
                <div className="text-xs text-white/70">교사 회원가입</div>
              </div>
            </Link>

            <div className="max-w-xl">
              <span className="kicker text-white/88 before:bg-white">프로필 시작</span>
              <h1 className="mt-5 text-5xl font-bold leading-tight">
                사진 없이도
                <br />
                신뢰감 있는 프로필을 만듭니다.
              </h1>
              <p className="mt-5 text-base leading-7 text-white/78">
                실제 사진은 저장하지 않고, 가입 단계에서 선택한 SVG 캐릭터를 프로필과 인재풀에
                표시합니다. 비용 부담은 줄이고 화면 완성도는 더 높게 가져가도록 설계했습니다.
              </p>
            </div>

            <div className="grid gap-4">
              <div className="rounded-lg border border-white/14 bg-white/10 p-5 backdrop-blur">
                <div className="flex items-center gap-4">
                  <CharacterAvatar className="h-20 w-20 rounded-lg border-0 shadow-none" presetId="teacher-f-rose" size={80} />
                  <div>
                    <div className="text-lg font-semibold">사진 업로드 없음</div>
                    <div className="mt-1 text-sm leading-6 text-white/72">
                      선택한 캐릭터만 저장되어 회원가입과 이력서 등록 흐름이 가벼워집니다.
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-white/14 bg-white/10 p-5 backdrop-blur">
                  <div className="flex items-center gap-3">
                    <CharacterAvatar className="h-14 w-14 rounded-lg border-0 shadow-none" presetId="teacher-m-navy" size={56} />
                    <div>
                      <div className="font-semibold">성별별 캐릭터 선택</div>
                      <div className="mt-1 text-sm text-white/72">여성 / 남성 / 공개 안 함 기준으로 표시</div>
                    </div>
                  </div>
                </div>
                <div className="rounded-lg border border-white/14 bg-white/10 p-5 backdrop-blur">
                  <div className="flex items-center gap-3">
                    <CharacterAvatar className="h-14 w-14 rounded-lg border-0 shadow-none" presetId="teacher-n-cloud" size={56} />
                    <div>
                      <div className="font-semibold">프로필 일관성</div>
                      <div className="mt-1 text-sm text-white/72">대시보드와 인재풀 카드까지 같은 캐릭터로 연결</div>
                    </div>
                  </div>
                </div>
              </div>
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
                  <div className="mt-2 text-sm leading-6 text-ink-soft">
                    인재풀 공개와 학교 매칭 진행에 필요한 항목입니다.
                  </div>

                  <div className="mt-6 space-y-4">
                    {[
                      {
                        checked: privacyConsent,
                        setter: setPrivacyConsent,
                        title: "개인정보 수집 및 이용 동의",
                        detail:
                          "성명, 연락처, 자격, 경력, 희망 지역 정보를 인재풀 운영과 매칭 검토에 사용합니다.",
                      },
                      {
                        checked: thirdPartyConsent,
                        setter: setThirdPartyConsent,
                        title: "학교 담당자 제공 동의",
                        detail:
                          "연락처는 제안 수락 이후 공개하고, 요약 프로필은 학교 담당자가 먼저 검토합니다.",
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
                          <div className="mt-1 text-sm leading-6 text-ink-soft">{item.detail}</div>
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
                  <div className="text-3xl font-bold text-ink">기본 정보와 캐릭터</div>
                  <div className="mt-2 text-sm leading-6 text-ink-soft">
                    학교에서 처음 보게 되는 요약 프로필과 캐릭터를 함께 설정합니다.
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

                  <div className="mt-8 rounded-lg border border-outline bg-surface-subtle p-6">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
                      <div className="flex items-center gap-4">
                        <CharacterAvatar className="h-24 w-24 rounded-lg" presetId={selectedAvatarId} size={96} />
                        <div>
                          <div className="text-sm font-semibold text-primary-700">
                            {avatarGenderLabels[gender]} 캐릭터
                          </div>
                          <div className="mt-1 text-2xl font-bold text-ink">{selectedAvatar.name}</div>
                          <div className="mt-2 text-sm leading-6 text-ink-soft">
                            {selectedAvatar.description}
                          </div>
                        </div>
                      </div>
                      <div className="rounded-lg bg-white px-4 py-3 text-sm leading-6 text-ink-soft lg:ml-auto lg:max-w-sm">
                        실제 사진은 저장하지 않습니다. 선택한 SVG 캐릭터만 프로필과 인재풀 카드에
                        표시됩니다.
                      </div>
                    </div>

                    <div className="mt-6">
                      <div className="mb-3 text-sm font-semibold text-ink">성별 선택</div>
                      <div className="grid gap-3 sm:grid-cols-3">
                        {genderOptions.map((option) => (
                          <button
                            key={option}
                            type="button"
                            className={`rounded-lg px-4 py-3 text-sm font-semibold ${
                              gender === option
                                ? "bg-primary-50 text-primary-700"
                                : "bg-white text-ink-soft"
                            }`}
                            onClick={() => handleGenderChange(option)}
                          >
                            {avatarGenderLabels[option]}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div className="text-sm font-semibold text-ink">캐릭터 선택</div>
                        <div className="text-xs text-ink-muted">
                          성별에 따라 보여지는 캐릭터가 바뀝니다.
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        {visibleAvatars.map((avatar) => (
                          <button
                            key={avatar.id}
                            type="button"
                            className={`flex items-center gap-4 rounded-lg border p-4 text-left transition-colors ${
                              selectedAvatarId === avatar.id
                                ? "border-primary-200 bg-white shadow-panel"
                                : "border-outline bg-white/70 hover:border-primary-100"
                            }`}
                            onClick={() => setSelectedAvatarId(avatar.id)}
                          >
                            <CharacterAvatar className="h-16 w-16 rounded-lg" presetId={avatar.id} size={64} />
                            <div>
                              <div className="font-semibold text-ink">{avatar.name}</div>
                              <div className="mt-1 text-sm leading-6 text-ink-soft">
                                {avatar.description}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
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
                  <div className="text-3xl font-bold text-ink">자격과 경력</div>
                  <div className="mt-2 text-sm leading-6 text-ink-soft">
                    검색 결과에서 바로 확인할 수 있도록 자격 정보와 경력을 정리합니다.
                  </div>

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
                  <div className="mt-2 text-sm leading-6 text-ink-soft">
                    학교가 제안을 보낼 때 중요하게 보는 조건을 정리합니다.
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
                        placeholder="학교에서 빠르게 파악할 수 있도록 강점과 수업 경험을 짧게 정리해 주세요."
                      />
                    </label>

                    <div className="rounded-lg border border-outline bg-surface-subtle p-5">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        <CharacterAvatar className="h-20 w-20 rounded-lg" presetId={selectedAvatarId} size={80} />
                        <div>
                          <div className="text-sm font-semibold text-primary-700">가입 미리보기</div>
                          <div className="mt-1 text-lg font-bold text-ink">
                            {selectedAvatar.name} / {avatarGenderLabels[gender]}
                          </div>
                          <div className="mt-2 text-sm text-ink-soft">
                            희망 지역 {selectedRegions.slice(0, 3).join(", ")}
                            {selectedRegions.length > 3 ? ` 외 ${selectedRegions.length - 3}곳` : ""}
                          </div>
                        </div>
                        <div className="rounded-lg bg-white px-4 py-3 text-sm leading-6 text-ink-soft sm:ml-auto sm:max-w-xs">
                          사진 파일 대신 가벼운 SVG 캐릭터만 저장되므로 프로필 운영 비용을 줄일 수
                          있습니다.
                        </div>
                      </div>
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

            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-ink-soft">
              <Sparkles className="h-4 w-4 text-primary-600" />
              이미 계정이 있다면
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
