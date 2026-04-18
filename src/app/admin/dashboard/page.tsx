"use client";

import { useState } from "react";
import {
  BookOpen, Shield, Users, UserCheck, FileText, BarChart3,
  Building2, TrendingUp, Eye, ChevronRight, CheckCircle2, XCircle,
  Clock, Search, Bell, Settings, AlertTriangle, MapPin
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "approvals" | "users" | "stats">("overview");
  const [searchQuery, setSearchQuery] = useState("");

  const pendingApprovals = [
    {
      id: 1,
      name: "홍길동",
      email: "hong@school.go.kr",
      schoolName: "○○초등학교",
      schoolRegion: "수원시",
      position: "교무부장",
      requestedAt: "2시간 전",
    },
    {
      id: 2,
      name: "김철수",
      email: "kim@school.go.kr",
      schoolName: "△△중학교",
      schoolRegion: "화성시",
      position: "행정실장",
      requestedAt: "5시간 전",
    },
    {
      id: 3,
      name: "이영희",
      email: "lee@school.go.kr",
      schoolName: "□□고등학교",
      schoolRegion: "용인시",
      position: "인사담당 교사",
      requestedAt: "1일 전",
    },
  ];

  const recentUsers = [
    { id: 1, name: "박○영", role: "TEACHER", email: "park@email.com", status: "ACTIVE", joinedAt: "2일 전" },
    { id: 2, name: "이○준", role: "TEACHER", email: "lee@email.com", status: "ACTIVE", joinedAt: "3일 전" },
    { id: 3, name: "홍길동", role: "HR", email: "hong@school.go.kr", status: "PENDING", joinedAt: "2시간 전" },
    { id: 4, name: "김○현", role: "TEACHER", email: "kim@email.com", status: "INACTIVE", joinedAt: "1주 전" },
  ];

  const tabs = [
    { key: "overview" as const, label: "현황", icon: <BarChart3 size={16} /> },
    { key: "approvals" as const, label: "승인 관리", icon: <Shield size={16} />, badge: pendingApprovals.length },
    { key: "users" as const, label: "사용자 관리", icon: <Users size={16} /> },
    { key: "stats" as const, label: "통계", icon: <TrendingUp size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-gray-900 text-white sticky top-0 z-40">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen size={20} />
            <span className="font-bold">에듀커넥트</span>
            <Badge className="bg-red-500/20 text-red-300 border-red-500/30 text-xs">Admin</Badge>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative text-gray-400 hover:text-white transition-colors">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold">{pendingApprovals.length}</span>
            </button>
            <button className="text-gray-400 hover:text-white transition-colors">
              <Settings size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4">
          <nav className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.key
                    ? "border-gray-900 text-gray-900"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.icon}
                {tab.label}
                {tab.badge && (
                  <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">{tab.badge}</span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Alert for pending approvals */}
            {pendingApprovals.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
                <AlertTriangle size={20} className="text-amber-500 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-amber-800">승인 대기중인 인사담당자 계정이 {pendingApprovals.length}건 있습니다.</p>
                  <p className="text-sm text-amber-700 mt-0.5">빠른 승인을 통해 학교 인사 업무를 지원해 주세요.</p>
                </div>
                <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white rounded-lg" onClick={() => setActiveTab("approvals")}>
                  승인 관리
                </Button>
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "전체 교사", value: "247", change: "+12 이번 주", icon: <Users size={20} />, color: "text-primary-600", bg: "bg-primary-50" },
                { label: "인사담당자", value: "63", change: "+3 이번 주", icon: <Building2 size={20} />, color: "text-secondary-600", bg: "bg-secondary-50" },
                { label: "활성 공고", value: "18", change: "+5 오늘", icon: <FileText size={20} />, color: "text-green-600", bg: "bg-green-50" },
                { label: "매칭 건수", value: "342", change: "+24 이번 달", icon: <UserCheck size={20} />, color: "text-purple-600", bg: "bg-purple-50" },
              ].map((stat, i) => (
                <Card key={i} className="shadow-sm border-gray-100">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center ${stat.color}`}>
                        {stat.icon}
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500 font-medium">{stat.label}</div>
                      <div className="text-xs text-green-600 font-medium">{stat.change}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-sm border-gray-100">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">승인 대기 목록</CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab("approvals")}>
                      전체 보기 <ChevronRight size={14} className="ml-1" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {pendingApprovals.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center">
                          <Clock size={16} className="text-amber-500" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.name}</div>
                          <div className="text-xs text-gray-500">{item.schoolName} · {item.position}</div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white h-8 w-8 p-0 rounded-lg">
                          <CheckCircle2 size={14} />
                        </Button>
                        <Button size="sm" variant="outline" className="h-8 w-8 p-0 rounded-lg border-gray-200 text-gray-400">
                          <XCircle size={14} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="shadow-sm border-gray-100">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">최근 가입 사용자</CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab("users")}>
                      전체 보기 <ChevronRight size={14} className="ml-1" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {recentUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          user.role === "TEACHER" ? "bg-primary-50" : "bg-secondary-50"
                        }`}>
                          {user.role === "TEACHER" ? (
                            <Users size={16} className="text-primary-600" />
                          ) : (
                            <Building2 size={16} className="text-secondary-600" />
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-xs text-gray-500">{user.email}</div>
                        </div>
                      </div>
                      <Badge className={`text-xs ${
                        user.status === "ACTIVE" ? "bg-green-50 text-green-700 border-green-200" :
                        user.status === "PENDING" ? "bg-amber-50 text-amber-700 border-amber-200" :
                        "bg-gray-100 text-gray-600 border-gray-200"
                      }`}>
                        {user.status === "ACTIVE" ? "활성" : user.status === "PENDING" ? "대기" : "비활성"}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Approvals Tab */}
        {activeTab === "approvals" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">인사담당자 승인 관리</h2>
              <Badge className="bg-amber-100 text-amber-800 border-amber-200">{pendingApprovals.length}건 대기</Badge>
            </div>

            <div className="space-y-4">
              {pendingApprovals.map((item) => (
                <Card key={item.id} className="shadow-sm border-gray-100 border-l-4 border-l-amber-400">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <Badge className="bg-amber-100 text-amber-800 border-amber-200">⏳ 승인 대기</Badge>
                          <span className="text-xs text-gray-400">{item.requestedAt}</span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{item.name}</h3>
                        <p className="text-sm text-gray-500 mb-3">{item.email}</p>
                        <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                          <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-md">
                            <Building2 size={14} className="text-gray-400" /> {item.schoolName}
                          </span>
                          <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-md">
                            <MapPin size={14} className="text-gray-400" /> {item.schoolRegion}
                          </span>
                          <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-md">
                            <UserCheck size={14} className="text-gray-400" /> {item.position}
                          </span>
                        </div>
                      </div>
                      <div className="flex md:flex-col gap-2 shrink-0">
                        <Button className="bg-green-600 hover:bg-green-700 text-white rounded-xl flex-1 md:flex-none">
                          <CheckCircle2 size={16} className="mr-1" /> 승인
                        </Button>
                        <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 rounded-xl flex-1 md:flex-none">
                          <XCircle size={16} className="mr-1" /> 거절
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <h2 className="text-xl font-bold text-gray-900">사용자 관리</h2>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  className="pl-9 h-10 border-gray-200"
                  placeholder="이름, 이메일 검색"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <Card className="shadow-sm border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">사용자</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">유형</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">상태</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">가입일</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">관리</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {recentUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                              user.role === "TEACHER" ? "bg-primary-50" : "bg-secondary-50"
                            }`}>
                              {user.role === "TEACHER" ? (
                                <Users size={14} className="text-primary-600" />
                              ) : (
                                <Building2 size={14} className="text-secondary-600" />
                              )}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                              <div className="text-xs text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="outline" className="text-xs">
                            {user.role === "TEACHER" ? "교사" : "인사담당자"}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <Badge className={`text-xs ${
                            user.status === "ACTIVE" ? "bg-green-50 text-green-700 border-green-200" :
                            user.status === "PENDING" ? "bg-amber-50 text-amber-700 border-amber-200" :
                            "bg-gray-100 text-gray-600 border-gray-200"
                          }`}>
                            {user.status === "ACTIVE" ? "활성" : user.status === "PENDING" ? "대기" : "비활성"}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{user.joinedAt}</td>
                        <td className="px-6 py-4 text-right">
                          <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                            <Eye size={14} className="mr-1" /> 상세
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* Stats Tab */}
        {activeTab === "stats" && (
          <div className="space-y-8">
            <h2 className="text-xl font-bold text-gray-900">플랫폼 통계</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="shadow-sm border-gray-100">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-500 font-medium">월간 신규 가입</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-gray-900 mb-2">42</div>
                  <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                    <TrendingUp size={14} /> +18% 전월 대비
                  </div>
                  <div className="mt-4 flex gap-1 items-end h-16">
                    {[30, 45, 25, 60, 40, 55, 42].map((h, i) => (
                      <div key={i} className="flex-1 bg-primary-100 hover:bg-primary-200 rounded-t transition-colors" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-gray-100">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-500 font-medium">월간 매칭 성사</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-gray-900 mb-2">28</div>
                  <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                    <TrendingUp size={14} /> +24% 전월 대비
                  </div>
                  <div className="mt-4 flex gap-1 items-end h-16">
                    {[20, 35, 50, 30, 65, 45, 55].map((h, i) => (
                      <div key={i} className="flex-1 bg-secondary-100 hover:bg-secondary-200 rounded-t transition-colors" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-gray-100">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-500 font-medium">평균 매칭 소요 시간</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-gray-900 mb-2">2.3일</div>
                  <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                    <TrendingUp size={14} /> -0.5일 전월 대비
                  </div>
                  <div className="mt-4 h-16 flex items-end">
                    <div className="w-full bg-gradient-to-r from-green-100 via-amber-100 to-red-100 rounded h-4 relative">
                      <div className="absolute left-[35%] -top-2 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow" />
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>빠름</span>
                    <span>느림</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Regional Stats */}
            <Card className="shadow-sm border-gray-100">
              <CardHeader>
                <CardTitle className="text-lg">지역별 매칭 현황</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { region: "수원시", teachers: 42, schools: 12, matchRate: 78 },
                    { region: "화성시", teachers: 35, schools: 8, matchRate: 65 },
                    { region: "용인시", teachers: 28, schools: 10, matchRate: 72 },
                    { region: "성남시", teachers: 22, schools: 6, matchRate: 81 },
                    { region: "고양시", teachers: 18, schools: 5, matchRate: 59 },
                  ].map((r) => (
                    <div key={r.region} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                      <div className="w-20 text-sm font-medium text-gray-900">{r.region}</div>
                      <div className="flex-1">
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full transition-all" style={{ width: `${r.matchRate}%` }} />
                        </div>
                      </div>
                      <div className="flex gap-4 text-xs text-gray-500 whitespace-nowrap">
                        <span>교사 {r.teachers}</span>
                        <span>학교 {r.schools}</span>
                        <span className="font-medium text-primary-600">{r.matchRate}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
