// app/notes/actions.ts
// 노트 관련 Server Actions
// 노트 생성, 조회, 수정, 삭제 등의 서버 사이드 로직 처리
// 관련 파일: lib/db/notes.ts, lib/supabase/server.ts, app/notes/new/page.tsx

'use server';

import { createClient } from '@/lib/supabase/server';
import {
  createNote,
  getNotesByUserIdPaginated,
  getNoteById,
  updateNote,
  softDeleteNote,
  restoreNote,
  hardDeleteNote,
  getDeletedNotesByUserId,
} from '@/lib/db/notes';
import { redirect } from 'next/navigation';
import type { Note } from '@/drizzle/schema';
import { generateSummary } from '@/lib/ai/gemini';
import { createSummary, deleteSummaryByNoteId } from '@/lib/db/summaries';
import { RateLimitError, TimeoutError } from '@/lib/ai/types';
import { revalidatePath } from 'next/cache';

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
    console.error('에러 상세:', {
      message: error instanceof Error ? error.message : '알 수 없는 에러',
      userId: user.id,
      page,
      pageSize,
    });
    return {
      notes: [],
      total: 0,
      error: '노트를 불러오는 중 오류가 발생했습니다. 데이터베이스 연결을 확인해주세요.',
    };
  }
}

/**
 * 특정 노트 조회 Server Action
 * @param noteId - 노트 ID
 * @returns 노트 객체 또는 에러 메시지
 */
export async function getNoteByIdAction(
  noteId: string
): Promise<{ note: Note | null; error?: string }> {
  const supabase = await createClient();

  // 사용자 인증 확인
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { note: null, error: '로그인이 필요합니다.' };
  }

  try {
    // 노트 조회 (사용자 스코프 적용)
    const note = await getNoteById(noteId, user.id);

    if (!note) {
      return { note: null, error: '노트를 찾을 수 없습니다.' };
    }

    return { note };
  } catch (error) {
    console.error('노트 조회 에러:', error);
    return { note: null, error: '노트를 불러오는 중 오류가 발생했습니다.' };
  }
}

/**
 * 노트 수정 Server Action
 * @param noteId - 노트 ID
 * @param formData - 수정할 데이터 (title, content)
 * @returns 성공 시 수정된 노트, 실패 시 에러 메시지
 */
export async function updateNoteAction(
  noteId: string,
  formData: { title: string; content: string }
): Promise<{ success?: boolean; note?: Note; error?: string }> {
  const supabase = await createClient();

  // 사용자 인증 확인
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: '로그인이 필요합니다.' };
  }

  // 제목 검증
  if (!formData.title || formData.title.trim() === '') {
    return { error: '제목을 입력해주세요.' };
  }

  if (formData.title.length > 200) {
    return { error: '제목은 최대 200자까지 입력 가능합니다.' };
  }

  if (formData.content.length > 50000) {
    return { error: '본문은 최대 50,000자까지 입력 가능합니다.' };
  }

  try {
    // 노트 업데이트 (사용자 스코프 적용)
    const updatedNote = await updateNote(
      noteId,
      user.id,
      formData.title.trim(),
      formData.content.trim()
    );

    if (!updatedNote) {
      return { error: '노트를 찾을 수 없거나 수정 권한이 없습니다.' };
    }

    return { success: true, note: updatedNote };
  } catch (error) {
    console.error('노트 수정 에러:', error);
    return { error: '노트를 수정하는 중 오류가 발생했습니다.' };
  }
}

/**
 * 노트 소프트 삭제 Server Action
 * @param noteId - 노트 ID
 * @returns 성공 또는 에러 메시지
 */
export async function softDeleteNoteAction(
  noteId: string
): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient();

  // 사용자 인증 확인
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: '로그인이 필요합니다.' };
  }

  try {
    // 노트 소프트 삭제 (사용자 스코프 적용)
    const deletedNote = await softDeleteNote(noteId, user.id);

    if (!deletedNote) {
      return { error: '노트를 찾을 수 없거나 삭제 권한이 없습니다.' };
    }

    return { success: true };
  } catch (error) {
    console.error('노트 삭제 에러:', error);
    return { error: '노트를 삭제하는 중 오류가 발생했습니다.' };
  }
}

/**
 * 노트 복구 Server Action
 * @param noteId - 노트 ID
 * @returns 성공 또는 에러 메시지
 */
export async function restoreNoteAction(
  noteId: string
): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient();

  // 사용자 인증 확인
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: '로그인이 필요합니다.' };
  }

  try {
    // 노트 복구 (사용자 스코프 적용)
    const restoredNote = await restoreNote(noteId, user.id);

    if (!restoredNote) {
      return { error: '노트를 찾을 수 없거나 복구 권한이 없습니다.' };
    }

    return { success: true };
  } catch (error) {
    console.error('노트 복구 에러:', error);
    return { error: '노트를 복구하는 중 오류가 발생했습니다.' };
  }
}

/**
 * 노트 영구 삭제 Server Action
 * @param noteId - 노트 ID
 * @returns 성공 또는 에러 메시지
 */
export async function hardDeleteNoteAction(
  noteId: string
): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient();

  // 사용자 인증 확인
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: '로그인이 필요합니다.' };
  }

  try {
    // 노트 영구 삭제 (사용자 스코프 적용)
    const deleted = await hardDeleteNote(noteId, user.id);

    if (!deleted) {
      return { error: '노트를 찾을 수 없거나 삭제 권한이 없습니다.' };
    }

    return { success: true };
  } catch (error) {
    console.error('노트 영구 삭제 에러:', error);
    return { error: '노트를 영구 삭제하는 중 오류가 발생했습니다.' };
  }
}

/**
 * 삭제된 노트 목록 조회 Server Action
 * @returns 삭제된 노트 목록 또는 에러 메시지
 */
export async function getDeletedNotesAction(): Promise<{
  notes: Note[];
  error?: string;
}> {
  const supabase = await createClient();

  // 사용자 인증 확인
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { notes: [], error: '로그인이 필요합니다.' };
  }

  try {
    // 삭제된 노트 목록 조회
    const notes = await getDeletedNotesByUserId(user.id);

    return { notes };
  } catch (error) {
    console.error('삭제된 노트 조회 에러:', error);
    return {
      notes: [],
      error: '삭제된 노트를 불러오는 중 오류가 발생했습니다.',
    };
  }
}

/**
 * AI 요약 생성 Server Action
 * @param noteId - 노트 ID
 * @returns 성공 시 생성된 요약, 실패 시 에러 메시지
 */
export async function generateSummaryAction(
  noteId: string
): Promise<{ success?: boolean; summary?: string; error?: string }> {
  const supabase = await createClient();

  // 사용자 인증 확인
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: '로그인이 필요합니다.' };
  }

  try {
    // 노트 권한 확인
    const note = await getNoteById(noteId, user.id);
    if (!note) {
      return { error: '노트를 찾을 수 없거나 권한이 없습니다.' };
    }

    // 기존 요약 삭제 (재생성)
    await deleteSummaryByNoteId(noteId, user.id);

    // Gemini API로 요약 생성
    const summaryContent = await generateSummary(note.content);

    // DB에 요약 저장
    await createSummary(noteId, 'gemini-2.0-flash', summaryContent);

    // 페이지 재검증
    revalidatePath(`/notes/${noteId}`);

    return { success: true, summary: summaryContent };
  } catch (error) {
    console.error('요약 생성 에러:', error);

    // 에러 타입에 따른 메시지
    if (error instanceof RateLimitError) {
      return {
        error: 'API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.',
      };
    }
    if (error instanceof TimeoutError) {
      return { error: '요청 시간이 초과되었습니다. 다시 시도해주세요.' };
    }

    return { error: 'AI 요약 생성 중 오류가 발생했습니다.' };
  }
}

