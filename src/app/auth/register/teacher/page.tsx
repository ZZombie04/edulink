"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, ChevronRight, ChevronLeft, Upload, Check, AlertCircle, GraduationCap, Briefcase, MapPin, User } from "lucide-react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

const GYEONGGI_REGIONS = [
  "수원시", "성남시", "고양시", "용인시", "부천시", "안산시", "안양시",
  "남양주시", "화성시", "평택시", "의정부시", "시흥시", "파주시", "김포시",
  "광명시", "광주시", "군포시", "오산시", "이천시", "양주시", "안성시",
  "구리시", "포천시", "의왕시", "하남시", "여주시", "양평군", "동두천시",
  "과천시", "가평군", "연천군",
];

const SECONDARY_SUBJECTS = [
  "국어", "수학", "영어", "사회", "역사", "도덕",
  "과학", "물리학", "화학", "생명과학", "지구과학",
  "기술·가정", "정보", "체육", "음악", "미술",
  "한문", "일본어", "중국어", "독일어", "프랑스어", "스페인어",
  "보건", "진로와직업", "환경", "상업정보",
  "특수(초등)", "특수(중등)", "사서", "영양", "전문상담",
];

const steps = [
  { id: 1, title: "약관 동의", icon: <Check size={18} /> },
  { id: 2, title: "기본 정보", icon: <User size={18} /> },
  { id: 3, title: "자격·학력", icon: <GraduationCap size={18} /> },
  { id: 4, title: "경력·희망", icon: <Briefcase size={18} /> },
];

export default function TeacherRegisterPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [thirdPartyConsent, setThirdPartyConsent] = useState(false);
  const [termsConsent, setTermsConsent] = useState(false);
  const [qualificationType, setQualificationType] = useState("");
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);

  const toggleRegion = (region: string) => {
    setSelectedRegions((prev) =>
      prev.includes(region) ? prev.filter((r) => r !== region) : [...prev, region]
    );
  };

  const allRequiredConsents = privacyConsent && thirdPartyConsent && termsConsent;

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-primary-600 text-white p-2 rounded-lg shadow-md shadow-primary-500/20">
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
                    ? "bg-primary-600 text-white"
                    : currentStep === step.id
                    ? "bg-primary-600 text-white ring-4 ring-primary-200"
                    : "bg-gray-200 text-gray-500"
                }`}>
                  {currentStep > step.id ? <Check size={18} /> : step.id}
                </div>
                <span className={`text-xs mt-2 font-medium ${currentStep >= step.id ? "text-primary-700" : "text-gray-400"}`}>
                  {step.title}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div className={`w-12 sm:w-20 h-0.5 mx-1 mt-[-18px] ${currentStep > step.id ? "bg-primary-500" : "bg-gray-200"}`} />
              )}
            </div>
          ))}
        </div>

        <Card className="shadow-xl shadow-gray-200/50 border-gray-100/50 rounded-2xl overflow-hidden">
          <div className="h-2 w-full bg-gradient-to-r from-primary-500 to-secondary-500" />

          {/* Step 1 - Consents */}
          {currentStep === 1 && (
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
                      <p className="text-xs text-gray-500 mt-1">수집 항목: 성명, 생년월일, 연락처, 이메일, 거주지, 교원자격 정보, 학력, 경력</p>
                      <p className="text-xs text-gray-500">수집 목적: 인력풀 등록 및 매칭 서비스 제공</p>
                      <p className="text-xs text-gray-500">보유 기간: 회원 탈퇴 시까지 (탈퇴 후 30일 이내 파기)</p>
                    </div>
                  </div>
                  <hr className="border-gray-200" />
                  <div className="flex items-start gap-3">
                    <Checkbox id="thirdParty" checked={thirdPartyConsent} onCheckedChange={(v) => setThirdPartyConsent(v as boolean)} />
                    <div className="flex-1">
                      <Label htmlFor="thirdParty" className="font-semibold text-gray-800 cursor-pointer">[필수] 개인정보 제3자 제공 동의</Label>
                      <p className="text-xs text-gray-500 mt-1">제공받는 자: 경기도 관내 학교 인사담당자</p>
                      <p className="text-xs text-gray-500">제공 항목: 성명(마스킹), 만 나이, 교원자격, 교직경력, 거주지(시/군)</p>
                      <p className="text-xs text-primary-600 font-medium">※ 상세 연락처는 구직자의 수락 이후에만 제공됩니다</p>
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

                {!allRequiredConsents && (
                  <div className="bg-amber-50 text-amber-700 p-3 rounded-lg flex items-center gap-2 text-sm">
                    <AlertCircle size={16} />
                    필수 동의 항목에 모두 동의하셔야 다음 단계로 진행할 수 있습니다.
                  </div>
                )}

                <Button
                  className="w-full h-12 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl"
                  disabled={!allRequiredConsents}
                  onClick={() => setCurrentStep(2)}
                >
                  다음 단계 <ChevronRight size={18} className="ml-1" />
                </Button>
              </CardContent>
            </>
          )}

          {/* Step 2 - Basic Info */}
          {currentStep === 2 && (
            <>
              <CardHeader className="pt-8 pb-4 text-center">
                <CardTitle className="text-2xl font-bold text-gray-900">기본 정보</CardTitle>
                <CardDescription className="text-gray-500">이름, 생년월일, 연락처 등을 입력해 주세요.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 pb-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className="text-gray-700">성명 <span className="text-red-500">*</span></Label>
                    <Input className="h-12 border-gray-200" placeholder="홍길동" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-700">생년월일 <span className="text-red-500">*</span></Label>
                    <Input type="date" className="h-12 border-gray-200" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className="text-gray-700">이메일 주소 <span className="text-red-500">*</span></Label>
                    <Input type="email" className="h-12 border-gray-200" placeholder="name@example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-700">휴대전화 <span className="text-red-500">*</span></Label>
                    <Input type="tel" className="h-12 border-gray-200" placeholder="010-0000-0000" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className="text-gray-700">비밀번호 <span className="text-red-500">*</span></Label>
                    <Input type="password" className="h-12 border-gray-200" placeholder="8자 이상, 영문+숫자" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-700">비밀번호 확인 <span className="text-red-500">*</span></Label>
                    <Input type="password" className="h-12 border-gray-200" placeholder="비밀번호 재입력" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700">거주 지역 <span className="text-red-500">*</span></Label>
                  <select className="w-full h-12 rounded-md border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                    <option value="">시/군 선택</option>
                    {GYEONGGI_REGIONS.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button variant="outline" className="flex-1 h-12 rounded-xl" onClick={() => setCurrentStep(1)}>
                    <ChevronLeft size={18} className="mr-1" /> 이전
                  </Button>
                  <Button className="flex-1 h-12 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl" onClick={() => setCurrentStep(3)}>
                    다음 단계 <ChevronRight size={18} className="ml-1" />
                  </Button>
                </div>
              </CardContent>
            </>
          )}

          {/* Step 3 - Qualification & Education */}
          {currentStep === 3 && (
            <>
              <CardHeader className="pt-8 pb-4 text-center">
                <CardTitle className="text-2xl font-bold text-gray-900">교원자격 및 학력</CardTitle>
                <CardDescription className="text-gray-500">보유하신 교원 자격과 학력 정보를 입력해 주세요.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 pb-8">
                <div className="space-y-2">
                  <Label className="text-gray-700">자격 유형 <span className="text-red-500">*</span></Label>
                  <div className="grid grid-cols-3 gap-3">
                    {["초등", "중등", "특수"].map((type) => (
                      <button
                        key={type}
                        className={`h-12 rounded-xl border-2 font-medium text-sm transition-all ${
                          qualificationType === type
                            ? "border-primary-500 bg-primary-50 text-primary-700"
                            : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                        }`}
                        onClick={() => setQualificationType(type)}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className="text-gray-700">자격 등급 <span className="text-red-500">*</span></Label>
                    <select className="w-full h-12 rounded-md border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                      <option value="">선택</option>
                      <option value="GRADE_1">1급 정교사</option>
                      <option value="GRADE_2">2급 정교사</option>
                    </select>
                  </div>
                  {qualificationType === "중등" && (
                    <div className="space-y-2">
                      <Label className="text-gray-700">과목 <span className="text-red-500">*</span></Label>
                      <select className="w-full h-12 rounded-md border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                        <option value="">과목 선택</option>
                        {SECONDARY_SUBJECTS.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className="text-gray-700">자격증 번호 <span className="text-red-500">*</span></Label>
                    <Input className="h-12 border-gray-200" placeholder="자격증 번호 입력" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-700">자격증 사본 업로드</Label>
                    <div className="h-12 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center gap-2 text-sm text-gray-500 cursor-pointer hover:border-primary-400 hover:bg-primary-50/30 transition-colors">
                      <Upload size={16} /> 파일 선택
                    </div>
                  </div>
                </div>

                <hr className="border-gray-100 my-4" />
                <h3 className="font-semibold text-gray-800">학력 정보</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className="text-gray-700">출신 대학 <span className="text-red-500">*</span></Label>
                    <Input className="h-12 border-gray-200" placeholder="대학명" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-700">전공 <span className="text-red-500">*</span></Label>
                    <Input className="h-12 border-gray-200" placeholder="전공명" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className="text-gray-700">졸업 연도 <span className="text-red-500">*</span></Label>
                    <Input type="number" className="h-12 border-gray-200" placeholder="2020" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-700">학위 <span className="text-red-500">*</span></Label>
                    <select className="w-full h-12 rounded-md border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                      <option value="BACHELOR">학사</option>
                      <option value="MASTER">석사</option>
                      <option value="DOCTOR">박사</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button variant="outline" className="flex-1 h-12 rounded-xl" onClick={() => setCurrentStep(2)}>
                    <ChevronLeft size={18} className="mr-1" /> 이전
                  </Button>
                  <Button className="flex-1 h-12 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl" onClick={() => setCurrentStep(4)}>
                    다음 단계 <ChevronRight size={18} className="ml-1" />
                  </Button>
                </div>
              </CardContent>
            </>
          )}

          {/* Step 4 - Career & Preferences */}
          {currentStep === 4 && (
            <>
              <CardHeader className="pt-8 pb-4 text-center">
                <CardTitle className="text-2xl font-bold text-gray-900">경력 및 희망 조건</CardTitle>
                <CardDescription className="text-gray-500">경력 사항과 원하는 근무 조건을 입력해 주세요.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 pb-8">
                <div className="border rounded-xl p-5 bg-gray-50/50 space-y-4">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2"><Briefcase size={16} /> 경력 사항</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input className="h-11 border-gray-200" placeholder="근무 학교" />
                    <select className="h-11 rounded-md border border-gray-200 px-3 text-sm">
                      <option>학교 유형 선택</option>
                      <option>초등학교</option>
                      <option>중학교</option>
                      <option>고등학교</option>
                      <option>특수학교</option>
                    </select>
                    <Input className="h-11 border-gray-200" placeholder="담당 업무 (담임, 교과)" />
                    <Input className="h-11 border-gray-200" placeholder="담당 과목" />
                    <Input type="date" className="h-11 border-gray-200" />
                    <Input type="date" className="h-11 border-gray-200" />
                  </div>
                  <Button variant="outline" size="sm" className="text-primary-600 border-primary-200 hover:bg-primary-50">+ 경력 추가</Button>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700 font-semibold flex items-center gap-2"><MapPin size={16} /> 희망 근무 지역 (복수 선택)</Label>
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-48 overflow-y-auto border rounded-xl p-4 bg-gray-50/50">
                    {GYEONGGI_REGIONS.map((region) => (
                      <button
                        key={region}
                        className={`py-2 px-1 rounded-lg text-xs font-medium transition-all ${
                          selectedRegions.includes(region)
                            ? "bg-primary-600 text-white shadow-sm"
                            : "bg-white border border-gray-200 text-gray-600 hover:border-primary-300"
                        }`}
                        onClick={() => toggleRegion(region)}
                      >
                        {region}
                      </button>
                    ))}
                  </div>
                  {selectedRegions.length > 0 && (
                    <p className="text-xs text-primary-600">{selectedRegions.length}개 지역 선택됨</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700 font-semibold">희망 근무 유형</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex items-center gap-3 border rounded-xl p-4 cursor-pointer hover:border-primary-300 bg-white transition-colors">
                      <input type="checkbox" className="rounded text-primary-600" defaultChecked />
                      <div>
                        <div className="font-medium text-gray-800 text-sm">기간제교사</div>
                        <div className="text-xs text-gray-500">1개월 이상</div>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 border rounded-xl p-4 cursor-pointer hover:border-primary-300 bg-white transition-colors">
                      <input type="checkbox" className="rounded text-primary-600" />
                      <div>
                        <div className="font-medium text-gray-800 text-sm">시간강사</div>
                        <div className="text-xs text-gray-500">1개월 미만</div>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700 font-semibold">자기소개</Label>
                  <Textarea className="min-h-[100px] border-gray-200" placeholder="경력 요약 및 자기소개를 작성해 주세요." />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button variant="outline" className="flex-1 h-12 rounded-xl" onClick={() => setCurrentStep(3)}>
                    <ChevronLeft size={18} className="mr-1" /> 이전
                  </Button>
                  <Button className="flex-1 h-12 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white font-bold rounded-xl shadow-lg shadow-primary-500/20">
                    가입 완료 <Check size={18} className="ml-1" />
                  </Button>
                </div>
              </CardContent>
            </>
          )}
        </Card>

        <p className="text-center text-sm text-gray-500 mt-6">
          이미 계정이 있으신가요?{" "}
          <Link href="/auth/login" className="text-primary-600 font-medium hover:underline">로그인</Link>
        </p>
      </div>
    </div>
  );
}
