// lib/db/summaries.test.ts
// Summaries CRUD 함수 단위 테스트
// 요약 생성, 조회, 삭제 기능 검증
// 관련 파일: lib/db/summaries.ts, drizzle/schema.ts

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { createSummary, getSummaryByNoteId, deleteSummaryByNoteId } from './summaries';
import { db } from './client';
import { summaries, notes } from '@/drizzle/schema';
import { eq, and, desc } from 'drizzle-orm';

// Drizzle ORM 모킹
vi.mock('./client', () => ({
  db: {
    insert: vi.fn(),
    select: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('Summaries CRUD Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('createSummary', () => {
    it('새로운 요약을 생성해야 함', async () => {
      // Arrange
      const mockSummary = {
        id: 'summary-id',
        noteId: 'note-id',
        model: 'gemini-2.0-flash',
        content: '- 포인트 1\n- 포인트 2\n- 포인트 3',
        createdAt: new Date(),
      };

      const mockInsert = {
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([mockSummary]),
      };
      (db.insert as any).mockReturnValue(mockInsert);

      // Act
      const result = await createSummary('note-id', 'gemini-2.0-flash', '- 포인트 1\n- 포인트 2\n- 포인트 3');

      // Assert
      expect(db.insert).toHaveBeenCalledWith(summaries);
      expect(mockInsert.values).toHaveBeenCalledWith({
        noteId: 'note-id',
        model: 'gemini-2.0-flash',
        content: '- 포인트 1\n- 포인트 2\n- 포인트 3',
      });
      expect(result).toEqual(mockSummary);
    });

    it('요약 생성 시 모든 필드가 포함되어야 함', async () => {
      // Arrange
      const mockSummary = {
        id: 'summary-id',
        noteId: 'note-id',
        model: 'gemini-2.0-flash',
        content: '- 요약 내용',
        createdAt: new Date(),
      };

      const mockInsert = {
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([mockSummary]),
      };
      (db.insert as any).mockReturnValue(mockInsert);

      // Act
      const result = await createSummary('note-id', 'gemini-2.0-flash', '- 요약 내용');

      // Assert
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('noteId');
      expect(result).toHaveProperty('model');
      expect(result).toHaveProperty('content');
      expect(result).toHaveProperty('createdAt');
    });
  });

  describe('getSummaryByNoteId', () => {
    it('노트의 최신 요약을 조회해야 함', async () => {
      // Arrange
      const mockSummary = {
        id: 'summary-id',
        noteId: 'note-id',
        model: 'gemini-2.0-flash',
        content: '- 포인트 1\n- 포인트 2\n- 포인트 3',
        createdAt: new Date(),
      };

      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockSummary]),
      };
      (db.select as any).mockReturnValue(mockSelect);

      // Act
      const result = await getSummaryByNoteId('note-id', 'user-id');

      // Assert
      expect(db.select).toHaveBeenCalled();
      expect(mockSelect.from).toHaveBeenCalledWith(summaries);
      expect(mockSelect.innerJoin).toHaveBeenCalled();
      expect(mockSelect.where).toHaveBeenCalled();
      expect(mockSelect.orderBy).toHaveBeenCalled();
      expect(mockSelect.limit).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockSummary);
    });

    it('요약이 없으면 null을 반환해야 함', async () => {
      // Arrange
      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };
      (db.select as any).mockReturnValue(mockSelect);

      // Act
      const result = await getSummaryByNoteId('note-id', 'user-id');

      // Assert
      expect(result).toBeNull();
    });

    it('권한 없는 사용자는 요약을 조회할 수 없어야 함', async () => {
      // Arrange
      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };
      (db.select as any).mockReturnValue(mockSelect);

      // Act
      const result = await getSummaryByNoteId('note-id', 'wrong-user-id');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('deleteSummaryByNoteId', () => {
    it('노트의 요약을 삭제해야 함', async () => {
      // Arrange
      const mockNote = {
        id: 'note-id',
        userId: 'user-id',
        title: '테스트 노트',
        content: '테스트 내용',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      const mockSelectNote = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockNote]),
      };
      (db.select as any).mockReturnValue(mockSelectNote);

      const mockDelete = {
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([{ id: 'summary-id' }]),
      };
      (db.delete as any).mockReturnValue(mockDelete);

      // Act
      const result = await deleteSummaryByNoteId('note-id', 'user-id');

      // Assert
      expect(db.select).toHaveBeenCalled();
      expect(db.delete).toHaveBeenCalledWith(summaries);
      expect(mockDelete.where).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('권한 없는 사용자는 요약을 삭제할 수 없어야 함', async () => {
      // Arrange
      const mockSelectNote = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]), // 노트를 찾을 수 없음
      };
      (db.select as any).mockReturnValue(mockSelectNote);

      // Act
      const result = await deleteSummaryByNoteId('note-id', 'wrong-user-id');

      // Assert
      expect(result).toBe(false);
      expect(db.delete).not.toHaveBeenCalled();
    });

    it('요약이 없어도 false를 반환해야 함', async () => {
      // Arrange
      const mockNote = {
        id: 'note-id',
        userId: 'user-id',
        title: '테스트 노트',
        content: '테스트 내용',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      const mockSelectNote = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockNote]),
      };
      (db.select as any).mockReturnValue(mockSelectNote);

      const mockDelete = {
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([]), // 삭제할 요약 없음
      };
      (db.delete as any).mockReturnValue(mockDelete);

      // Act
      const result = await deleteSummaryByNoteId('note-id', 'user-id');

      // Assert
      expect(result).toBe(false);
    });
  });
});


