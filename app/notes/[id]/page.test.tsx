// app/notes/[id]/page.test.tsx
// 노트 상세 페이지 컴포넌트 테스트
// 노트 렌더링, 액션 버튼, 줄바꿈 보존 테스트
// 관련 파일: app/notes/[id]/page.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import NoteDetailPage from './page';
import { redirect, notFound } from 'next/navigation';
import * as notesDb from '@/lib/db/notes';
import * as summariesDb from '@/lib/db/summaries';
import * as noteTagsDb from '@/lib/db/note-tags';

// Mock modules
vi.mock('next/navigation', () => ({
  redirect: vi.fn(() => {
    throw new Error('NEXT_REDIRECT');
  }),
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    refresh: vi.fn(),
  })),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

vi.mock('@/lib/db/notes', () => ({
  getNoteById: vi.fn(),
}));

vi.mock('@/lib/db/summaries', () => ({
  getSummaryByNoteId: vi.fn(),
}));

vi.mock('@/lib/db/note-tags', () => ({
  getTagsByNoteId: vi.fn(),
}));

// Mock Next.js Link component
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe('NoteDetailPage', () => {
  const mockUser = { id: 'user-123', email: 'test@example.com' };
  const mockNote = {
    id: 'note-123',
    userId: 'user-123',
    title: '테스트 노트 제목',
    content: '테스트 노트 본문입니다.\n줄바꿈이 있는 내용입니다.',
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
    await expect(NoteDetailPage({ params })).rejects.toThrow('NEXT_REDIRECT');
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
    await expect(NoteDetailPage({ params })).rejects.toThrow('NEXT_NOT_FOUND');
    expect(notFound).toHaveBeenCalled();
  });

  it('노트 제목, 본문, 날짜가 올바르게 표시된다', async () => {
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
    vi.mocked(summariesDb.getSummaryByNoteId).mockResolvedValue(null);
    vi.mocked(noteTagsDb.getTagsByNoteId).mockResolvedValue([]);

    const params = Promise.resolve({ id: 'note-123' });
    const component = await NoteDetailPage({ params });
    render(component);

    // 제목 확인
    expect(screen.getByText('테스트 노트 제목')).toBeDefined();

    // 본문 확인
    expect(
      screen.getByText(/테스트 노트 본문입니다.*줄바꿈이 있는 내용입니다/s)
    ).toBeDefined();

    // 날짜 확인
    expect(screen.getByText(/작성일: 2024년 1월 15일/)).toBeDefined();
    expect(screen.getByText(/수정일: 2024년 1월 20일/)).toBeDefined();
  });

  it('목록으로 돌아가기 버튼이 렌더링된다', async () => {
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
    vi.mocked(summariesDb.getSummaryByNoteId).mockResolvedValue(null);
    vi.mocked(noteTagsDb.getTagsByNoteId).mockResolvedValue([]);

    const params = Promise.resolve({ id: 'note-123' });
    const component = await NoteDetailPage({ params });
    render(component);

    expect(screen.getByText('← 목록으로')).toBeDefined();
  });

  it('수정 버튼과 삭제 버튼이 렌더링된다', async () => {
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
    vi.mocked(summariesDb.getSummaryByNoteId).mockResolvedValue(null);
    vi.mocked(noteTagsDb.getTagsByNoteId).mockResolvedValue([]);

    const params = Promise.resolve({ id: 'note-123' });
    const component = await NoteDetailPage({ params });
    render(component);

    // 수정 버튼 확인
    const editButton = screen.getByText('수정');
    expect(editButton).toBeDefined();

    // 삭제 버튼 확인
    const deleteButton = screen.getByText('삭제');
    expect(deleteButton).toBeDefined();
  });

  it('본문의 줄바꿈이 보존된다 (whitespace-pre-wrap)', async () => {
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
    vi.mocked(summariesDb.getSummaryByNoteId).mockResolvedValue(null);
    vi.mocked(noteTagsDb.getTagsByNoteId).mockResolvedValue([]);

    const params = Promise.resolve({ id: 'note-123' });
    const component = await NoteDetailPage({ params });
    const { container } = render(component);

    const contentElement = container.querySelector('.whitespace-pre-wrap');
    expect(contentElement).toBeDefined();
    expect(contentElement?.textContent).toContain('줄바꿈이 있는 내용입니다');
  });

  it('다른 사용자의 노트 접근 시 notFound를 호출한다', async () => {
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
    await expect(NoteDetailPage({ params })).rejects.toThrow('NEXT_NOT_FOUND');
    expect(notesDb.getNoteById).toHaveBeenCalledWith(
      'other-user-note',
      'user-123'
    );
    expect(notFound).toHaveBeenCalled();
  });

  it('태그가 있을 때 태그가 올바르게 표시된다', async () => {
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
    vi.mocked(summariesDb.getSummaryByNoteId).mockResolvedValue(null);
    vi.mocked(noteTagsDb.getTagsByNoteId).mockResolvedValue(['AI', '기술', '학습']);

    const params = Promise.resolve({ id: 'note-123' });
    const component = await NoteDetailPage({ params });
    render(component);

    // 태그 섹션 제목 확인
    expect(screen.getByText('태그')).toBeDefined();
    
    // 태그들 확인
    expect(screen.getByText('#AI')).toBeDefined();
    expect(screen.getByText('#기술')).toBeDefined();
    expect(screen.getByText('#학습')).toBeDefined();
  });

  it('태그가 없을 때 안내 메시지가 표시된다', async () => {
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
    vi.mocked(summariesDb.getSummaryByNoteId).mockResolvedValue(null);
    vi.mocked(noteTagsDb.getTagsByNoteId).mockResolvedValue([]);

    const params = Promise.resolve({ id: 'note-123' });
    const component = await NoteDetailPage({ params });
    render(component);

    // 태그 섹션 제목 확인
    expect(screen.getByText('태그')).toBeDefined();
    
    // 안내 메시지 확인
    expect(screen.getByText(/AI가 노트의 핵심 주제를 분석하여/)).toBeDefined();
  });

  it('AI 태그 생성 버튼이 렌더링된다', async () => {
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
    vi.mocked(summariesDb.getSummaryByNoteId).mockResolvedValue(null);
    vi.mocked(noteTagsDb.getTagsByNoteId).mockResolvedValue([]);

    const params = Promise.resolve({ id: 'note-123' });
    const component = await NoteDetailPage({ params });
    render(component);

    // AI 태그 생성 버튼 확인
    expect(screen.getByText('AI 태그 생성')).toBeDefined();
  });

  it('태그가 있을 때 태그 재생성 버튼이 렌더링된다', async () => {
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
    vi.mocked(summariesDb.getSummaryByNoteId).mockResolvedValue(null);
    vi.mocked(noteTagsDb.getTagsByNoteId).mockResolvedValue(['AI', '기술']);

    const params = Promise.resolve({ id: 'note-123' });
    const component = await NoteDetailPage({ params });
    render(component);

    // 태그 재생성 버튼 확인
    expect(screen.getByText('태그 재생성')).toBeDefined();
  });
});

