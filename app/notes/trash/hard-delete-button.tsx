// app/notes/trash/hard-delete-button.tsx
// 노트 영구 삭제 버튼 및 확인 모달 컴포넌트
// 삭제된 노트를 DB에서 완전히 제거
// 관련 파일: app/notes/actions.ts, components/ui/dialog.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { hardDeleteNoteAction } from '@/app/notes/actions';
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

export function HardDeleteButton({
  noteId,
  title,
}: {
  noteId: string;
  title: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleHardDelete = async () => {
    setIsLoading(true);
    setError(null);

    const result = await hardDeleteNoteAction(noteId);

    if (result.error) {
      setError(result.error);
      setIsLoading(false);
    } else {
      setIsOpen(false);
      router.refresh();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" className="w-full sm:w-auto">
          영구 삭제
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>노트 영구 삭제</DialogTitle>
          <DialogDescription className="space-y-2">
            <p className="font-semibold text-red-600">
              ⚠️ 경고: 이 작업은 되돌릴 수 없습니다!
            </p>
            <p>
              <span className="font-medium">"{title}"</span> 노트를 영구적으로
              삭제하시겠습니까?
            </p>
            <p className="text-sm">
              영구 삭제된 노트는 복구할 수 없습니다.
            </p>
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
            onClick={handleHardDelete}
            disabled={isLoading}
          >
            {isLoading ? '삭제 중...' : '영구 삭제'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

