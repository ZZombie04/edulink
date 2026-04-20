"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Check,
  FileText,
  GraduationCap,
  MapPin,
  Plus,
  School,
  ShieldCheck,
  Trash2,
  User,
} from "lucide-react";

import { AuthShell } from "@/components/auth-shell";
import { CharacterAvatar } from "@/components/character-avatar";
import {
  avatarPresets,
  defaultAvatarPreset,
  type AvatarPresetId,
} from "@/lib/avatar-presets";
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from "@/lib/demo-access";
import { gyeonggiRegions, secondarySubjects } from "@/lib/demo-data";

const steps = [
  { id: 1, title: "필수 동의", icon: ShieldCheck },
  { id: 2, title: "기본 정보", icon: User },
  { id: 3, title: "자격 / 경력", icon: GraduationCap },
  { id: 4, title: "근무 조건", icon: MapPin },
];

const qualificationTypes = ["초등", "중등", "특수"] as const;
const institutionTypes = [
  "유치원",
  "초등학교",
  "중학교",
  "고등학교",
  "특수학교",
  "기타 교육기관",
] as const;
const employmentTypes = [
  "기간제",
  "정규",
  "시간강사",
  "전일제 강사",
  "기타",
] as const;

const consentSections = [
  {
    id: "privacy",
    title: "개인정보 수집 및 이용 동의",
    heading: "수집 항목",
    points: [
      "이름, 생년월일, 휴대전화, 이메일",
      "자격, 경력, 희망 지역, 자기소개",
    ],
    sections: [
      {
        title: "이용 목적",
        body: "회원가입, 본인 확인, 채용 제안 전달, 인재풀 노출, 서비스 운영 기록 관리에 사용됩니다.",
      },
      {
        title: "보관 기간",
        body: "회원 탈퇴 후 1년까지 보관하며, 법령상 의무 보관 항목은 해당 기간 동안 별도 보관됩니다.",
      },
      {
        title: "동의 거부 권리",
        body: "동의를 거부할 수 있으나, 필수 항목 미동의 시 회원가입과 인재풀 등록이 제한됩니다.",
      },
    ],
  },
  {
    id: "thirdParty",
    title: "학교 담당자 제공 동의",
    heading: "제공 항목",
    points: ["이름, 자격, 경력, 희망 근무 조건", "자기소개 및 프로필 캐릭터"],
    sections: [
      {
        title: "제공 대상",
        body: "플랫폼 승인을 완료한 학교 담당자에게만 제공됩니다.",
      },
      {
        title: "제공 시점",
        body: "학교가 인재풀을 조회하거나 매칭 제안을 보낼 때 요약 프로필이 제공됩니다.",
      },
      {
        title: "제공 범위",
        body: "연락처는 제안 수락 전까지 비공개로 유지되며, 검토에 필요한 정보만 우선 제공됩니다.",
      },
    ],
  },
  {
    id: "terms",
    title: "서비스 이용약관 동의",
    heading: "주요 내용",
    points: [
      "계정 정보의 정확성 유지",
      "허위 경력 등록 금지",
      "제안 수락 이후 성실한 응답 의무",
    ],
    sections: [
      {
        title: "이용 제한",
        body: "허위 정보 등록, 반복적 미응답, 서비스 운영 방해가 확인되면 계정 이용이 제한될 수 있습니다.",
      },
      {
        title: "계정 책임",
        body: "비밀번호 관리 책임은 회원에게 있으며, 타인에게 계정을 양도하거나 공유할 수 없습니다.",
      },
      {
        title: "변경 공지",
        body: "약관 변경 시 서비스 내 공지 후 적용됩니다.",
      },
    ],
  },
] as const;

interface CareerEntry {
  id: number;
  institutionName: string;
  institutionType: (typeof institutionTypes)[number];
  region: string;
  role: string;
  subject: string;
  employmentType: (typeof employmentTypes)[number];
  startDate: string;
  endDate: string;
  current: boolean;
}

function createCareerEntry(id: number): CareerEntry {
  return {
    id,
    institutionName: "",
    institutionType: "초등학교",
    region: "수원",
    role: "",
    subject: "",
    employmentType: "기간제",
    startDate: "",
    endDate: "",
    current: false,
  };
}

export default function TeacherRegisterPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [thirdPartyConsent, setThirdPartyConsent] = useState(false);
  const [termsConsent, setTermsConsent] = useState(false);
  const [selectedAvatarId, setSelectedAvatarId] =
    useState<AvatarPresetId>(defaultAvatarPreset);
  const [qualificationType, setQualificationType] =
    useState<(typeof qualificationTypes)[number]>("초등");
  const [selectedRegions, setSelectedRegions] = useState<string[]>([
    "수원",
    "성남",
    "용인",
  ]);
  const [isNewTeacher, setIsNewTeacher] = useState(false);
  const [careers, setCareers] = useState<CareerEntry[]>([createCareerEntry(1)]);
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const allConsents = privacyConsent && thirdPartyConsent && termsConsent;

  const toggleRegion = (region: string) => {
    setSelectedRegions((current) =>
      current.includes(region)
        ? current.filter((item) => item !== region)
        : [...current, region],
    );
  };

  const updateCareer = <K extends keyof CareerEntry>(
    careerId: number,
    key: K,
    value: CareerEntry[K],
  ) => {
    setCareers((current) =>
      current.map((career) => {
        if (career.id !== careerId) {
          return career;
        }

        const nextCareer = { ...career, [key]: value };

        if (key === "current" && value === true) {
          nextCareer.endDate = "";
        }

        return nextCareer;
      }),
    );
  };

  const addCareer = () => {
    setCareers((current) => [...current, createCareerEntry(Date.now())]);
  };

  const removeCareer = (careerId: number) => {
    setCareers((current) => current.filter((career) => career.id !== careerId));
  };

  return (
    <AuthShell
      avatarPreset={selectedAvatarId}
      title="교사(강사) 가입"
      variant="teacher"
    >
      <div className="mx-auto w-full max-w-3xl">
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

              <div className="mt-6 space-y-4">
                {consentSections.map((section) => {
                  const checked =
                    section.id === "privacy"
                      ? privacyConsent
                      : section.id === "thirdParty"
                        ? thirdPartyConsent
                        : termsConsent;
                  const onChange =
                    section.id === "privacy"
                      ? setPrivacyConsent
                      : section.id === "thirdParty"
                        ? setThirdPartyConsent
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
                  <div className="mb-2 text-sm font-semibold text-ink">
                    이름
                  </div>
                  <input className="input-surface" placeholder="홍길동" />
                </label>
                <label className="block">
                  <div className="mb-2 text-sm font-semibold text-ink">
                    생년월일
                  </div>
                  <input className="input-surface" type="date" />
                </label>
                <label className="block">
                  <div className="mb-2 text-sm font-semibold text-ink">
                    이메일
                  </div>
                  <input
                    className="input-surface"
                    placeholder="teacher@email.com"
                  />
                </label>
                <label className="block">
                  <div className="mb-2 text-sm font-semibold text-ink">
                    휴대전화
                  </div>
                  <input
                    className="input-surface"
                    placeholder="010-0000-0000"
                  />
                </label>
                <label className="block sm:col-span-2">
                  <div className="mb-2 text-sm font-semibold text-ink">
                    거주 지역
                  </div>
                  <select className="input-surface">
                    {gyeonggiRegions.map((region) => (
                      <option key={region}>{region}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="mt-8 grid gap-4 xl:grid-cols-[0.82fr_1.18fr]">
                <div className="rounded-[26px] border border-outline bg-[linear-gradient(145deg,#f4f7ff,#ecfff7)] p-4 sm:p-6">
                  <div className="flex min-h-[188px] items-center justify-center rounded-[22px] bg-white/58 sm:min-h-[220px]">
                    <CharacterAvatar
                      className="rounded-[30px] border-white/60 shadow-[0_26px_48px_rgba(18,33,58,0.18)]"
                      presetId={selectedAvatarId}
                      size={168}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                  {avatarPresets.map((avatar) => (
                    <button
                      key={avatar.id}
                      type="button"
                      aria-label={avatar.name}
                      className={`group aspect-square rounded-[18px] border p-2.5 transition-all sm:rounded-[20px] sm:p-3 ${
                        selectedAvatarId === avatar.id
                          ? "border-primary-300 bg-white shadow-[0_16px_32px_rgba(36,56,88,0.14)]"
                          : "border-outline bg-surface-subtle hover:border-primary-100 hover:bg-white"
                      }`}
                      onClick={() => setSelectedAvatarId(avatar.id)}
                    >
                      <div className="flex h-full items-center justify-center">
                        <CharacterAvatar
                          className="rounded-[18px] border-white/50 shadow-none transition-transform duration-200 group-hover:scale-[1.03] sm:rounded-[20px]"
                          presetId={avatar.id}
                          size={68}
                        />
                      </div>
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
              <div className="text-3xl font-bold text-ink">자격 / 경력</div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <div className="mb-2 text-sm font-semibold text-ink">
                    자격 유형
                  </div>
                  <div className="grid grid-cols-3 gap-2">
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
                </label>

                <label className="block">
                  <div className="mb-2 text-sm font-semibold text-ink">
                    자격 급수
                  </div>
                  <select className="input-surface">
                    <option>2급 정교사</option>
                    <option>1급 정교사</option>
                  </select>
                </label>

                {qualificationType === "중등" ? (
                  <label className="block">
                    <div className="mb-2 text-sm font-semibold text-ink">
                      과목
                    </div>
                    <select className="input-surface">
                      {secondarySubjects.map((subject) => (
                        <option key={subject}>{subject}</option>
                      ))}
                    </select>
                  </label>
                ) : (
                  <label className="block">
                    <div className="mb-2 text-sm font-semibold text-ink">
                      전공
                    </div>
                    <input className="input-surface" placeholder="초등교육과" />
                  </label>
                )}

                <label className="block">
                  <div className="mb-2 text-sm font-semibold text-ink">
                    자격증 번호
                  </div>
                  <input
                    className="input-surface"
                    placeholder="예: 제2026-000123호"
                  />
                </label>
              </div>

              <div className="mt-8 rounded-[24px] border border-outline bg-surface-subtle p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white text-primary-700">
                      <School className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-lg font-bold text-ink">
                        교육기관 근무 경력
                      </div>
                      <div className="text-sm text-ink-soft">
                        학교와 교육기관 경력을 입력해 주세요.
                      </div>
                    </div>
                  </div>

                  <label className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-medium text-ink-soft">
                    <input
                      checked={isNewTeacher}
                      className="h-4 w-4"
                      type="checkbox"
                      onChange={(event) =>
                        setIsNewTeacher(event.target.checked)
                      }
                    />
                    신규 교사
                  </label>
                </div>

                {!isNewTeacher ? (
                  <div className="mt-6 space-y-4">
                    {careers.map((career, index) => (
                      <div
                        key={career.id}
                        className="rounded-[20px] border border-outline bg-white p-5"
                      >
                        <div className="mb-4 flex items-center justify-between gap-3">
                          <div className="inline-flex items-center gap-2 rounded-full bg-surface-subtle px-3 py-1.5 text-xs font-semibold text-ink-soft">
                            <Briefcase className="h-3.5 w-3.5" />
                            경력 {index + 1}
                          </div>
                          {careers.length > 1 ? (
                            <button
                              type="button"
                              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-[#b94b44] hover:bg-[#fff2f0]"
                              onClick={() => removeCareer(career.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                              삭제
                            </button>
                          ) : null}
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <label className="block sm:col-span-2">
                            <div className="mb-2 text-sm font-semibold text-ink">
                              기관명
                            </div>
                            <input
                              className="input-surface"
                              placeholder="예: 가온초등학교"
                              value={career.institutionName}
                              onChange={(event) =>
                                updateCareer(
                                  career.id,
                                  "institutionName",
                                  event.target.value,
                                )
                              }
                            />
                          </label>

                          <label className="block">
                            <div className="mb-2 text-sm font-semibold text-ink">
                              기관 유형
                            </div>
                            <select
                              className="input-surface"
                              value={career.institutionType}
                              onChange={(event) =>
                                updateCareer(
                                  career.id,
                                  "institutionType",
                                  event.target
                                    .value as CareerEntry["institutionType"],
                                )
                              }
                            >
                              {institutionTypes.map((type) => (
                                <option key={type}>{type}</option>
                              ))}
                            </select>
                          </label>

                          <label className="block">
                            <div className="mb-2 text-sm font-semibold text-ink">
                              지역
                            </div>
                            <select
                              className="input-surface"
                              value={career.region}
                              onChange={(event) =>
                                updateCareer(
                                  career.id,
                                  "region",
                                  event.target.value,
                                )
                              }
                            >
                              {gyeonggiRegions.map((region) => (
                                <option key={region}>{region}</option>
                              ))}
                            </select>
                          </label>

                          <label className="block">
                            <div className="mb-2 text-sm font-semibold text-ink">
                              담당 업무
                            </div>
                            <input
                              className="input-surface"
                              placeholder="예: 3학년 담임"
                              value={career.role}
                              onChange={(event) =>
                                updateCareer(
                                  career.id,
                                  "role",
                                  event.target.value,
                                )
                              }
                            />
                          </label>

                          <label className="block">
                            <div className="mb-2 text-sm font-semibold text-ink">
                              과목 / 분야
                            </div>
                            <input
                              className="input-surface"
                              placeholder="예: 수학, 특수교육"
                              value={career.subject}
                              onChange={(event) =>
                                updateCareer(
                                  career.id,
                                  "subject",
                                  event.target.value,
                                )
                              }
                            />
                          </label>

                          <label className="block">
                            <div className="mb-2 text-sm font-semibold text-ink">
                              근무 형태
                            </div>
                            <select
                              className="input-surface"
                              value={career.employmentType}
                              onChange={(event) =>
                                updateCareer(
                                  career.id,
                                  "employmentType",
                                  event.target
                                    .value as CareerEntry["employmentType"],
                                )
                              }
                            >
                              {employmentTypes.map((type) => (
                                <option key={type}>{type}</option>
                              ))}
                            </select>
                          </label>

                          <label className="block">
                            <div className="mb-2 text-sm font-semibold text-ink">
                              근무 시작일
                            </div>
                            <input
                              className="input-surface"
                              type="date"
                              value={career.startDate}
                              onChange={(event) =>
                                updateCareer(
                                  career.id,
                                  "startDate",
                                  event.target.value,
                                )
                              }
                            />
                          </label>

                          <label className="block">
                            <div className="mb-2 text-sm font-semibold text-ink">
                              근무 종료일
                            </div>
                            <input
                              className="input-surface"
                              disabled={career.current}
                              type="date"
                              value={career.endDate}
                              onChange={(event) =>
                                updateCareer(
                                  career.id,
                                  "endDate",
                                  event.target.value,
                                )
                              }
                            />
                          </label>
                        </div>

                        <label className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-ink-soft">
                          <input
                            checked={career.current}
                            className="h-4 w-4"
                            type="checkbox"
                            onChange={(event) =>
                              updateCareer(
                                career.id,
                                "current",
                                event.target.checked,
                              )
                            }
                          />
                          현재 근무 중
                        </label>
                      </div>
                    ))}

                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-lg border border-dashed border-primary-200 bg-white px-4 py-3 text-sm font-semibold text-primary-700"
                      onClick={addCareer}
                    >
                      <Plus className="h-4 w-4" />
                      경력 추가
                    </button>
                  </div>
                ) : (
                  <div className="mt-6 rounded-[20px] border border-outline bg-white px-5 py-8 text-center text-sm text-ink-soft">
                    교육기관 근무 경력 없이 다음 단계로 진행합니다.
                  </div>
                )}
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
                <div className="rounded-[24px] border border-outline bg-surface-subtle p-6">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white text-primary-700">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div className="text-lg font-bold text-ink">희망 지역</div>
                  </div>
                  <div className="flex max-h-[280px] flex-wrap gap-2 overflow-y-auto pr-1">
                    {gyeonggiRegions.map((region) => (
                      <button
                        key={region}
                        type="button"
                        className={`rounded-full px-3 py-2 text-sm font-medium ${
                          selectedRegions.includes(region)
                            ? "bg-primary-50 text-primary-700"
                            : "bg-white text-ink-soft"
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
                    <div className="mb-2 text-sm font-semibold text-ink">
                      희망 형태
                    </div>
                    <select className="input-surface">
                      <option>기간제와 시간강사 모두</option>
                      <option>기간제만</option>
                      <option>시간강사만</option>
                    </select>
                  </label>

                  <label className="block">
                    <div className="mb-2 text-sm font-semibold text-ink">
                      즉시 근무 가능일
                    </div>
                    <input className="input-surface" type="date" />
                  </label>
                </div>

                <label className="block">
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink">
                    <FileText className="h-4 w-4 text-primary-600" />
                    자기소개
                  </div>
                  <textarea
                    className="input-surface textarea-surface"
                    placeholder="강점, 수업 경험, 희망 근무 방향을 입력해 주세요."
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
                  disabled={submitting}
                  onClick={async () => {
                    setSubmitError("");
                    setSubmitting(true);

                    try {
                      const response = await fetch("/api/auth/demo-login", {
                        body: JSON.stringify({
                          email: DEMO_ACCOUNTS[0].email,
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
                            "인재풀 등록을 완료하지 못했습니다.",
                        );
                        setSubmitting(false);
                        return;
                      }

                      router.push(result.redirectTo);
                      router.refresh();
                    } catch {
                      setSubmitError("인재풀 등록을 완료하지 못했습니다.");
                      setSubmitting(false);
                    }
                  }}
                >
                  {submitting ? "등록 중..." : "인재풀 등록 완료"}
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
