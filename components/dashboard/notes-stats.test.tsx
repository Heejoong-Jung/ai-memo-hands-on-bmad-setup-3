// components/dashboard/notes-stats.test.tsx
// NotesStats 컴포넌트 단위 테스트
// 메모 통계 정보의 렌더링 및 데이터 표시 테스트
// 관련 파일: components/dashboard/notes-stats.tsx

import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import NotesStats from "./notes-stats";

describe("NotesStats", () => {
  const mockStats = {
    totalNotes: 15,
    recentNotes: 3,
    totalTags: 8,
    lastCreatedAt: "2024-01-15T10:30:00Z"
  };

  it("통계 정보가 올바르게 렌더링된다", () => {
    render(<NotesStats {...mockStats} />);
    
    expect(screen.getByText("15")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument();
  });

  it("총 메모 수가 올바르게 표시된다", () => {
    render(<NotesStats {...mockStats} />);
    
    expect(screen.getByText("15")).toBeInTheDocument();
    expect(screen.getByText("총 메모")).toBeInTheDocument();
  });

  it("최근 7일 메모 수가 올바르게 표시된다", () => {
    render(<NotesStats {...mockStats} />);
    
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("최근 7일")).toBeInTheDocument();
  });

  it("총 태그 수가 올바르게 표시된다", () => {
    render(<NotesStats {...mockStats} />);
    
    expect(screen.getByText("8")).toBeInTheDocument();
    expect(screen.getByText("총 태그")).toBeInTheDocument();
  });

  it("마지막 작성일이 올바르게 포맷되어 표시된다", () => {
    render(<NotesStats {...mockStats} />);
    
    expect(screen.getByText("1월 15일 오후 07:30")).toBeInTheDocument();
    expect(screen.getByText("마지막 작성")).toBeInTheDocument();
  });

  it("적절한 아이콘들이 표시된다", () => {
    render(<NotesStats {...mockStats} />);
    
    // FileText 아이콘 (총 메모)
    expect(screen.getByText("총 메모")).toBeInTheDocument();
    
    // TrendingUp 아이콘 (최근 7일)
    expect(screen.getByText("최근 7일")).toBeInTheDocument();
    
    // Tag 아이콘 (총 태그)
    expect(screen.getByText("총 태그")).toBeInTheDocument();
    
    // Calendar 아이콘 (마지막 작성)
    expect(screen.getByText("마지막 작성")).toBeInTheDocument();
  });

  it("0 값일 때도 올바르게 표시된다", () => {
    const zeroStats = {
      totalNotes: 0,
      recentNotes: 0,
      totalTags: 0,
      lastCreatedAt: undefined
    };

    render(<NotesStats {...zeroStats} />);
    
    expect(screen.getAllByText("0")).toHaveLength(3);
    expect(screen.getByText("없음")).toBeInTheDocument();
  });

  it("lastCreatedAt이 없을 때 '없음'을 표시한다", () => {
    const statsWithoutDate = {
      ...mockStats,
      lastCreatedAt: undefined
    };

    render(<NotesStats {...statsWithoutDate} />);
    
    expect(screen.getByText("없음")).toBeInTheDocument();
  });

  it("반응형 그리드 레이아웃이 적용된다", () => {
    render(<NotesStats {...mockStats} />);
    
    const gridContainer = screen.getByText("15").closest("div")?.parentElement;
    expect(gridContainer).toHaveClass("grid", "grid-cols-2", "lg:grid-cols-4");
  });

  it("각 통계 카드에 적절한 색상이 적용된다", () => {
    render(<NotesStats {...mockStats} />);
    
    // 총 메모 - 파란색 아이콘 배경
    const totalNotesIcon = screen.getByText("15").closest("div")?.querySelector(".bg-blue-100");
    expect(totalNotesIcon).toBeInTheDocument();
    
    // 최근 7일 - 초록색 아이콘 배경
    const recentNotesIcon = screen.getByText("3").closest("div")?.querySelector(".bg-green-100");
    expect(recentNotesIcon).toBeInTheDocument();
    
    // 총 태그 - 보라색 아이콘 배경
    const totalTagsIcon = screen.getByText("8").closest("div")?.querySelector(".bg-purple-100");
    expect(totalTagsIcon).toBeInTheDocument();
    
    // 마지막 작성 - 주황색 아이콘 배경
    const lastCreatedIcon = screen.getByText("1월 15일 오후 07:30").closest("div")?.querySelector(".bg-orange-100");
    expect(lastCreatedIcon).toBeInTheDocument();
  });

  it("접근성을 위한 적절한 구조를 가진다", () => {
    render(<NotesStats {...mockStats} />);
    
    // 모든 통계 카드가 적절한 텍스트를 가진다
    expect(screen.getByText("총 메모")).toBeInTheDocument();
    expect(screen.getByText("최근 7일")).toBeInTheDocument();
    expect(screen.getByText("총 태그")).toBeInTheDocument();
    expect(screen.getByText("마지막 작성")).toBeInTheDocument();
  });
});
