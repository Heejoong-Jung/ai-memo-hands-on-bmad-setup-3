// app/notes/[id]/edit/form.tsx
// 노트 수정 폼 컴포넌트 (클라이언트 컴포넌트)
// 제목, 본문 수정 및 실시간 글자 수 카운터 제공
// 관련 파일: app/notes/actions.ts, app/notes/[id]/edit/page.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateNoteAction } from '@/app/notes/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface EditNoteFormProps {
  noteId: string;
  initialTitle: string;
  initialContent: string;
}

export default function EditNoteForm({
  noteId,
  initialTitle,
  initialContent,
}: EditNoteFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const titleMaxLength = 200;
  const contentMaxLength = 50000;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await updateNoteAction(noteId, { title, content });

      if (result?.error) {
        setError(result.error);
        setIsLoading(false);
      } else {
        // 성공 시 노트 상세 페이지로 이동
        router.push(`/notes/${noteId}`);
        router.refresh();
      }
    } catch (err) {
      console.error('노트 수정 에러:', err);
      setError('노트 수정 중 오류가 발생했습니다.');
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push(`/notes/${noteId}`);
  };

  return (
    <div className="container mx-auto max-w-3xl py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>노트 수정</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 에러 메시지 */}
            {error && (
              <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">
                {error}
              </div>
            )}

            {/* 제목 입력 */}
            <div className="space-y-2">
              <Label htmlFor="title">제목</Label>
              <Input
                id="title"
                name="title"
                type="text"
                placeholder="노트 제목을 입력하세요"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={titleMaxLength}
                required
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500 text-right">
                {title.length} / {titleMaxLength}자
              </p>
            </div>

            {/* 본문 입력 */}
            <div className="space-y-2">
              <Label htmlFor="content">본문</Label>
              <Textarea
                id="content"
                name="content"
                placeholder="노트 내용을 입력하세요"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                maxLength={contentMaxLength}
                rows={20}
                disabled={isLoading}
                className="resize-y"
              />
              <p className="text-xs text-gray-500 text-right">
                {content.length} / {contentMaxLength.toLocaleString()}자
              </p>
            </div>

            {/* 버튼 그룹 */}
            <div className="flex gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isLoading}
              >
                취소
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? '저장 중...' : '저장'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

