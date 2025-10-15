// app/notes/[id]/tags-button.tsx
// AI 태그 생성 버튼 컴포넌트
// 노트 내용을 기반으로 AI가 자동으로 태그를 생성하는 기능
// 관련 파일: app/notes/actions.ts, lib/ai/gemini.ts, lib/db/note-tags.ts

'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { generateTagsAction } from '@/app/notes/actions';

interface TagsButtonProps {
  noteId: string;
  hasTags: boolean;
}

export function TagsButton({ noteId, hasTags }: TagsButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleGenerateTags = () => {
    setError(null);
    startTransition(async () => {
      try {
        const result = await generateTagsAction(noteId);
        
        if (result.error) {
          setError(result.error);
        } else {
          // 성공 시 페이지 새로고침으로 태그 표시
          window.location.reload();
        }
      } catch (err) {
        setError('태그 생성 중 오류가 발생했습니다.');
        console.error('태그 생성 에러:', err);
      }
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={handleGenerateTags}
        disabled={isPending}
        variant={hasTags ? "outline" : "default"}
        size="sm"
        className="w-fit"
      >
        {isPending ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
            태그 생성 중...
          </>
        ) : hasTags ? (
          '태그 재생성'
        ) : (
          'AI 태그 생성'
        )}
      </Button>
      
      {error && (
        <p className="text-sm text-red-600 bg-red-50 p-2 rounded border">
          {error}
        </p>
      )}
    </div>
  );
}
