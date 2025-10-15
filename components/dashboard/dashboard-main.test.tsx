// components/dashboard/dashboard-main.test.tsx
// DashboardMain 컴포넌트 단위 테스트
// 대시보드 메인 컴포넌트의 통합 렌더링 테스트
// 관련 파일: components/dashboard/dashboard-main.tsx

import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import DashboardMain from "./dashboard-main";
import { User } from "@supabase/supabase-js";

// 하위 컴포넌트들 모킹
vi.mock("./dashboard-header", () => ({
  default: ({ user }: { user: User }) => (
    <header data-testid="dashboard-header">
      <span>Dashboard Header for {user.email}</span>
    </header>
  ),
}));

vi.mock("./quick-actions", () => ({
  default: () => (
    <div data-testid="quick-actions">
      <span>Quick Actions</span>
    </div>
  ),
}));

vi.mock("./notes-stats", () => ({
  default: ({ totalNotes, recentNotes, totalTags }: { totalNotes: number; recentNotes: number; totalTags: number }) => (
    <div data-testid="notes-stats">
      <span>Stats: {totalNotes} total, {recentNotes} recent, {totalTags} tags</span>
    </div>
  ),
}));

vi.mock("./notes-list", () => ({
  default: ({ notes, isLoading }: { notes: unknown[]; isLoading?: boolean }) => (
    <div data-testid="notes-list">
      <span>Notes List: {notes.length} notes, loading: {isLoading ? 'true' : 'false'}</span>
    </div>
  ),
}));

describe("DashboardMain", () => {
  const mockUser: User = {
    id: "user-123",
    email: "test@example.com",
    user_metadata: {
      full_name: "테스트 사용자"
    },
    app_metadata: {},
    aud: "authenticated",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z"
  } as User;

  const mockNotes = [
    {
      id: "note-1",
      title: "테스트 메모",
      content: "테스트 내용",
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z"
    }
  ];

  const mockStats = {
    totalNotes: 5,
    recentNotes: 2,
    totalTags: 3,
    lastCreatedAt: "2024-01-15T10:30:00Z"
  };

  it("대시보드가 올바르게 렌더링된다", () => {
    render(
      <DashboardMain 
        user={mockUser}
        notes={mockNotes}
        stats={mockStats}
      />
    );
    
    expect(screen.getByTestId("dashboard-header")).toBeInTheDocument();
    expect(screen.getByTestId("quick-actions")).toBeInTheDocument();
    expect(screen.getByTestId("notes-stats")).toBeInTheDocument();
    expect(screen.getByTestId("notes-list")).toBeInTheDocument();
  });

  it("환영 메시지가 사용자 이름과 함께 표시된다", () => {
    render(
      <DashboardMain 
        user={mockUser}
        notes={mockNotes}
        stats={mockStats}
      />
    );
    
    expect(screen.getByText(/안녕하세요, 테스트 사용자님!/)).toBeInTheDocument();
    expect(screen.getByText("오늘도 생산적인 메모 작성하세요.")).toBeInTheDocument();
  });

  it("full_name이 없을 때 이메일의 첫 부분을 사용한다", () => {
    const userWithoutName = {
      ...mockUser,
      user_metadata: {}
    } as User;

    render(
      <DashboardMain 
        user={userWithoutName}
        notes={mockNotes}
        stats={mockStats}
      />
    );
    
    expect(screen.getByText(/안녕하세요, test님!/)).toBeInTheDocument();
  });

  it("통계 데이터가 올바르게 전달된다", () => {
    render(
      <DashboardMain 
        user={mockUser}
        notes={mockNotes}
        stats={mockStats}
      />
    );
    
    expect(screen.getByText("Stats: 5 total, 2 recent, 3 tags")).toBeInTheDocument();
  });

  it("메모 데이터가 올바르게 전달된다", () => {
    render(
      <DashboardMain 
        user={mockUser}
        notes={mockNotes}
        stats={mockStats}
      />
    );
    
    expect(screen.getByText("Notes List: 1 notes, loading: false")).toBeInTheDocument();
  });

  it("로딩 상태가 올바르게 전달된다", () => {
    render(
      <DashboardMain 
        user={mockUser}
        notes={[]}
        stats={mockStats}
        isLoading={true}
      />
    );
    
    expect(screen.getByText("Notes List: 0 notes, loading: true")).toBeInTheDocument();
  });

  it("빈 메모 배열이 올바르게 처리된다", () => {
    render(
      <DashboardMain 
        user={mockUser}
        notes={[]}
        stats={mockStats}
      />
    );
    
    expect(screen.getByText("Notes List: 0 notes, loading: false")).toBeInTheDocument();
  });

  it("접근성을 위한 적절한 구조를 가진다", () => {
    render(
      <DashboardMain 
        user={mockUser}
        notes={mockNotes}
        stats={mockStats}
      />
    );
    
    const main = screen.getByRole("main");
    expect(main).toBeInTheDocument();
    
    const header = screen.getByTestId("dashboard-header");
    expect(header).toBeInTheDocument();
  });

  it("반응형 클래스가 적용된다", () => {
    render(
      <DashboardMain 
        user={mockUser}
        notes={mockNotes}
        stats={mockStats}
      />
    );
    
    const container = screen.getByRole("main").parentElement;
    expect(container).toHaveClass("min-h-screen", "bg-gray-50", "dark:bg-gray-900");
  });

  it("모든 하위 컴포넌트가 올바른 props를 받는다", () => {
    render(
      <DashboardMain 
        user={mockUser}
        notes={mockNotes}
        stats={mockStats}
      />
    );
    
    // DashboardHeader가 user prop을 받는지 확인
    expect(screen.getByText("Dashboard Header for test@example.com")).toBeInTheDocument();
    
    // NotesStats가 올바른 stats를 받는지 확인
    expect(screen.getByText("Stats: 5 total, 2 recent, 3 tags")).toBeInTheDocument();
    
    // NotesList가 올바른 notes와 isLoading을 받는지 확인
    expect(screen.getByText("Notes List: 1 notes, loading: false")).toBeInTheDocument();
  });
});
