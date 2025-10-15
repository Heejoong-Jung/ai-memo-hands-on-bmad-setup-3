// components/dashboard/notes-list.tsx
// 대시보드의 메모 목록을 표시하는 컴포넌트
// 최근 메모를 날짜순으로 정렬하여 표시하고 미리보기 기능 제공
// 관련 파일: components/dashboard/notes-stats.tsx, lib/db/notes.ts

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Calendar, Eye } from "lucide-react";
import type { Note } from "@/drizzle/schema";

interface NotesListProps {
  notes: Note[];
  isLoading?: boolean;
}

export default function NotesList({ notes, isLoading = false }: NotesListProps) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateContent = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (notes.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              아직 메모가 없습니다
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              첫 번째 메모를 작성해보세요!
            </p>
            <Button asChild>
              <Link href="/notes/new">새 메모 작성하기</Link>
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6" role="region" aria-label="최근 메모 목록">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          최근 메모
        </h2>
        <Button asChild variant="outline" size="sm">
          <Link href="/notes" aria-label="모든 메모 보기">모두 보기</Link>
        </Button>
      </div>

      <div className="space-y-4" role="list" aria-label="메모 목록">
        {notes.map((note) => (
          <div
            key={note.id}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            role="listitem"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <Link 
                  href={`/notes/${note.id}`}
                  className="block group"
                  aria-label={`메모 "${note.title || "제목 없음"}" 보기`}
                >
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2">
                    {note.title || "제목 없음"}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                    {truncateContent(note.content)}
                  </p>
                </Link>

                <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3" aria-hidden="true" />
                    <span aria-label={`작성일: ${formatDate(note.createdAt)}`}>{formatDate(note.createdAt)}</span>
                  </div>
                  
                  {/* TODO: 태그 기능 구현 후 활성화 */}
                  {/* {note.tags && note.tags.length > 0 && (
                    <div className="flex items-center space-x-1">
                      <Tag className="w-3 h-3" aria-hidden="true" />
                      <span aria-label={`태그 ${note.tags.length}개`}>{note.tags.length}개 태그</span>
                    </div>
                  )} */}
                </div>

                {/* TODO: 태그 기능 구현 후 활성화 */}
                {/* {note.tags && note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {note.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      >
                        {tag}
                      </span>
                    ))}
                    {note.tags.length > 3 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                        +{note.tags.length - 3}
                      </span>
                    )}
                  </div>
                )} */}
              </div>

              <div className="ml-4 flex-shrink-0">
                <Button asChild variant="ghost" size="sm">
                  <Link 
                    href={`/notes/${note.id}`} 
                    className="flex items-center space-x-1"
                    aria-label={`메모 "${note.title || "제목 없음"}" 자세히 보기`}
                  >
                    <Eye className="w-4 h-4" aria-hidden="true" />
                    <span className="hidden sm:inline">보기</span>
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {notes.length >= 5 && (
        <div className="mt-6 text-center">
          <Button asChild variant="outline">
            <Link href="/notes" aria-label="더 많은 메모 보기">더 많은 메모 보기</Link>
          </Button>
        </div>
      )}
    </Card>
  );
}
