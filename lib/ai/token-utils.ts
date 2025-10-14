// lib/ai/token-utils.ts
// 토큰 관리 유틸리티 함수 - 8k 토큰 제한 관리
// Gemini API 토큰 제한을 준수하기 위한 헬퍼 함수 모음
// 관련 파일: lib/ai/gemini.ts, app/notes/actions.ts

const MAX_TOKENS = 8000;

/**
 * 텍스트의 토큰 수 추정 (대략 4 chars = 1 token)
 * @param text 추정할 텍스트
 * @returns 추정된 토큰 수
 */
export function estimateTokenCount(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * 텍스트가 토큰 제한을 초과하는지 확인
 * @param text 확인할 텍스트
 * @returns 토큰 제한 초과 여부
 */
export function exceedsTokenLimit(text: string): boolean {
  return estimateTokenCount(text) > MAX_TOKENS;
}

/**
 * 토큰 제한 내로 텍스트 자르기
 * @param text 자를 텍스트
 * @returns 토큰 제한 내로 잘린 텍스트
 */
export function truncateToTokenLimit(text: string): string {
  const estimatedTokens = estimateTokenCount(text);

  if (estimatedTokens <= MAX_TOKENS) {
    return text;
  }

  const maxChars = MAX_TOKENS * 4;
  return text.slice(0, maxChars) + '...';
}

/**
 * 최대 토큰 수 반환 (테스트용)
 */
export function getMaxTokens(): number {
  return MAX_TOKENS;
}

