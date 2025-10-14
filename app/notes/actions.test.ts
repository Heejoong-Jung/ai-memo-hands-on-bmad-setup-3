// app/notes/actions.test.ts
// 노트 관련 Server Actions 테스트
// createNoteAction, getNotesAction, getNoteByIdAction의 유효성 검증 및 인증 확인 테스트
// 관련 파일: app/notes/actions.ts, lib/db/notes.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createNoteAction,
  getNotesAction,
  getNoteByIdAction,
  updateNoteAction,
  softDeleteNoteAction,
  restoreNoteAction,
  hardDeleteNoteAction,
  getDeletedNotesAction,
  generateSummaryAction,
} from './actions';

// 모킹 설정
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

vi.mock('@/lib/db/notes', () => ({
  createNote: vi.fn(),
  getNotesByUserIdPaginated: vi.fn(),
  getNoteById: vi.fn(),
  updateNote: vi.fn(),
  softDeleteNote: vi.fn(),
  restoreNote: vi.fn(),
  hardDeleteNote: vi.fn(),
  getDeletedNotesByUserId: vi.fn(),
}));

vi.mock('@/lib/db/summaries', () => ({
  createSummary: vi.fn(),
  getSummaryByNoteId: vi.fn(),
  deleteSummaryByNoteId: vi.fn(),
}));

vi.mock('@/lib/ai/gemini', () => ({
  generateSummary: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
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
      error: '노트를 불러오는 중 오류가 발생했습니다. 데이터베이스 연결을 확인해주세요.',
    });
  });
});

describe('getNoteByIdAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('인증되지 않은 사용자는 노트를 조회할 수 없다', async () => {
    const { createClient } = await import('@/lib/supabase/server');
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
          error: new Error('Not authenticated'),
        }),
      },
    } as any);

    const result = await getNoteByIdAction('note-123');

    expect(result).toEqual({
      note: null,
      error: '로그인이 필요합니다.',
    });
  });

  it('정상적으로 노트를 조회한다', async () => {
    const { createClient } = await import('@/lib/supabase/server');
    const { getNoteById } = await import('@/lib/db/notes');

    const mockNote = {
      id: 'note-123',
      userId: 'user-123',
      title: '테스트 노트',
      content: '테스트 내용',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    };

    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-123' } },
          error: null,
        }),
      },
    } as any);

    vi.mocked(getNoteById).mockResolvedValue(mockNote);

    const result = await getNoteByIdAction('note-123');

    expect(result).toEqual({ note: mockNote });
    expect(getNoteById).toHaveBeenCalledWith('note-123', 'user-123');
  });

  it('존재하지 않는 노트 조회 시 에러를 반환한다', async () => {
    const { createClient } = await import('@/lib/supabase/server');
    const { getNoteById } = await import('@/lib/db/notes');

    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-123' } },
          error: null,
        }),
      },
    } as any);

    vi.mocked(getNoteById).mockResolvedValue(null);

    const result = await getNoteByIdAction('non-existent');

    expect(result).toEqual({
      note: null,
      error: '노트를 찾을 수 없습니다.',
    });
  });

  it('다른 사용자의 노트 조회 시 에러를 반환한다', async () => {
    const { createClient } = await import('@/lib/supabase/server');
    const { getNoteById } = await import('@/lib/db/notes');

    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-123' } },
          error: null,
        }),
      },
    } as any);

    // 다른 사용자의 노트이므로 null 반환
    vi.mocked(getNoteById).mockResolvedValue(null);

    const result = await getNoteByIdAction('other-user-note');

    expect(result).toEqual({
      note: null,
      error: '노트를 찾을 수 없습니다.',
    });
  });

  it('데이터베이스 에러 발생 시 에러 메시지를 반환한다', async () => {
    const { createClient } = await import('@/lib/supabase/server');
    const { getNoteById } = await import('@/lib/db/notes');

    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-123' } },
          error: null,
        }),
      },
    } as any);

    vi.mocked(getNoteById).mockRejectedValue(new Error('Database error'));

    const result = await getNoteByIdAction('note-123');

    expect(result).toEqual({
      note: null,
      error: '노트를 불러오는 중 오류가 발생했습니다.',
    });
  });
});

describe('updateNoteAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('인증되지 않은 사용자는 노트를 수정할 수 없다', async () => {
    const { createClient } = await import('@/lib/supabase/server');
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
          error: new Error('Not authenticated'),
        }),
      },
    } as any);

    const result = await updateNoteAction('note-123', {
      title: '수정된 제목',
      content: '수정된 내용',
    });

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

    const result = await updateNoteAction('note-123', {
      title: '   ',
      content: '수정된 내용',
    });

    expect(result).toEqual({ error: '제목을 입력해주세요.' });
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
    const result = await updateNoteAction('note-123', {
      title: longTitle,
      content: '수정된 내용',
    });

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
    const result = await updateNoteAction('note-123', {
      title: '수정된 제목',
      content: longContent,
    });

    expect(result).toEqual({ error: '본문은 최대 50,000자까지 입력 가능합니다.' });
  });

  it('정상적으로 노트를 수정한다', async () => {
    const { createClient } = await import('@/lib/supabase/server');
    const { updateNote } = await import('@/lib/db/notes');

    const mockUpdatedNote = {
      id: 'note-123',
      userId: 'user-123',
      title: '수정된 제목',
      content: '수정된 내용',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-02'),
    };

    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-123' } },
          error: null,
        }),
      },
    } as any);

    vi.mocked(updateNote).mockResolvedValue(mockUpdatedNote);

    const result = await updateNoteAction('note-123', {
      title: '수정된 제목',
      content: '수정된 내용',
    });

    expect(result).toEqual({
      success: true,
      note: mockUpdatedNote,
    });
    expect(updateNote).toHaveBeenCalledWith(
      'note-123',
      'user-123',
      '수정된 제목',
      '수정된 내용'
    );
  });

  it('존재하지 않는 노트 수정 시 에러를 반환한다', async () => {
    const { createClient } = await import('@/lib/supabase/server');
    const { updateNote } = await import('@/lib/db/notes');

    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-123' } },
          error: null,
        }),
      },
    } as any);

    vi.mocked(updateNote).mockResolvedValue(null);

    const result = await updateNoteAction('non-existent', {
      title: '수정된 제목',
      content: '수정된 내용',
    });

    expect(result).toEqual({
      error: '노트를 찾을 수 없거나 수정 권한이 없습니다.',
    });
  });

  it('다른 사용자의 노트 수정 시 에러를 반환한다', async () => {
    const { createClient } = await import('@/lib/supabase/server');
    const { updateNote } = await import('@/lib/db/notes');

    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-123' } },
          error: null,
        }),
      },
    } as any);

    // 다른 사용자의 노트이므로 null 반환
    vi.mocked(updateNote).mockResolvedValue(null);

    const result = await updateNoteAction('other-user-note', {
      title: '해킹 시도',
      content: '해킹 내용',
    });

    expect(result).toEqual({
      error: '노트를 찾을 수 없거나 수정 권한이 없습니다.',
    });
  });

  it('데이터베이스 에러 발생 시 에러 메시지를 반환한다', async () => {
    const { createClient } = await import('@/lib/supabase/server');
    const { updateNote } = await import('@/lib/db/notes');

    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-123' } },
          error: null,
        }),
      },
    } as any);

    vi.mocked(updateNote).mockRejectedValue(new Error('Database error'));

    const result = await updateNoteAction('note-123', {
      title: '수정된 제목',
      content: '수정된 내용',
    });

    expect(result).toEqual({
      error: '노트를 수정하는 중 오류가 발생했습니다.',
    });
  });
});

describe('softDeleteNoteAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('인증되지 않은 사용자는 노트를 삭제할 수 없다', async () => {
    const { createClient } = await import('@/lib/supabase/server');
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
          error: new Error('Not authenticated'),
        }),
      },
    } as any);

    const result = await softDeleteNoteAction('note-123');

    expect(result).toEqual({
      error: '로그인이 필요합니다.',
    });
  });

  it('성공적으로 노트를 소프트 삭제한다', async () => {
    const { createClient } = await import('@/lib/supabase/server');
    const { softDeleteNote } = await import('@/lib/db/notes');

    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-123' } },
          error: null,
        }),
      },
    } as any);

    vi.mocked(softDeleteNote).mockResolvedValue({
      id: 'note-123',
      userId: 'user-123',
      title: '테스트',
      content: '내용',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: new Date(),
    });

    const result = await softDeleteNoteAction('note-123');

    expect(result).toEqual({ success: true });
  });

  it('존재하지 않는 노트 삭제 시 에러를 반환한다', async () => {
    const { createClient } = await import('@/lib/supabase/server');
    const { softDeleteNote } = await import('@/lib/db/notes');

    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-123' } },
          error: null,
        }),
      },
    } as any);

    vi.mocked(softDeleteNote).mockResolvedValue(null);

    const result = await softDeleteNoteAction('nonexistent-id');

    expect(result).toEqual({
      error: '노트를 찾을 수 없거나 삭제 권한이 없습니다.',
    });
  });

  it('데이터베이스 에러 발생 시 에러 메시지를 반환한다', async () => {
    const { createClient } = await import('@/lib/supabase/server');
    const { softDeleteNote } = await import('@/lib/db/notes');

    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-123' } },
          error: null,
        }),
      },
    } as any);

    vi.mocked(softDeleteNote).mockRejectedValue(new Error('Database error'));

    const result = await softDeleteNoteAction('note-123');

    expect(result).toEqual({
      error: '노트를 삭제하는 중 오류가 발생했습니다.',
    });
  });
});

describe('restoreNoteAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('인증되지 않은 사용자는 노트를 복구할 수 없다', async () => {
    const { createClient } = await import('@/lib/supabase/server');
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
          error: new Error('Not authenticated'),
        }),
      },
    } as any);

    const result = await restoreNoteAction('note-123');

    expect(result).toEqual({
      error: '로그인이 필요합니다.',
    });
  });

  it('성공적으로 노트를 복구한다', async () => {
    const { createClient } = await import('@/lib/supabase/server');
    const { restoreNote } = await import('@/lib/db/notes');

    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-123' } },
          error: null,
        }),
      },
    } as any);

    vi.mocked(restoreNote).mockResolvedValue({
      id: 'note-123',
      userId: 'user-123',
      title: '테스트',
      content: '내용',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });

    const result = await restoreNoteAction('note-123');

    expect(result).toEqual({ success: true });
  });

  it('존재하지 않는 노트 복구 시 에러를 반환한다', async () => {
    const { createClient } = await import('@/lib/supabase/server');
    const { restoreNote } = await import('@/lib/db/notes');

    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-123' } },
          error: null,
        }),
      },
    } as any);

    vi.mocked(restoreNote).mockResolvedValue(null);

    const result = await restoreNoteAction('nonexistent-id');

    expect(result).toEqual({
      error: '노트를 찾을 수 없거나 복구 권한이 없습니다.',
    });
  });

  it('데이터베이스 에러 발생 시 에러 메시지를 반환한다', async () => {
    const { createClient } = await import('@/lib/supabase/server');
    const { restoreNote } = await import('@/lib/db/notes');

    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-123' } },
          error: null,
        }),
      },
    } as any);

    vi.mocked(restoreNote).mockRejectedValue(new Error('Database error'));

    const result = await restoreNoteAction('note-123');

    expect(result).toEqual({
      error: '노트를 복구하는 중 오류가 발생했습니다.',
    });
  });
});

describe('hardDeleteNoteAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('인증되지 않은 사용자는 노트를 영구 삭제할 수 없다', async () => {
    const { createClient } = await import('@/lib/supabase/server');
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
          error: new Error('Not authenticated'),
        }),
      },
    } as any);

    const result = await hardDeleteNoteAction('note-123');

    expect(result).toEqual({
      error: '로그인이 필요합니다.',
    });
  });

  it('성공적으로 노트를 영구 삭제한다', async () => {
    const { createClient } = await import('@/lib/supabase/server');
    const { hardDeleteNote } = await import('@/lib/db/notes');

    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-123' } },
          error: null,
        }),
      },
    } as any);

    vi.mocked(hardDeleteNote).mockResolvedValue(true);

    const result = await hardDeleteNoteAction('note-123');

    expect(result).toEqual({ success: true });
  });

  it('존재하지 않는 노트 영구 삭제 시 에러를 반환한다', async () => {
    const { createClient } = await import('@/lib/supabase/server');
    const { hardDeleteNote } = await import('@/lib/db/notes');

    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-123' } },
          error: null,
        }),
      },
    } as any);

    vi.mocked(hardDeleteNote).mockResolvedValue(false);

    const result = await hardDeleteNoteAction('nonexistent-id');

    expect(result).toEqual({
      error: '노트를 찾을 수 없거나 삭제 권한이 없습니다.',
    });
  });

  it('데이터베이스 에러 발생 시 에러 메시지를 반환한다', async () => {
    const { createClient } = await import('@/lib/supabase/server');
    const { hardDeleteNote } = await import('@/lib/db/notes');

    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-123' } },
          error: null,
        }),
      },
    } as any);

    vi.mocked(hardDeleteNote).mockRejectedValue(new Error('Database error'));

    const result = await hardDeleteNoteAction('note-123');

    expect(result).toEqual({
      error: '노트를 영구 삭제하는 중 오류가 발생했습니다.',
    });
  });
});

describe('getDeletedNotesAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('인증되지 않은 사용자는 삭제된 노트를 조회할 수 없다', async () => {
    const { createClient } = await import('@/lib/supabase/server');
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
          error: new Error('Not authenticated'),
        }),
      },
    } as any);

    const result = await getDeletedNotesAction();

    expect(result).toEqual({
      notes: [],
      error: '로그인이 필요합니다.',
    });
  });

  it('성공적으로 삭제된 노트 목록을 조회한다', async () => {
    const { createClient } = await import('@/lib/supabase/server');
    const { getDeletedNotesByUserId } = await import('@/lib/db/notes');

    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-123' } },
          error: null,
        }),
      },
    } as any);

    const deletedNotes = [
      {
        id: 'note-1',
        userId: 'user-123',
        title: '삭제된 노트 1',
        content: '내용 1',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: new Date(),
      },
      {
        id: 'note-2',
        userId: 'user-123',
        title: '삭제된 노트 2',
        content: '내용 2',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: new Date(),
      },
    ];

    vi.mocked(getDeletedNotesByUserId).mockResolvedValue(deletedNotes);

    const result = await getDeletedNotesAction();

    expect(result).toEqual({ notes: deletedNotes });
  });

  it('데이터베이스 에러 발생 시 에러 메시지를 반환한다', async () => {
    const { createClient } = await import('@/lib/supabase/server');
    const { getDeletedNotesByUserId } = await import('@/lib/db/notes');

    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-123' } },
          error: null,
        }),
      },
    } as any);

    vi.mocked(getDeletedNotesByUserId).mockRejectedValue(new Error('Database error'));

    const result = await getDeletedNotesAction();

    expect(result).toEqual({
      notes: [],
      error: '삭제된 노트를 불러오는 중 오류가 발생했습니다.',
    });
  });
});

describe('generateSummaryAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('인증되지 않은 사용자는 요약을 생성할 수 없다', async () => {
    const { createClient } = await import('@/lib/supabase/server');
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
          error: new Error('Not authenticated'),
        }),
      },
    } as any);

    const result = await generateSummaryAction('note-id');

    expect(result).toEqual({ error: '로그인이 필요합니다.' });
  });

  it('존재하지 않는 노트는 요약을 생성할 수 없다', async () => {
    const { createClient } = await import('@/lib/supabase/server');
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-123' } },
          error: null,
        }),
      },
    } as any);

    const { getNoteById } = await import('@/lib/db/notes');
    vi.mocked(getNoteById).mockResolvedValue(null);

    const result = await generateSummaryAction('non-existent-note');

    expect(result).toEqual({
      error: '노트를 찾을 수 없거나 권한이 없습니다.',
    });
  });

  it('요약을 성공적으로 생성한다', async () => {
    const { createClient } = await import('@/lib/supabase/server');
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-123' } },
          error: null,
        }),
      },
    } as any);

    const mockNote = {
      id: 'note-123',
      userId: 'user-123',
      title: '테스트 노트',
      content: '오늘 배운 내용을 정리한다.',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    const { getNoteById } = await import('@/lib/db/notes');
    vi.mocked(getNoteById).mockResolvedValue(mockNote);

    const { deleteSummaryByNoteId } = await import('@/lib/db/summaries');
    vi.mocked(deleteSummaryByNoteId).mockResolvedValue(true);

    const { generateSummary } = await import('@/lib/ai/gemini');
    vi.mocked(generateSummary).mockResolvedValue(
      '- 포인트 1\n- 포인트 2\n- 포인트 3'
    );

    const { createSummary } = await import('@/lib/db/summaries');
    vi.mocked(createSummary).mockResolvedValue({
      id: 'summary-123',
      noteId: 'note-123',
      model: 'gemini-2.0-flash',
      content: '- 포인트 1\n- 포인트 2\n- 포인트 3',
      createdAt: new Date(),
    });

    const result = await generateSummaryAction('note-123');

    expect(result).toEqual({
      success: true,
      summary: '- 포인트 1\n- 포인트 2\n- 포인트 3',
    });
    expect(deleteSummaryByNoteId).toHaveBeenCalledWith('note-123', 'user-123');
    expect(generateSummary).toHaveBeenCalledWith('오늘 배운 내용을 정리한다.');
    expect(createSummary).toHaveBeenCalledWith(
      'note-123',
      'gemini-2.0-flash',
      '- 포인트 1\n- 포인트 2\n- 포인트 3'
    );
  });

  it('Rate Limit 에러 발생 시 적절한 메시지를 반환한다', async () => {
    const { createClient } = await import('@/lib/supabase/server');
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-123' } },
          error: null,
        }),
      },
    } as any);

    const mockNote = {
      id: 'note-123',
      userId: 'user-123',
      title: '테스트 노트',
      content: '테스트 내용',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    const { getNoteById } = await import('@/lib/db/notes');
    vi.mocked(getNoteById).mockResolvedValue(mockNote);

    const { deleteSummaryByNoteId } = await import('@/lib/db/summaries');
    vi.mocked(deleteSummaryByNoteId).mockResolvedValue(true);

    const { RateLimitError } = await import('@/lib/ai/types');
    const { generateSummary } = await import('@/lib/ai/gemini');
    vi.mocked(generateSummary).mockRejectedValue(new RateLimitError());

    const result = await generateSummaryAction('note-123');

    expect(result).toEqual({
      error: 'API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.',
    });
  });

  it('Timeout 에러 발생 시 적절한 메시지를 반환한다', async () => {
    const { createClient } = await import('@/lib/supabase/server');
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-123' } },
          error: null,
        }),
      },
    } as any);

    const mockNote = {
      id: 'note-123',
      userId: 'user-123',
      title: '테스트 노트',
      content: '테스트 내용',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    const { getNoteById } = await import('@/lib/db/notes');
    vi.mocked(getNoteById).mockResolvedValue(mockNote);

    const { deleteSummaryByNoteId } = await import('@/lib/db/summaries');
    vi.mocked(deleteSummaryByNoteId).mockResolvedValue(true);

    const { TimeoutError } = await import('@/lib/ai/types');
    const { generateSummary } = await import('@/lib/ai/gemini');
    vi.mocked(generateSummary).mockRejectedValue(new TimeoutError());

    const result = await generateSummaryAction('note-123');

    expect(result).toEqual({
      error: '요청 시간이 초과되었습니다. 다시 시도해주세요.',
    });
  });

  it('일반 에러 발생 시 기본 에러 메시지를 반환한다', async () => {
    const { createClient } = await import('@/lib/supabase/server');
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-123' } },
          error: null,
        }),
      },
    } as any);

    const mockNote = {
      id: 'note-123',
      userId: 'user-123',
      title: '테스트 노트',
      content: '테스트 내용',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    const { getNoteById } = await import('@/lib/db/notes');
    vi.mocked(getNoteById).mockResolvedValue(mockNote);

    const { deleteSummaryByNoteId } = await import('@/lib/db/summaries');
    vi.mocked(deleteSummaryByNoteId).mockResolvedValue(true);

    const { generateSummary } = await import('@/lib/ai/gemini');
    vi.mocked(generateSummary).mockRejectedValue(new Error('Unknown error'));

    const result = await generateSummaryAction('note-123');

    expect(result).toEqual({
      error: 'AI 요약 생성 중 오류가 발생했습니다.',
    });
  });
});

