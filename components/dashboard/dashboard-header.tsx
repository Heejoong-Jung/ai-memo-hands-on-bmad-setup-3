// components/dashboard/dashboard-header.tsx
// 로그인된 사용자를 위한 대시보드 헤더 컴포넌트
// 브랜드 로고, 사용자 정보, 로그아웃 버튼을 포함한 반응형 헤더
// 관련 파일: app/page.tsx, app/auth/actions.ts, components/ui/button.tsx

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { signOut } from "@/app/auth/actions";
import { User } from "@supabase/supabase-js";

interface DashboardHeaderProps {
  user: User;
}

export default function DashboardHeader({ user }: DashboardHeaderProps) {
  return (
    <header 
      className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40"
      role="banner"
      aria-label="대시보드 헤더"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 브랜드 로고 및 제목 */}
          <div className="flex items-center space-x-3">
            <Link 
              href="/" 
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
              aria-label="AI 메모장 홈으로 이동"
            >
              <Image
                className="dark:invert"
                src="/next.svg"
                alt="AI 메모장 로고"
                width={32}
                height={32}
                priority
              />
              <span className="text-xl font-bold text-gray-900 dark:text-white hidden sm:block">
                AI 메모장
              </span>
            </Link>
          </div>

          {/* 사용자 정보 및 액션 */}
          <div className="flex items-center space-x-4">
            {/* 사용자 정보 */}
            <div className="hidden md:flex items-center space-x-3 text-sm" role="region" aria-label="사용자 정보">
              <div className="text-right">
                <p className="text-gray-900 dark:text-white font-medium">
                  {user.user_metadata?.full_name || user.email?.split('@')[0] || '사용자'}
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-xs">
                  {user.email}
                </p>
              </div>
              <div 
                className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center"
                aria-label="사용자 아바타"
              >
                <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm">
                  {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
            </div>

            {/* 모바일 사용자 정보 */}
            <div className="md:hidden flex items-center space-x-2" role="region" aria-label="사용자 정보">
              <div 
                className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center"
                aria-label="사용자 아바타"
              >
                <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm">
                  {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
            </div>

            {/* 로그아웃 버튼 */}
            <form action={signOut}>
              <Button 
                variant="outline" 
                size="sm"
                type="submit"
                className="hover:bg-red-50 hover:border-red-200 hover:text-red-600 dark:hover:bg-red-950 dark:hover:border-red-800 dark:hover:text-red-400 transition-colors"
                aria-label="로그아웃"
              >
                <span className="hidden sm:inline">로그아웃</span>
                <span className="sm:hidden">나가기</span>
              </Button>
            </form>
          </div>
        </div>
      </div>
    </header>
  );
}
