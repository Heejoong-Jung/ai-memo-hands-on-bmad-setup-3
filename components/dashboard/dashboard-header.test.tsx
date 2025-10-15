// components/dashboard/dashboard-header.test.tsx
// DashboardHeader 컴포넌트 단위 테스트
// 헤더 렌더링, 사용자 정보 표시, 로그아웃 버튼 테스트
// 관련 파일: components/dashboard/dashboard-header.tsx

import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import DashboardHeader from "./dashboard-header";
import { User } from "@supabase/supabase-js";

// Next.js Image 컴포넌트 모킹
vi.mock("next/image", () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

// Next.js Link 컴포넌트 모킹
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

// Server Action 모킹
vi.mock("@/app/auth/actions", () => ({
  signOut: vi.fn(),
}));

describe("DashboardHeader", () => {
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

  it("헤더가 올바르게 렌더링된다", () => {
    render(<DashboardHeader user={mockUser} />);
    
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByText("AI 메모장")).toBeInTheDocument();
  });

  it("브랜드 로고가 표시된다", () => {
    render(<DashboardHeader user={mockUser} />);
    
    const logo = screen.getByAltText("AI 메모장 로고");
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute("src", "/next.svg");
  });

  it("사용자 정보가 올바르게 표시된다", () => {
    render(<DashboardHeader user={mockUser} />);
    
    expect(screen.getByText("테스트 사용자")).toBeInTheDocument();
    expect(screen.getByText("test@example.com")).toBeInTheDocument();
  });

  it("사용자 아바타가 표시된다", () => {
    render(<DashboardHeader user={mockUser} />);
    
    const avatars = screen.getAllByText("테");
    expect(avatars).toHaveLength(2); // 데스크톱과 모바일 버전
    expect(avatars[0]).toBeInTheDocument();
  });

  it("로그아웃 버튼이 표시된다", () => {
    render(<DashboardHeader user={mockUser} />);
    
    const logoutButton = screen.getByRole("button", { name: /로그아웃/ });
    expect(logoutButton).toBeInTheDocument();
  });

  it("full_name이 없을 때 이메일의 첫 부분을 사용자명으로 표시한다", () => {
    const userWithoutName = {
      ...mockUser,
      user_metadata: {}
    } as User;

    render(<DashboardHeader user={userWithoutName} />);
    
    expect(screen.getByText("test")).toBeInTheDocument();
  });

  it("모바일에서 로고 제목이 숨겨진다", () => {
    render(<DashboardHeader user={mockUser} />);
    
    const title = screen.getByText("AI 메모장");
    expect(title).toHaveClass("hidden", "sm:block");
  });

  it("모바일에서 로그아웃 버튼 텍스트가 변경된다", () => {
    render(<DashboardHeader user={mockUser} />);
    
    const logoutButton = screen.getByRole("button", { name: /로그아웃/ });
    expect(logoutButton).toHaveTextContent("로그아웃");
    
    // 모바일 버전도 확인
    const mobileText = screen.getByText("나가기");
    expect(mobileText).toBeInTheDocument();
  });

  it("접근성을 위한 적절한 HTML 구조를 가진다", () => {
    render(<DashboardHeader user={mockUser} />);
    
    const header = screen.getByRole("banner");
    expect(header).toBeInTheDocument();
    
    const logo = screen.getByAltText("AI 메모장 로고");
    expect(logo).toBeInTheDocument();
  });

  it("반응형 클래스가 올바르게 적용된다", () => {
    render(<DashboardHeader user={mockUser} />);
    
    const header = screen.getByRole("banner");
    expect(header).toHaveClass("sticky", "top-0", "z-40");
  });
});
