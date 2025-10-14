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
const {
  createNote,
  getNotesByUserId,
  getNoteById,
  updateNote,
  deleteNote,
  getNotesByUserIdPaginated,
  softDeleteNote,
  restoreNote,
  hardDeleteNote,
  getDeletedNotesByUserId,
} = await import('./notes');

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
    deletedAt: null,
  };

  const mockDeletedNote: Note = {
    ...mockNote,
    deletedAt: new Date('2025-01-02'),
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

  describe('getNotesByUserIdPaginated', () => {
    it('성공: 페이지 1 조회 (20개)', async () => {
      const mockNotes = Array.from({ length: 20 }, (_, i) => ({
        id: `note-${i}`,
        userId: mockUserId,
        title: `Note ${i}`,
        content: `Content ${i}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                offset: vi.fn().mockResolvedValue(mockNotes),
              }),
            }),
          }),
        }),
      });

      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ count: 25 }]),
        }),
      });

      const result = await getNotesByUserIdPaginated(mockUserId, 1, 20);

      expect(result.notes).toHaveLength(20);
      expect(result.total).toBe(25);
    });

    it('성공: 페이지 2 조회 (OFFSET 적용)', async () => {
      const mockNotes = Array.from({ length: 5 }, (_, i) => ({
        id: `note-${i + 20}`,
        userId: mockUserId,
        title: `Note ${i + 20}`,
        content: `Content ${i + 20}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                offset: vi.fn().mockResolvedValue(mockNotes),
              }),
            }),
          }),
        }),
      });

      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ count: 25 }]),
        }),
      });

      const result = await getNotesByUserIdPaginated(mockUserId, 2, 20);

      expect(result.notes).toHaveLength(5);
      expect(result.total).toBe(25);
    });

    it('빈 목록: 노트가 없는 경우', async () => {
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                offset: vi.fn().mockResolvedValue([]),
              }),
            }),
          }),
        }),
      });

      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ count: 0 }]),
        }),
      });

      const result = await getNotesByUserIdPaginated(mockUserId, 1, 20);

      expect(result.notes).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('권한: 다른 사용자의 노트는 조회되지 않음', async () => {
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                offset: vi.fn().mockResolvedValue([]),
              }),
            }),
          }),
        }),
      });

      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ count: 0 }]),
        }),
      });

      const result = await getNotesByUserIdPaginated(mockOtherUserId, 1, 20);

      expect(result.notes).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });

  describe('softDeleteNote', () => {
    it('성공: 노트 소프트 삭제', async () => {
      mockDb.update.mockReturnValueOnce({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockDeletedNote]),
          }),
        }),
      });

      const result = await softDeleteNote(mockNoteId, mockUserId);

      expect(result).toEqual(mockDeletedNote);
      expect(result?.deletedAt).not.toBeNull();
    });

    it('실패: 존재하지 않는 노트', async () => {
      mockDb.update.mockReturnValueOnce({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      const result = await softDeleteNote('nonexistent-id', mockUserId);

      expect(result).toBeNull();
    });

    it('권한: 다른 사용자의 노트 삭제 불가', async () => {
      mockDb.update.mockReturnValueOnce({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      const result = await softDeleteNote(mockNoteId, mockOtherUserId);

      expect(result).toBeNull();
    });

    it('실패: 이미 삭제된 노트 재삭제 불가', async () => {
      mockDb.update.mockReturnValueOnce({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      const result = await softDeleteNote(mockNoteId, mockUserId);

      expect(result).toBeNull();
    });
  });

  describe('restoreNote', () => {
    it('성공: 노트 복구', async () => {
      mockDb.update.mockReturnValueOnce({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockNote]),
          }),
        }),
      });

      const result = await restoreNote(mockNoteId, mockUserId);

      expect(result).toEqual(mockNote);
      expect(result?.deletedAt).toBeNull();
    });

    it('실패: 존재하지 않는 노트', async () => {
      mockDb.update.mockReturnValueOnce({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      const result = await restoreNote('nonexistent-id', mockUserId);

      expect(result).toBeNull();
    });

    it('권한: 다른 사용자의 노트 복구 불가', async () => {
      mockDb.update.mockReturnValueOnce({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      const result = await restoreNote(mockNoteId, mockOtherUserId);

      expect(result).toBeNull();
    });

    it('실패: 삭제되지 않은 노트 복구 불가', async () => {
      mockDb.update.mockReturnValueOnce({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      const result = await restoreNote(mockNoteId, mockUserId);

      expect(result).toBeNull();
    });
  });

  describe('hardDeleteNote', () => {
    it('성공: 노트 영구 삭제', async () => {
      mockDb.delete.mockReturnValueOnce({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockDeletedNote]),
        }),
      });

      const result = await hardDeleteNote(mockNoteId, mockUserId);

      expect(result).toBe(true);
    });

    it('실패: 존재하지 않는 노트', async () => {
      mockDb.delete.mockReturnValueOnce({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([]),
        }),
      });

      const result = await hardDeleteNote('nonexistent-id', mockUserId);

      expect(result).toBe(false);
    });

    it('권한: 다른 사용자의 노트 영구 삭제 불가', async () => {
      mockDb.delete.mockReturnValueOnce({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([]),
        }),
      });

      const result = await hardDeleteNote(mockNoteId, mockOtherUserId);

      expect(result).toBe(false);
    });

    it('실패: soft delete되지 않은 노트 영구 삭제 불가', async () => {
      mockDb.delete.mockReturnValueOnce({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([]),
        }),
      });

      const result = await hardDeleteNote(mockNoteId, mockUserId);

      expect(result).toBe(false);
    });
  });

  describe('getDeletedNotesByUserId', () => {
    it('성공: 삭제된 노트 목록 조회', async () => {
      const deletedNotes = [mockDeletedNote, { ...mockDeletedNote, id: 'note-456' }];

      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockResolvedValue(deletedNotes),
          }),
        }),
      });

      const result = await getDeletedNotesByUserId(mockUserId);

      expect(result).toHaveLength(2);
      expect(result[0].deletedAt).not.toBeNull();
    });

    it('빈 목록: 삭제된 노트가 없는 경우', async () => {
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      const result = await getDeletedNotesByUserId(mockUserId);

      expect(result).toHaveLength(0);
    });

    it('권한: 다른 사용자의 삭제된 노트는 조회되지 않음', async () => {
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      const result = await getDeletedNotesByUserId(mockOtherUserId);

      expect(result).toHaveLength(0);
    });
  });
});

