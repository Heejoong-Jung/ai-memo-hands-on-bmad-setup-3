// app/notes/trash/restore-button.tsx
// 노트 복구 버튼 컴포넌트
// 삭제된 노트를 복구하는 클라이언트 컴포넌트
// 관련 파일: app/notes/actions.ts

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { restoreNoteAction } from '@/app/notes/actions';
import { Button } from '@/components/ui/button';

export function RestoreButton({ noteId }: { noteId: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleRestore = async () => {
    setIsLoading(true);
    setError(null);

    const result = await restoreNoteAction(noteId);

    if (result.error) {
      setError(result.error);
      setIsLoading(false);
      // 에러 메시지를 3초 후 자동으로 숨김
      setTimeout(() => setError(null), 3000);
    } else {
      router.push('/notes');
      router.refresh();
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Button
        variant="default"
        onClick={handleRestore}
        disabled={isLoading}
        className="w-full sm:w-auto"
      >
        {isLoading ? '복구 중...' : '복구'}
      </Button>
      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
    </div>
  );
}

