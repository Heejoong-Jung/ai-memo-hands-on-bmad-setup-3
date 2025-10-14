// app/notes/[id]/summary-button.tsx
// AI 요약 생성/재생성 버튼 컴포넌트
// 로딩 상태 관리 및 에러 처리 포함
// 관련 파일: app/notes/actions.ts, app/notes/[id]/page.tsx

'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { generateSummaryAction } from '@/app/notes/actions';
import { useRouter } from 'next/navigation';

export function SummaryButton({
  noteId,
  hasSummary,
}: {
  noteId: string;
  hasSummary: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleGenerate = () => {
    startTransition(async () => {
      setError(null);
      const result = await generateSummaryAction(noteId);

      if (result.error) {
        setError(result.error);
      } else {
        router.refresh();
      }
    });
  };

  return (
    <div>
      <Button onClick={handleGenerate} disabled={isPending}>
        {isPending ? '생성 중...' : hasSummary ? '재생성' : 'AI 요약 생성'}
      </Button>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
}


