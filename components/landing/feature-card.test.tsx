// components/landing/feature-card.test.tsx
// FeatureCard 컴포넌트 단위 테스트
// 기능 카드 렌더링, 애니메이션, 접근성 테스트
// 관련 파일: components/landing/feature-card.tsx, lib/data/features.ts

import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import FeatureCard from "./feature-card";
import { features } from "@/lib/data/features";

// Framer Motion 모킹
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => (
      <div {...props}>{children}</div>
    ),
    h3: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => (
      <h3 {...props}>{children}</h3>
    ),
    p: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => (
      <p {...props}>{children}</p>
    ),
  },
}));

describe("FeatureCard", () => {
  const testFeature = features[0]; // 음성 메모 기능

  it("기능 카드가 올바르게 렌더링된다", () => {
    render(<FeatureCard feature={testFeature} index={0} />);
    
    expect(screen.getByText("🎤 음성 메모")).toBeInTheDocument();
    expect(screen.getByText("음성을 텍스트로 실시간 변환하여 빠르게 메모를 작성합니다")).toBeInTheDocument();
  });

  it("아이콘이 올바르게 렌더링된다", () => {
    render(<FeatureCard feature={testFeature} index={0} />);
    
    const iconContainer = screen.getByLabelText("🎤 음성 메모 아이콘");
    expect(iconContainer).toBeInTheDocument();
    expect(iconContainer).toHaveClass("bg-blue-100", "dark:bg-blue-900");
  });

  it("접근성을 위한 적절한 HTML 구조를 가진다", () => {
    render(<FeatureCard feature={testFeature} index={0} />);
    
    // article role과 aria-label 확인
    expect(screen.getByRole("article", { name: "🎤 음성 메모 기능 소개" })).toBeInTheDocument();
    
    // h3 태그가 존재하는지 확인
    expect(screen.getByRole("heading", { level: 3, name: "🎤 음성 메모" })).toBeInTheDocument();
    
    // 아이콘에 aria-hidden이 있는지 확인
    const icon = screen.getByLabelText("🎤 음성 메모 아이콘").querySelector("svg");
    expect(icon).toHaveAttribute("aria-hidden", "true");
  });

  it("모든 기능 카드가 올바르게 렌더링된다", () => {
    features.forEach((feature, index) => {
      const { unmount } = render(<FeatureCard feature={feature} index={index} />);
      
      expect(screen.getByText(feature.title)).toBeInTheDocument();
      expect(screen.getByText(feature.description)).toBeInTheDocument();
      
      unmount();
    });
  });

  it("반응형 클래스가 올바르게 적용된다", () => {
    render(<FeatureCard feature={testFeature} index={0} />);
    
    const card = screen.getByRole("article");
    expect(card).toHaveClass("bg-white", "dark:bg-gray-800", "rounded-2xl", "p-8");
  });

  it("호버 효과를 위한 클래스가 적용된다", () => {
    render(<FeatureCard feature={testFeature} index={0} />);
    
    const card = screen.getByRole("article");
    expect(card).toHaveClass("group", "hover:shadow-2xl", "transition-all", "duration-300");
  });
});
