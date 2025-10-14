// lib/ai/types.ts
// AI 관련 TypeScript 타입 정의
// Gemini API 응답 및 에러 타입 정의
// 관련 파일: lib/ai/gemini.ts, lib/ai/token-utils.ts, app/notes/actions.ts

/**
 * Gemini API 에러 기본 클래스
 */
export class GeminiError extends Error {
  constructor(
    message: string,
    public code: string
  ) {
    super(message);
    this.name = 'GeminiError';
  }
}

/**
 * 유효하지 않은 API 키 에러
 */
export class InvalidApiKeyError extends GeminiError {
  constructor() {
    super('유효하지 않은 API 키입니다.', 'INVALID_API_KEY');
  }
}

/**
 * API 요청 한도 초과 에러
 */
export class RateLimitError extends GeminiError {
  constructor() {
    super(
      'API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.',
      'RATE_LIMIT'
    );
  }
}

/**
 * 요청 시간 초과 에러
 */
export class TimeoutError extends GeminiError {
  constructor() {
    super('요청 시간이 초과되었습니다.', 'TIMEOUT');
  }
}

/**
 * Gemini API 응답 타입
 */
export type GeminiResponse = {
  success: boolean;
  data?: string;
  error?: string;
};

