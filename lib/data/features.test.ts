// lib/data/features.test.ts
// 기능 데이터 구조 및 타입 검증 테스트
// features 배열의 데이터 무결성 확인
// 관련 파일: lib/data/features.ts

import { describe, it, expect } from "vitest";
import { features, Feature } from "./features";

describe("Features Data", () => {
  it("features 배열이 3개의 요소를 가진다", () => {
    expect(features).toHaveLength(3);
  });

  it("모든 기능이 올바른 구조를 가진다", () => {
    features.forEach((feature, index) => {
      expect(feature).toHaveProperty("id");
      expect(feature).toHaveProperty("title");
      expect(feature).toHaveProperty("description");
      expect(feature).toHaveProperty("icon");
      expect(feature).toHaveProperty("color");
      expect(feature).toHaveProperty("bgColor");
      
      expect(typeof feature.id).toBe("string");
      expect(typeof feature.title).toBe("string");
      expect(typeof feature.description).toBe("string");
      expect(typeof feature.color).toBe("string");
      expect(typeof feature.bgColor).toBe("string");
      expect(typeof feature.icon).toBe("object");
    });
  });

  it("각 기능의 ID가 고유하다", () => {
    const ids = features.map(feature => feature.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("음성 메모 기능이 올바른 데이터를 가진다", () => {
    const voiceMemoFeature = features.find(f => f.id === "voice-memo");
    expect(voiceMemoFeature).toBeDefined();
    expect(voiceMemoFeature?.title).toBe("🎤 음성 메모");
    expect(voiceMemoFeature?.description).toBe("음성을 텍스트로 실시간 변환하여 빠르게 메모를 작성합니다");
    expect(voiceMemoFeature?.color).toBe("text-blue-600 dark:text-blue-400");
    expect(voiceMemoFeature?.bgColor).toBe("bg-blue-100 dark:bg-blue-900");
  });

  it("AI 요약 기능이 올바른 데이터를 가진다", () => {
    const aiSummaryFeature = features.find(f => f.id === "ai-summary");
    expect(aiSummaryFeature).toBeDefined();
    expect(aiSummaryFeature?.title).toBe("🤖 AI 요약");
    expect(aiSummaryFeature?.description).toBe("긴 메모를 3-6개의 핵심 포인트로 자동 요약해드립니다");
    expect(aiSummaryFeature?.color).toBe("text-green-600 dark:text-green-400");
    expect(aiSummaryFeature?.bgColor).toBe("bg-green-100 dark:bg-green-900");
  });

  it("자동 태깅 기능이 올바른 데이터를 가진다", () => {
    const autoTaggingFeature = features.find(f => f.id === "auto-tagging");
    expect(autoTaggingFeature).toBeDefined();
    expect(autoTaggingFeature?.title).toBe("🏷️ 자동 태깅");
    expect(autoTaggingFeature?.description).toBe("메모 내용을 분석하여 최대 6개의 관련 태그를 자동 생성합니다");
    expect(autoTaggingFeature?.color).toBe("text-purple-600 dark:text-purple-400");
    expect(autoTaggingFeature?.bgColor).toBe("bg-purple-100 dark:bg-purple-900");
  });

  it("모든 기능의 색상이 Tailwind CSS 클래스 형식이다", () => {
    features.forEach(feature => {
      // text-{color}-{shade} 형식 확인
      expect(feature.color).toMatch(/^text-\w+-\d+\s+dark:text-\w+-\d+$/);
      // bg-{color}-{shade} 형식 확인
      expect(feature.bgColor).toMatch(/^bg-\w+-\d+\s+dark:bg-\w+-\d+$/);
    });
  });

  it("Feature 타입이 올바르게 정의되어 있다", () => {
    const testFeature: Feature = {
      id: "test",
      title: "Test Feature",
      description: "Test description",
      icon: () => null,
      color: "text-gray-600 dark:text-gray-400",
      bgColor: "bg-gray-100 dark:bg-gray-900",
    };
    
    expect(testFeature).toBeDefined();
    expect(testFeature.id).toBe("test");
  });
});
