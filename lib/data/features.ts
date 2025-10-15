// lib/data/features.ts
// 기능 소개 섹션을 위한 데이터 정의
// 각 기능의 메타데이터와 타입 정의
// 관련 파일: components/landing/features-section.tsx, components/landing/feature-card.tsx

import { Mic, Sparkles, Tag } from "lucide-react";

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
}

export const features: Feature[] = [
  {
    id: "voice-memo",
    title: "🎤 음성 메모",
    description: "음성을 텍스트로 실시간 변환하여 빠르게 메모를 작성합니다",
    icon: Mic,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900",
  },
  {
    id: "ai-summary",
    title: "🤖 AI 요약",
    description: "긴 메모를 3-6개의 핵심 포인트로 자동 요약해드립니다",
    icon: Sparkles,
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-100 dark:bg-green-900",
  },
  {
    id: "auto-tagging",
    title: "🏷️ 자동 태깅",
    description: "메모 내용을 분석하여 최대 6개의 관련 태그를 자동 생성합니다",
    icon: Tag,
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-100 dark:bg-purple-900",
  },
];
