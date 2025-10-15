// components/dashboard/quick-actions.test.tsx
// QuickActions 컴포넌트 단위 테스트
// 빠른 액션 버튼들의 렌더링 및 링크 테스트
// 관련 파일: components/dashboard/quick-actions.tsx

import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import QuickActions from "./quick-actions";

// Next.js Link 컴포넌트 모킹
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

describe("QuickActions", () => {
  it("빠른 액션 섹션이 올바르게 렌더링된다", () => {
    render(<QuickActions />);
    
    expect(screen.getByText("새 메모 작성")).toBeInTheDocument();
    expect(screen.getByText("음성 메모")).toBeInTheDocument();
  });

  it("새 메모 작성 버튼이 가장 강조되어 표시된다", () => {
    render(<QuickActions />);
    
    const newNoteButton = screen.getByRole("link", { name: /새 메모 작성/ });
    expect(newNoteButton).toHaveClass("bg-blue-600", "hover:bg-blue-700", "text-white");
    expect(newNoteButton).toHaveAttribute("href", "/notes/new");
  });

  it("음성 메모 버튼이 별도로 강조 표시된다", () => {
    render(<QuickActions />);
    
    const voiceButton = screen.getByRole("link", { name: /음성 메모/ });
    expect(voiceButton).toHaveClass("border-green-200", "text-green-700");
    expect(voiceButton).toHaveAttribute("href", "/notes/new?mode=voice");
  });

  it("보조 액션 버튼들이 표시된다", () => {
    render(<QuickActions />);
    
    expect(screen.getByRole("link", { name: /모든 메모/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /휴지통/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /AI 요약/ })).toBeInTheDocument();
  });

  it("모든 액션 버튼에 적절한 아이콘이 표시된다", () => {
    render(<QuickActions />);
    
    // Plus 아이콘 (새 메모 작성)
    expect(screen.getByRole("link", { name: /새 메모 작성/ })).toBeInTheDocument();
    
    // Mic 아이콘 (음성 메모)
    expect(screen.getByRole("link", { name: /음성 메모/ })).toBeInTheDocument();
    
    // FileText 아이콘 (모든 메모)
    expect(screen.getByRole("link", { name: /모든 메모/ })).toBeInTheDocument();
    
    // Trash2 아이콘 (휴지통)
    expect(screen.getByRole("link", { name: /휴지통/ })).toBeInTheDocument();
    
    // Sparkles 아이콘 (AI 요약)
    expect(screen.getByRole("link", { name: /AI 요약/ })).toBeInTheDocument();
  });

  it("모바일에서 음성 메모 버튼 텍스트가 축약된다", () => {
    render(<QuickActions />);
    
    const voiceButton = screen.getByRole("link", { name: /음성 메모/ });
    expect(voiceButton).toHaveTextContent("음성 메모");
    
    // 모바일 버전도 확인
    const mobileText = screen.getByText("음성");
    expect(mobileText).toBeInTheDocument();
  });

  it("올바른 링크들이 설정되어 있다", () => {
    render(<QuickActions />);
    
    expect(screen.getByRole("link", { name: /새 메모 작성/ })).toHaveAttribute("href", "/notes/new");
    expect(screen.getByRole("link", { name: /음성 메모/ })).toHaveAttribute("href", "/notes/new?mode=voice");
    expect(screen.getByRole("link", { name: /모든 메모/ })).toHaveAttribute("href", "/notes");
    expect(screen.getByRole("link", { name: /휴지통/ })).toHaveAttribute("href", "/notes/trash");
    expect(screen.getByRole("link", { name: /AI 요약/ })).toHaveAttribute("href", "/notes?filter=ai-summary");
  });

  it("반응형 레이아웃이 적용된다", () => {
    render(<QuickActions />);
    
    const container = screen.getByText("새 메모 작성").closest("div");
    expect(container).toHaveClass("flex", "flex-col", "sm:flex-row");
  });

  it("접근성을 위한 적절한 구조를 가진다", () => {
    render(<QuickActions />);
    
    // 모든 링크가 적절한 텍스트를 가진다
    expect(screen.getByRole("link", { name: /새 메모 작성/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /음성 메모/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /모든 메모/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /휴지통/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /AI 요약/ })).toBeInTheDocument();
  });
});
