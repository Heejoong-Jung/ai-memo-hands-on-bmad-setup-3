// app/notes/[id]/delete-button.tsx
// 노트 삭제 버튼 및 확인 모달 컴포넌트
// 클라이언트 컴포넌트로 삭제 확인 다이얼로그 처리
// 관련 파일: app/notes/actions.ts, components/ui/dialog.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { softDeleteNoteAction } from '@/app/notes/actions';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export function DeleteNoteButton({ noteId }: { noteId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleDelete = async () => {
    setIsLoading(true);
    setError(null);

    const result = await softDeleteNoteAction(noteId);

    if (result.error) {
      setError(result.error);
      setIsLoading(false);
    } else {
      setIsOpen(false);
      router.push('/notes');
      router.refresh();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">삭제</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>노트 삭제</DialogTitle>
          <DialogDescription>
            정말 이 노트를 삭제하시겠습니까? 삭제된 노트는 휴지통에서 복구할 수
            있습니다.
          </DialogDescription>
        </DialogHeader>
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded text-sm">
            {error}
          </div>
        )}
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
          >
            취소
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? '삭제 중...' : '삭제'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

