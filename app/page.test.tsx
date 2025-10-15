// app/page.test.tsx
// 메인 페이지 테스트
// 로그인 상태에 따른 다른 UI 렌더링 및 Hero 섹션 통합 테스트
// 관련 파일: app/page.tsx, components/landing/hero-section.tsx

import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

// Supabase 클라이언트 모킹
const mockGetUser = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: mockGetUser,
    },
  })),
}));

// Next.js Image 컴포넌트 모킹
vi.mock("next/image", () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

// Next.js Link 컴포넌트 모킹
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Hero 섹션 컴포넌트 모킹
vi.mock("@/components/landing/hero-section", () => ({
  default: () => <div data-testid="hero-section">Hero Section</div>,
}));

describe("Home Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("로그인된 사용자에게 대시보드를 표시한다", async () => {
    const mockUser = {
      id: "test-user-id",
      email: "test@example.com",
    };

    mockGetUser.mockResolvedValue({
      data: { user: mockUser },
    });

    const Home = (await import("./page")).default;
    const component = await Home();
    render(component);

    expect(screen.getByText("AI 메모장")).toBeInTheDocument();
    expect(screen.getByText(/안녕하세요, test님!/)).toBeInTheDocument();
    expect(screen.getByText("test@example.com")).toBeInTheDocument();
    expect(screen.getByText("새 메모 작성")).toBeInTheDocument();
    expect(screen.getByText("음성 메모")).toBeInTheDocument();
  });

  it("로그인되지 않은 사용자에게 랜딩 페이지를 표시한다", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
    });

    const Home = (await import("./page")).default;
    const component = await Home();
    render(component);

    expect(screen.getByText("AI 메모장")).toBeInTheDocument();
    expect(screen.getByTestId("hero-section")).toBeInTheDocument();
    expect(screen.getByText("로그인")).toBeInTheDocument();
    expect(screen.getByText("회원가입")).toBeInTheDocument();
  });

  it("네비게이션 바가 올바르게 렌더링된다", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
    });

    const Home = (await import("./page")).default;
    const component = await Home();
    render(component);

    const nav = screen.getByRole("navigation");
    expect(nav).toBeInTheDocument();
    expect(nav).toHaveClass("fixed", "top-0", "left-0", "right-0");
  });

  it("로그인/회원가입 링크가 올바른 경로를 가진다", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
    });

    const Home = (await import("./page")).default;
    const component = await Home();
    render(component);

    const loginLink = screen.getByText("로그인").closest("a");
    const signupLink = screen.getByText("회원가입").closest("a");

    expect(loginLink).toHaveAttribute("href", "/auth/login");
    expect(signupLink).toHaveAttribute("href", "/auth/signup");
  });

  it("로그인된 사용자의 메모 링크가 올바른 경로를 가진다", async () => {
    const mockUser = {
      id: "test-user-id",
      email: "test@example.com",
    };

    mockGetUser.mockResolvedValue({
      data: { user: mockUser },
    });

    const Home = (await import("./page")).default;
    const component = await Home();
    render(component);

    const newNoteLink = screen.getByText("새 메모 작성").closest("a");
    const voiceNoteLink = screen.getByText("음성 메모").closest("a");

    expect(newNoteLink).toHaveAttribute("href", "/notes/new");
    expect(voiceNoteLink).toHaveAttribute("href", "/notes/new?mode=voice");
  });
});
