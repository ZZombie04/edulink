"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  FileText,
  GraduationCap,
  LoaderCircle,
  MapPin,
  Plus,
  School,
  ShieldCheck,
  Trash2,
  UserRound,
} from "lucide-react";

import { AuthShell } from "@/components/auth-shell";
import { CharacterAvatar } from "@/components/character-avatar";
import {
  avatarPresets,
  defaultAvatarPreset,
  type AvatarPresetId,
} from "@/lib/avatar-presets";
import { gyeonggiRegions, secondarySubjects } from "@/lib/demo-data";

const steps = [
  { id: 1, title: "필수 동의", icon: ShieldCheck },
  { id: 2, title: "기본 정보", icon: UserRound },
  { id: 3, title: "자격·경력", icon: GraduationCap },
  { id: 4, title: "근무 조건", icon: MapPin },
] as const;

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
    detail:
      "회원가입, 본인 확인, 채용 제안 전달과 서비스 운영을 위해 사용합니다.",
  },
  {
    id: "thirdParty",
    title: "학교 담당자 제공 동의",
    heading: "제공 범위",
    points: ["이름, 자격, 경력, 희망 근무 조건", "자기소개 및 프로필 사진"],
    detail:
      "승인된 학교 담당자에게만 제공되며, 연락처는 제안 수락 전까지 비공개입니다.",
  },
  {
    id: "terms",
    title: "서비스 이용약관 동의",
    heading: "주요 내용",
    points: ["정확한 계정 정보 유지", "허위 경력 등록 금지", "채용 제안 응답"],
    detail:
      "허위 정보 등록이나 서비스 운영 방해가 확인되면 이용이 제한될 수 있습니다.",
  },
] as const;

type CareerEntry = {
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
};

type FormState = {
  name: string;
  birthDate: string;
  email: string;
  phone: string;
  password: string;
  passwordConfirm: string;
  residence: string;
  qualificationGrade: string;
  qualificationSubject: string;
  qualificationNumber: string;
  university: string;
  major: string;
  preferredEmploymentType: string;
  availableFrom: string;
  introduction: string;
};

type FieldErrors = Partial<Record<keyof FormState | "preferredRegions", string>>;

function createCareerEntry(id: number): CareerEntry {
  return {
    id,
    institutionName: "",
    institutionType: "초등학교",
    region: gyeonggiRegions[0] ?? "수원",
    role: "",
    subject: "",
    employmentType: "기간제",
    startDate: "",
    endDate: "",
    current: false,
  };
}

const initialForm: FormState = {
  name: "",
  birthDate: "",
  email: "",
  phone: "",
  password: "",
  passwordConfirm: "",
  residence: gyeonggiRegions[0] ?? "수원",
  qualificationGrade: "2급 정교사",
  qualificationSubject: "",
  qualificationNumber: "",
  university: "",
  major: "",
  preferredEmploymentType: "기간제와 시간강사 모두",
  availableFrom: "",
  introduction: "",
};

export default function TeacherRegisterPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [thirdPartyConsent, setThirdPartyConsent] = useState(false);
  const [termsConsent, setTermsConsent] = useState(false);
  const [selectedAvatarId, setSelectedAvatarId] =
    useState<AvatarPresetId>(defaultAvatarPreset);
  const [qualificationType, setQualificationType] =
    useState<(typeof qualificationTypes)[number]>("초등");
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [isNewTeacher, setIsNewTeacher] = useState(false);
  const [careers, setCareers] = useState<CareerEntry[]>([createCareerEntry(1)]);
  const [form, setForm] = useState<FormState>(initialForm);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [successRedirect, setSuccessRedirect] = useState("/teacher/dashboard");

  const allConsents = privacyConsent && thirdPartyConsent && termsConsent;
  const avatarChoices = avatarPresets.slice(0, 5);

  const updateField = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    setSubmitError("");
  };

  const toggleRegion = (region: string) => {
    setSelectedRegions((current) =>
      current.includes(region)
        ? current.filter((item) => item !== region)
        : [...current, region],
    );
    setFieldErrors((current) => ({ ...current, preferredRegions: undefined }));
  };

  const updateCareer = <K extends keyof CareerEntry>(
    careerId: number,
    key: K,
    value: CareerEntry[K],
  ) => {
    setSubmitError("");
    setCareers((current) =>
      current.map((career) => {
        if (career.id !== careerId) return career;
        const nextCareer = { ...career, [key]: value };
        if (key === "current" && value === true) nextCareer.endDate = "";
        return nextCareer;
      }),
    );
  };

  const validateStep = (step: number) => {
    const errors: FieldErrors = {};
    let careerInvalid = false;

    if (step === 2) {
      if (!form.name.trim()) errors.name = "이름을 입력해 주세요.";
      if (!form.birthDate) errors.birthDate = "생년월일을 입력해 주세요.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
        errors.email = "사용 가능한 이메일 형식으로 입력해 주세요.";
      }
      if (!form.phone.trim()) errors.phone = "휴대전화 번호를 입력해 주세요.";
      if (form.password.length < 8) {
        errors.password = "비밀번호는 8자 이상 입력해 주세요.";
      }
      if (form.password !== form.passwordConfirm) {
        errors.passwordConfirm = "비밀번호가 일치하지 않습니다.";
      }
    }

    if (step === 3) {
      if (qualificationType === "중등" && !form.qualificationSubject) {
        errors.qualificationSubject = "담당 과목을 선택해 주세요.";
      }
      if (!form.qualificationNumber.trim()) {
        errors.qualificationNumber = "자격증 번호를 입력해 주세요.";
      }
      if (!form.university.trim()) {
        errors.university = "출신 대학을 입력해 주세요.";
      }
      if (!form.major.trim()) {
        errors.major = "전공을 입력해 주세요.";
      }
      if (
        !isNewTeacher &&
        careers.some(
          (career) =>
            !career.institutionName.trim() ||
            !career.role.trim() ||
            !career.startDate,
        )
      ) {
        careerInvalid = true;
        setSubmitError(
          "각 경력의 기관명, 담당 업무, 근무 시작일을 입력해 주세요.",
        );
      }
    }

    if (step === 4) {
      if (selectedRegions.length === 0) {
        errors.preferredRegions = "희망 지역을 한 곳 이상 선택해 주세요.";
      }
      if (!form.availableFrom) {
        errors.availableFrom = "근무 가능일을 입력해 주세요.";
      }
      if (form.introduction.trim().length < 20) {
        errors.introduction = "자기소개를 20자 이상 입력해 주세요.";
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0 && !careerInvalid;
  };

  const nextStep = (step: number) => {
    if (validateStep(currentStep)) {
      setCurrentStep(step);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const submitRegistration = async () => {
    if (!validateStep(4)) return;

    setSubmitError("");
    setSubmitting(true);

    try {
      const response = await fetch("/api/auth/register/teacher", {
        body: JSON.stringify({
          name: form.name.trim(),
          birthDate: form.birthDate,
          email: form.email.trim(),
          phone: form.phone.trim(),
          password: form.password,
          residenceRegion: form.residence,
          avatarPreset: selectedAvatarId,
          qualificationType,
          qualificationGrade: form.qualificationGrade,
          qualificationSubject:
            qualificationType === "중등"
              ? form.qualificationSubject.trim()
              : undefined,
          qualificationNumber: form.qualificationNumber.trim(),
          university: form.university.trim(),
          major: form.major.trim(),
          careers: isNewTeacher ? [] : careers,
          preferredRegions: selectedRegions,
          preferredTypes:
            form.preferredEmploymentType === "기간제와 시간강사 모두"
              ? ["기간제", "시간강사"]
              : form.preferredEmploymentType === "기간제만"
                ? ["기간제"]
                : ["시간강사"],
          availableFrom: form.availableFrom,
          introduction: form.introduction.trim(),
          privacyConsent,
          thirdPartyConsent,
          termsConsent,
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const result = (await response.json().catch(() => null)) as {
        code?: string;
        fieldErrors?: Record<string, string>;
        message?: string;
        redirectTo?: string;
      } | null;

      if (!response.ok) {
        setFieldErrors({
          ...((result?.fieldErrors ?? {}) as FieldErrors),
          ...(result?.code === "EMAIL_ALREADY_REGISTERED"
            ? { email: result.message ?? "이미 가입된 이메일입니다." }
            : {}),
        });
        setSubmitError(result?.message ?? "교사 가입을 완료하지 못했습니다.");
        setSubmitting(false);
        return;
      }

      setSuccessRedirect(result?.redirectTo ?? "/teacher/dashboard");
      setSubmitted(true);
      setSubmitting(false);
    } catch {
      setSubmitError(
        "가입 서버에 연결하지 못했습니다. 잠시 후 다시 시도해 주세요.",
      );
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <AuthShell title="교사 가입 완료" variant="teacher">
        <div className="mx-auto max-w-xl py-10 sm:py-20">
          <div className="border-t-2 border-primary-700 bg-surface-contrast px-6 py-9 sm:px-9">
            <CheckCircle2
              className="h-10 w-10 text-primary-600"
              strokeWidth={1.6}
            />
            <p className="mt-7 text-xs font-bold uppercase tracking-[0.16em] text-primary-700">
              Profile created
            </p>
            <h1 className="mt-3 break-keep text-3xl font-bold tracking-[-0.04em] text-ink">
              교사 프로필 등록이 완료되었습니다.
            </h1>
            <p className="mt-4 break-keep text-sm leading-7 text-ink-soft">
              {form.name} 선생님의 자격, 경력, 희망 조건이 저장되고 안전하게
              로그인되었습니다. 대시보드에서 프로필 노출 상태와 채용 제안을
              확인하세요.
            </p>
            <dl className="mt-8 border-y border-outline">
              <div className="grid grid-cols-[110px_1fr] border-b border-outline py-4 text-sm">
                <dt className="text-ink-muted">등록 계정</dt>
                <dd className="font-semibold text-ink">{form.email}</dd>
              </div>
              <div className="grid grid-cols-[110px_1fr] border-b border-outline py-4 text-sm">
                <dt className="text-ink-muted">교원 자격</dt>
                <dd className="font-semibold text-ink">
                  {qualificationType} · {form.qualificationGrade}
                </dd>
              </div>
              <div className="grid grid-cols-[110px_1fr] py-4 text-sm">
                <dt className="text-ink-muted">희망 지역</dt>
                <dd className="font-semibold text-ink">
                  {selectedRegions.join(", ")}
                </dd>
              </div>
            </dl>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href={successRedirect}
                className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 bg-primary-700 px-5 text-sm font-bold text-white hover:bg-primary-800"
              >
                내 대시보드 열기
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/jobs"
                className="inline-flex min-h-12 flex-1 items-center justify-center border border-outline-strong px-5 text-sm font-bold text-ink hover:bg-surface-subtle"
              >
                채용 공고 보기
              </Link>
            </div>
          </div>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      avatarPreset={selectedAvatarId}
      title="교사 회원가입"
      variant="teacher"
    >
      <div className="mx-auto max-w-3xl py-2 sm:py-6">
        <div className="mb-8">
          <p className="kicker">Teacher profile</p>
          <h1 className="mt-4 text-3xl font-bold tracking-[-0.04em] text-ink sm:text-4xl">
            교사 회원가입
          </h1>
          <p className="mt-3 text-sm leading-6 text-ink-soft">
            학교가 정확하게 검토할 수 있도록 자격과 희망 조건을 단계별로
            입력합니다.
          </p>
        </div>

        <ol className="mb-8 grid grid-cols-2 border-y border-outline sm:grid-cols-4">
          {steps.map((step) => {
            const Icon = step.icon;
            const active = currentStep === step.id;
            const done = currentStep > step.id;
            return (
              <li
                key={step.id}
                aria-current={active ? "step" : undefined}
                className={`flex items-center gap-3 border-b border-r border-outline px-3 py-4 last:border-r-0 sm:border-b-0 ${
                  active ? "bg-primary-50" : "bg-transparent"
                }`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center border text-xs font-bold ${
                    active || done
                      ? "border-primary-700 bg-primary-700 text-white"
                      : "border-outline-strong text-ink-muted"
                  }`}
                >
                  {done ? <Check className="h-4 w-4" /> : step.id}
                </span>
                <span className="min-w-0">
                  <Icon className="hidden h-4 w-4 sm:block" />
                  <span className="mt-1 block truncate text-xs font-semibold text-ink">
                    {step.title}
                  </span>
                </span>
              </li>
            );
          })}
        </ol>

        <section className="border-t-2 border-primary-700 bg-surface-contrast px-5 py-7 sm:px-8 sm:py-9">
          {submitError ? (
            <div
              className="mb-6 flex items-start gap-3 border border-[#e1b9b2] bg-[var(--danger-soft)] px-4 py-3 text-sm leading-6 text-[#963b33]"
              role="alert"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {submitError}
            </div>
          ) : null}

          {currentStep === 1 ? (
            <ConsentStep
              allConsents={allConsents}
              privacyConsent={privacyConsent}
              setPrivacyConsent={setPrivacyConsent}
              setTermsConsent={setTermsConsent}
              setThirdPartyConsent={setThirdPartyConsent}
              termsConsent={termsConsent}
              thirdPartyConsent={thirdPartyConsent}
              onNext={() => setCurrentStep(2)}
            />
          ) : null}

          {currentStep === 2 ? (
            <>
              <StepHeading
                Icon={UserRound}
                title="기본 정보"
                description="로그인과 본인 확인에 사용할 실제 정보를 입력해 주세요."
              />
              <div className="mt-7 grid gap-5 sm:grid-cols-2">
                <Field error={fieldErrors.name} id="name" label="이름">
                  <input
                    id="name"
                    className="input-surface"
                    aria-invalid={Boolean(fieldErrors.name)}
                    autoComplete="name"
                    placeholder="홍길동"
                    value={form.name}
                    onChange={(event) => updateField("name", event.target.value)}
                  />
                </Field>
                <Field
                  error={fieldErrors.birthDate}
                  id="birthDate"
                  label="생년월일"
                >
                  <input
                    id="birthDate"
                    className="input-surface"
                    aria-invalid={Boolean(fieldErrors.birthDate)}
                    type="date"
                    value={form.birthDate}
                    onChange={(event) =>
                      updateField("birthDate", event.target.value)
                    }
                  />
                </Field>
                <Field error={fieldErrors.email} id="email" label="이메일">
                  <input
                    id="email"
                    className="input-surface"
                    aria-invalid={Boolean(fieldErrors.email)}
                    autoComplete="email"
                    inputMode="email"
                    placeholder="teacher@email.com"
                    type="email"
                    value={form.email}
                    onChange={(event) => updateField("email", event.target.value)}
                  />
                </Field>
                <Field error={fieldErrors.phone} id="phone" label="휴대전화">
                  <input
                    id="phone"
                    className="input-surface"
                    aria-invalid={Boolean(fieldErrors.phone)}
                    autoComplete="tel"
                    inputMode="tel"
                    placeholder="010-0000-0000"
                    value={form.phone}
                    onChange={(event) => updateField("phone", event.target.value)}
                  />
                </Field>
                <Field
                  error={fieldErrors.password}
                  id="password"
                  label="비밀번호"
                >
                  <input
                    id="password"
                    className="input-surface"
                    aria-invalid={Boolean(fieldErrors.password)}
                    autoComplete="new-password"
                    placeholder="8자 이상"
                    type="password"
                    value={form.password}
                    onChange={(event) =>
                      updateField("password", event.target.value)
                    }
                  />
                </Field>
                <Field
                  error={fieldErrors.passwordConfirm}
                  id="passwordConfirm"
                  label="비밀번호 확인"
                >
                  <input
                    id="passwordConfirm"
                    className="input-surface"
                    aria-invalid={Boolean(fieldErrors.passwordConfirm)}
                    autoComplete="new-password"
                    placeholder="비밀번호 다시 입력"
                    type="password"
                    value={form.passwordConfirm}
                    onChange={(event) =>
                      updateField("passwordConfirm", event.target.value)
                    }
                  />
                </Field>
                <Field id="residence" label="거주 지역">
                  <select
                    id="residence"
                    className="input-surface"
                    value={form.residence}
                    onChange={(event) =>
                      updateField("residence", event.target.value)
                    }
                  >
                    {gyeonggiRegions.map((region) => (
                      <option key={region}>{region}</option>
                    ))}
                  </select>
                </Field>
              </div>

              <fieldset className="mt-8 border-t border-outline pt-6">
                <legend className="text-sm font-semibold text-ink">
                  프로필 사진 선택
                </legend>
                <p className="mt-1 text-xs leading-5 text-ink-muted">
                  인재풀에서 학교 담당자에게 표시할 사진입니다.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  {avatarChoices.map((avatar) => (
                    <button
                      key={avatar.id}
                      type="button"
                      aria-label={`${avatar.name} 프로필 사진 선택`}
                      aria-pressed={selectedAvatarId === avatar.id}
                      className={`p-1 ${
                        selectedAvatarId === avatar.id
                          ? "ring-2 ring-primary-700 ring-offset-2 ring-offset-surface-contrast"
                          : "opacity-72 hover:opacity-100"
                      }`}
                      onClick={() => setSelectedAvatarId(avatar.id)}
                    >
                      <CharacterAvatar presetId={avatar.id} size={58} />
                    </button>
                  ))}
                </div>
              </fieldset>

              <StepActions
                onBack={() => setCurrentStep(1)}
                onNext={() => nextStep(3)}
              />
            </>
          ) : null}

          {currentStep === 3 ? (
            <>
              <StepHeading
                Icon={GraduationCap}
                title="자격과 경력"
                description="학교가 채용 요건과 비교할 수 있는 검증 정보를 입력합니다."
              />

              <div className="mt-7 grid gap-5 sm:grid-cols-2">
                <fieldset>
                  <legend className="mb-2 text-sm font-semibold text-ink">
                    자격 유형
                  </legend>
                  <div className="grid grid-cols-3">
                    {qualificationTypes.map((type) => (
                      <button
                        key={type}
                        type="button"
                        aria-pressed={qualificationType === type}
                        className={`min-h-11 border border-r-0 px-3 text-sm font-semibold last:border-r ${
                          qualificationType === type
                            ? "border-primary-700 bg-primary-700 text-white"
                            : "border-outline bg-transparent text-ink-soft"
                        }`}
                        onClick={() => {
                          setQualificationType(type);
                          updateField("qualificationSubject", "");
                        }}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </fieldset>
                <Field id="qualificationGrade" label="자격 급수">
                  <select
                    id="qualificationGrade"
                    className="input-surface"
                    value={form.qualificationGrade}
                    onChange={(event) =>
                      updateField("qualificationGrade", event.target.value)
                    }
                  >
                    <option>2급 정교사</option>
                    <option>1급 정교사</option>
                  </select>
                </Field>
                <Field
                  error={fieldErrors.qualificationNumber}
                  id="qualificationNumber"
                  label="자격증 번호"
                >
                  <input
                    id="qualificationNumber"
                    className="input-surface"
                    aria-invalid={Boolean(fieldErrors.qualificationNumber)}
                    placeholder="예: 제2026-000123호"
                    value={form.qualificationNumber}
                    onChange={(event) =>
                      updateField("qualificationNumber", event.target.value)
                    }
                  />
                </Field>
                {qualificationType === "중등" ? (
                  <Field
                    error={fieldErrors.qualificationSubject}
                    id="qualificationSubject"
                    label="담당 과목"
                  >
                    <select
                      id="qualificationSubject"
                      className="input-surface"
                      aria-invalid={Boolean(fieldErrors.qualificationSubject)}
                      value={form.qualificationSubject}
                      onChange={(event) =>
                        updateField("qualificationSubject", event.target.value)
                      }
                    >
                      <option value="">과목 선택</option>
                      {secondarySubjects.map((subject) => (
                        <option key={subject}>{subject}</option>
                      ))}
                    </select>
                  </Field>
                ) : null}
                <Field
                  error={fieldErrors.university}
                  id="university"
                  label="출신 대학"
                >
                  <input
                    id="university"
                    className="input-surface"
                    aria-invalid={Boolean(fieldErrors.university)}
                    placeholder="한국대학교"
                    value={form.university}
                    onChange={(event) =>
                      updateField("university", event.target.value)
                    }
                  />
                </Field>
                <Field error={fieldErrors.major} id="major" label="전공">
                  <input
                    id="major"
                    className="input-surface"
                    aria-invalid={Boolean(fieldErrors.major)}
                    placeholder={
                      qualificationType === "특수"
                        ? "특수교육과"
                        : qualificationType === "중등"
                          ? "수학교육과"
                          : "초등교육과"
                    }
                    value={form.major}
                    onChange={(event) =>
                      updateField("major", event.target.value)
                    }
                  />
                </Field>
              </div>

              <div className="mt-8 border-t border-outline pt-7">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-3">
                    <School className="h-5 w-5 text-primary-600" />
                    <div>
                      <h3 className="font-bold text-ink">교육기관 근무 경력</h3>
                      <p className="mt-1 text-xs text-ink-muted">
                        학교와 교육기관에서 맡은 업무를 입력해 주세요.
                      </p>
                    </div>
                  </div>
                  <label className="inline-flex items-center gap-2 text-sm font-semibold text-ink-soft">
                    <input
                      checked={isNewTeacher}
                      className="h-4 w-4 accent-[#164c3c]"
                      type="checkbox"
                      onChange={(event) => setIsNewTeacher(event.target.checked)}
                    />
                    신규 교사(경력 없음)
                  </label>
                </div>

                {!isNewTeacher ? (
                  <div className="mt-6 space-y-6">
                    {careers.map((career, index) => (
                      <div
                        key={career.id}
                        className="border-l-2 border-primary-300 bg-surface-subtle px-4 py-5 sm:px-6"
                      >
                        <div className="mb-5 flex items-center justify-between gap-3">
                          <span className="inline-flex items-center gap-2 text-sm font-bold text-ink">
                            <BriefcaseBusiness className="h-4 w-4 text-primary-600" />
                            경력 {index + 1}
                          </span>
                          {careers.length > 1 ? (
                            <button
                              type="button"
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#a14339]"
                              onClick={() =>
                                setCareers((current) =>
                                  current.filter(
                                    (item) => item.id !== career.id,
                                  ),
                                )
                              }
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              삭제
                            </button>
                          ) : null}
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <CareerInput
                            label="기관명"
                            value={career.institutionName}
                            placeholder="가온초등학교"
                            onChange={(value) =>
                              updateCareer(
                                career.id,
                                "institutionName",
                                value,
                              )
                            }
                          />
                          <CareerSelect
                            label="기관 유형"
                            value={career.institutionType}
                            options={institutionTypes}
                            onChange={(value) =>
                              updateCareer(
                                career.id,
                                "institutionType",
                                value as CareerEntry["institutionType"],
                              )
                            }
                          />
                          <CareerSelect
                            label="지역"
                            value={career.region}
                            options={gyeonggiRegions}
                            onChange={(value) =>
                              updateCareer(career.id, "region", value)
                            }
                          />
                          <CareerSelect
                            label="근무 형태"
                            value={career.employmentType}
                            options={employmentTypes}
                            onChange={(value) =>
                              updateCareer(
                                career.id,
                                "employmentType",
                                value as CareerEntry["employmentType"],
                              )
                            }
                          />
                          <CareerInput
                            label="담당 업무"
                            value={career.role}
                            placeholder="3학년 담임"
                            onChange={(value) =>
                              updateCareer(career.id, "role", value)
                            }
                          />
                          <CareerInput
                            label="과목·분야"
                            value={career.subject}
                            placeholder="수학, 특수교육"
                            onChange={(value) =>
                              updateCareer(career.id, "subject", value)
                            }
                          />
                          <CareerInput
                            label="근무 시작일"
                            type="date"
                            value={career.startDate}
                            onChange={(value) =>
                              updateCareer(career.id, "startDate", value)
                            }
                          />
                          <CareerInput
                            disabled={career.current}
                            label="근무 종료일"
                            type="date"
                            value={career.endDate}
                            onChange={(value) =>
                              updateCareer(career.id, "endDate", value)
                            }
                          />
                        </div>
                        <label className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-ink-soft">
                          <input
                            checked={career.current}
                            className="h-4 w-4 accent-[#164c3c]"
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
                      className="inline-flex min-h-10 items-center gap-2 border border-outline-strong px-4 text-sm font-bold text-primary-700 hover:bg-surface-subtle"
                      onClick={() =>
                        setCareers((current) => [
                          ...current,
                          createCareerEntry(Date.now()),
                        ])
                      }
                    >
                      <Plus className="h-4 w-4" />
                      경력 추가
                    </button>
                  </div>
                ) : (
                  <p className="mt-6 border-y border-outline py-5 text-sm text-ink-soft">
                    교육기관 근무 경력 없이 다음 단계로 진행합니다.
                  </p>
                )}
              </div>

              <StepActions
                onBack={() => setCurrentStep(2)}
                onNext={() => nextStep(4)}
              />
            </>
          ) : null}

          {currentStep === 4 ? (
            <>
              <StepHeading
                Icon={MapPin}
                title="희망 근무 조건"
                description="제안을 받고 싶은 지역과 근무 형태를 구체적으로 알려주세요."
              />

              <fieldset className="mt-7">
                <legend className="text-sm font-semibold text-ink">
                  희망 지역
                </legend>
                <p className="mt-1 text-xs text-ink-muted">
                  복수 선택할 수 있습니다.
                </p>
                <div className="mt-4 flex max-h-[240px] flex-wrap gap-2 overflow-y-auto border-y border-outline py-4">
                  {gyeonggiRegions.map((region) => (
                    <button
                      key={region}
                      type="button"
                      aria-pressed={selectedRegions.includes(region)}
                      className={`min-h-9 border px-3 text-sm font-semibold ${
                        selectedRegions.includes(region)
                          ? "border-primary-700 bg-primary-700 text-white"
                          : "border-outline bg-transparent text-ink-soft hover:border-primary-400"
                      }`}
                      onClick={() => toggleRegion(region)}
                    >
                      {region}
                    </button>
                  ))}
                </div>
                {fieldErrors.preferredRegions ? (
                  <p className="mt-2 text-xs font-medium text-[#a14339]">
                    {fieldErrors.preferredRegions}
                  </p>
                ) : null}
              </fieldset>

              <div className="mt-7 grid gap-5 sm:grid-cols-2">
                <Field
                  id="preferredEmploymentType"
                  label="희망 근무 형태"
                >
                  <select
                    id="preferredEmploymentType"
                    className="input-surface"
                    value={form.preferredEmploymentType}
                    onChange={(event) =>
                      updateField(
                        "preferredEmploymentType",
                        event.target.value,
                      )
                    }
                  >
                    <option>기간제와 시간강사 모두</option>
                    <option>기간제만</option>
                    <option>시간강사만</option>
                  </select>
                </Field>
                <Field
                  error={fieldErrors.availableFrom}
                  id="availableFrom"
                  label="근무 가능일"
                >
                  <input
                    id="availableFrom"
                    className="input-surface"
                    aria-invalid={Boolean(fieldErrors.availableFrom)}
                    type="date"
                    value={form.availableFrom}
                    onChange={(event) =>
                      updateField("availableFrom", event.target.value)
                    }
                  />
                </Field>
              </div>

              <Field
                error={fieldErrors.introduction}
                id="introduction"
                label="자기소개"
                className="mt-6"
              >
                <div className="relative">
                  <FileText className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-ink-muted" />
                  <textarea
                    id="introduction"
                    className="input-surface textarea-surface pl-10"
                    aria-invalid={Boolean(fieldErrors.introduction)}
                    placeholder="강점, 수업 경험, 희망 근무 방향을 20자 이상 입력해 주세요."
                    value={form.introduction}
                    onChange={(event) =>
                      updateField("introduction", event.target.value)
                    }
                  />
                </div>
              </Field>

              <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row">
                <button
                  type="button"
                  className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 border border-outline-strong px-5 text-sm font-bold text-ink hover:bg-surface-subtle"
                  onClick={() => setCurrentStep(3)}
                >
                  <ArrowLeft className="h-4 w-4" />
                  이전
                </button>
                <button
                  type="button"
                  className="inline-flex min-h-12 flex-[1.4] items-center justify-center gap-2 bg-primary-700 px-5 text-sm font-bold text-white hover:bg-primary-800 disabled:opacity-60"
                  disabled={submitting}
                  onClick={submitRegistration}
                >
                  {submitting ? (
                    <>
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                      프로필 저장 중
                    </>
                  ) : (
                    <>
                      교사 프로필 등록
                      <Check className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </>
          ) : null}
        </section>

        <p className="mt-6 text-center text-sm text-ink-soft">
          이미 계정이 있다면{" "}
          <Link href="/auth/login" className="font-bold text-primary-700">
            로그인
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}

function ConsentStep({
  allConsents,
  privacyConsent,
  setPrivacyConsent,
  setTermsConsent,
  setThirdPartyConsent,
  termsConsent,
  thirdPartyConsent,
  onNext,
}: {
  allConsents: boolean;
  privacyConsent: boolean;
  setPrivacyConsent: (checked: boolean) => void;
  setTermsConsent: (checked: boolean) => void;
  setThirdPartyConsent: (checked: boolean) => void;
  termsConsent: boolean;
  thirdPartyConsent: boolean;
  onNext: () => void;
}) {
  return (
    <>
      <StepHeading
        Icon={ShieldCheck}
        title="필수 약관 확인"
        description="프로필 공개 범위와 개인정보 처리 기준을 확인해 주세요."
      />
      <div className="mt-7 divide-y divide-outline border-y border-outline">
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
            <div key={section.id} className="py-4">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  checked={checked}
                  className="mt-0.5 h-4 w-4 accent-[#164c3c]"
                  type="checkbox"
                  onChange={(event) => onChange(event.target.checked)}
                />
                <span className="text-sm font-semibold text-ink">
                  {section.title}
                </span>
              </label>
              <details className="ml-7 mt-3">
                <summary className="cursor-pointer text-xs font-bold text-primary-700">
                  전문 보기
                </summary>
                <div className="mt-3 border-l border-outline pl-4 text-sm leading-6 text-ink-soft">
                  <div className="font-semibold text-ink">{section.heading}</div>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    {section.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                  <p className="mt-3">{section.detail}</p>
                </div>
              </details>
            </div>
          );
        })}
      </div>
      <button
        type="button"
        className="mt-7 inline-flex min-h-12 w-full items-center justify-center gap-2 bg-primary-700 px-5 text-sm font-bold text-white hover:bg-primary-800 disabled:opacity-50"
        disabled={!allConsents}
        onClick={onNext}
      >
        기본 정보 입력
        <ArrowRight className="h-4 w-4" />
      </button>
    </>
  );
}

function StepHeading({
  Icon,
  title,
  description,
}: {
  Icon: typeof UserRound;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start justify-between gap-5">
      <div>
        <h2 className="text-2xl font-bold tracking-[-0.03em] text-ink">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-6 text-ink-soft">{description}</p>
      </div>
      <Icon className="h-7 w-7 text-primary-600" strokeWidth={1.7} />
    </div>
  );
}

function StepActions({
  onBack,
  onNext,
}: {
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row">
      <button
        type="button"
        className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 border border-outline-strong px-5 text-sm font-bold text-ink hover:bg-surface-subtle"
        onClick={onBack}
      >
        <ArrowLeft className="h-4 w-4" />
        이전
      </button>
      <button
        type="button"
        className="inline-flex min-h-12 flex-[1.4] items-center justify-center gap-2 bg-primary-700 px-5 text-sm font-bold text-white hover:bg-primary-800"
        onClick={onNext}
      >
        다음
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}

function Field({
  children,
  className,
  error,
  id,
  label,
}: {
  children: React.ReactNode;
  className?: string;
  error?: string;
  id: string;
  label: string;
}) {
  return (
    <label className={className ?? "block"} htmlFor={id}>
      <span className="mb-2 block text-sm font-semibold text-ink">{label}</span>
      {children}
      {error ? (
        <span className="mt-1.5 block text-xs font-medium text-[#a14339]">
          {error}
        </span>
      ) : null}
    </label>
  );
}

function CareerInput({
  disabled,
  label,
  onChange,
  placeholder,
  type = "text",
  value,
}: {
  disabled?: boolean;
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  value: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold text-ink-soft">
        {label}
      </span>
      <input
        className="input-surface"
        disabled={disabled}
        placeholder={placeholder}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function CareerSelect({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  options: readonly string[];
  value: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold text-ink-soft">
        {label}
      </span>
      <select
        className="input-surface"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}
