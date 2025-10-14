// lib/ai/gemini.ts
// Gemini API 클라이언트 초기화 및 설정 - 서버 전용
// 프로젝트의 AI 요약/태깅 기능의 핵심 인터페이스
// 관련 파일: lib/ai/token-utils.ts, lib/ai/types.ts, app/notes/actions.ts

import { GoogleGenAI } from '@google/genai';
import {
  GeminiError,
  InvalidApiKeyError,
  RateLimitError,
  TimeoutError,
} from './types';

// Gemini API 클라이언트 초기화 (lazy)
let ai: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI {
  if (!ai) {
    // 환경 변수 체크
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY 환경 변수가 설정되지 않았습니다.');
    }

    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
  }
  return ai;
}

/**
 * Gemini 클라이언트 인스턴스 가져오기
 * @returns GoogleGenAI 클라이언트 인스턴스
 */
export function getGeminiClient() {
  return getAIClient();
}

/**
 * 에러를 사용자 친화적인 GeminiError로 변환
 * @param error 원본 에러
 * @returns GeminiError 인스턴스
 */
function handleGeminiError(error: unknown): GeminiError {
  if (error instanceof GeminiError) {
    return error;
  }

  const errorMessage = error instanceof Error ? error.message : String(error);
  const lowerMessage = errorMessage.toLowerCase();

  // API 키 관련 에러
  if (
    lowerMessage.includes('api key') ||
    lowerMessage.includes('invalid_argument') ||
    errorMessage.includes('401')
  ) {
    return new InvalidApiKeyError();
  }

  // Rate limit 에러
  if (
    lowerMessage.includes('quota') ||
    lowerMessage.includes('rate limit') ||
    errorMessage.includes('429')
  ) {
    return new RateLimitError();
  }

  // Timeout 에러
  if (
    lowerMessage.includes('timeout') ||
    lowerMessage.includes('deadline_exceeded')
  ) {
    return new TimeoutError();
  }

  // 기타 에러
  return new GeminiError(errorMessage, 'UNKNOWN_ERROR');
}

/**
 * 재시도 로직을 포함한 비동기 함수 실행
 * @param fn 실행할 함수
 * @param maxRetries 최대 재시도 횟수
 * @param initialDelay 초기 지연 시간 (ms)
 * @returns 함수 실행 결과
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: unknown;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Rate limit 에러인 경우에만 재시도
      const geminiError = handleGeminiError(error);
      if (!(geminiError instanceof RateLimitError)) {
        throw geminiError;
      }

      // 마지막 시도였다면 에러 throw
      if (i === maxRetries - 1) {
        throw geminiError;
      }

      // Exponential backoff
      const delay = initialDelay * Math.pow(2, i);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw handleGeminiError(lastError);
}

/**
 * 텍스트 생성 함수
 * @param prompt 프롬프트 텍스트
 * @param modelName 모델 이름 (기본값: gemini-2.0-flash)
 * @returns 생성된 텍스트
 */
export async function generateText(
  prompt: string,
  modelName: string = 'gemini-2.0-flash'
): Promise<string> {
  try {
    return await withRetry(async () => {
      const client = getAIClient();
      const response = await client.models.generateContent({
        model: modelName,
        contents: prompt,
      });

      return response.text || '';
    });
  } catch (error) {
    console.error('텍스트 생성 실패:', error);
    throw handleGeminiError(error);
  }
}

/**
 * Gemini API 연결 테스트
 * @returns 연결 성공 여부
 */
export async function testGeminiConnection(): Promise<boolean> {
  try {
    const text = await generateText('Hello');
    return text.length > 0;
  } catch (error) {
    console.error('Gemini 연결 테스트 실패:', error);
    return false;
  }
}

