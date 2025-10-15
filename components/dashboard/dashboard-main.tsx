// components/dashboard/dashboard-main.tsx
// 로그인된 사용자를 위한 메인 대시보드 컴포넌트
// 헤더, 빠른 액션, 통계, 메모 목록을 통합한 대시보드 레이아웃
// 관련 파일: components/dashboard/dashboard-header.tsx, components/dashboard/quick-actions.tsx

import { User } from "@supabase/supabase-js";
import DashboardHeader from "./dashboard-header";
import QuickActions from "./quick-actions";
import NotesStats from "./notes-stats";
import NotesList from "./notes-list";
import type { Note } from "@/drizzle/schema";

interface DashboardMainProps {
  user: User;
  notes: Note[];
  stats: {
    totalNotes: number;
    recentNotes: number;
    totalTags: number;
    lastCreatedAt?: string;
  };
  isLoading?: boolean;
}

export default function DashboardMain({ 
  user, 
  notes, 
  stats, 
  isLoading = false 
}: DashboardMainProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 대시보드 헤더 */}
      <DashboardHeader user={user} />

      {/* 메인 콘텐츠 */}
      <main 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8"
        role="main"
        aria-label="대시보드 메인 콘텐츠"
      >
        {/* 환영 메시지 */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            안녕하세요, {user.user_metadata?.full_name || user.email?.split('@')[0] || '사용자'}님! 👋
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            오늘도 생산적인 메모 작성하세요.
          </p>
        </div>

        {/* 빠른 액션 섹션 */}
        <div className="mb-6 sm:mb-8">
          <QuickActions />
        </div>

        {/* 메모 통계 */}
        <div className="mb-6 sm:mb-8">
          <NotesStats 
            totalNotes={stats.totalNotes}
            recentNotes={stats.recentNotes}
            totalTags={stats.totalTags}
            lastCreatedAt={stats.lastCreatedAt}
          />
        </div>

        {/* 메모 목록 */}
        <NotesList notes={notes} isLoading={isLoading} />
      </main>
    </div>
  );
}
