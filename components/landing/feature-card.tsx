// components/landing/feature-card.tsx
// 기능 소개 섹션의 개별 기능 카드 컴포넌트
// 재사용 가능한 카드 컴포넌트로 설계
// 관련 파일: components/landing/features-section.tsx, lib/data/features.ts

import { motion } from "framer-motion";
import { Feature } from "@/lib/data/features";

interface FeatureCardProps {
  feature: Feature;
  index: number;
}

export default function FeatureCard({ feature, index }: FeatureCardProps) {
  const IconComponent = feature.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ 
        y: -8,
        transition: { duration: 0.2 }
      }}
      className="group relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700"
      role="article"
      aria-label={`${feature.title} 기능 소개`}
    >
      {/* 아이콘 */}
      <motion.div
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
        className={`w-16 h-16 ${feature.bgColor} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
        role="img"
        aria-label={`${feature.title} 아이콘`}
      >
        <IconComponent 
          className={`w-8 h-8 ${feature.color}`}
          aria-hidden="true"
        />
      </motion.div>

      {/* 제목 */}
      <motion.h3
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
        className="text-xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300"
      >
        {feature.title}
      </motion.h3>

      {/* 설명 */}
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: index * 0.1 + 0.4 }}
        className="text-gray-600 dark:text-gray-300 leading-relaxed group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors duration-300"
      >
        {feature.description}
      </motion.p>

      {/* 호버 효과를 위한 배경 그라데이션 */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-purple-50/0 group-hover:from-blue-50/50 group-hover:to-purple-50/50 dark:from-blue-900/0 dark:to-purple-900/0 dark:group-hover:from-blue-900/20 dark:group-hover:to-purple-900/20 rounded-2xl transition-all duration-300 pointer-events-none" />
    </motion.div>
  );
}
