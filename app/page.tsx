// app/page.tsx
// 메인 홈페이지 - 랜딩 페이지 및 로그인 상태 확인
// 사용자의 로그인 여부에 따라 Hero 섹션 또는 대시보드 표시
// 관련 파일: components/landing/hero-section.tsx, lib/supabase/server.ts, app/auth/login/page.tsx, app/auth/signup/page.tsx

import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import HeroSection from "@/components/landing/hero-section";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 로그인된 사용자는 대시보드로 리다이렉트
  if (user) {
    return (
      <div className="font-sans min-h-screen p-8">
        <main className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <Image
              className="dark:invert"
              src="/next.svg"
              alt="Next.js logo"
              width={180}
              height={38}
              priority
            />
            <div className="flex gap-4">
              <Button variant="outline" asChild>
                <Link href="/api/auth/signout">로그아웃</Link>
              </Button>
            </div>
          </div>

          <Card className="p-8 mb-8">
            <h1 className="text-3xl font-bold mb-4">AI 메모장</h1>
            
            <div className="space-y-4">
              <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <p className="text-green-800 dark:text-green-200 font-semibold mb-2">✅ 로그인 상태</p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  이메일: <span className="font-mono">{user.email}</span>
                </p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  사용자 ID: <span className="font-mono text-xs">{user.id}</span>
                </p>
              </div>
              <div className="flex gap-4">
                <Button asChild size="lg" className="flex-1">
                  <Link href="/notes">📝 내 메모 보기</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="flex-1">
                  <Link href="/notes/new">✏️ 새 메모 작성</Link>
                </Button>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                메모를 작성하고 관리하세요. AI 요약 및 태깅 기능이 곧 추가됩니다.
              </p>
            </div>
          </Card>

          <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">개발 상태</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>✅ 회원가입 기능</li>
              <li>✅ 로그인 기능</li>
              <li>✅ 메모 관리 (생성, 조회, 수정, 삭제, 휴지통)</li>
              <li>⏳ 음성 메모 변환 (개발 예정)</li>
              <li>⏳ AI 요약 및 태깅 (개발 예정)</li>
            </ul>
          </div>
        </main>
      </div>
    );
  }

  // 로그인되지 않은 사용자는 랜딩 페이지 표시
  return (
    <div className="font-sans min-h-screen">
      {/* 네비게이션 바 */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">
                AI 메모장
              </Link>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" asChild>
                <Link href="/auth/login">로그인</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/signup">회원가입</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero 섹션 */}
      <HeroSection />
    </div>
  );
}
