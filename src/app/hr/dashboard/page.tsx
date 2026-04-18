"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BookOpen, Bell, Users,
  Eye, Plus, ChevronRight, Building2, 
  Search, TrendingUp, UserCheck, FileText, BarChart3
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function HRDashboardPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "requests" | "postings">("overview");

  const sentRequests = [
    {
      id: 1,
      teacherName: "박○영",
      qualification: "초등 2급 정교사",
      status: "PENDING",
      sentAt: "2시간 전",
      position: "3학년 담임 (출산휴가 대체)",
    },
    {
      id: 2,
      teacherName: "이○준",
      qualification: "중등(수학) 1급 정교사",
      status: "ACCEPTED",
      sentAt: "1일 전",
      position: "1학년 수학 교과전담",
    },
    {
      id: 3,
      teacherName: "김○현",
      qualification: "초등 1급 정교사",
      status: "REJECTED",
      sentAt: "3일 전",
      position: "4학년 담임",
    },
  ];

  const myPostings = [
    {
      id: 1,
      title: "[기간제교사] 3학년 초등 선생님 모십니다.",
      status: "OPEN",
      applicants: 5,
      views: 128,
      createdAt: "3일 전",
    },
    {
      id: 2,
      title: "[시간강사] 1학년 수학 강사 모집",
      status: "CLOSED",
      applicants: 12,
      views: 256,
      createdAt: "1주 전",
    },
  ];

  const getRequestBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200">⏳ 응답 대기</Badge>;
      case "ACCEPTED":
        return <Badge className="bg-green-100 text-green-800 border-green-200">✅ 수락됨</Badge>;
      case "REJECTED":
        return <Badge className="bg-red-100 text-red-800 border-red-200">❌ 거절됨</Badge>;
      default:
        return null;
    }
  };

  const tabs = [
    { key: "overview" as const, label: "대시보드", icon: <BarChart3 size={16} /> },
    { key: "requests" as const, label: "요청 관리", icon: <Users size={16} /> },
    { key: "postings" as const, label: "내 공고", icon: <FileText size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <header className="bg-white border-b sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-secondary-500 to-primary-500 text-white p-1.5 rounded-lg">
              <BookOpen size={20} />
            </div>
            <span className="font-bold text-lg text-gray-900">에듀커넥트</span>
            <Badge className="bg-secondary-50 text-secondary-700 border-secondary-200 text-xs ml-1">인사담당자</Badge>
          </Link>
          <div className="flex items-center gap-4">
            <button className="relative text-gray-400 hover:text-gray-600 transition-colors">
              <Bell size={22} />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">1</span>
            </button>
            <div className="h-8 w-px bg-gray-200" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-secondary-100 rounded-full flex items-center justify-center">
                <Building2 size={16} className="text-secondary-600" />
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-medium text-gray-700">홍길동</div>
                <div className="text-xs text-gray-400">○○초등학교</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4">
          <nav className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? "border-secondary-500 text-secondary-700"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200"
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Welcome */}
            <div className="bg-gradient-to-r from-secondary-600 via-secondary-500 to-primary-500 rounded-2xl p-6 md:p-8 text-white shadow-lg shadow-secondary-500/20">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold mb-2">○○초등학교 인사관리 🏫</h1>
                  <p className="text-secondary-100 text-sm md:text-base">매칭 요청 1건에 대한 응답이 대기중입니다.</p>
                </div>
                <div className="flex gap-2">
                  <Link href="/pool">
                    <Button className="bg-white/20 hover:bg-white/30 text-white border border-white/30 rounded-full px-5 backdrop-blur-sm">
                      <Search size={16} className="mr-2" /> 인력풀 검색
                    </Button>
                  </Link>
                  <Link href="/hr/postings/new">
                    <Button className="bg-white text-secondary-700 hover:bg-white/90 rounded-full px-5 font-bold shadow-md">
                      <Plus size={16} className="mr-2" /> 공고 등록
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "보낸 요청", value: "8", icon: <Users size={20} />, color: "text-secondary-600", bg: "bg-secondary-50" },
                { label: "수락률", value: "62%", icon: <TrendingUp size={20} />, color: "text-green-600", bg: "bg-green-50" },
                { label: "등록 공고", value: "2", icon: <FileText size={20} />, color: "text-primary-600", bg: "bg-primary-50" },
                { label: "총 지원자", value: "17", icon: <UserCheck size={20} />, color: "text-amber-600", bg: "bg-amber-50" },
              ].map((stat, i) => (
                <Card key={i} className="shadow-sm border-gray-100">
                  <CardContent className="p-5">
                    <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center ${stat.color} mb-3`}>
                      {stat.icon}
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                    <div className="text-xs text-gray-500 font-medium">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-sm border-gray-100">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">최근 매칭 요청</CardTitle>
                    <Button variant="ghost" size="sm" className="text-secondary-600" onClick={() => setActiveTab("requests")}>
                      전체 보기 <ChevronRight size={14} className="ml-1" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {sentRequests.slice(0, 3).map((req) => (
                    <div key={req.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-sm font-bold text-gray-400">
                          {req.teacherName[0]}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{req.teacherName}</div>
                          <div className="text-xs text-gray-500">{req.qualification}</div>
                        </div>
                      </div>
                      {getRequestBadge(req.status)}
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="shadow-sm border-gray-100">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">내 구인 공고</CardTitle>
                    <Button variant="ghost" size="sm" className="text-secondary-600" onClick={() => setActiveTab("postings")}>
                      전체 보기 <ChevronRight size={14} className="ml-1" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {myPostings.map((post) => (
                    <div key={post.id} className="p-4 rounded-xl border border-gray-100 hover:border-secondary-200 transition-colors">
                      <div className="flex items-center gap-2 mb-2">
                        {post.status === "OPEN" ? (
                          <Badge className="bg-green-50 text-green-700 border-green-200 text-xs">모집중</Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-600 border-gray-200 text-xs">마감</Badge>
                        )}
                        <span className="text-xs text-gray-400">{post.createdAt}</span>
                      </div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">{post.title}</h4>
                      <div className="flex gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><Users size={12} /> 지원 {post.applicants}명</span>
                        <span className="flex items-center gap-1"><Eye size={12} /> 조회 {post.views}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Requests Tab */}
        {activeTab === "requests" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">보낸 매칭 요청</h2>
              <Link href="/pool">
                <Button className="bg-secondary-600 hover:bg-secondary-700 text-white rounded-full px-6">
                  <Search size={16} className="mr-2" /> 인력풀 검색
                </Button>
              </Link>
            </div>

            <div className="space-y-4">
              {sentRequests.map((req) => (
                <Card key={req.id} className={`shadow-sm border-gray-100 overflow-hidden ${
                  req.status === "ACCEPTED" ? "border-l-4 border-l-green-400" : ""
                }`}>
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getRequestBadge(req.status)}
                          <span className="text-xs text-gray-400">{req.sentAt}</span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{req.teacherName}</h3>
                        <p className="text-sm text-gray-600">{req.qualification}</p>
                        <p className="text-sm text-secondary-700 font-medium mt-2">{req.position}</p>
                      </div>
                      <div className="flex sm:flex-col gap-2 sm:items-end shrink-0">
                        {req.status === "ACCEPTED" && (
                          <Button className="bg-secondary-600 hover:bg-secondary-700 text-white rounded-xl">
                            연락처 확인
                          </Button>
                        )}
                        <Button variant="outline" className="rounded-xl border-gray-200">
                          <Eye size={16} className="mr-1" /> 프로필 보기
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Postings Tab */}
        {activeTab === "postings" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">내 구인 공고</h2>
              <Link href="/hr/postings/new">
                <Button className="bg-secondary-600 hover:bg-secondary-700 text-white rounded-full px-6">
                  <Plus size={16} className="mr-2" /> 새 공고 등록
                </Button>
              </Link>
            </div>

            <div className="space-y-4">
              {myPostings.map((post) => (
                <Card key={post.id} className="shadow-sm border-gray-100">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {post.status === "OPEN" ? (
                            <Badge className="bg-green-50 text-green-700 border-green-200">모집중</Badge>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-600 border-gray-200">마감</Badge>
                          )}
                          <span className="text-xs text-gray-400">{post.createdAt}</span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{post.title}</h3>
                        <div className="flex gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1"><Users size={14} /> 지원자 {post.applicants}명</span>
                          <span className="flex items-center gap-1"><Eye size={14} /> 조회 {post.views}회</span>
                        </div>
                      </div>
                      <div className="flex sm:flex-col gap-2 sm:items-end shrink-0">
                        <Button variant="outline" className="rounded-xl border-gray-200">
                          지원자 확인
                        </Button>
                        <Button variant="outline" className="rounded-xl border-gray-200 text-gray-500">
                          수정
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
