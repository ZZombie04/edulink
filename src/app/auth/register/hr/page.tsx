"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  LockKeyhole,
  Mail,
  Phone,
  School,
  ShieldCheck,
} from "lucide-react";

import { AuthShell } from "@/components/auth-shell";
import { gyeonggiRegions } from "@/lib/demo-data";
import { hrConsentSections } from "@/lib/hr-consents";

const steps = [
  { id: 1, title: "필수 동의", icon: ShieldCheck },
  { id: 2, title: "학교 정보", icon: School },
] as const;

type FormState = {
  contactName: string;
  birthDate: string;
  email: string;
  phone: string;
  password: string;
  passwordConfirm: string;
  position: string;
  department: string;
  schoolName: string;
  schoolCode: string;
  schoolType: string;
  region: string;
  address: string;
  verificationCode: string;
};

type FieldErrors = Partial<Record<keyof FormState | "form", string>>;

const initialForm: FormState = {
  contactName: "",
  birthDate: "",
  email: "",
  phone: "",
  password: "",
  passwordConfirm: "",
  position: "",
  department: "",
  schoolName: "",
  schoolCode: "",
  schoolType: "초등학교",
  region: gyeonggiRegions[0] ?? "수원",
  address: "",
  verificationCode: "",
};

export default function HRRegisterPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [termsConsent, setTermsConsent] = useState(false);
  const [form, setForm] = useState<FormState>(initialForm);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const updateField = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    setSubmitError("");
  };

  const validate = () => {
    const errors: FieldErrors = {};

    if (!form.contactName.trim()) errors.contactName = "담당자 이름을 입력해 주세요.";
    if (!form.birthDate) errors.birthDate = "생년월일을 입력해 주세요.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errors.email = "사용 가능한 이메일 형식으로 입력해 주세요.";
    }
    if (!form.phone.trim()) errors.phone = "연락 가능한 전화번호를 입력해 주세요.";
    if (form.password.length < 8) {
      errors.password = "비밀번호는 8자 이상 입력해 주세요.";
    }
    if (form.password !== form.passwordConfirm) {
      errors.passwordConfirm = "비밀번호가 일치하지 않습니다.";
    }
    if (!form.schoolName.trim()) errors.schoolName = "학교명을 입력해 주세요.";
    if (!form.schoolCode.trim()) {
      errors.schoolCode = "학교 코드를 입력해 주세요.";
    }
    if (!form.address.trim()) errors.address = "학교 주소를 입력해 주세요.";
    if (!form.position.trim()) errors.position = "담당자 직위를 입력해 주세요.";
    if (!form.verificationCode.trim()) {
      errors.verificationCode = "학교 가입 인증번호를 입력해 주세요.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const submitRegistration = async () => {
    if (!validate()) return;

    setSubmitError("");
    setSubmitting(true);

    try {
      const response = await fetch("/api/auth/register/hr", {
        body: JSON.stringify({
          name: form.contactName.trim(),
          birthDate: form.birthDate,
          email: form.email.trim(),
          phone: form.phone.trim(),
          password: form.password,
          position: form.position.trim(),
          department: form.department.trim() || undefined,
          schoolName: form.schoolName.trim(),
          schoolCode: form.schoolCode.trim(),
          schoolType: form.schoolType,
          schoolRegion: form.region,
          schoolAddress: form.address.trim(),
          verificationCode: form.verificationCode.trim(),
          privacyConsent,
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
        status?: string;
      } | null;

      if (!response.ok) {
        setFieldErrors({
          ...((result?.fieldErrors ?? {}) as FieldErrors),
          ...(result?.code === "EMAIL_ALREADY_REGISTERED"
            ? { email: result.message ?? "이미 가입된 이메일입니다." }
            : {}),
        });
        setSubmitError(
          result?.message ?? "학교 계정 신청을 접수하지 못했습니다.",
        );
        setSubmitting(false);
        return;
      }

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
      <AuthShell title="학교 계정 신청 완료" variant="school">
        <div className="mx-auto max-w-xl py-10 sm:py-20">
          <div className="border-t-2 border-primary-700 bg-surface-contrast px-6 py-9 sm:px-9">
            <CheckCircle2
              className="h-10 w-10 text-primary-600"
              strokeWidth={1.6}
            />
            <p className="mt-7 text-xs font-bold uppercase tracking-[0.16em] text-primary-700">
              Application received
            </p>
            <h1 className="mt-3 break-keep text-3xl font-bold tracking-[-0.04em] text-ink">
              학교 계정 신청이 접수되었습니다.
            </h1>
            <p className="mt-4 break-keep text-sm leading-7 text-ink-soft">
              관리자 검토가 완료되면 {form.email}로 안내합니다. 승인 전에는
              인재풀 상세 열람과 채용 공고 등록 기능을 사용할 수 없습니다.
            </p>

            <dl className="mt-8 border-y border-outline">
              <div className="grid grid-cols-[110px_1fr] border-b border-outline py-4 text-sm">
                <dt className="text-ink-muted">신청 학교</dt>
                <dd className="font-semibold text-ink">{form.schoolName}</dd>
              </div>
              <div className="grid grid-cols-[110px_1fr] border-b border-outline py-4 text-sm">
                <dt className="text-ink-muted">현재 상태</dt>
                <dd className="font-semibold text-primary-700">승인 대기</dd>
              </div>
              <div className="grid grid-cols-[110px_1fr] py-4 text-sm">
                <dt className="text-ink-muted">예상 검토</dt>
                <dd className="font-semibold text-ink">영업일 기준 1~2일</dd>
              </div>
            </dl>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/auth/login?registered=hr-pending"
                className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 bg-primary-700 px-5 text-sm font-bold text-white hover:bg-primary-800"
              >
                로그인 화면으로
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/"
                className="inline-flex min-h-12 flex-1 items-center justify-center border border-outline-strong px-5 text-sm font-bold text-ink hover:bg-surface-subtle"
              >
                홈으로
              </Link>
            </div>
          </div>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="학교 계정 신청" variant="school">
      <div className="mx-auto max-w-2xl py-2 sm:py-6">
        <div className="mb-8">
          <p className="kicker">School account</p>
          <h1 className="mt-4 text-3xl font-bold tracking-[-0.04em] text-ink sm:text-4xl">
            학교 계정 신청
          </h1>
          <p className="mt-3 text-sm leading-6 text-ink-soft">
            학교 담당자 확인과 관리자 승인을 거쳐 채용 기능이 활성화됩니다.
          </p>
        </div>

        <ol className="mb-8 grid grid-cols-2 border-y border-outline">
          {steps.map((step) => {
            const Icon = step.icon;
            const active = currentStep === step.id;
            const done = currentStep > step.id;
            return (
              <li
                key={step.id}
                aria-current={active ? "step" : undefined}
                className={`flex items-center gap-3 border-r border-outline px-3 py-4 last:border-r-0 sm:px-5 ${
                  active ? "bg-primary-50" : "bg-transparent"
                }`}
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center border text-xs font-bold ${
                    active || done
                      ? "border-primary-700 bg-primary-700 text-white"
                      : "border-outline-strong text-ink-muted"
                  }`}
                >
                  {done ? <Check className="h-4 w-4" /> : step.id}
                </span>
                <span>
                  <Icon className="hidden h-4 w-4 sm:block" />
                  <span className="mt-1 block text-xs font-semibold text-ink sm:text-sm">
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
            <>
              <h2 className="text-2xl font-bold tracking-[-0.03em] text-ink">
                필수 약관 확인
              </h2>
              <p className="mt-2 text-sm leading-6 text-ink-soft">
                학교 계정 운영과 채용 정보 등록에 필요한 항목입니다.
              </p>

              <div className="mt-7 divide-y divide-outline border-y border-outline">
                {hrConsentSections.map((section) => {
                  const checked =
                    section.id === "privacy" ? privacyConsent : termsConsent;
                  const onChange =
                    section.id === "privacy"
                      ? setPrivacyConsent
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
                          <div className="font-semibold text-ink">
                            {section.heading}
                          </div>
                          <ul className="mt-2 list-disc space-y-1 pl-5">
                            {section.points.map((point) => (
                              <li key={point}>{point}</li>
                            ))}
                          </ul>
                          {section.sections.map((detail) => (
                            <div key={detail.title} className="mt-4">
                              <div className="font-semibold text-ink">
                                {detail.title}
                              </div>
                              <p className="mt-1">{detail.body}</p>
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
                className="mt-7 inline-flex min-h-12 w-full items-center justify-center gap-2 bg-primary-700 px-5 text-sm font-bold text-white hover:bg-primary-800 disabled:opacity-50"
                disabled={!privacyConsent || !termsConsent}
                onClick={() => setCurrentStep(2)}
              >
                학교 정보 입력
                <ArrowRight className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <div className="flex items-start justify-between gap-5">
                <div>
                  <h2 className="text-2xl font-bold tracking-[-0.03em] text-ink">
                    담당자와 학교 정보
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-ink-soft">
                    승인 검토와 계정 안내에 사용할 실제 정보를 입력해 주세요.
                  </p>
                </div>
                <Building2 className="h-7 w-7 text-primary-600" />
              </div>

              <div className="mt-7 grid gap-5 sm:grid-cols-2">
                <Field
                  error={fieldErrors.contactName}
                  id="contactName"
                  label="담당자 이름"
                >
                  <input
                    id="contactName"
                    className="input-surface"
                    aria-invalid={Boolean(fieldErrors.contactName)}
                    autoComplete="name"
                    placeholder="홍수진"
                    value={form.contactName}
                    onChange={(event) =>
                      updateField("contactName", event.target.value)
                    }
                  />
                </Field>
                <Field error={fieldErrors.phone} id="phone" label="담당자 연락처">
                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
                    <input
                      id="phone"
                      className="input-surface pl-10"
                      aria-invalid={Boolean(fieldErrors.phone)}
                      autoComplete="tel"
                      inputMode="tel"
                      placeholder="010-0000-0000"
                      value={form.phone}
                      onChange={(event) =>
                        updateField("phone", event.target.value)
                      }
                    />
                  </div>
                </Field>
                <Field
                  error={fieldErrors.birthDate}
                  id="birthDate"
                  label="담당자 생년월일"
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
                <Field error={fieldErrors.position} id="position" label="직위">
                  <input
                    id="position"
                    className="input-surface"
                    aria-invalid={Boolean(fieldErrors.position)}
                    placeholder="인사담당"
                    value={form.position}
                    onChange={(event) =>
                      updateField("position", event.target.value)
                    }
                  />
                </Field>
                <Field error={fieldErrors.email} id="email" label="업무 이메일">
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
                    <input
                      id="email"
                      className="input-surface pl-10"
                      aria-invalid={Boolean(fieldErrors.email)}
                      autoComplete="email"
                      inputMode="email"
                      placeholder="name@school.go.kr"
                      type="email"
                      value={form.email}
                      onChange={(event) =>
                        updateField("email", event.target.value)
                      }
                    />
                  </div>
                </Field>
                <Field id="department" label="부서 (선택)">
                  <input
                    id="department"
                    className="input-surface"
                    placeholder="교무부"
                    value={form.department}
                    onChange={(event) =>
                      updateField("department", event.target.value)
                    }
                  />
                </Field>
                <Field
                  error={fieldErrors.password}
                  id="password"
                  label="비밀번호"
                >
                  <div className="relative">
                    <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
                    <input
                      id="password"
                      className="input-surface pl-10"
                      aria-invalid={Boolean(fieldErrors.password)}
                      autoComplete="new-password"
                      placeholder="8자 이상"
                      type="password"
                      value={form.password}
                      onChange={(event) =>
                        updateField("password", event.target.value)
                      }
                    />
                  </div>
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
              </div>

              <div className="my-8 border-t border-outline" />

              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  error={fieldErrors.schoolName}
                  id="schoolName"
                  label="학교명"
                >
                  <input
                    id="schoolName"
                    className="input-surface"
                    aria-invalid={Boolean(fieldErrors.schoolName)}
                    placeholder="정인초등학교"
                    value={form.schoolName}
                    onChange={(event) =>
                      updateField("schoolName", event.target.value)
                    }
                  />
                </Field>
                <Field
                  error={fieldErrors.schoolCode}
                  id="schoolCode"
                  label="학교 코드"
                >
                  <input
                    id="schoolCode"
                    className="input-surface"
                    aria-invalid={Boolean(fieldErrors.schoolCode)}
                    placeholder="학교 행정 코드"
                    value={form.schoolCode}
                    onChange={(event) =>
                      updateField("schoolCode", event.target.value)
                    }
                  />
                </Field>
                <Field id="schoolType" label="학교 유형">
                  <select
                    id="schoolType"
                    className="input-surface"
                    value={form.schoolType}
                    onChange={(event) =>
                      updateField("schoolType", event.target.value)
                    }
                  >
                    <option>초등학교</option>
                    <option>중학교</option>
                    <option>고등학교</option>
                    <option>특수학교</option>
                    <option>기타 교육기관</option>
                  </select>
                </Field>
                <Field id="region" label="지역">
                  <select
                    id="region"
                    className="input-surface"
                    value={form.region}
                    onChange={(event) =>
                      updateField("region", event.target.value)
                    }
                  >
                    {gyeonggiRegions.map((region) => (
                      <option key={region}>{region}</option>
                    ))}
                  </select>
                </Field>
                <Field
                  error={fieldErrors.address}
                  id="address"
                  label="학교 주소"
                >
                  <input
                    id="address"
                    className="input-surface"
                    aria-invalid={Boolean(fieldErrors.address)}
                    placeholder="경기도 수원시 ..."
                    value={form.address}
                    onChange={(event) =>
                      updateField("address", event.target.value)
                    }
                  />
                </Field>
                <Field
                  error={fieldErrors.verificationCode}
                  id="verificationCode"
                  label="학교 가입 인증번호"
                >
                  <input
                    id="verificationCode"
                    className="input-surface"
                    aria-describedby="verificationCode-help"
                    aria-invalid={Boolean(fieldErrors.verificationCode)}
                    placeholder="승인 확인용 인증번호"
                    value={form.verificationCode}
                    onChange={(event) =>
                      updateField("verificationCode", event.target.value)
                    }
                  />
                  <span
                    id="verificationCode-help"
                    className="mt-1.5 block text-xs text-ink-muted"
                  >
                    관리자 승인 시 학교 소속 확인에 사용합니다.
                  </span>
                </Field>
              </div>

              <div className="mt-7 flex items-start gap-3 border-y border-outline py-4 text-sm leading-6 text-ink-soft">
                <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" />
                신청 후 관리자 확인을 거쳐 계정이 활성화됩니다. 검토 결과는 업무
                이메일로 안내합니다.
              </div>

              <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row">
                <button
                  type="button"
                  className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 border border-outline-strong px-5 text-sm font-bold text-ink hover:bg-surface-subtle"
                  onClick={() => setCurrentStep(1)}
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
                      신청 접수 중
                    </>
                  ) : (
                    <>
                      학교 계정 신청
                      <Check className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </>
          )}
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

function Field({
  children,
  error,
  id,
  label,
}: {
  children: React.ReactNode;
  error?: string;
  id: string;
  label: string;
}) {
  return (
    <label className="block" htmlFor={id}>
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
