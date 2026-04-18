"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, BookOpen, Clock, Users, ShieldCheck, Search, Building2 } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-primary-50 to-white overflow-hidden">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-white/70 border-b border-primary-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-primary-500 to-secondary-500 text-white p-1.5 rounded-lg">
              <BookOpen size={24} />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-900 tracking-tight">
              에듀커넥트
            </span>
          </div>
          <nav className="hidden md:flex gap-8 text-sm font-medium text-gray-600">
            <Link href="#features" className="hover:text-primary-600 transition-colors">기능 소개</Link>
            <Link href="/pool" className="hover:text-primary-600 transition-colors">인력풀</Link>
            <Link href="/jobs" className="hover:text-primary-600 transition-colors">구인게시판</Link>
          </nav>
          <div className="flex gap-3">
            <Link href="/auth/login" className="text-sm font-medium text-gray-600 hover:text-primary-600 px-4 py-2 transition-colors">
              로그인
            </Link>
            <Link href="/auth/register/teacher" className="text-sm font-medium bg-primary-600 text-white px-5 py-2 rounded-full hover:bg-primary-700 hover:shadow-md hover:shadow-primary-500/20 transition-all">
              교사 가입
            </Link>
            <Link href="/auth/register/hr" className="hidden sm:inline-flex text-sm font-medium bg-secondary-600 text-white px-5 py-2 rounded-full hover:bg-secondary-700 hover:shadow-md hover:shadow-secondary-500/20 transition-all">
              인사담당자 가입
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative pt-20 pb-32 lg:pt-36 lg:pb-40 overflow-hidden">
          {/* Background decorations */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-tr from-primary-200/40 to-secondary-200/40 blur-3xl -z-10 rounded-full opacity-70 animate-pulse-slow"></div>
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-100 text-primary-700 text-sm font-medium mb-8 border border-primary-200"
            >
              <span className="flex h-2 w-2 rounded-full bg-primary-500 animate-ping absolute"></span>
              <span className="flex h-2 w-2 rounded-full bg-primary-600 relative"></span>
              경기도교육청 공식 인증 매칭 플랫폼
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 mb-6 leading-tight"
            >
              교육의 공백을 채우는 <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-500">
                가장 빠른 연결고리
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed"
            >
              기간제교사와 시간강사, 그리고 학교 인사담당자를 위한 양방향 매칭 서비스입니다.
              복잡한 절차 없이 클릭 몇 번으로 최적의 교육 인재를 만나보세요.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link href="/auth/register/hr" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-primary-500 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg shadow-primary-500/30 hover:scale-105 transition-transform">
                <Building2 size={20} />
                학교 담당자로 시작하기
              </Link>
              <Link href="/auth/register/teacher" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-gray-800 border items-center justify-center border-gray-200 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm">
                <Users size={20} className="text-secondary-600" />
                구직 교사로 이력 등록
              </Link>
            </motion.div>
          </div>

          {/* Interactive Platform Mockup */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-20 flex justify-center px-4"
          >
            <div className="relative w-full max-w-5xl rounded-2xl md:rounded-[2rem] border border-white/40 bg-white/40 backdrop-blur-3xl shadow-2xl overflow-hidden">
              <div className="h-12 bg-gray-100/50 border-b border-gray-200/50 flex items-center px-6 gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                <div className="ml-4 h-6 w-64 bg-white rounded flex items-center px-3 text-xs text-gray-400 line-clamp-1">educonnect.kr</div>
              </div>
              <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="col-span-1 md:col-span-2 space-y-4">
                  <div className="h-8 w-48 bg-gray-200 rounded-md animate-pulse"></div>
                  <div className="flex gap-4">
                    <div className="h-10 w-24 bg-primary-100 rounded-full"></div>
                    <div className="h-10 w-24 bg-gray-100 rounded-full"></div>
                    <div className="h-10 w-24 bg-gray-100 rounded-full"></div>
                  </div>
                  <div className="space-y-3 pt-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center hover:-translate-y-1 transition-transform cursor-pointer">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gray-100 rounded-full flex justify-center items-center font-bold text-gray-400">사진</div>
                          <div>
                            <div className="h-5 w-24 bg-gray-200 rounded mb-2"></div>
                            <div className="h-4 w-40 bg-gray-100 rounded"></div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                           <div className="h-6 w-16 bg-green-100 rounded-full"></div>
                           <div className="h-8 w-8 bg-blue-50 rounded-full flex items-center justify-center text-blue-500">→</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="hidden md:block col-span-1 bg-gradient-to-b from-primary-50 to-white rounded-xl border border-primary-100 p-6">
                    <div className="h-40 w-full bg-white rounded-xl shadow-sm border border-gray-100 mb-4 p-4 flex flex-col justify-between">
                       <div className="h-4 w-20 bg-gray-200 rounded"></div>
                       <div className="h-12 w-12 bg-primary-500 rounded-full self-end"></div>
                    </div>
                     <div className="h-20 w-full bg-white rounded-xl shadow-sm border border-gray-100 p-4"></div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Features Matrix */}
        <section id="features" className="py-24 bg-white relative">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">채용 혁신, 지금 시작됩니다</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                에듀커넥트가 교원 수급의 오랜 고민을 해결합니다.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { 
                  icon: <Search className="text-primary-500 w-8 h-8" />,
                  title: "양방향 매칭 시스템",
                  desc: "인력풀 직접 검색부터 구인공고를 통한 지원까지. 학교의 상황에 맞는 채용 방식을 선택하세요."
                },
                { 
                  icon: <Clock className="text-secondary-500 w-8 h-8" />,
                  title: "실시간 상태 업데이트",
                  desc: "구직중, 재직중, 구직중지 등 교사의 현재 상태가 실시간으로 표시되어 불필요한 연락을 줄입니다."
                },
                { 
                  icon: <ShieldCheck className="text-emerald-500 w-8 h-8" />,
                  title: "안전한 개인정보 보호",
                  desc: "인증된 인사담당자만 접근 가능하며, 상세 프로필과 연락처는 수락 후에만 안전하게 공개됩니다."
                }
              ].map((f, idx) => (
                <div key={idx} className="group p-8 rounded-2xl border border-gray-100 hover:border-primary-200 hover:shadow-xl hover:shadow-primary-100/50 bg-white transition-all bg-gradient-to-b hover:from-white hover:to-primary-50/50">
                  <div className="w-14 h-14 bg-gray-50 group-hover:bg-primary-50 rounded-xl flex items-center justify-center mb-6 transition-colors">
                    {f.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{f.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div className="col-span-1 md:col-span-2">
              <span className="text-xl font-bold text-white tracking-tight mb-4 block">에듀커넥트</span>
              <p className="text-sm text-gray-400 max-w-sm mb-6">
                경기도교육청 소속 학교의 효율적인 교원 수급을 돕기 위해 개발된 공식 인력풀 매칭 플랫폼입니다.
              </p>
              <div className="flex space-x-4">
                {/* Social links placeholder */}
                <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary-500 transition-colors cursor-pointer"></div>
                <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary-500 transition-colors cursor-pointer"></div>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">서비스</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/pool" className="hover:text-white transition-colors">인력풀 스카웃</Link></li>
                <li><Link href="/jobs" className="hover:text-white transition-colors">구인게시판</Link></li>
                <li><Link href="/auth/register/hr" className="hover:text-white transition-colors">학교 등록안내</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">고객지원</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/faq" className="hover:text-white transition-colors">자주 묻는 질문</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">개인정보처리방침</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">이용약관</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-xs">
            <p>© 2026 Gyeonggido Office of Education. All rights reserved.</p>
            <p className="mt-2 md:mt-0">Powered by Next.js & Vercel / Railway</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
