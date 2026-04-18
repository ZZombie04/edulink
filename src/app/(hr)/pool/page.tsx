"use client";

import { useState } from "react";
import { Search, MapPin, Briefcase, ChevronDown, Check, Star, Filter } from "lucide-react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function HCPoolPage() {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Dummy data based on the spec
  const teachers = [
    {
      id: 1,
      name: "박○영",
      age: 28,
      birthYear: 1998,
      qualification: "초등 2급 정교사",
      experience: "2년 6개월",
      residence: "수원시",
      preferredRegions: ["수원시", "화성시", "용인시"],
      preferredTypes: ["기간제", "시간강사"],
      status: "SEEKING",
      reservation: false
    },
    {
      id: 2,
      name: "이○준",
      age: 45,
      birthYear: 1981,
      qualification: "중등(수학) 1급 정교사",
      experience: "18년 2개월",
      residence: "성남시",
      preferredRegions: ["성남시", "수원시", "용인시", "광주시"],
      preferredTypes: ["기간제"],
      status: "INTERVIEWING",
      interviewCount: 2,
      reservation: false
    },
    {
      id: 3,
      name: "김○현",
      age: 52,
      birthYear: 1974,
      qualification: "초등 1급 정교사",
      experience: "25년 0개월",
      residence: "고양시",
      preferredRegions: ["고양시", "파주시"],
      preferredTypes: ["기간제"],
      status: "EMPLOYED",
      employedUntil: "2026.08.31",
      reservation: true,
      reservationCount: 1
    }
  ];

  const getStatusBadge = (status: string, employedUntil?: string, interviewCount?: number) => {
    switch (status) {
      case "SEEKING":
        return <Badge className="bg-seeking hover:bg-seeking/80 border-transparent text-white">🟢 구직중</Badge>;
      case "INTERVIEWING":
        return <Badge className="bg-interviewing hover:bg-interviewing/80 border-transparent text-white">🟡 면접진행중 {interviewCount ? `(${interviewCount}건)` : ''}</Badge>;
      case "EMPLOYED":
        return <Badge className="bg-employed hover:bg-employed/80 border-transparent text-white">🔵 재직중 (~{employedUntil})</Badge>;
      case "NOT_SEEKING":
        return <Badge className="bg-not-seeking hover:bg-not-seeking/80 border-transparent text-white">⚫ 구직중지</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center pb-20">
      <header className="w-full bg-white border-b sticky top-0 z-30">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
           <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
             <Briefcase className="text-primary-500" />
             인력풀 검색
           </h1>
           <div className="flex items-center gap-4">
             <span className="text-sm text-gray-500 font-medium">총 247명 등록</span>
             <Button variant="outline" size="sm">로그아웃</Button>
           </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 w-full max-w-6xl">
        <Card className="mb-8 border-none shadow-md">
          <CardHeader className="bg-white rounded-t-xl border-b pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2"><Filter size={18} /> 상세 필터</CardTitle>
              <Button variant="ghost" size="sm" className="text-gray-500">필터 초기화</Button>
            </div>
          </CardHeader>
          <CardContent className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 p-6 bg-gray-50/50">
             
            <div className="space-y-2 lg:col-span-4">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <Input
                  className="pl-10 h-12 text-md border-gray-300 focus-visible:ring-primary-500 w-full"
                  placeholder="이름, 과목, 지역, 등급 등 키워드 검색"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2 border rounded-lg p-4 bg-white shadow-sm">
                <div className="font-semibold text-sm text-gray-800 mb-3">구직 상태</div>
                <div className="flex flex-wrap gap-2 text-sm">
                  <Badge variant="outline" className="bg-primary-50 border-primary-200 text-primary-700 cursor-pointer hover:bg-primary-100 flex gap-1"><Check size={14}/> 구직중</Badge>
                  <Badge variant="outline" className="bg-primary-50 border-primary-200 text-primary-700 cursor-pointer hover:bg-primary-100 flex gap-1"><Check size={14}/> 면접진행중</Badge>
                  <Badge variant="outline" className="cursor-pointer hover:bg-gray-100 bg-white">재직중</Badge>
                  <Badge variant="outline" className="cursor-pointer hover:bg-gray-100 bg-white">구직중지</Badge>
                </div>
            </div>

            <div className="space-y-2 border rounded-lg p-4 bg-white shadow-sm">
                <div className="font-semibold text-sm text-gray-800 mb-3">자격 유형</div>
                <div className="flex flex-wrap gap-2 text-sm">
                  <Badge variant="outline" className="bg-primary-50 border-primary-200 text-primary-700 cursor-pointer hover:bg-primary-100 flex gap-1"><Check size={14}/> 초등</Badge>
                  <Badge variant="outline" className="cursor-pointer hover:bg-gray-100 bg-white">중등</Badge>
                  <Badge variant="outline" className="cursor-pointer hover:bg-gray-100 bg-white">특수</Badge>
                </div>
            </div>

            <div className="space-y-2 border rounded-lg p-4 bg-white shadow-sm">
                <div className="font-semibold text-sm text-gray-800 mb-3">근무 유형</div>
                <div className="flex flex-wrap gap-2 text-sm">
                  <Badge variant="outline" className="bg-primary-50 border-primary-200 text-primary-700 cursor-pointer hover:bg-primary-100 flex gap-1"><Check size={14}/> 기간제</Badge>
                  <Badge variant="outline" className="bg-primary-50 border-primary-200 text-primary-700 cursor-pointer hover:bg-primary-100 flex gap-1"><Check size={14}/> 시간강사</Badge>
                </div>
            </div>

            <div className="space-y-2 border rounded-lg p-4 bg-white shadow-sm">
                <div className="font-semibold text-sm text-gray-800 mb-3">희망 지역</div>
                <div className="flex flex-wrap gap-2 text-sm">
                  <Badge variant="outline" className="bg-primary-50 border-primary-200 text-primary-700 cursor-pointer hover:bg-primary-100 flex gap-1"><Check size={14}/> 수원시</Badge>
                  <Badge variant="outline" className="bg-primary-50 border-primary-200 text-primary-700 cursor-pointer hover:bg-primary-100 flex gap-1"><Check size={14}/> 화성시</Badge>
                  <Badge variant="outline" className="cursor-pointer hover:bg-gray-100 bg-white items-center gap-1">지역추가 <ChevronDown size={14}/></Badge>
                </div>
            </div>
            
          </CardContent>
        </Card>

        <div className="flex justify-between items-center mb-6">
          <div className="text-gray-600">검색 결과 <span className="font-bold text-gray-900">183</span>건</div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">정렬:</span>
            <Button variant="outline" size="sm" className="font-medium">경력순 <ChevronDown size={14} className="ml-1" /></Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {teachers.map((t) => (
            <Card key={t.id} className="hover:-translate-y-1 hover:shadow-lg transition-all border-gray-200 overflow-hidden group bg-white">
              <div className="h-2 w-full bg-gradient-to-r from-primary-400 to-secondary-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-col gap-2">
                    {getStatusBadge(t.status, t.employedUntil, t.interviewCount)}
                    {t.reservation && (
                       <Badge variant="secondary" className="bg-reserved/10 text-reserved border-reserved/20 mt-1 w-fit">
                         📌 예약 가능 {t.reservationCount ? `(${t.reservationCount}건 대기)` : ''}
                       </Badge>
                    )}
                  </div>
                  <Button variant="ghost" size="icon" className="text-gray-300 hover:text-amber-400 transition-colors">
                    <Star size={24} />
                  </Button>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-1 flex items-end gap-3">
                  {t.name}
                  <span className="text-sm text-gray-500 font-normal">{t.age}세 ({t.birthYear}년생)</span>
                </h3>
                <p className="text-primary-700 font-medium mb-4">{t.qualification}</p>
                
                <div className="space-y-2 text-sm text-gray-600 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-20 text-gray-400 text-xs">교직경력</div>
                    <div className="font-medium text-gray-800">{t.experience}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-20 text-gray-400 text-xs">거주지</div>
                    <div>{t.residence}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-20 text-gray-400 text-xs flex-shrink-0">희망지역</div>
                    <div className="line-clamp-1">{t.preferredRegions.join(', ')}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-20 text-gray-400 text-xs">희망유형</div>
                    <div>{t.preferredTypes.join(', ')}</div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-100 flex gap-3">
                  <Button variant="outline" className="flex-1 border-primary-200 text-primary-700 hover:bg-primary-50">
                    <Star size={16} className="mr-2" /> 관심 등록
                  </Button>
                  {t.status !== 'EMPLOYED' ? (
                     <Button className="flex-1 bg-primary-600 hover:bg-primary-700 text-white shadow-md shadow-primary-500/20">
                       <Briefcase size={16} className="mr-2" /> 면접 요청
                     </Button>
                  ) : (
                     <Button className="flex-1 bg-reserved hover:bg-reserved/90 text-white shadow-md shadow-reserved/20" disabled={!t.reservation}>
                       <MapPin size={16} className="mr-2" /> 예약 요청
                     </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 flex justify-center pb-8">
           <div className="flex items-center gap-2">
             <Button variant="outline" size="icon" disabled>&lt;</Button>
             <Button variant="default" className="bg-primary-600 hover:bg-primary-700 h-10 w-10">1</Button>
             <Button variant="outline" className="h-10 w-10 hover:bg-gray-50">2</Button>
             <Button variant="outline" className="h-10 w-10 hover:bg-gray-50">3</Button>
             <Button variant="outline" className="h-10 w-10 hover:bg-gray-50">4</Button>
             <span className="px-2 text-gray-400">...</span>
             <Button variant="outline" className="h-10 w-10 hover:bg-gray-50">10</Button>
             <Button variant="outline" size="icon" className="hover:bg-gray-50">&gt;</Button>
           </div>
        </div>
      </main>
    </div>
  );
}
