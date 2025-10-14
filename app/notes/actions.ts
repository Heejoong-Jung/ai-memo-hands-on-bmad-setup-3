// app/notes/actions.ts
// 노트 관련 Server Actions
// 노트 생성, 수정, 삭제 등의 서버 사이드 로직 처리
// 관련 파일: lib/db/notes.ts, lib/supabase/server.ts, app/notes/new/page.tsx

'use server';

import { createClient } from '@/lib/supabase/server';
import { createNote, getNotesByUserIdPaginated } from '@/lib/db/notes';
import { redirect } from 'next/navigation';
import type { Note } from '@/drizzle/schema';

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

/**
 * 노트 목록 조회 Server Action (페이지네이션 지원)
 * @param page - 페이지 번호 (1부터 시작)
 * @param pageSize - 페이지당 항목 수 (기본값: 20)
 * @returns 노트 목록, 전체 개수, 에러 메시지
 */
export async function getNotesAction(
  page: number = 1,
  pageSize: number = 20
): Promise<{ notes: Note[]; total: number; error?: string }> {
  const supabase = await createClient();

  // 사용자 인증 확인
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { notes: [], total: 0, error: '로그인이 필요합니다.' };
  }

  try {
    // 노트 목록 조회 (페이지네이션)
    const { notes, total } = await getNotesByUserIdPaginated(
      user.id,
      page,
      pageSize
    );

    return { notes, total };
  } catch (error) {
    console.error('노트 조회 에러:', error);
    return {
      notes: [],
      total: 0,
      error: '노트를 불러오는 중 오류가 발생했습니다.',
    };
  }
}

