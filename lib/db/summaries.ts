// lib/db/summaries.ts
// Summaries 테이블 CRUD 유틸리티 함수
// 사용자 스코프 기반 권한 제어 적용
// 관련 파일: lib/db/client.ts, drizzle/schema.ts, lib/db/notes.ts

import { db } from './client';
import { summaries, notes, type Summary, type NewSummary } from '@/drizzle/schema';
import { eq, and, desc } from 'drizzle-orm';

/**
 * 새로운 요약 생성
 * @param noteId - 노트 ID
 * @param model - 사용된 AI 모델 이름
 * @param content - 요약 내용
 * @returns 생성된 요약 객체
 */
export async function createSummary(
  noteId: string,
  model: string,
  content: string
): Promise<Summary> {
  const newSummary: NewSummary = {
    noteId,
    model,
    content,
  };

  const result = await db.insert(summaries).values(newSummary).returning();
  return result[0];
}

/**
 * 특정 노트의 최신 요약 조회
 * @param noteId - 노트 ID
 * @param userId - 사용자 ID (권한 확인용)
 * @returns 요약 객체 또는 null
 */
export async function getSummaryByNoteId(
  noteId: string,
  userId: string
): Promise<Summary | null> {
  // noteId의 소유자 확인을 위해 notes 테이블과 조인
  const result = await db
    .select({
      id: summaries.id,
      noteId: summaries.noteId,
      model: summaries.model,
      content: summaries.content,
      createdAt: summaries.createdAt,
    })
    .from(summaries)
    .innerJoin(notes, eq(summaries.noteId, notes.id))
    .where(and(eq(summaries.noteId, noteId), eq(notes.userId, userId)))
    .orderBy(desc(summaries.createdAt))
    .limit(1);

  return result[0] || null;
}

/**
 * 특정 노트의 요약 삭제 (재생성 시 사용)
 * @param noteId - 노트 ID
 * @param userId - 사용자 ID (권한 확인용)
 * @returns 삭제 성공 여부
 */
export async function deleteSummaryByNoteId(
  noteId: string,
  userId: string
): Promise<boolean> {
  // noteId의 소유자 확인
  const note = await db
    .select()
    .from(notes)
    .where(and(eq(notes.id, noteId), eq(notes.userId, userId)))
    .limit(1);

  if (note.length === 0) {
    return false; // 권한 없음
  }

  const result = await db
    .delete(summaries)
    .where(eq(summaries.noteId, noteId))
    .returning();

  return result.length > 0;
}


