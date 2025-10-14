// app/page.tsx
// 메인 홈페이지 - 로그인 상태 확인 및 네비게이션
// 사용자의 로그인 여부에 따라 다른 UI 표시
// 관련 파일: lib/supabase/server.ts, app/auth/login/page.tsx, app/auth/signup/page.tsx

import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

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
            {user ? (
              <Button variant="outline" asChild>
                <Link href="/api/auth/signout">로그아웃</Link>
              </Button>
            ) : (
              <>
                <Button variant="outline" asChild>
                  <Link href="/auth/login">로그인</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/signup">회원가입</Link>
                </Button>
              </>
            )}
          </div>
        </div>

        <Card className="p-8 mb-8">
          <h1 className="text-3xl font-bold mb-4">AI 메모장</h1>
          
          {user ? (
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
              <p className="text-gray-600 dark:text-gray-400">
                메모 관리 기능은 곧 추가될 예정입니다.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <p className="text-yellow-800 dark:text-yellow-200 font-semibold mb-2">⚠️ 로그아웃 상태</p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  로그인하여 AI 메모장 기능을 사용하세요.
                </p>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                음성 메모를 텍스트로 변환하고, AI가 자동으로 요약하고 태그를 생성합니다.
              </p>
            </div>
          )}
        </Card>

        <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">개발 상태</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>✅ 회원가입 기능</li>
            <li>✅ 로그인 기능</li>
            <li>⏳ 메모 관리 (개발 예정)</li>
            <li>⏳ 음성 메모 변환 (개발 예정)</li>
            <li>⏳ AI 요약 및 태깅 (개발 예정)</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
