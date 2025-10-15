// components/dashboard/notes-stats.tsx
// 사용자의 메모 통계 정보를 시각적으로 표시하는 컴포넌트
// 총 메모 수, 최근 작성일, 태그 수 등의 통계 제공
// 관련 파일: components/dashboard/quick-actions.tsx, lib/db/notes.ts

import { Card } from "@/components/ui/card";
import { FileText, Calendar, Tag, TrendingUp } from "lucide-react";

interface NotesStatsProps {
  totalNotes: number;
  recentNotes: number;
  totalTags: number;
  lastCreatedAt?: string;
}

export default function NotesStats({ 
  totalNotes, 
  recentNotes, 
  totalTags, 
  lastCreatedAt 
}: NotesStatsProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "없음";
    return new Date(dateString).toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8" role="region" aria-label="메모 통계">
      {/* 총 메모 수 */}
      <Card className="p-4 text-center" role="group" aria-label="총 메모 수">
        <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg mx-auto mb-3">
          <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" aria-hidden="true" />
        </div>
        <p className="text-2xl font-bold text-gray-900 dark:text-white" aria-label={`총 메모 ${totalNotes}개`}>{totalNotes}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">총 메모</p>
      </Card>

      {/* 최근 메모 수 (7일) */}
      <Card className="p-4 text-center" role="group" aria-label="최근 7일 메모 수">
        <div className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg mx-auto mb-3">
          <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" aria-hidden="true" />
        </div>
        <p className="text-2xl font-bold text-gray-900 dark:text-white" aria-label={`최근 7일 메모 ${recentNotes}개`}>{recentNotes}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">최근 7일</p>
      </Card>

      {/* 총 태그 수 */}
      <Card className="p-4 text-center" role="group" aria-label="총 태그 수">
        <div className="flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg mx-auto mb-3">
          <Tag className="w-6 h-6 text-purple-600 dark:text-purple-400" aria-hidden="true" />
        </div>
        <p className="text-2xl font-bold text-gray-900 dark:text-white" aria-label={`총 태그 ${totalTags}개`}>{totalTags}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">총 태그</p>
      </Card>

      {/* 마지막 작성일 */}
      <Card className="p-4 text-center" role="group" aria-label="마지막 작성일">
        <div className="flex items-center justify-center w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg mx-auto mb-3">
          <Calendar className="w-6 h-6 text-orange-600 dark:text-orange-400" aria-hidden="true" />
        </div>
        <p className="text-sm font-semibold text-gray-900 dark:text-white" aria-label={`마지막 작성일: ${formatDate(lastCreatedAt)}`}>
          {formatDate(lastCreatedAt)}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">마지막 작성</p>
      </Card>
    </div>
  );
}
