// app/notes/actions.ts
// 노트 관련 Server Actions
// 노트 생성, 수정, 삭제 등의 서버 사이드 로직 처리
// 관련 파일: lib/db/notes.ts, lib/supabase/server.ts, app/notes/new/page.tsx

'use server';

import { createClient } from '@/lib/supabase/server';
import { createNote } from '@/lib/db/notes';
import { redirect } from 'next/navigation';

/**
 * 노트 생성 Server Action
 * @param formData - 폼 데이터 (title, content)
 * @returns 성공 시 리다이렉트, 실패 시 에러 메시지
 */
export async function createNoteAction(formData: FormData) {
  const supabase = await createClient();

  // 사용자 인증 확인
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: '로그인이 필요합니다.' };
  }

  // 폼 데이터 추출
  const title = formData.get('title') as string;
  const content = formData.get('content') as string;

  // 유효성 검증
  if (!title?.trim() || !content?.trim()) {
    return { error: '제목과 본문은 필수 입력 사항입니다.' };
  }

  if (title.length > 200) {
    return { error: '제목은 최대 200자까지 입력 가능합니다.' };
  }

  if (content.length > 50000) {
    return { error: '본문은 최대 50,000자까지 입력 가능합니다.' };
  }

  try {
    // 노트 생성
    await createNote(user.id, title.trim(), content.trim());
  } catch (error) {
    console.error('노트 생성 에러:', error);
    return { error: '노트 저장 중 오류가 발생했습니다.' };
  }

  // 성공 시 리다이렉트
  redirect('/notes');
}

