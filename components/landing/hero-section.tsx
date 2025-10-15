// components/landing/hero-section.tsx
// 랜딩 페이지 Hero 섹션 컴포넌트
// 서비스의 핵심 가치와 주요 기능을 한눈에 파악할 수 있는 Hero 섹션
// 관련 파일: app/page.tsx, components/ui/button.tsx, app/globals.css

"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Mic, Sparkles, ArrowRight } from "lucide-react";

export default function HeroSection() {
  return (
    <section 
      className="relative min-h-[80vh] flex items-center justify-center overflow-hidden"
      role="banner"
      aria-label="AI 메모장 서비스 소개"
    >
      {/* 배경 그라데이션 */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900" />
      
      {/* 배경 패턴 */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse" />
        <div className="absolute top-40 right-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000" />
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* 메인 헤드라인 */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight"
          id="main-heading"
        >
          음성으로 메모하고,{" "}
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AI가 정리해드립니다
          </span>
        </motion.h1>

        {/* 서브 헤드라인 */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-lg sm:text-xl lg:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed"
          aria-describedby="main-heading"
        >
          음성 인식으로 빠르게 기록하고, AI가 자동으로 요약과 태그를 생성합니다
        </motion.p>

        {/* CTA 버튼들 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
        >
          <Button
            asChild
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            aria-label="AI 메모장 무료 회원가입"
          >
            <Link href="/auth/signup" className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" aria-hidden="true" />
              무료로 시작하기
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </Link>
          </Button>
          
          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300 transform hover:scale-105"
            aria-label="AI 메모장 데모 시연 보기"
          >
            <Link href="#demo" className="flex items-center gap-2">
              <Mic className="w-5 h-5" aria-hidden="true" />
              데모 보기
            </Link>
          </Button>
        </motion.div>

        {/* 시각적 요소 - 일러스트레이션 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="relative max-w-4xl mx-auto"
          role="img"
          aria-label="AI 메모장 서비스 워크플로우: 음성 입력에서 AI 정리까지"
        >
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              {/* 음성 입력 */}
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4" role="img" aria-label="음성 입력 아이콘">
                  <Mic className="w-8 h-8 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">음성 입력</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">말하기만 하면 자동으로 텍스트 변환</p>
              </div>

              {/* 화살표 */}
              <div className="hidden md:flex justify-center">
                <ArrowRight className="w-8 h-8 text-gray-400" aria-hidden="true" />
              </div>

              {/* AI 처리 */}
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4" role="img" aria-label="AI 정리 아이콘">
                  <Sparkles className="w-8 h-8 text-purple-600 dark:text-purple-400" aria-hidden="true" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">AI 정리</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">자동 요약 및 태그 생성</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 신뢰도 지표 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-gray-500 dark:text-gray-400"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>무료로 시작</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>실시간 변환</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span>AI 자동 정리</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
