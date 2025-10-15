// components/landing/features-section.test.tsx
// FeaturesSection 컴포넌트 단위 테스트
// 섹션 렌더링, 그리드 레이아웃, 접근성 테스트
// 관련 파일: components/landing/features-section.tsx, components/landing/feature-card.tsx

import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import FeaturesSection from "./features-section";

// Framer Motion 모킹
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => (
      <div {...props}>{children}</div>
    ),
    h2: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => (
      <h2 {...props}>{children}</h2>
    ),
    p: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => (
      <p {...props}>{children}</p>
    ),
  },
}));

// FeatureCard 컴포넌트 모킹
vi.mock("./feature-card", () => ({
  default: ({ feature, index }: { feature: { title: string; description: string }; index: number }) => (
    <div data-testid={`feature-card-${index}`}>
      <h3>{feature.title}</h3>
      <p>{feature.description}</p>
    </div>
  ),
}));

describe("FeaturesSection", () => {
  it("섹션 제목이 올바르게 렌더링된다", () => {
    render(<FeaturesSection />);
    
    expect(screen.getByText("AI 메모장의")).toBeInTheDocument();
    expect(screen.getByText("핵심 기능")).toBeInTheDocument();
  });

  it("섹션 설명이 올바르게 렌더링된다", () => {
    render(<FeaturesSection />);
    
    expect(screen.getByText(/음성 인식부터 AI 자동 정리까지/)).toBeInTheDocument();
  });

  it("3개의 기능 카드가 렌더링된다", () => {
    render(<FeaturesSection />);
    
    expect(screen.getByTestId("feature-card-0")).toBeInTheDocument();
    expect(screen.getByTestId("feature-card-1")).toBeInTheDocument();
    expect(screen.getByTestId("feature-card-2")).toBeInTheDocument();
  });

  it("접근성을 위한 적절한 HTML 구조를 가진다", () => {
    render(<FeaturesSection />);
    
    // section에 region role과 aria-label이 있는지 확인
    expect(screen.getByRole("region", { name: "AI 메모장 핵심 기능 소개" })).toBeInTheDocument();
    
    // h2 태그가 존재하는지 확인
    expect(screen.getByRole("heading", { level: 2, name: /AI 메모장의 핵심 기능/ })).toBeInTheDocument();
    
    // list role이 있는지 확인
    expect(screen.getByRole("list", { name: "주요 기능 목록" })).toBeInTheDocument();
    
    // listitem들이 있는지 확인
    const listItems = screen.getAllByRole("listitem");
    expect(listItems).toHaveLength(3);
  });

  it("반응형 그리드 클래스가 올바르게 적용된다", () => {
    render(<FeaturesSection />);
    
    const grid = screen.getByRole("list");
    expect(grid).toHaveClass("grid", "grid-cols-1", "md:grid-cols-2", "lg:grid-cols-3");
  });

  it("하단 CTA 텍스트가 렌더링된다", () => {
    render(<FeaturesSection />);
    
    expect(screen.getByText(/지금 시작해서 더 스마트한 메모 작성 경험을 만나보세요/)).toBeInTheDocument();
  });

  it("섹션에 적절한 배경 클래스가 적용된다", () => {
    render(<FeaturesSection />);
    
    const section = screen.getByRole("region");
    expect(section).toHaveClass("bg-white", "dark:bg-gray-900");
  });
});
