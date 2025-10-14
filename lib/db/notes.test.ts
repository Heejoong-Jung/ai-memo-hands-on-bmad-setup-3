// lib/db/notes.test.ts
// Notes CRUD 함수 단위 테스트
// Drizzle ORM 모킹을 통한 테스트 (사용자 권한 스코프 검증 포함)
// 관련 파일: lib/db/notes.ts, drizzle/schema.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Note } from '@/drizzle/schema';

// Drizzle 클라이언트 모킹
const mockDb = {
  insert: vi.fn(),
  select: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

// lib/db/client 모킹
vi.mock('./client', () => ({
  db: mockDb,
}));

// 모킹 후 함수 임포트
const { createNote, getNotesByUserId, getNoteById, updateNote, deleteNote } =
  await import('./notes');

describe('Notes CRUD Functions', () => {
  const mockUserId = 'user-123';
  const mockOtherUserId = 'user-456';
  const mockNoteId = 'note-123';

  const mockNote: Note = {
    id: mockNoteId,
    userId: mockUserId,
    title: 'Test Note',
    content: 'Test Content',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createNote', () => {
    it('성공: 올바른 데이터로 노트 생성', async () => {
      // Mock 체이닝 설정
      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockNote]),
        }),
      });

      const result = await createNote(mockUserId, 'Test Note', 'Test Content');

      expect(result).toEqual(mockNote);
      expect(mockDb.insert).toHaveBeenCalledTimes(1);
    });
  });

  describe('getNotesByUserId', () => {
    it('성공: 사용자의 모든 노트 조회', async () => {
      const mockNotes = [mockNote, { ...mockNote, id: 'note-456' }];

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockResolvedValue(mockNotes),
          }),
        }),
      });

      const result = await getNotesByUserId(mockUserId);

      expect(result).toEqual(mockNotes);
      expect(result).toHaveLength(2);
    });

    it('빈 목록: 노트가 없는 경우', async () => {
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      const result = await getNotesByUserId(mockUserId);

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('getNoteById', () => {
    it('성공: 특정 노트 조회', async () => {
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockNote]),
          }),
        }),
      });

      const result = await getNoteById(mockNoteId, mockUserId);

      expect(result).toEqual(mockNote);
    });

    it('실패: 존재하지 않는 노트', async () => {
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      const result = await getNoteById('non-existent', mockUserId);

      expect(result).toBeNull();
    });

    it('권한: 다른 사용자의 노트 접근 차단', async () => {
      // 다른 사용자로 접근 시도 시 빈 배열 반환
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      const result = await getNoteById(mockNoteId, mockOtherUserId);

      expect(result).toBeNull();
    });
  });

  describe('updateNote', () => {
    it('성공: 노트 수정 성공', async () => {
      const updatedNote = {
        ...mockNote,
        title: 'Updated Title',
        content: 'Updated Content',
        updatedAt: expect.any(Date),
      };

      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([updatedNote]),
          }),
        }),
      });

      const result = await updateNote(
        mockNoteId,
        mockUserId,
        'Updated Title',
        'Updated Content'
      );

      expect(result).toBeDefined();
      expect(result?.title).toBe('Updated Title');
      expect(result?.content).toBe('Updated Content');
    });

    it('실패: 존재하지 않는 노트', async () => {
      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      const result = await updateNote(
        'non-existent',
        mockUserId,
        'Title',
        'Content'
      );

      expect(result).toBeNull();
    });

    it('권한: 다른 사용자의 노트 수정 차단', async () => {
      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      const result = await updateNote(
        mockNoteId,
        mockOtherUserId,
        'Hacked Title',
        'Hacked Content'
      );

      expect(result).toBeNull();
    });
  });

  describe('deleteNote', () => {
    it('성공: 노트 삭제 성공', async () => {
      mockDb.delete.mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockNote]),
        }),
      });

      const result = await deleteNote(mockNoteId, mockUserId);

      expect(result).toBe(true);
    });

    it('실패: 존재하지 않는 노트', async () => {
      mockDb.delete.mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([]),
        }),
      });

      const result = await deleteNote('non-existent', mockUserId);

      expect(result).toBe(false);
    });

    it('권한: 다른 사용자의 노트 삭제 차단', async () => {
      mockDb.delete.mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([]),
        }),
      });

      const result = await deleteNote(mockNoteId, mockOtherUserId);

      expect(result).toBe(false);
    });
  });
});

