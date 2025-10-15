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
import FeaturesSection from "@/components/landing/features-section";
import DashboardMain from "@/components/dashboard/dashboard-main";
import { getRecentNotesForDashboard, getNotesStatsForDashboard } from "@/lib/db/notes";
import { signOut } from "@/app/auth/actions";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 로그인된 사용자는 개선된 대시보드 표시
  if (user) {
    try {
      // 대시보드용 데이터 가져오기
      const [recentNotes, stats] = await Promise.all([
        getRecentNotesForDashboard(user.id),
        getNotesStatsForDashboard(user.id)
      ]);

      return (
        <DashboardMain 
          user={user}
          notes={recentNotes}
          stats={{
            totalNotes: stats.totalNotes,
            recentNotes: stats.recentNotes,
            totalTags: 0, // TODO: 태그 통계 구현
            lastCreatedAt: stats.lastCreatedAt
          }}
        />
      );
    } catch (error) {
      console.error('대시보드 데이터 로딩 실패:', error);
      // 에러 발생 시 기본 대시보드 표시
      return (
        <DashboardMain 
          user={user}
          notes={[]}
          stats={{
            totalNotes: 0,
            recentNotes: 0,
            totalTags: 0
          }}
          isLoading={true}
        />
      );
    }
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
              
              {/* 기능 소개 섹션 */}
              <FeaturesSection />
            </div>
          );
        }
