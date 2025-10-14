// app/notes/new/form.test.tsx
// 노트 생성 폼 컴포넌트 테스트
// 폼 렌더링, 글자 수 카운터, 버튼 동작 테스트
// 관련 파일: app/notes/new/form.tsx, app/notes/actions.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NewNoteForm from './form';

// 모킹 설정
const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

vi.mock('../actions', () => ({
  createNoteAction: vi.fn(),
}));

describe('NewNoteForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('폼 요소가 정상적으로 렌더링된다', () => {
    render(<NewNoteForm />);

    expect(screen.getByLabelText('제목')).toBeInTheDocument();
    expect(screen.getByLabelText('본문')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '저장' })).toBeInTheDocument();
  });

  it('제목 글자 수 카운터가 작동한다', async () => {
    const user = userEvent.setup();
    render(<NewNoteForm />);

    const titleInput = screen.getByLabelText('제목');

    // 초기 상태
    expect(screen.getByText('0 / 200자')).toBeInTheDocument();

    // 텍스트 입력
    await user.type(titleInput, '테스트 제목');

    await waitFor(() => {
      expect(screen.getByText('6 / 200자')).toBeInTheDocument();
    });
  });

  it('본문 글자 수 카운터가 작동한다', async () => {
    const user = userEvent.setup();
    render(<NewNoteForm />);

    const contentTextarea = screen.getByLabelText('본문');

    // 초기 상태
    expect(screen.getByText('0 / 50,000자')).toBeInTheDocument();

    // 텍스트 입력
    await user.type(contentTextarea, '테스트 본문 내용입니다.');

    await waitFor(() => {
      expect(screen.getByText('13 / 50,000자')).toBeInTheDocument();
    });
  });

  it('제목과 본문이 필수 입력 필드다', () => {
    render(<NewNoteForm />);

    const titleInput = screen.getByLabelText('제목') as HTMLInputElement;
    const contentTextarea = screen.getByLabelText('본문') as HTMLTextAreaElement;

    expect(titleInput.required).toBe(true);
    expect(contentTextarea.required).toBe(true);
  });

  it('제목 최대 길이가 200자로 제한된다', () => {
    render(<NewNoteForm />);

    const titleInput = screen.getByLabelText('제목') as HTMLInputElement;

    expect(titleInput.maxLength).toBe(200);
  });

  it('본문 최대 길이가 50,000자로 제한된다', () => {
    render(<NewNoteForm />);

    const contentTextarea = screen.getByLabelText('본문') as HTMLTextAreaElement;

    expect(contentTextarea.maxLength).toBe(50000);
  });

  it('폼 제출 시 로딩 상태를 표시한다', async () => {
    const user = userEvent.setup();
    const { createNoteAction } = await import('../actions');

    // createNoteAction이 완료되지 않은 상태를 시뮬레이션
    vi.mocked(createNoteAction).mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve(undefined), 1000);
        })
    );

    render(<NewNoteForm />);

    const titleInput = screen.getByLabelText('제목');
    const contentTextarea = screen.getByLabelText('본문');
    const submitButton = screen.getByRole('button', { name: '저장' });

    await user.type(titleInput, '테스트 제목');
    await user.type(contentTextarea, '테스트 본문');
    await user.click(submitButton);

    // 로딩 중 상태 확인
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '저장 중...' })).toBeInTheDocument();
    });
  });

  it('에러 발생 시 에러 메시지를 표시한다', async () => {
    const user = userEvent.setup();
    const { createNoteAction } = await import('../actions');

    vi.mocked(createNoteAction).mockResolvedValue({
      error: '제목과 본문은 필수 입력 사항입니다.',
    });

    render(<NewNoteForm />);

    const titleInput = screen.getByLabelText('제목');
    const contentTextarea = screen.getByLabelText('본문');
    const submitButton = screen.getByRole('button', { name: '저장' });

    await user.type(titleInput, '  '); // 빈 공백
    await user.type(contentTextarea, '테스트 본문');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('제목과 본문은 필수 입력 사항입니다.')).toBeInTheDocument();
    });
  });

  it('취소 버튼 클릭 시 /notes로 이동한다', async () => {
    const user = userEvent.setup();

    render(<NewNoteForm />);

    const cancelButton = screen.getByRole('button', { name: '취소' });
    await user.click(cancelButton);

    expect(mockPush).toHaveBeenCalledWith('/notes');
  });
});

