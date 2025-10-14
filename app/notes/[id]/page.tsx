// app/notes/[id]/page.tsx
// 노트 상세 조회 페이지
// 특정 노트의 전체 내용을 표시하고 수정/삭제 버튼 제공
// 관련 파일: lib/db/notes.ts, app/notes/page.tsx, app/notes/actions.ts

import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getNoteById } from '@/lib/db/notes';
import { DeleteNoteButton } from './delete-button';

type Params = Promise<{ id: string }>;

export default async function NoteDetailPage(props: { params: Params }) {
  const params = await props.params;
  
  // 인증 확인
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // 노트 조회 (사용자 스코프 적용)
  const note = await getNoteById(params.id, user.id);

  // 노트가 없거나 권한이 없으면 404
  if (!note) {
    notFound();
  }

  // 날짜 포맷팅 (한국어 형식)
  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      {/* 상단 액션 버튼 영역 */}
      <div className="flex justify-between items-center mb-6">
        <Link href="/notes">
          <Button variant="outline">← 목록으로</Button>
        </Link>
        <div className="flex gap-2">
          <Link href={`/notes/${note.id}/edit`}>
            <Button variant="outline">수정</Button>
          </Link>
          <DeleteNoteButton noteId={note.id} />
        </div>
      </div>

      {/* 노트 내용 카드 */}
      <Card className="p-6 md:p-8">
        {/* 제목 */}
        <h1 className="text-3xl md:text-4xl font-bold mb-4 break-words">
          {note.title}
        </h1>

        {/* 메타 정보 */}
        <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-6 pb-6 border-b">
          <span>작성일: {formatDate(note.createdAt)}</span>
          <span>수정일: {formatDate(note.updatedAt)}</span>
        </div>

        {/* 본문 (줄바꿈 보존) */}
        <div className="prose prose-lg max-w-none">
          <p className="whitespace-pre-wrap leading-relaxed text-base break-words">
            {note.content}
          </p>
        </div>
      </Card>
    </div>
  );
}

