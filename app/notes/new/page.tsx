// app/notes/new/page.tsx
// 노트 생성 페이지
// 로그인한 사용자가 새 노트를 작성할 수 있는 폼 제공
// 관련 파일: app/notes/actions.ts, app/notes/new/form.tsx, lib/supabase/server.ts

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import NewNoteForm from './form';

export default async function NewNotePage() {
  // 인증 확인
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  return <NewNoteForm />;
}
