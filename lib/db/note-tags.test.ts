// lib/db/note-tags.test.ts
// Note Tags CRUD 함수 단위 테스트
// Vitest + TypeScript 테스트 프레임워크 사용
// 관련 파일: lib/db/note-tags.ts, lib/db/client.ts, drizzle/schema.ts

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createNoteTags, getTagsByNoteId, deleteTagsByNoteId } from './note-tags';
import { db } from './client';
import { noteTags } from '@/drizzle/schema';

// Drizzle ORM 모킹
vi.mock('./client', () => ({
  db: {
    insert: vi.fn(),
    select: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('Note Tags CRUD Functions', () => {
  const mockNoteId = 'note-123';
  const mockUserId = 'user-456';
  const mockTags = ['태그1', '태그2', '태그3'];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('createNoteTags', () => {
    it('should create multiple tags successfully', async () => {
      const mockReturnedTags = mockTags.map((tag, index) => ({
        id: `tag-${index}`,
        noteId: mockNoteId,
        tag: tag.trim(),
      }));

      const mockInsert = {
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue(mockReturnedTags),
      };
      (db.insert as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockInsert);

      const result = await createNoteTags(mockNoteId, mockTags);

      expect(db.insert).toHaveBeenCalledWith(noteTags);
      expect(mockInsert.values).toHaveBeenCalledWith(
        mockTags.map(tag => ({
          noteId: mockNoteId,
          tag: tag.trim(),
        }))
      );
      expect(result).toEqual(mockReturnedTags);
    });

    it('should trim whitespace from tags', async () => {
      const tagsWithWhitespace = ['  태그1  ', '\t태그2\n', '태그3 '];
      const mockReturnedTags = tagsWithWhitespace.map((tag, index) => ({
        id: `tag-${index}`,
        noteId: mockNoteId,
        tag: tag.trim(),
      }));

      const mockInsert = {
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue(mockReturnedTags),
      };
      (db.insert as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockInsert);

      const result = await createNoteTags(mockNoteId, tagsWithWhitespace);

      expect(mockInsert.values).toHaveBeenCalledWith([
        { noteId: mockNoteId, tag: '태그1' },
        { noteId: mockNoteId, tag: '태그2' },
        { noteId: mockNoteId, tag: '태그3' },
      ]);
      expect(result).toEqual(mockReturnedTags);
    });
  });

  describe('getTagsByNoteId', () => {
    it('should return tags for authorized user', async () => {
      const mockResult = [
        { tag: '태그1' },
        { tag: '태그2' },
        { tag: '태그3' },
      ];

      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(mockResult),
      };
      (db.select as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockSelect);

      const result = await getTagsByNoteId(mockNoteId, mockUserId);

      expect(db.select).toHaveBeenCalledWith({
        tag: noteTags.tag,
      });
      expect(mockSelect.from).toHaveBeenCalledWith(noteTags);
      expect(mockSelect.innerJoin).toHaveBeenCalled();
      expect(mockSelect.where).toHaveBeenCalled();
      expect(result).toEqual(['태그1', '태그2', '태그3']);
    });

    it('should return empty array for unauthorized user', async () => {
      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([]),
      };
      (db.select as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockSelect);

      const result = await getTagsByNoteId(mockNoteId, 'unauthorized-user');

      expect(result).toEqual([]);
    });
  });

  describe('deleteTagsByNoteId', () => {
    it('should delete tags for authorized user', async () => {
      const mockNote = [{ id: mockNoteId, userId: mockUserId }];
      const mockDeletedTags = [
        { id: 'tag-1', noteId: mockNoteId, tag: '태그1' },
        { id: 'tag-2', noteId: mockNoteId, tag: '태그2' },
      ];

      // 노트 권한 확인 모킹
      const mockSelectNote = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue(mockNote),
      };
      (db.select as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockSelectNote);

      // 태그 삭제 모킹
      const mockDelete = {
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue(mockDeletedTags),
      };
      (db.delete as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockDelete);

      const result = await deleteTagsByNoteId(mockNoteId, mockUserId);

      expect(db.select).toHaveBeenCalled();
      expect(db.delete).toHaveBeenCalledWith(noteTags);
      expect(mockDelete.where).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return false for unauthorized user', async () => {
      const mockSelectNote = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]), // 권한 없는 사용자
      };
      (db.select as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockSelectNote);

      const result = await deleteTagsByNoteId(mockNoteId, 'unauthorized-user');

      expect(db.select).toHaveBeenCalled();
      expect(db.delete).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it('should return false when no tags to delete', async () => {
      const mockNote = [{ id: mockNoteId, userId: mockUserId }];

      const mockSelectNote = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue(mockNote),
      };
      (db.select as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockSelectNote);

      const mockDelete = {
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([]), // 삭제할 태그 없음
      };
      (db.delete as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockDelete);

      const result = await deleteTagsByNoteId(mockNoteId, mockUserId);

      expect(result).toBe(false);
    });
  });
});
