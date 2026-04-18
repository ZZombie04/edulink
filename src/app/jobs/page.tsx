"use client";

import { useState } from "react";
import { Search, MapPin, Building, ChevronDown, Calendar, ArrowRight, Briefcase } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

interface Job {
  id: number;
  schoolName: string;
  schoolRegion: string;
  employmentType: string;
  startDate: string;
  endDate: string;
  qualificationType: string;
  qualificationSubject?: string;
  gradeLevel: string;
  isHomeroom: boolean;
  duties: string;
  status: string;
}

export default function JobsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const jobs: Job[] = [
    {
      id: 1,
      schoolName: "○○초등학교",
      schoolRegion: "수원시",
      employmentType: "기간제교사",
      startDate: "2026-05-01",
      endDate: "2026-08-31",
      qualificationType: "초등",
      gradeLevel: "3학년",
      isHomeroom: true,
      duties: "3학년 2반 담임교사 (출산휴가 대체)\n국어, 수학, 사회 교과 지도\n학급 경영 및 생활지도",
      status: "OPEN"
    },
    {
      id: 2,
      schoolName: "△△중학교",
      schoolRegion: "화성시",
      employmentType: "시간강사",
      startDate: "2026-04-20",
      endDate: "2026-05-10",
      qualificationType: "중등",
      qualificationSubject: "수학",
      gradeLevel: "1학년",
      isHomeroom: false,
      duties: "1학년 수학 교과 지도 (주 14시간)\n방과후 학교 지도 1시간 포함",
      status: "OPEN"
    },
    {
      id: 3,
      schoolName: "□□고등학교",
      schoolRegion: "용인시",
      employmentType: "기간제교사",
      startDate: "2026-03-01",
      endDate: "2027-02-28",
      qualificationType: "중등",
      qualificationSubject: "영어",
      gradeLevel: "2학년",
      isHomeroom: true,
      duties: "2학년 담임 및 영어 교과 지도",
      status: "CLOSED"
    }
  ];

  const getJobTitle = (job: Job) => {
    const subject = job.qualificationSubject ? `(${job.qualificationSubject})` : "";
    return `[${job.employmentType}] ${job.gradeLevel} ${job.qualificationType} ${subject} 선생님 모십니다.`;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-20">
      <header className="w-full bg-white border-b sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-900 flex items-center gap-2">
                <Briefcase className="text-primary-500 w-5 h-5"/> 에듀커넥트 구인게시판
            </Link>
           <div className="flex items-center gap-4">
             <Link href="/auth/login">
               <Button variant="ghost" className="text-gray-600">로그인</Button>
             </Link>
             <Link href="/auth/register/hr">
               <Button className="bg-secondary-600 hover:bg-secondary-700 text-white">공고 등록하기</Button>
             </Link>
           </div>
        </div>
      </header>

      <div className="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white py-16">
          <div className="container mx-auto px-4 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">내게 딱 맞는 학교를 찾아보세요</h2>
              <p className="text-primary-200 mb-8 max-w-2xl mx-auto">
                 수원, 화성, 용인 등 경기도 전 지역의 기간제 교사 및 시간 강사 구인 공고를 한눈에 확인하고 지원할 수 있습니다.
              </p>
              <div className="max-w-2xl mx-auto relative flex gap-2">
                 <div className="relative flex-grow">
                    <Search className="absolute left-4 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      className="pl-12 h-12 rounded-full text-md border-transparent focus-visible:ring-primary-400 text-gray-900 shadow-lg"
                      placeholder="학교명, 지역, 과목 검색"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                 </div>
                 <Button className="h-12 rounded-full px-8 bg-secondary-500 hover:bg-secondary-600 shadow-lg text-white font-bold">검색</Button>
              </div>
          </div>
      </div>

      <main className="container mx-auto px-4 py-12 flex flex-col lg:flex-row gap-8 items-start">
        {/* Filters Sidebar */}
        <div className="w-full lg:w-64 flex-shrink-0 bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
            <h3 className="font-bold text-gray-900 mb-6 flex justify-between items-center">
                필터
                <span className="text-xs text-primary-600 cursor-pointer font-normal hover:underline">초기화</span>
            </h3>

            <div className="space-y-6">
                <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-3">근무 지역</h4>
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" className="rounded text-primary-600 focus:ring-primary-500" defaultChecked />
                            <span className="text-sm text-gray-600">수원시</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" className="rounded text-primary-600 focus:ring-primary-500" defaultChecked />
                            <span className="text-sm text-gray-600">화성시</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" className="rounded text-primary-600 focus:ring-primary-500" />
                            <span className="text-sm text-gray-600">용인시</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" className="rounded text-primary-600 focus:ring-primary-500" />
                            <span className="text-sm text-gray-600">성남시</span>
                        </label>
                        <div className="text-primary-600 text-xs mt-2 cursor-pointer hover:underline">더보기 +</div>
                    </div>
                </div>
                
                <hr className="border-gray-100" />

                <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-3">모집 구분</h4>
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" className="rounded text-primary-600 focus:ring-primary-500" defaultChecked />
                            <span className="text-sm text-gray-600">기간제교사</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" className="rounded text-primary-600 focus:ring-primary-500" defaultChecked />
                            <span className="text-sm text-gray-600">시간강사</span>
                        </label>
                    </div>
                </div>

                <hr className="border-gray-100" />
                
                <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-3">자격 요건</h4>
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" className="rounded text-primary-600 focus:ring-primary-500" defaultChecked />
                            <span className="text-sm text-gray-600">초등</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" className="rounded text-primary-600 focus:ring-primary-500" />
                            <span className="text-sm text-gray-600">중등</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" className="rounded text-primary-600 focus:ring-primary-500" />
                            <span className="text-sm text-gray-600">특수</span>
                        </label>
                    </div>
                </div>
            </div>
        </div>

        {/* Job List */}
        <div className="flex-grow flex flex-col gap-4 w-full">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-bold text-gray-900">신규 채용 공고 <span className="text-primary-600 ml-1">42</span></h3>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">정렬:</span>
                    <button className="text-sm font-medium text-gray-700 flex items-center hover:text-black">
                        최신등록순 <ChevronDown size={14} className="ml-1" />
                    </button>
                </div>
            </div>

            {jobs.map((job) => {
              const isClosed = job.status === "CLOSED";
              return (
               <Card key={job.id} className={`border overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-primary-200 ${isClosed ? "opacity-60 bg-gray-50" : "bg-white"}`}>
                  <div className="flex flex-col sm:flex-row">
                      <div className="flex-grow p-6">
                           <div className="flex items-center gap-2 mb-3 flex-wrap">
                               {job.status === "OPEN" ? (
                                   <Badge className="bg-primary-50 text-primary-700 border-primary-200 hover:bg-primary-100">모집중</Badge>
                               ) : (
                                   <Badge variant="secondary" className="bg-gray-200 text-gray-600 hover:bg-gray-300 border-transparent">모집마감</Badge>
                               )}
                               <span className="text-sm text-gray-500 flex items-center gap-1 font-medium">
                                   <MapPin size={14} /> {job.schoolRegion}
                               </span>
                               <span className="text-sm text-gray-500 flex items-center gap-1 font-medium">
                                   <Building size={14} /> {job.schoolName}
                               </span>
                           </div>

                           <Link href={"/jobs/" + job.id} className="block group">
                               <h4 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                                   {getJobTitle(job)}
                               </h4>
                           </Link>

                           <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600">
                               <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-md">
                                   <Calendar size={15} className="text-gray-400" />
                                   {job.startDate} ~ {job.endDate}
                               </div>
                               <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-md">
                                   <Briefcase size={15} className="text-gray-400" />
                                   {job.isHomeroom ? "담임 업무 포함" : "교과 전담"}
                               </div>
                           </div>
                           
                           <div className="mt-4 text-sm text-gray-600 line-clamp-2 border-t border-gray-50 pt-4 whitespace-pre-line">
                               {job.duties}
                           </div>
                      </div>
                      
                      <div className="sm:w-48 bg-gray-50 border-t sm:border-t-0 sm:border-l border-gray-100 p-6 flex flex-col justify-center items-center gap-3 shrink-0">
                          <Button 
                             className={`w-full rounded-full font-bold shadow-md ${job.status === "OPEN" ? "bg-primary-600 hover:bg-primary-700 text-white" : ""}`}
                             variant={job.status === "OPEN" ? "default" : "secondary"}
                             disabled={isClosed}
                          >
                              {job.status === "OPEN" ? "지원하기" : "마감됨"}
                          </Button>
                          <Button variant="outline" className="w-full rounded-full border-gray-300 text-gray-700 hover:bg-white hover:text-primary-600 hover:border-primary-300">
                              상세보기 <ArrowRight size={14} className="ml-1" />
                          </Button>
                      </div>
                  </div>
               </Card>
              );
            })}

            <div className="mt-8 flex justify-center pb-8">
                <Button variant="outline" className="px-8 font-medium rounded-full border-gray-200 text-gray-700 shadow-sm hover:shadow">더 보기</Button>
            </div>
        </div>
      </main>
    </div>
  );
}
