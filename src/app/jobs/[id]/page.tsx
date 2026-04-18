"use client";

import Link from "next/link";
import { ArrowLeft, MapPin, Building, Calendar, Briefcase, Share2, BookmarkPlus, ChevronRight, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function JobDetailPage() {
  const job = {
    id: 1,
    schoolName: "○○초등학교",
    schoolRegion: "수원시",
    schoolAddress: "경기도 수원시 팔달구 ○○로 123",
    employmentType: "기간제교사",
    startDate: "2026-05-01",
    endDate: "2026-08-31",
    qualificationType: "초등",
    gradeLevel: "3학년",
    isHomeroom: true,
    duties: [
      "3학년 2반 담임교사 (출산휴가 대체)",
      "국어, 수학, 사회 교과 지도",
      "학급 경영 및 생활지도",
      "학교 행사 참여 및 업무 분장에 따른 업무 수행",
    ],
    requirements: [
      "초등학교 2급 이상 정교사 자격증 소지자",
      "교직 경력 1년 이상 우대",
      "수원시 거주자 우대",
    ],
    benefits: [
      "경기도교육청 기간제교사 보수 기준 적용",
      "4대 보험 가입",
      "학교 급식 제공",
    ],
    status: "OPEN",
    postedAt: "2026-04-15",
    deadline: "2026-04-25",
    contactName: "홍○동 교무부장",
    applicants: 5,
    views: 128,
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="w-full bg-white border-b sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/jobs" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">목록으로</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-gray-500">
              <Share2 size={16} className="mr-1" /> 공유
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-500">
              <BookmarkPlus size={16} className="mr-1" /> 저장
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Job Header Card */}
        <Card className="shadow-md border-gray-100 overflow-hidden mb-6">
          <div className="h-2 w-full bg-gradient-to-r from-primary-500 to-secondary-500" />
          <CardContent className="p-6 md:p-8">
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <Badge className="bg-primary-50 text-primary-700 border-primary-200">모집중</Badge>
              <Badge variant="outline" className="text-gray-600">{job.employmentType}</Badge>
              {job.isHomeroom && <Badge variant="outline" className="text-amber-600 border-amber-200">담임</Badge>}
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              [{job.employmentType}] {job.gradeLevel} {job.qualificationType} 선생님 모십니다.
            </h1>

            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6">
              <span className="flex items-center gap-1.5">
                <Building size={16} className="text-gray-400" /> {job.schoolName}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin size={16} className="text-gray-400" /> {job.schoolRegion}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar size={16} className="text-gray-400" /> {job.startDate} ~ {job.endDate}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button className="flex-1 sm:flex-none bg-primary-600 hover:bg-primary-700 text-white font-bold h-12 px-8 rounded-xl shadow-md shadow-primary-500/20">
                지원하기
              </Button>
              <Button variant="outline" className="flex-1 sm:flex-none h-12 px-8 rounded-xl border-gray-200">
                <BookmarkPlus size={16} className="mr-2" /> 관심 공고 저장
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-sm border-gray-100">
              <CardHeader>
                <CardTitle className="text-lg">수행 업무</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {job.duties.map((d, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-700">
                      <div className="w-6 h-6 bg-primary-50 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                        <ChevronRight size={14} className="text-primary-500" />
                      </div>
                      {d}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-gray-100">
              <CardHeader>
                <CardTitle className="text-lg">자격 요건</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {job.requirements.map((r, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-700">
                      <div className="w-6 h-6 bg-amber-50 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                        <AlertCircle size={14} className="text-amber-500" />
                      </div>
                      {r}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-gray-100">
              <CardHeader>
                <CardTitle className="text-lg">처우 및 기타</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {job.benefits.map((b, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-700">
                      <div className="w-6 h-6 bg-green-50 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Briefcase size={14} className="text-green-500" />
                      </div>
                      {b}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="shadow-sm border-gray-100 sticky top-20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-gray-500 font-medium">공고 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">등록일</span>
                  <span className="font-medium text-gray-900">{job.postedAt}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">마감일</span>
                  <span className="font-medium text-red-600">{job.deadline}</span>
                </div>
                <hr className="border-gray-100" />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">지원자 수</span>
                  <span className="font-medium text-gray-900">{job.applicants}명</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">조회수</span>
                  <span className="font-medium text-gray-900">{job.views}회</span>
                </div>
                <hr className="border-gray-100" />
                <div className="text-sm">
                  <span className="text-gray-500 block mb-1">학교 주소</span>
                  <span className="text-gray-900">{job.schoolAddress}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-500 block mb-1">담당자</span>
                  <span className="text-gray-900">{job.contactName}</span>
                </div>

                <Button className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold h-11 rounded-xl shadow-md mt-4">
                  지원하기
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
