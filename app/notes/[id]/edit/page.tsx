// app/notes/[id]/edit/page.tsx
// 노트 수정 페이지
// 기존 노트 데이터를 불러와서 수정 폼에 전달
// 관련 파일: app/notes/[id]/edit/form.tsx, lib/db/notes.ts, app/notes/actions.ts

import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { getNoteById } from '@/lib/db/notes';
import EditNoteForm from './form';

type Params = Promise<{ id: string }>;

export default async function EditNotePage(props: { params: Params }) {
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

  return (
    <EditNoteForm
      noteId={note.id}
      initialTitle={note.title}
      initialContent={note.content}
    />
  );
}

