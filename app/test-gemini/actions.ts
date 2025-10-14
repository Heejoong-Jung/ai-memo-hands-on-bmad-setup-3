// app/test-gemini/actions.ts
// Gemini API 테스트 Server Action
// 테스트 페이지에서 Gemini API를 호출하는 서버 액션
// 관련 파일: app/test-gemini/page.tsx, lib/ai/gemini.ts

'use server';

import { generateText } from '@/lib/ai/gemini';
import { truncateToTokenLimit } from '@/lib/ai/token-utils';

export async function testGeminiAction(prompt: string) {
  try {
    // 입력 검증
    if (!prompt || !prompt.trim()) {
      return {
        success: false,
        error: '프롬프트를 입력해주세요.',
      };
    }

    // 토큰 제한 적용
    const truncatedPrompt = truncateToTokenLimit(prompt);

    // Gemini API 호출
    const response = await generateText(truncatedPrompt);

    return {
      success: true,
      response,
      truncated: truncatedPrompt !== prompt,
    };
  } catch (error) {
    console.error('Gemini 테스트 에러:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
    };
  }
}

