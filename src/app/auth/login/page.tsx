"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, AlertCircle } from "lucide-react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("이메일과 비밀번호를 입력해주세요.");
      return;
    }
    
    setLoading(true);
    setError("");

    // Demo routing based on email pattern
    // In production, this would be a real authentication API call
    await new Promise(resolve => setTimeout(resolve, 800));

    if (email.includes("admin")) {
      router.push("/admin/dashboard");
    } else if (email.includes("school") || email.includes("hr")) {
      router.push("/hr/dashboard");
    } else {
      router.push("/teacher/dashboard");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary-50 to-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-primary-600 text-white p-2 rounded-lg shadow-md shadow-primary-500/20">
              <BookOpen size={28} />
            </div>
            <span className="text-3xl font-extrabold tracking-tight text-gray-900">
              에듀커넥트
            </span>
          </Link>
        </div>

        <Card className="shadow-xl shadow-gray-200/50 border-gray-100/50 rounded-2xl overflow-hidden">
          <div className="h-2 w-full bg-gradient-to-r from-primary-500 to-secondary-500"></div>
          <CardHeader className="space-y-1 pb-6 pt-8 text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">로그인</CardTitle>
            <CardDescription className="text-gray-500">
              이메일과 비밀번호를 입력하여 서비스에 접속하세요.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg flex items-center gap-2 text-sm">
                <AlertCircle size={16} />
                {error}
              </div>
            )}
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">이메일 주소</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="name@example.com" 
                  required
                  className="h-12 border-gray-200 focus-visible:ring-primary-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-gray-700">비밀번호</Label>
                  <Link href="/auth/reset-password" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                    비밀번호 찾기
                  </Link>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  required
                  className="h-12 border-gray-200 focus-visible:ring-primary-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 bg-primary-600 hover:bg-primary-700 text-white font-bold text-base shadow-md mt-6 rounded-xl"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    로그인 중...
                  </span>
                ) : "로그인"}
              </Button>
            </form>

            {/* Demo credentials hint */}
            <div className="bg-primary-50 border border-primary-200 p-3 rounded-lg text-xs text-primary-700 space-y-1">
              <p className="font-semibold">🔑 데모 로그인 안내</p>
              <p>• <code className="bg-primary-100 px-1 rounded">teacher@email.com</code> → 교사 대시보드</p>
              <p>• <code className="bg-primary-100 px-1 rounded">hr@school.go.kr</code> → 인사담당자 대시보드</p>
              <p>• <code className="bg-primary-100 px-1 rounded">admin@educonnect.kr</code> → 관리자 대시보드</p>
              <p className="text-primary-500 mt-1">비밀번호: 아무 값이나 입력</p>
            </div>
            
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">또는 처음이신가요?</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Link href="/auth/register/teacher">
                <Button variant="outline" className="w-full h-12 rounded-xl border-gray-200 hover:bg-gray-50 text-gray-700 font-medium">
                  구직 교사 가입
                </Button>
              </Link>
              <Link href="/auth/register/hr">
                <Button variant="outline" className="w-full h-12 rounded-xl border-gray-200 hover:bg-gray-50 text-gray-700 font-medium">
                  인사담당자 가입
                </Button>
              </Link>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center border-t py-6 bg-gray-50/50 mt-4 text-sm text-gray-500">
             로그인에 문제가 있으신가요? <a href="#" className="text-primary-600 font-medium ml-1">고객센터 문의</a>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
