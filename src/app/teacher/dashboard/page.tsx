"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BookOpen, Bell, Settings, FileText, Briefcase, MapPin,
  Eye, CheckCircle2, XCircle, ChevronRight, Star, Calendar, User, Edit3, Shield
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function TeacherDashboardPage() {
  const [activeStatus, setActiveStatus] = useState("SEEKING");

  const statuses = [
    { key: "SEEKING", label: "🟢 구직중", desc: "인력풀에 공개됩니다", color: "bg-green-500" },
    { key: "NOT_SEEKING", label: "⚫ 구직중지", desc: "인력풀에서 숨겨집니다", color: "bg-gray-500" },
  ];

  const matchRequests = [
    {
      id: 1,
      schoolName: "○○초등학교",
      region: "수원시",
      position: "3학년 담임 (기간제)",
      period: "2026.05.01 ~ 2026.08.31",
      status: "PENDING",
      receivedAt: "2시간 전",
    },
    {
      id: 2,
      schoolName: "△△중학교",
      region: "화성시",
      position: "수학 교과 (시간강사)",
      period: "2026.04.20 ~ 2026.05.10",
      status: "ACCEPTED",
      receivedAt: "1일 전",
    },
    {
      id: 3,
      schoolName: "□□고등학교",
      region: "용인시",
      position: "영어 교과 (기간제)",
      period: "2026.03.01 ~ 2027.02.28",
      status: "REJECTED",
      receivedAt: "3일 전",
    },
  ];

  const getRequestStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200">⏳ 대기중</Badge>;
      case "ACCEPTED":
        return <Badge className="bg-green-100 text-green-800 border-green-200">✅ 수락</Badge>;
      case "REJECTED":
        return <Badge className="bg-red-100 text-red-800 border-red-200">❌ 거절</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <header className="bg-white border-b sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-primary-500 to-secondary-500 text-white p-1.5 rounded-lg">
              <BookOpen size={20} />
            </div>
            <span className="font-bold text-lg text-gray-900">에듀커넥트</span>
          </Link>
          <div className="flex items-center gap-4">
            <button className="relative text-gray-400 hover:text-gray-600 transition-colors">
              <Bell size={22} />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">2</span>
            </button>
            <Link href="/teacher/settings">
              <button className="text-gray-400 hover:text-gray-600 transition-colors">
                <Settings size={22} />
              </button>
            </Link>
            <div className="h-8 w-px bg-gray-200" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <User size={16} className="text-primary-600" />
              </div>
              <span className="text-sm font-medium text-gray-700 hidden sm:block">박○영</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-500 rounded-2xl p-6 md:p-8 text-white mb-8 shadow-lg shadow-primary-500/20">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">안녕하세요, 박○영 선생님 👋</h1>
              <p className="text-primary-100 text-sm md:text-base">오늘 새로운 매칭 요청이 1건 도착했습니다.</p>
            </div>
            <Link href="/jobs">
              <Button className="bg-white/20 hover:bg-white/30 text-white border border-white/30 rounded-full px-6 backdrop-blur-sm">
                <Briefcase size={16} className="mr-2" /> 구인공고 보기
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Status & Stats */}
          <div className="space-y-6">
            {/* Current Status */}
            <Card className="shadow-sm border-gray-100">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield size={18} className="text-primary-500" /> 현재 구직 상태
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {statuses.map((s) => (
                  <button
                    key={s.key}
                    onClick={() => setActiveStatus(s.key)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      activeStatus === s.key
                        ? "border-primary-500 bg-primary-50"
                        : "border-gray-100 bg-white hover:border-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${s.color}`} />
                      <div>
                        <div className="font-semibold text-gray-900 text-sm">{s.label}</div>
                        <div className="text-xs text-gray-500">{s.desc}</div>
                      </div>
                      {activeStatus === s.key && (
                        <CheckCircle2 size={18} className="text-primary-500 ml-auto" />
                      )}
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="shadow-sm border-gray-100">
                <CardContent className="p-5 text-center">
                  <div className="text-3xl font-bold text-primary-600 mb-1">12</div>
                  <div className="text-xs text-gray-500 font-medium">프로필 열람</div>
                </CardContent>
              </Card>
              <Card className="shadow-sm border-gray-100">
                <CardContent className="p-5 text-center">
                  <div className="text-3xl font-bold text-secondary-600 mb-1">3</div>
                  <div className="text-xs text-gray-500 font-medium">매칭 요청</div>
                </CardContent>
              </Card>
              <Card className="shadow-sm border-gray-100">
                <CardContent className="p-5 text-center">
                  <div className="text-3xl font-bold text-green-600 mb-1">1</div>
                  <div className="text-xs text-gray-500 font-medium">수락 완료</div>
                </CardContent>
              </Card>
              <Card className="shadow-sm border-gray-100">
                <CardContent className="p-5 text-center">
                  <div className="text-3xl font-bold text-amber-500 mb-1">5</div>
                  <div className="text-xs text-gray-500 font-medium">관심 등록됨</div>
                </CardContent>
              </Card>
            </div>

            {/* Profile Quick Actions */}
            <Card className="shadow-sm border-gray-100">
              <CardContent className="p-6 space-y-3">
                <Link href="/teacher/profile" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                  <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                    <Edit3 size={18} className="text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">프로필 수정</div>
                    <div className="text-xs text-gray-500">이력서 및 희망 조건 업데이트</div>
                  </div>
                  <ChevronRight size={16} className="text-gray-300" />
                </Link>
                <Link href="/teacher/applications" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                  <div className="w-10 h-10 bg-secondary-50 rounded-lg flex items-center justify-center group-hover:bg-secondary-100 transition-colors">
                    <FileText size={18} className="text-secondary-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">지원 내역</div>
                    <div className="text-xs text-gray-500">공고 지원 현황 확인</div>
                  </div>
                  <ChevronRight size={16} className="text-gray-300" />
                </Link>
                <Link href="/teacher/favorites" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                  <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                    <Star size={18} className="text-amber-500" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">관심 학교</div>
                    <div className="text-xs text-gray-500">저장한 공고 목록</div>
                  </div>
                  <ChevronRight size={16} className="text-gray-300" />
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Match Requests */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Briefcase size={20} className="text-primary-500" /> 받은 매칭 요청
              </h2>
              <Badge variant="outline" className="text-primary-600 border-primary-200">
                {matchRequests.filter(r => r.status === "PENDING").length}건 대기중
              </Badge>
            </div>

            <div className="space-y-4">
              {matchRequests.map((req) => (
                <Card key={req.id} className={`shadow-sm border-gray-100 overflow-hidden transition-all hover:shadow-md ${
                  req.status === "PENDING" ? "border-l-4 border-l-amber-400" : ""
                }`}>
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          {getRequestStatusBadge(req.status)}
                          <span className="text-xs text-gray-400">{req.receivedAt}</span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{req.schoolName}</h3>
                        <p className="text-sm text-primary-700 font-medium mb-3">{req.position}</p>
                        <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                          <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1 rounded-md">
                            <MapPin size={14} className="text-gray-400" /> {req.region}
                          </span>
                          <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1 rounded-md">
                            <Calendar size={14} className="text-gray-400" /> {req.period}
                          </span>
                        </div>
                      </div>

                      {req.status === "PENDING" && (
                        <div className="flex sm:flex-col gap-2 sm:items-end shrink-0">
                          <Button className="bg-primary-600 hover:bg-primary-700 text-white rounded-xl shadow-sm">
                            <CheckCircle2 size={16} className="mr-1" /> 수락
                          </Button>
                          <Button variant="outline" className="border-gray-200 text-gray-600 rounded-xl">
                            <XCircle size={16} className="mr-1" /> 거절
                          </Button>
                        </div>
                      )}

                      {req.status === "ACCEPTED" && (
                        <div className="flex sm:flex-col gap-2 sm:items-end shrink-0">
                          <Button variant="outline" className="border-primary-200 text-primary-700 rounded-xl">
                            <Eye size={16} className="mr-1" /> 상세보기
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Recent Notifications */}
            <Card className="shadow-sm border-gray-100">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Bell size={18} className="text-primary-500" /> 최근 알림
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {[
                  { text: "○○초등학교에서 면접 요청이 도착했습니다.", time: "2시간 전", type: "match" },
                  { text: "프로필이 5회 열람되었습니다.", time: "6시간 전", type: "view" },
                  { text: "△△중학교 매칭 요청을 수락하였습니다.", time: "1일 전", type: "accepted" },
                  { text: "새로운 구인공고 3건이 등록되었습니다.", time: "2일 전", type: "job" },
                ].map((n, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                      n.type === "match" ? "bg-amber-400" :
                      n.type === "view" ? "bg-blue-400" :
                      n.type === "accepted" ? "bg-green-400" : "bg-gray-300"
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm text-gray-700">{n.text}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{n.time}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
