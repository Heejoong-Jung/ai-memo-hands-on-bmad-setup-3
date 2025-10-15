// components/landing/hero-section.test.tsx
// Hero 섹션 컴포넌트 테스트
// 컴포넌트 렌더링, CTA 버튼 클릭, 반응형 레이아웃 테스트
// 관련 파일: components/landing/hero-section.tsx, components/ui/button.tsx

import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import HeroSection from "./hero-section";

// Next.js Link 컴포넌트 모킹
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Framer Motion 모킹
vi.mock("framer-motion", () => ({
  motion: {
    h1: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => <h1 {...props}>{children}</h1>,
    p: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => <p {...props}>{children}</p>,
    div: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => <div {...props}>{children}</div>,
  },
}));

describe("HeroSection", () => {
  it("메인 헤드라인이 올바르게 렌더링된다", () => {
    render(<HeroSection />);
    
    const mainHeading = screen.getByText(/음성으로 메모하고/);
    expect(mainHeading).toBeInTheDocument();
    expect(mainHeading).toHaveClass("text-4xl", "sm:text-5xl", "lg:text-6xl");
  });

  it("서브 헤드라인이 올바르게 렌더링된다", () => {
    render(<HeroSection />);
    
    const subHeading = screen.getByText(/음성 인식으로 빠르게 기록하고/);
    expect(subHeading).toBeInTheDocument();
    expect(subHeading).toHaveClass("text-lg", "sm:text-xl", "lg:text-2xl");
  });

  it("메인 CTA 버튼이 올바르게 렌더링된다", () => {
    render(<HeroSection />);
    
    const mainCTA = screen.getByText("무료로 시작하기");
    expect(mainCTA).toBeInTheDocument();
    expect(mainCTA.closest("a")).toHaveAttribute("href", "/auth/signup");
  });

  it("보조 CTA 버튼이 올바르게 렌더링된다", () => {
    render(<HeroSection />);
    
    const secondaryCTA = screen.getByText("데모 보기");
    expect(secondaryCTA).toBeInTheDocument();
    expect(secondaryCTA.closest("a")).toHaveAttribute("href", "#demo");
  });

  it("시각적 요소들이 올바르게 렌더링된다", () => {
    render(<HeroSection />);
    
    // 음성 입력 섹션
    expect(screen.getByText("음성 입력")).toBeInTheDocument();
    expect(screen.getByText("말하기만 하면 자동으로 텍스트 변환")).toBeInTheDocument();
    
    // AI 처리 섹션
    expect(screen.getByText("AI 정리")).toBeInTheDocument();
    expect(screen.getByText("자동 요약 및 태그 생성")).toBeInTheDocument();
  });

  it("신뢰도 지표들이 올바르게 렌더링된다", () => {
    render(<HeroSection />);
    
    expect(screen.getByText("무료로 시작")).toBeInTheDocument();
    expect(screen.getByText("실시간 변환")).toBeInTheDocument();
    expect(screen.getByText("AI 자동 정리")).toBeInTheDocument();
  });

  it("반응형 클래스가 올바르게 적용된다", () => {
    render(<HeroSection />);
    
    const section = document.querySelector("section");
    expect(section).toHaveClass("min-h-[80vh]");
    
    const mainHeading = screen.getByText(/음성으로 메모하고/);
    expect(mainHeading).toHaveClass("text-4xl", "sm:text-5xl", "lg:text-6xl");
  });

  it("접근성을 위한 적절한 HTML 구조를 가진다", () => {
    render(<HeroSection />);
    
    // h1 태그가 존재하는지 확인
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toBeInTheDocument();
    
    // 링크들이 적절한 href를 가지는지 확인
    const links = screen.getAllByRole("link");
    expect(links.length).toBeGreaterThan(0);
  });
});
