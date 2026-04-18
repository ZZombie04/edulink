"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, ChevronRight, ChevronLeft, Check, AlertCircle, ShieldCheck, Building2, KeyRound } from "lucide-react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const GYEONGGI_REGIONS = [
  "수원시", "성남시", "고양시", "용인시", "부천시", "안산시", "안양시",
  "남양주시", "화성시", "평택시", "의정부시", "시흥시", "파주시", "김포시",
  "광명시", "광주시", "군포시", "오산시", "이천시", "양주시", "안성시",
  "구리시", "포천시", "의왕시", "하남시", "여주시", "양평군", "동두천시",
  "과천시", "가평군", "연천군",
];

const steps = [
  { id: 1, title: "인증번호", icon: <KeyRound size={18} /> },
  { id: 2, title: "약관 동의", icon: <Check size={18} /> },
  { id: 3, title: "학교 정보", icon: <Building2 size={18} /> },
];

export default function HRRegisterPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [verificationCode, setVerificationCode] = useState("");
  const [codeVerified, setCodeVerified] = useState(false);
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [termsConsent, setTermsConsent] = useState(false);

  const handleVerifyCode = () => {
    if (verificationCode.length >= 6) {
      setCodeVerified(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary-200/30 to-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-secondary-600 text-white p-2 rounded-lg shadow-md shadow-secondary-500/20">
              <BookOpen size={24} />
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-gray-900">에듀커넥트</span>
          </Link>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-center gap-0 mb-10">
          {steps.map((step, idx) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  currentStep > step.id
                    ? "bg-secondary-600 text-white"
                    : currentStep === step.id
                    ? "bg-secondary-600 text-white ring-4 ring-secondary-200"
                    : "bg-gray-200 text-gray-500"
                }`}>
                  {currentStep > step.id ? <Check size={18} /> : step.id}
                </div>
                <span className={`text-xs mt-2 font-medium ${currentStep >= step.id ? "text-secondary-700" : "text-gray-400"}`}>
                  {step.title}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div className={`w-16 sm:w-24 h-0.5 mx-1 mt-[-18px] ${currentStep > step.id ? "bg-secondary-500" : "bg-gray-200"}`} />
              )}
            </div>
          ))}
        </div>

        <Card className="shadow-xl shadow-gray-200/50 border-gray-100/50 rounded-2xl overflow-hidden">
          <div className="h-2 w-full bg-gradient-to-r from-secondary-500 to-primary-500" />

          {/* Step 1 - Verification Code */}
          {currentStep === 1 && (
            <>
              <CardHeader className="pt-8 pb-4 text-center">
                <div className="mx-auto w-16 h-16 bg-secondary-50 rounded-full flex items-center justify-center mb-4">
                  <ShieldCheck className="w-8 h-8 text-secondary-600" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">교육지원청 인증번호 확인</CardTitle>
                <CardDescription className="text-gray-500 max-w-sm mx-auto">
                  소속 교육지원청에서 발급받은 인증번호를 입력해 주세요. 인증번호가 없으시면 교육지원청 인사담당 부서에 문의해 주세요.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pb-8">
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">인증번호</Label>
                  <div className="flex gap-3">
                    <Input
                      className="h-14 text-center text-xl font-mono tracking-[0.5em] border-gray-200 flex-grow"
                      placeholder="ABC123"
                      maxLength={10}
                      value={verificationCode}
                      onChange={(e) => {
                        setVerificationCode(e.target.value.toUpperCase());
                        setCodeVerified(false);
                      }}
                    />
                    <Button
                      className="h-14 px-6 bg-secondary-600 hover:bg-secondary-700 text-white font-bold rounded-xl"
                      onClick={handleVerifyCode}
                      disabled={verificationCode.length < 6}
                    >
                      확인
                    </Button>
                  </div>
                </div>

                {codeVerified && (
                  <div className="bg-green-50 text-green-700 p-4 rounded-xl flex items-center gap-3 text-sm border border-green-200">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Check size={18} className="text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold">인증번호가 확인되었습니다</p>
                      <p className="text-green-600 text-xs">발급처: 경기도교육청 인사과</p>
                    </div>
                  </div>
                )}

                {!codeVerified && verificationCode.length > 0 && verificationCode.length < 6 && (
                  <div className="bg-amber-50 text-amber-700 p-3 rounded-lg flex items-center gap-2 text-sm">
                    <AlertCircle size={16} />
                    인증번호는 6자리 이상입니다.
                  </div>
                )}

                <Button
                  className="w-full h-12 bg-secondary-600 hover:bg-secondary-700 text-white font-bold rounded-xl"
                  disabled={!codeVerified}
                  onClick={() => setCurrentStep(2)}
                >
                  다음 단계 <ChevronRight size={18} className="ml-1" />
                </Button>
              </CardContent>
            </>
          )}

          {/* Step 2 - Consents */}
          {currentStep === 2 && (
            <>
              <CardHeader className="pt-8 pb-4 text-center">
                <CardTitle className="text-2xl font-bold text-gray-900">약관 동의</CardTitle>
                <CardDescription className="text-gray-500">서비스 이용을 위해 아래 약관에 동의해 주세요.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pb-8">
                <div className="border rounded-xl p-5 bg-gray-50/50 space-y-4">
                  <div className="flex items-start gap-3">
                    <Checkbox id="privacy" checked={privacyConsent} onCheckedChange={(v) => setPrivacyConsent(v as boolean)} />
                    <div className="flex-1">
                      <Label htmlFor="privacy" className="font-semibold text-gray-800 cursor-pointer">[필수] 개인정보 수집·이용 동의</Label>
                      <p className="text-xs text-gray-500 mt-1">수집 항목: 성명, 연락처, 이메일, 소속 학교 정보, 직위</p>
                    </div>
                  </div>
                  <hr className="border-gray-200" />
                  <div className="flex items-start gap-3">
                    <Checkbox id="terms" checked={termsConsent} onCheckedChange={(v) => setTermsConsent(v as boolean)} />
                    <div className="flex-1">
                      <Label htmlFor="terms" className="font-semibold text-gray-800 cursor-pointer">[필수] 이용약관 동의</Label>
                      <Link href="/terms" className="text-xs text-primary-600 ml-2 hover:underline">전문 보기 →</Link>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button variant="outline" className="flex-1 h-12 rounded-xl" onClick={() => setCurrentStep(1)}>
                    <ChevronLeft size={18} className="mr-1" /> 이전
                  </Button>
                  <Button
                    className="flex-1 h-12 bg-secondary-600 hover:bg-secondary-700 text-white font-bold rounded-xl"
                    disabled={!privacyConsent || !termsConsent}
                    onClick={() => setCurrentStep(3)}
                  >
                    다음 단계 <ChevronRight size={18} className="ml-1" />
                  </Button>
                </div>
              </CardContent>
            </>
          )}

          {/* Step 3 - School Info */}
          {currentStep === 3 && (
            <>
              <CardHeader className="pt-8 pb-4 text-center">
                <CardTitle className="text-2xl font-bold text-gray-900">학교 및 담당자 정보</CardTitle>
                <CardDescription className="text-gray-500">소속 학교와 담당자 정보를 입력해 주세요.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 pb-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className="text-gray-700">성명 <span className="text-red-500">*</span></Label>
                    <Input className="h-12 border-gray-200" placeholder="홍길동" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-700">휴대전화 <span className="text-red-500">*</span></Label>
                    <Input type="tel" className="h-12 border-gray-200" placeholder="010-0000-0000" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className="text-gray-700">이메일 주소 <span className="text-red-500">*</span></Label>
                    <Input type="email" className="h-12 border-gray-200" placeholder="name@school.go.kr" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-700">비밀번호 <span className="text-red-500">*</span></Label>
                    <Input type="password" className="h-12 border-gray-200" placeholder="8자 이상" />
                  </div>
                </div>

                <hr className="border-gray-100 my-2" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className="text-gray-700">소속 학교명 <span className="text-red-500">*</span></Label>
                    <Input className="h-12 border-gray-200" placeholder="○○초등학교" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-700">학교 코드 (NEIS) <span className="text-red-500">*</span></Label>
                    <Input className="h-12 border-gray-200" placeholder="7581234" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className="text-gray-700">학교 유형 <span className="text-red-500">*</span></Label>
                    <select className="w-full h-12 rounded-md border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-secondary-500">
                      <option value="">선택</option>
                      <option>초등학교</option>
                      <option>중학교</option>
                      <option>고등학교</option>
                      <option>특수학교</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-700">학교 소재 지역 <span className="text-red-500">*</span></Label>
                    <select className="w-full h-12 rounded-md border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-secondary-500">
                      <option value="">시/군 선택</option>
                      {GYEONGGI_REGIONS.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className="text-gray-700">학교 주소 <span className="text-red-500">*</span></Label>
                    <Input className="h-12 border-gray-200" placeholder="경기도 수원시..." />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-700">직위 <span className="text-red-500">*</span></Label>
                    <select className="w-full h-12 rounded-md border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-secondary-500">
                      <option value="">선택</option>
                      <option>교감</option>
                      <option>행정실장</option>
                      <option>교무부장</option>
                      <option>인사담당 교사</option>
                      <option>행정직원</option>
                    </select>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-sm text-amber-800 flex items-start gap-3">
                  <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">가입 후 교육청 관리자의 승인이 필요합니다</p>
                    <p className="mt-1 text-amber-700">교육청 관리자가 소속 학교 정보를 확인한 후 계정이 활성화됩니다. 승인까지 최대 2영업일이 소요될 수 있습니다.</p>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button variant="outline" className="flex-1 h-12 rounded-xl" onClick={() => setCurrentStep(2)}>
                    <ChevronLeft size={18} className="mr-1" /> 이전
                  </Button>
                  <Button className="flex-1 h-12 bg-gradient-to-r from-secondary-600 to-secondary-500 hover:from-secondary-700 hover:to-secondary-600 text-white font-bold rounded-xl shadow-lg shadow-secondary-500/20">
                    가입 신청 <Check size={18} className="ml-1" />
                  </Button>
                </div>
              </CardContent>
            </>
          )}
        </Card>

        <p className="text-center text-sm text-gray-500 mt-6">
          이미 계정이 있으신가요?{" "}
          <Link href="/auth/login" className="text-secondary-600 font-medium hover:underline">로그인</Link>
        </p>
      </div>
    </div>
  );
}
