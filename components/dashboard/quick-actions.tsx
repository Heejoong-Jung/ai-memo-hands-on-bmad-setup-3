// components/dashboard/quick-actions.tsx
// 대시보드의 빠른 액션 버튼들을 포함한 컴포넌트
// 새 메모 작성, 음성 메모, 휴지통 접근 등의 주요 액션 제공
// 관련 파일: components/dashboard/dashboard-header.tsx, components/ui/button.tsx

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Mic, Trash2, FileText, Sparkles } from "lucide-react";

export default function QuickActions() {
  return (
    <Card className="p-6 mb-8" role="region" aria-label="빠른 액션">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* 새 메모 작성 - 가장 강조 */}
        <Button asChild size="lg" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
          <Link 
            href="/notes/new" 
            className="flex items-center justify-center space-x-2"
            aria-label="새 메모 작성하기"
          >
            <Plus className="w-5 h-5" aria-hidden="true" />
            <span>새 메모 작성</span>
          </Link>
        </Button>

        {/* 음성 메모 - 별도 강조 */}
        <Button asChild size="lg" variant="outline" className="flex-1 border-green-200 text-green-700 hover:bg-green-50 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-950">
          <Link 
            href="/notes/new?mode=voice" 
            className="flex items-center justify-center space-x-2"
            aria-label="음성 메모 작성하기"
          >
            <Mic className="w-5 h-5" aria-hidden="true" />
            <span className="hidden sm:inline">음성 메모</span>
            <span className="sm:hidden">음성</span>
          </Link>
        </Button>
      </div>

      {/* 보조 액션들 */}
      <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700" role="group" aria-label="보조 액션">
        <Button asChild variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
          <Link href="/notes" className="flex items-center space-x-2" aria-label="모든 메모 보기">
            <FileText className="w-4 h-4" aria-hidden="true" />
            <span>모든 메모</span>
          </Link>
        </Button>

        <Button asChild variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
          <Link href="/notes/trash" className="flex items-center space-x-2" aria-label="휴지통 보기">
            <Trash2 className="w-4 h-4" aria-hidden="true" />
            <span>휴지통</span>
          </Link>
        </Button>

        <Button asChild variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
          <Link href="/notes?filter=ai-summary" className="flex items-center space-x-2" aria-label="AI 요약된 메모 보기">
            <Sparkles className="w-4 h-4" aria-hidden="true" />
            <span>AI 요약</span>
          </Link>
        </Button>
      </div>
    </Card>
  );
}
