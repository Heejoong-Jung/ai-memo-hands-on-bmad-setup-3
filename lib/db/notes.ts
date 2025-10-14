// lib/db/notes.ts
// Notes 테이블 CRUD 유틸리티 함수
// 사용자 ID 스코프 기반 권한 제어 적용
// 관련 파일: lib/db/client.ts, drizzle/schema.ts, lib/db/notes.test.ts

import { db } from './client';
import { notes, type Note, type NewNote } from '@/drizzle/schema';
import { eq, and, desc, sql, count } from 'drizzle-orm';

/**
 * 새로운 노트 생성
 * @param userId - 사용자 ID
 * @param title - 노트 제목
 * @param content - 노트 내용
 * @returns 생성된 노트 객체
 */
export async function createNote(
  userId: string,
  title: string,
  content: string
): Promise<Note> {
  const newNote: NewNote = {
    userId,
    title,
    content,
  };

  const result = await db.insert(notes).values(newNote).returning();
  return result[0];
}

/**
 * 사용자의 모든 노트 조회
 * @param userId - 사용자 ID
 * @returns 노트 배열 (최신순)
 */
export async function getNotesByUserId(userId: string): Promise<Note[]> {
  return db
    .select()
    .from(notes)
    .where(eq(notes.userId, userId))
    .orderBy(notes.createdAt);
}

/**
 * 특정 노트 조회 (권한 체크 포함)
 * @param noteId - 노트 ID
 * @param userId - 사용자 ID (권한 확인용)
 * @returns 노트 객체 또는 null
 */
export async function getNoteById(
  noteId: string,
  userId: string
): Promise<Note | null> {
  const result = await db
    .select()
    .from(notes)
    .where(and(eq(notes.id, noteId), eq(notes.userId, userId)))
    .limit(1);

  return result[0] || null;
}

/**
 * 노트 수정 (권한 체크 포함)
 * @param noteId - 노트 ID
 * @param userId - 사용자 ID (권한 확인용)
 * @param title - 새 제목
 * @param content - 새 내용
 * @returns 수정된 노트 객체 또는 null
 */
export async function updateNote(
  noteId: string,
  userId: string,
  title: string,
  content: string
): Promise<Note | null> {
  const result = await db
    .update(notes)
    .set({
      title,
      content,
      updatedAt: new Date(),
    })
    .where(and(eq(notes.id, noteId), eq(notes.userId, userId)))
    .returning();

  return result[0] || null;
}

/**
 * 노트 삭제 (권한 체크 포함)
 * @param noteId - 노트 ID
 * @param userId - 사용자 ID (권한 확인용)
 * @returns 삭제 성공 여부
 */
export async function deleteNote(
  noteId: string,
  userId: string
): Promise<boolean> {
  const result = await db
    .delete(notes)
    .where(and(eq(notes.id, noteId), eq(notes.userId, userId)))
    .returning();

  return result.length > 0;
}

/**
 * 사용자의 노트 목록 조회 (페이지네이션 지원)
 * @param userId - 사용자 ID
 * @param page - 페이지 번호 (1부터 시작)
 * @param pageSize - 페이지당 항목 수
 * @returns 노트 배열 및 전체 개수
 */
export async function getNotesByUserIdPaginated(
  userId: string,
  page: number = 1,
  pageSize: number = 20
): Promise<{ notes: Note[]; total: number }> {
  // OFFSET 계산
  const offset = (page - 1) * pageSize;

  // 노트 조회 (최신순, 페이지네이션)
  const notesList = await db
    .select()
    .from(notes)
    .where(eq(notes.userId, userId))
    .orderBy(desc(notes.createdAt))
    .limit(pageSize)
    .offset(offset);

  // 전체 노트 개수 조회
  const totalResult = await db
    .select({ count: count() })
    .from(notes)
    .where(eq(notes.userId, userId));

  return {
    notes: notesList,
    total: totalResult[0]?.count || 0,
  };
}

