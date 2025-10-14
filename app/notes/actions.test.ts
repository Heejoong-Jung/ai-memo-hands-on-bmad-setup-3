// app/notes/actions.test.ts
// 노트 관련 Server Actions 테스트
// createNoteAction, getNotesAction의 유효성 검증 및 인증 확인 테스트
// 관련 파일: app/notes/actions.ts, lib/db/notes.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createNoteAction, getNotesAction } from './actions';

// 모킹 설정
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

vi.mock('@/lib/db/notes', () => ({
  createNote: vi.fn(),
  getNotesByUserIdPaginated: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

describe('createNoteAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('인증되지 않은 사용자는 노트를 생성할 수 없다', async () => {
    const { createClient } = await import('@/lib/supabase/server');
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
          error: new Error('Not authenticated'),
        }),
      },
    } as any);

    const formData = new FormData();
    formData.append('title', '테스트 제목');
    formData.append('content', '테스트 내용');

    const result = await createNoteAction(formData);

    expect(result).toEqual({ error: '로그인이 필요합니다.' });
  });

  it('제목이 비어있으면 에러를 반환한다', async () => {
    const { createClient } = await import('@/lib/supabase/server');
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-123' } },
          error: null,
        }),
      },
    } as any);

    const formData = new FormData();
    formData.append('title', '   '); // 빈 공백
    formData.append('content', '테스트 내용');

    const result = await createNoteAction(formData);

    expect(result).toEqual({ error: '제목과 본문은 필수 입력 사항입니다.' });
  });

  it('본문이 비어있으면 에러를 반환한다', async () => {
    const { createClient } = await import('@/lib/supabase/server');
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-123' } },
          error: null,
        }),
      },
    } as any);

    const formData = new FormData();
    formData.append('title', '테스트 제목');
    formData.append('content', '');

    const result = await createNoteAction(formData);

    expect(result).toEqual({ error: '제목과 본문은 필수 입력 사항입니다.' });
  });

  it('제목이 200자를 초과하면 에러를 반환한다', async () => {
    const { createClient } = await import('@/lib/supabase/server');
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-123' } },
          error: null,
        }),
      },
    } as any);

    const longTitle = 'a'.repeat(201);
    const formData = new FormData();
    formData.append('title', longTitle);
    formData.append('content', '테스트 내용');

    const result = await createNoteAction(formData);

    expect(result).toEqual({ error: '제목은 최대 200자까지 입력 가능합니다.' });
  });

  it('본문이 50,000자를 초과하면 에러를 반환한다', async () => {
    const { createClient } = await import('@/lib/supabase/server');
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-123' } },
          error: null,
        }),
      },
    } as any);

    const longContent = 'a'.repeat(50001);
    const formData = new FormData();
    formData.append('title', '테스트 제목');
    formData.append('content', longContent);

    const result = await createNoteAction(formData);

    expect(result).toEqual({ error: '본문은 최대 50,000자까지 입력 가능합니다.' });
  });

  it('유효한 데이터로 노트를 생성하면 리다이렉트한다', async () => {
    const { createClient } = await import('@/lib/supabase/server');
    const { createNote } = await import('@/lib/db/notes');
    const { redirect } = await import('next/navigation');

    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-123' } },
          error: null,
        }),
      },
    } as any);

    vi.mocked(createNote).mockResolvedValue({
      id: 'note-123',
      userId: 'user-123',
      title: '테스트 제목',
      content: '테스트 내용',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const formData = new FormData();
    formData.append('title', '테스트 제목');
    formData.append('content', '테스트 내용');

    try {
      await createNoteAction(formData);
    } catch (error) {
      // redirect()는 NEXT_REDIRECT 에러를 던지므로 예상된 동작
    }

    expect(createNote).toHaveBeenCalledWith('user-123', '테스트 제목', '테스트 내용');
    expect(redirect).toHaveBeenCalledWith('/notes');
  });

  it('데이터베이스 에러 발생 시 에러 메시지를 반환한다', async () => {
    const { createClient } = await import('@/lib/supabase/server');
    const { createNote } = await import('@/lib/db/notes');

    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-123' } },
          error: null,
        }),
      },
    } as any);

    vi.mocked(createNote).mockRejectedValue(new Error('Database error'));

    const formData = new FormData();
    formData.append('title', '테스트 제목');
    formData.append('content', '테스트 내용');

    const result = await createNoteAction(formData);

    expect(result).toEqual({ error: '노트 저장 중 오류가 발생했습니다.' });
  });
});

describe('getNotesAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('인증되지 않은 사용자는 노트 목록을 조회할 수 없다', async () => {
    const { createClient } = await import('@/lib/supabase/server');
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
          error: new Error('Not authenticated'),
        }),
      },
    } as any);

    const result = await getNotesAction(1, 20);

    expect(result).toEqual({
      notes: [],
      total: 0,
      error: '로그인이 필요합니다.',
    });
  });

  it('정상적으로 노트 목록을 조회한다 (페이지 1)', async () => {
    const { createClient } = await import('@/lib/supabase/server');
    const { getNotesByUserIdPaginated } = await import('@/lib/db/notes');

    const mockNotes = [
      {
        id: 'note-1',
        userId: 'user-123',
        title: '노트 1',
        content: '내용 1',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
      {
        id: 'note-2',
        userId: 'user-123',
        title: '노트 2',
        content: '내용 2',
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-02'),
      },
    ];

    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-123' } },
          error: null,
        }),
      },
    } as any);

    vi.mocked(getNotesByUserIdPaginated).mockResolvedValue({
      notes: mockNotes,
      total: 25,
    });

    const result = await getNotesAction(1, 20);

    expect(result).toEqual({
      notes: mockNotes,
      total: 25,
    });
    expect(getNotesByUserIdPaginated).toHaveBeenCalledWith('user-123', 1, 20);
  });

  it('빈 목록을 반환한다 (노트가 없는 경우)', async () => {
    const { createClient } = await import('@/lib/supabase/server');
    const { getNotesByUserIdPaginated } = await import('@/lib/db/notes');

    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-123' } },
          error: null,
        }),
      },
    } as any);

    vi.mocked(getNotesByUserIdPaginated).mockResolvedValue({
      notes: [],
      total: 0,
    });

    const result = await getNotesAction(1, 20);

    expect(result).toEqual({
      notes: [],
      total: 0,
    });
  });

  it('페이지 2를 조회한다 (OFFSET 적용)', async () => {
    const { createClient } = await import('@/lib/supabase/server');
    const { getNotesByUserIdPaginated } = await import('@/lib/db/notes');

    const mockNotes = [
      {
        id: 'note-21',
        userId: 'user-123',
        title: '노트 21',
        content: '내용 21',
        createdAt: new Date('2024-01-21'),
        updatedAt: new Date('2024-01-21'),
      },
    ];

    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-123' } },
          error: null,
        }),
      },
    } as any);

    vi.mocked(getNotesByUserIdPaginated).mockResolvedValue({
      notes: mockNotes,
      total: 25,
    });

    const result = await getNotesAction(2, 20);

    expect(result).toEqual({
      notes: mockNotes,
      total: 25,
    });
    expect(getNotesByUserIdPaginated).toHaveBeenCalledWith('user-123', 2, 20);
  });

  it('데이터베이스 에러 발생 시 에러 메시지를 반환한다', async () => {
    const { createClient } = await import('@/lib/supabase/server');
    const { getNotesByUserIdPaginated } = await import('@/lib/db/notes');

    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-123' } },
          error: null,
        }),
      },
    } as any);

    vi.mocked(getNotesByUserIdPaginated).mockRejectedValue(
      new Error('Database error')
    );

    const result = await getNotesAction(1, 20);

    expect(result).toEqual({
      notes: [],
      total: 0,
      error: '노트를 불러오는 중 오류가 발생했습니다.',
    });
  });
});

