// app/notes/trash/page.tsx
// 삭제된 노트 목록 페이지 (휴지통)
// 소프트 삭제된 노트들을 표시하고 복구/영구삭제 기능 제공
// 관련 파일: lib/db/notes.ts, app/notes/actions.ts

import { createClient } from '@/lib/supabase/server';
import { getDeletedNotesByUserId } from '@/lib/db/notes';
import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { RestoreButton } from './restore-button';
import { HardDeleteButton } from './hard-delete-button';

export default async function TrashPage() {
  // 인증 확인
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // 삭제된 노트 목록 조회
  const deletedNotes = await getDeletedNotesByUserId(user.id);

  // 날짜 포맷팅 (한국어 형식)
  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return new Date(date).toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 빈 상태 UI
  if (deletedNotes.length === 0) {
    return (
      <div className="container mx-auto max-w-4xl py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">휴지통</h1>
          <Link href="/notes">
            <Button variant="outline">← 노트 목록</Button>
          </Link>
        </div>

        <Card className="p-12 text-center">
          <p className="text-gray-500 text-lg mb-4">삭제된 노트가 없습니다.</p>
          <p className="text-gray-400 text-sm">
            삭제한 노트가 여기에 표시됩니다.
          </p>
        </Card>
      </div>
    );
  }

  // 삭제된 노트 목록 UI
  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      {/* 상단 헤더 */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">휴지통</h1>
          <p className="text-gray-500 mt-1">
            {deletedNotes.length}개의 삭제된 노트
          </p>
        </div>
        <Link href="/notes">
          <Button variant="outline">← 노트 목록</Button>
        </Link>
      </div>

      {/* 삭제된 노트 카드 목록 */}
      <div className="space-y-4">
        {deletedNotes.map((note) => (
          <Card key={note.id} className="p-6">
            {/* 제목 */}
            <h2 className="text-xl font-semibold mb-2 truncate">
              {note.title}
            </h2>

            {/* 본문 미리보기 (첫 2줄) */}
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {note.content}
            </p>

            {/* 메타 정보 */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
              <span>
                삭제일: {formatDate(note.deletedAt)}
              </span>
              <span>
                작성일: {formatDate(note.createdAt)}
              </span>
            </div>

            {/* 액션 버튼 */}
            <div className="flex gap-2 pt-4 border-t">
              <RestoreButton noteId={note.id} />
              <HardDeleteButton noteId={note.id} title={note.title} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

