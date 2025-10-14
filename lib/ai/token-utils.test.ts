// lib/ai/token-utils.test.ts
// 토큰 관리 유틸리티 테스트
// 토큰 추정, 제한 체크, 텍스트 자르기 함수 테스트
// 관련 파일: lib/ai/token-utils.ts

import { describe, it, expect } from 'vitest';
import {
  estimateTokenCount,
  exceedsTokenLimit,
  truncateToTokenLimit,
  getMaxTokens,
} from './token-utils';

describe('token-utils', () => {
  describe('estimateTokenCount', () => {
    it('빈 문자열은 0 토큰', () => {
      expect(estimateTokenCount('')).toBe(0);
    });

    it('4자는 약 1 토큰', () => {
      expect(estimateTokenCount('test')).toBe(1);
    });

    it('100자는 약 25 토큰', () => {
      const text = 'a'.repeat(100);
      expect(estimateTokenCount(text)).toBe(25);
    });

    it('1000자는 약 250 토큰', () => {
      const text = 'a'.repeat(1000);
      expect(estimateTokenCount(text)).toBe(250);
    });

    it('소수점 이하 올림 처리', () => {
      // 5자 = 1.25 토큰 -> 2 토큰으로 올림
      expect(estimateTokenCount('hello')).toBe(2);
    });
  });

  describe('exceedsTokenLimit', () => {
    it('짧은 텍스트는 제한 초과하지 않음', () => {
      const text = 'a'.repeat(1000); // ~250 토큰
      expect(exceedsTokenLimit(text)).toBe(false);
    });

    it('8000 토큰 이하는 제한 초과하지 않음', () => {
      const text = 'a'.repeat(32000); // 정확히 8000 토큰
      expect(exceedsTokenLimit(text)).toBe(false);
    });

    it('8000 토큰 초과는 제한 초과', () => {
      const text = 'a'.repeat(35000); // ~8750 토큰
      expect(exceedsTokenLimit(text)).toBe(true);
    });

    it('빈 문자열은 제한 초과하지 않음', () => {
      expect(exceedsTokenLimit('')).toBe(false);
    });
  });

  describe('truncateToTokenLimit', () => {
    it('짧은 텍스트는 그대로 반환', () => {
      const text = 'Hello, world!';
      expect(truncateToTokenLimit(text)).toBe(text);
    });

    it('8000 토큰 이하는 그대로 반환', () => {
      const text = 'a'.repeat(32000); // 정확히 8000 토큰
      expect(truncateToTokenLimit(text)).toBe(text);
    });

    it('8000 토큰 초과 시 자르고 ... 추가', () => {
      const text = 'a'.repeat(35000); // ~8750 토큰
      const result = truncateToTokenLimit(text);

      expect(result.length).toBe(32003); // 32000 + '...'
      expect(result.endsWith('...')).toBe(true);
    });

    it('빈 문자열은 그대로 반환', () => {
      expect(truncateToTokenLimit('')).toBe('');
    });

    it('자른 후 원본 텍스트 내용 포함', () => {
      const text = 'Hello, '.repeat(10000); // 긴 텍스트
      const result = truncateToTokenLimit(text);

      expect(result.startsWith('Hello, ')).toBe(true);
      expect(result.endsWith('...')).toBe(true);
    });
  });

  describe('getMaxTokens', () => {
    it('최대 토큰 수는 8000', () => {
      expect(getMaxTokens()).toBe(8000);
    });
  });
});

