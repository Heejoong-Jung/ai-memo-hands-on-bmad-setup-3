// components/dashboard/notes-list.test.tsx
// NotesList 컴포넌트 단위 테스트
// 메모 목록 렌더링, 빈 상태, 로딩 상태 테스트
// 관련 파일: components/dashboard/notes-list.tsx

import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import NotesList from "./notes-list";

// Next.js Link 컴포넌트 모킹
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

describe("NotesList", () => {
  const mockNotes = [
    {
      id: "note-1",
      title: "첫 번째 메모",
      content: "이것은 첫 번째 메모의 내용입니다. 매우 긴 내용을 포함하고 있어서 미리보기에서 잘려야 합니다.",
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z",
      tags: ["개발", "메모"]
    },
    {
      id: "note-2",
      title: "두 번째 메모",
      content: "두 번째 메모입니다.",
      created_at: "2024-01-14T09:15:00Z",
      updated_at: "2024-01-14T09:15:00Z",
      tags: ["회의", "중요"]
    },
    {
      id: "note-3",
      title: "",
      content: "제목이 없는 메모입니다.",
      created_at: "2024-01-13T14:20:00Z",
      updated_at: "2024-01-13T14:20:00Z"
    }
  ];

  it("메모 목록이 올바르게 렌더링된다", () => {
    render(<NotesList notes={mockNotes} />);
    
    expect(screen.getByText("최근 메모")).toBeInTheDocument();
    expect(screen.getByText("첫 번째 메모")).toBeInTheDocument();
    expect(screen.getByText("두 번째 메모")).toBeInTheDocument();
  });

  it("메모 제목이 링크로 표시된다", () => {
    render(<NotesList notes={mockNotes} />);
    
    const firstNoteLink = screen.getByRole("link", { name: /메모 "첫 번째 메모" 보기/ });
    expect(firstNoteLink).toHaveAttribute("href", "/notes/note-1");
  });

  it("메모 내용이 미리보기로 표시된다", () => {
    render(<NotesList notes={mockNotes} />);
    
    expect(screen.getByText("이것은 첫 번째 메모의 내용입니다. 매우 긴 내용을 포함하고 있어서 미리보기에서 잘려야 합니다.")).toBeInTheDocument();
    expect(screen.getByText("두 번째 메모입니다.")).toBeInTheDocument();
  });

  it("메모 작성일이 올바르게 포맷되어 표시된다", () => {
    render(<NotesList notes={mockNotes} />);
    
    expect(screen.getByText("2024년 1월 15일 오후 07:30")).toBeInTheDocument();
    // 두 번째 메모가 렌더링되는지 확인
    expect(screen.getByText("두 번째 메모")).toBeInTheDocument();
  });

  it("태그가 있는 메모에서 태그가 표시된다", () => {
    render(<NotesList notes={mockNotes} />);
    
    expect(screen.getByText("개발")).toBeInTheDocument();
    expect(screen.getByText("메모")).toBeInTheDocument();
    expect(screen.getByText("회의")).toBeInTheDocument();
    expect(screen.getByText("중요")).toBeInTheDocument();
  });

  it("태그가 3개 이상일 때 +N 표시가 나타난다", () => {
    const notesWithManyTags = [
      {
        ...mockNotes[0],
        tags: ["개발", "메모", "중요", "회의", "프로젝트"]
      }
    ];

    render(<NotesList notes={notesWithManyTags} />);
    
    expect(screen.getByText("개발")).toBeInTheDocument();
    expect(screen.getByText("메모")).toBeInTheDocument();
    expect(screen.getByText("중요")).toBeInTheDocument();
    expect(screen.getByText("+2")).toBeInTheDocument();
  });

  it("제목이 없는 메모에서 '제목 없음'이 표시된다", () => {
    render(<NotesList notes={mockNotes} />);
    
    expect(screen.getByText("제목 없음")).toBeInTheDocument();
  });

  it("'보기' 버튼이 각 메모에 표시된다", () => {
    render(<NotesList notes={mockNotes} />);
    
    const viewButtons = screen.getAllByRole("link", { name: /보기/ });
    expect(viewButtons.length).toBeGreaterThanOrEqual(3);
    
    // 메모별 보기 버튼 확인 (모두 보기 버튼도 포함되어 있을 수 있음)
    const noteViewButtons = viewButtons.filter(button => 
      button.getAttribute("href")?.startsWith("/notes/note-")
    );
    expect(noteViewButtons.length).toBeGreaterThanOrEqual(3);
  });

  it("'모두 보기' 버튼이 표시된다", () => {
    render(<NotesList notes={mockNotes} />);
    
    const viewAllButton = screen.getByRole("link", { name: /모든 메모 보기/ });
    expect(viewAllButton).toHaveAttribute("href", "/notes");
  });

  it("메모가 5개 이상일 때 '더 많은 메모 보기' 버튼이 표시된다", () => {
    const manyNotes = Array.from({ length: 6 }, (_, i) => ({
      id: `note-${i + 1}`,
      title: `메모 ${i + 1}`,
      content: `메모 ${i + 1} 내용`,
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z"
    }));

    render(<NotesList notes={manyNotes} />);
    
    expect(screen.getByRole("link", { name: /더 많은 메모 보기/ })).toBeInTheDocument();
  });

  it("빈 상태일 때 적절한 메시지가 표시된다", () => {
    render(<NotesList notes={[]} />);
    
    expect(screen.getByText("아직 메모가 없습니다")).toBeInTheDocument();
    expect(screen.getByText("첫 번째 메모를 작성해보세요!")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /새 메모 작성하기/ })).toBeInTheDocument();
  });

  it("로딩 상태일 때 스켈레톤이 표시된다", () => {
    render(<NotesList notes={[]} isLoading={true} />);
    
    // 스켈레톤 로딩 애니메이션 확인
    const skeletonElements = document.querySelectorAll(".animate-pulse");
    expect(skeletonElements.length).toBeGreaterThan(0);
  });

  it("접근성을 위한 적절한 구조를 가진다", () => {
    render(<NotesList notes={mockNotes} />);
    
    // 모든 링크가 적절한 텍스트를 가진다
    expect(screen.getByRole("link", { name: /메모 "첫 번째 메모" 보기/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /메모 "두 번째 메모" 보기/ })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /보기/ }).length).toBeGreaterThanOrEqual(3);
  });

  it("반응형 클래스가 적용된다", () => {
    render(<NotesList notes={mockNotes} />);
    
    const container = screen.getByText("최근 메모").closest("div")?.parentElement;
    expect(container).toHaveClass("p-6");
  });
});
