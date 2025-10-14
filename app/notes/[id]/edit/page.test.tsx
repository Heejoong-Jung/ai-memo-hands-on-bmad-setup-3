// app/notes/[id]/edit/page.test.tsx
// 노트 수정 페이지 컴포넌트 테스트
// 폼 렌더링, 기존 값 pre-filled, 인증 및 권한 테스트
// 관련 파일: app/notes/[id]/edit/page.tsx, app/notes/[id]/edit/form.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import EditNotePage from './page';
import { redirect, notFound } from 'next/navigation';
import * as notesDb from '@/lib/db/notes';

// Mock modules
vi.mock('next/navigation', () => ({
  redirect: vi.fn(() => {
    throw new Error('NEXT_REDIRECT');
  }),
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
  useRouter: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

vi.mock('@/lib/db/notes', () => ({
  getNoteById: vi.fn(),
}));

// Mock EditNoteForm component
vi.mock('./form', () => ({
  default: ({ noteId, initialTitle, initialContent }: any) => (
    <div data-testid="edit-form">
      <input data-testid="note-id" value={noteId} readOnly />
      <input data-testid="initial-title" value={initialTitle} readOnly />
      <textarea data-testid="initial-content" value={initialContent} readOnly />
    </div>
  ),
}));

describe('EditNotePage', () => {
  const mockUser = { id: 'user-123', email: 'test@example.com' };
  const mockNote = {
    id: 'note-123',
    userId: 'user-123',
    title: '기존 노트 제목',
    content: '기존 노트 본문입니다.\n줄바꿈이 있는 내용입니다.',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('로그인하지 않은 사용자는 로그인 페이지로 리다이렉트된다', async () => {
    const { createClient } = await import('@/lib/supabase/server');

    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
          error: null,
        }),
      },
    } as any);

    const params = Promise.resolve({ id: 'note-123' });

    // redirect() throws an error to stop execution
    await expect(EditNotePage({ params })).rejects.toThrow('NEXT_REDIRECT');
    expect(redirect).toHaveBeenCalledWith('/auth/login');
  });

  it('노트가 없으면 notFound를 호출한다', async () => {
    const { createClient } = await import('@/lib/supabase/server');

    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
    } as any);

    vi.mocked(notesDb.getNoteById).mockResolvedValue(null);

    const params = Promise.resolve({ id: 'non-existent' });

    // notFound() throws an error to stop execution
    await expect(EditNotePage({ params })).rejects.toThrow('NEXT_NOT_FOUND');
    expect(notFound).toHaveBeenCalled();
  });

  it('폼이 기존 노트 데이터로 렌더링된다 (pre-filled)', async () => {
    const { createClient } = await import('@/lib/supabase/server');

    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
    } as any);

    vi.mocked(notesDb.getNoteById).mockResolvedValue(mockNote);

    const params = Promise.resolve({ id: 'note-123' });
    const component = await EditNotePage({ params });
    render(component);

    // EditNoteForm이 올바른 props로 렌더링되는지 확인
    expect(screen.getByTestId('edit-form')).toBeDefined();
    expect(screen.getByTestId('note-id')).toHaveProperty('value', 'note-123');
    expect(screen.getByTestId('initial-title')).toHaveProperty('value', '기존 노트 제목');
    expect(screen.getByTestId('initial-content')).toHaveProperty(
      'value',
      '기존 노트 본문입니다.\n줄바꿈이 있는 내용입니다.'
    );
  });

  it('다른 사용자의 노트 수정 시도 시 notFound를 호출한다', async () => {
    const { createClient } = await import('@/lib/supabase/server');

    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
    } as any);

    // getNoteById가 null을 반환 (권한 없음)
    vi.mocked(notesDb.getNoteById).mockResolvedValue(null);

    const params = Promise.resolve({ id: 'other-user-note' });

    // notFound() throws an error to stop execution
    await expect(EditNotePage({ params })).rejects.toThrow('NEXT_NOT_FOUND');
    expect(notesDb.getNoteById).toHaveBeenCalledWith('other-user-note', 'user-123');
    expect(notFound).toHaveBeenCalled();
  });

  it('사용자 스코프로 노트를 조회한다', async () => {
    const { createClient } = await import('@/lib/supabase/server');

    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
    } as any);

    vi.mocked(notesDb.getNoteById).mockResolvedValue(mockNote);

    const params = Promise.resolve({ id: 'note-123' });
    await EditNotePage({ params });

    expect(notesDb.getNoteById).toHaveBeenCalledWith('note-123', 'user-123');
  });
});

