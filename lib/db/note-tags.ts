// lib/db/note-tags.ts
// Note Tags 테이블 CRUD 유틸리티 함수
// 사용자 스코프 기반 권한 제어 적용
// 관련 파일: lib/db/client.ts, drizzle/schema.ts, lib/db/notes.ts

import { db } from './client';
import { noteTags, notes, type NoteTag, type NewNoteTag } from '@/drizzle/schema';
import { eq, and } from 'drizzle-orm';

/**
 * 새로운 태그들 생성
 * @param noteId - 노트 ID
 * @param tags - 태그 배열
 * @returns 생성된 태그 객체들
 */
export async function createNoteTags(
  noteId: string,
  tags: string[]
): Promise<NoteTag[]> {
  const newTags: NewNoteTag[] = tags.map(tag => ({
    noteId,
    tag: tag.trim(),
  }));

  const result = await db.insert(noteTags).values(newTags).returning();
  return result;
}

/**
 * 특정 노트의 태그 목록 조회
 * @param noteId - 노트 ID
 * @param userId - 사용자 ID (권한 확인용)
 * @returns 태그 배열
 */
export async function getTagsByNoteId(
  noteId: string,
  userId: string
): Promise<string[]> {
  // noteId의 소유자 확인을 위해 notes 테이블과 조인
  const result = await db
    .select({
      tag: noteTags.tag,
    })
    .from(noteTags)
    .innerJoin(notes, eq(noteTags.noteId, notes.id))
    .where(and(eq(noteTags.noteId, noteId), eq(notes.userId, userId)));

  return result.map(row => row.tag);
}

/**
 * 특정 노트의 태그들 삭제 (재생성 시 사용)
 * @param noteId - 노트 ID
 * @param userId - 사용자 ID (권한 확인용)
 * @returns 삭제 성공 여부
 */
export async function deleteTagsByNoteId(
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
    .delete(noteTags)
    .where(eq(noteTags.noteId, noteId))
    .returning();

  return result.length > 0;
}
