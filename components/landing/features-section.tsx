// components/landing/features-section.tsx
// 기능 소개 섹션 메인 컴포넌트
// Hero 섹션 아래에 배치되는 3개 기능 카드 섹션
// 관련 파일: components/landing/feature-card.tsx, lib/data/features.ts

import { features } from "@/lib/data/features";
import FeatureCard from "./feature-card";

export default function FeaturesSection() {
  return (
    <section 
      className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900"
      role="region"
      aria-label="AI 메모장 핵심 기능 소개"
    >
      <div className="max-w-6xl mx-auto">
        {/* 섹션 제목 */}
        <div className="text-center mb-16">
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6"
            id="features-heading"
          >
            AI 메모장의{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              핵심 기능
            </span>
          </h2>
          
          <p
            className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed"
            aria-describedby="features-heading"
          >
            음성 인식부터 AI 자동 정리까지, 메모 작성의 모든 과정을 혁신적으로 개선합니다
          </p>
        </div>

        {/* 기능 카드 그리드 */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12"
          role="list"
          aria-label="주요 기능 목록"
        >
          {features.map((feature, index) => (
            <div
              key={feature.id}
              role="listitem"
            >
              <FeatureCard feature={feature} index={index} />
            </div>
          ))}
        </div>

        {/* 하단 CTA */}
        <div className="text-center mt-16">
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            지금 시작해서 더 스마트한 메모 작성 경험을 만나보세요
          </p>
        </div>
      </div>
    </section>
  );
}
