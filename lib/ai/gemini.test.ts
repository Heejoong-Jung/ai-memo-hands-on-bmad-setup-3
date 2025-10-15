// lib/ai/gemini.test.ts
// Gemini API 클라이언트 테스트
// 클라이언트 초기화, 텍스트 생성, 연결 테스트, 에러 핸들링 테스트
// 관련 파일: lib/ai/gemini.ts

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { GoogleGenAI } from '@google/genai';

// 모듈을 모킹하기 전에 타입을 저장
type _MockGoogleGenAI = GoogleGenAI;

// @google/genai 모킹
vi.mock('@google/genai', () => {
  const MockGoogleGenAI = vi.fn().mockImplementation(() => ({
    models: {
      generateContent: vi.fn(),
    },
  }));

  return {
    GoogleGenAI: MockGoogleGenAI,
  };
});

describe('gemini', () => {
  const originalEnv = process.env.GEMINI_API_KEY;

  beforeEach(() => {
    // 환경 변수 설정
    process.env.GEMINI_API_KEY = 'test-api-key';
    vi.clearAllMocks();
  });

  afterEach(() => {
    // 환경 변수 복원
    process.env.GEMINI_API_KEY = originalEnv;
  });

  describe('getGeminiClient', () => {
    it('클라이언트 인스턴스를 반환한다', async () => {
      // 모듈을 동적으로 임포트하여 모킹된 버전 사용
      const { getGeminiClient } = await import('./gemini');
      const client = getGeminiClient();

      expect(client).toBeDefined();
      expect(client).toHaveProperty('models');
    });
  });

  describe('generateText', () => {
    it('텍스트를 성공적으로 생성한다', async () => {
      const mockResponse = {
        text: 'Hello, this is a test response!',
      };

      // GoogleGenAI 모킹
      const { GoogleGenAI } = await import('@google/genai');
      const mockGenerateContent = vi.fn().mockResolvedValue(mockResponse);

      (GoogleGenAI as unknown as ReturnType<typeof vi.fn>).mockImplementation(
        () => ({
          models: {
            generateContent: mockGenerateContent,
          },
        })
      );

      // 모듈을 다시 임포트하여 새로운 모킹 적용
      vi.resetModules();
      process.env.GEMINI_API_KEY = 'test-api-key';
      const { generateText } = await import('./gemini');

      const result = await generateText('Test prompt');

      expect(result).toBe('Hello, this is a test response!');
      expect(mockGenerateContent).toHaveBeenCalledWith({
        model: 'gemini-2.0-flash',
        contents: 'Test prompt',
      });
    });

    it('커스텀 모델을 사용할 수 있다', async () => {
      const mockResponse = {
        text: 'Response from custom model',
      };

      const { GoogleGenAI } = await import('@google/genai');
      const mockGenerateContent = vi.fn().mockResolvedValue(mockResponse);

      (GoogleGenAI as unknown as ReturnType<typeof vi.fn>).mockImplementation(
        () => ({
          models: {
            generateContent: mockGenerateContent,
          },
        })
      );

      vi.resetModules();
      process.env.GEMINI_API_KEY = 'test-api-key';
      const { generateText } = await import('./gemini');

      await generateText('Test prompt', 'gemini-1.5-pro');

      expect(mockGenerateContent).toHaveBeenCalledWith({
        model: 'gemini-1.5-pro',
        contents: 'Test prompt',
      });
    });

    it('빈 응답인 경우 빈 문자열을 반환한다', async () => {
      const mockResponse = {
        text: '',
      };

      const { GoogleGenAI } = await import('@google/genai');
      const mockGenerateContent = vi.fn().mockResolvedValue(mockResponse);

      (GoogleGenAI as unknown as ReturnType<typeof vi.fn>).mockImplementation(
        () => ({
          models: {
            generateContent: mockGenerateContent,
          },
        })
      );

      vi.resetModules();
      process.env.GEMINI_API_KEY = 'test-api-key';
      const { generateText } = await import('./gemini');

      const result = await generateText('Test prompt');

      expect(result).toBe('');
    });

    it('API 에러 발생 시 GeminiError를 throw한다', async () => {
      const { GoogleGenAI } = await import('@google/genai');
      const mockGenerateContent = vi
        .fn()
        .mockRejectedValue(new Error('API error'));

      (GoogleGenAI as unknown as ReturnType<typeof vi.fn>).mockImplementation(
        () => ({
          models: {
            generateContent: mockGenerateContent,
          },
        })
      );

      vi.resetModules();
      process.env.GEMINI_API_KEY = 'test-api-key';
      const { generateText } = await import('./gemini');

      await expect(generateText('Test prompt')).rejects.toThrow();
    });
  });

  describe('testGeminiConnection', () => {
    it('연결 성공 시 true를 반환한다', async () => {
      const mockResponse = {
        text: 'Hello!',
      };

      const { GoogleGenAI } = await import('@google/genai');
      const mockGenerateContent = vi.fn().mockResolvedValue(mockResponse);

      (GoogleGenAI as unknown as ReturnType<typeof vi.fn>).mockImplementation(
        () => ({
          models: {
            generateContent: mockGenerateContent,
          },
        })
      );

      vi.resetModules();
      process.env.GEMINI_API_KEY = 'test-api-key';
      const { testGeminiConnection } = await import('./gemini');

      const result = await testGeminiConnection();

      expect(result).toBe(true);
    });

    it('연결 실패 시 false를 반환한다', async () => {
      const { GoogleGenAI } = await import('@google/genai');
      const mockGenerateContent = vi
        .fn()
        .mockRejectedValue(new Error('Connection failed'));

      (GoogleGenAI as unknown as ReturnType<typeof vi.fn>).mockImplementation(
        () => ({
          models: {
            generateContent: mockGenerateContent,
          },
        })
      );

      vi.resetModules();
      process.env.GEMINI_API_KEY = 'test-api-key';
      const { testGeminiConnection } = await import('./gemini');

      const result = await testGeminiConnection();

      expect(result).toBe(false);
    });

    it('빈 응답인 경우 false를 반환한다', async () => {
      const mockResponse = {
        text: '',
      };

      const { GoogleGenAI } = await import('@google/genai');
      const mockGenerateContent = vi.fn().mockResolvedValue(mockResponse);

      (GoogleGenAI as unknown as ReturnType<typeof vi.fn>).mockImplementation(
        () => ({
          models: {
            generateContent: mockGenerateContent,
          },
        })
      );

      vi.resetModules();
      process.env.GEMINI_API_KEY = 'test-api-key';
      const { testGeminiConnection } = await import('./gemini');

      const result = await testGeminiConnection();

      expect(result).toBe(false);
    });
  });

  describe('에러 핸들링', () => {
    it('InvalidApiKeyError를 올바르게 처리한다', async () => {
      const { GoogleGenAI } = await import('@google/genai');
      const mockGenerateContent = vi
        .fn()
        .mockRejectedValue(new Error('Invalid API key'));

      (GoogleGenAI as unknown as ReturnType<typeof vi.fn>).mockImplementation(
        () => ({
          models: {
            generateContent: mockGenerateContent,
          },
        })
      );

      vi.resetModules();
      process.env.GEMINI_API_KEY = 'test-api-key';
      const { generateText } = await import('./gemini');
      const { InvalidApiKeyError } = await import('./types');

      await expect(generateText('Test')).rejects.toThrow(InvalidApiKeyError);
    });

    it('RateLimitError를 올바르게 처리한다', async () => {
      const { GoogleGenAI } = await import('@google/genai');
      const mockGenerateContent = vi
        .fn()
        .mockRejectedValue(new Error('Rate limit exceeded'));

      (GoogleGenAI as unknown as ReturnType<typeof vi.fn>).mockImplementation(
        () => ({
          models: {
            generateContent: mockGenerateContent,
          },
        })
      );

      vi.resetModules();
      process.env.GEMINI_API_KEY = 'test-api-key';
      const { generateText } = await import('./gemini');
      const { RateLimitError } = await import('./types');

      await expect(generateText('Test')).rejects.toThrow(RateLimitError);
    });

    it('TimeoutError를 올바르게 처리한다', async () => {
      const { GoogleGenAI } = await import('@google/genai');
      const mockGenerateContent = vi
        .fn()
        .mockRejectedValue(new Error('Request timeout'));

      (GoogleGenAI as unknown as ReturnType<typeof vi.fn>).mockImplementation(
        () => ({
          models: {
            generateContent: mockGenerateContent,
          },
        })
      );

      vi.resetModules();
      process.env.GEMINI_API_KEY = 'test-api-key';
      const { generateText } = await import('./gemini');
      const { TimeoutError } = await import('./types');

      await expect(generateText('Test')).rejects.toThrow(TimeoutError);
    });
  });

  describe('generateSummary', () => {
    it('노트 내용을 요약으로 변환한다', async () => {
      const mockResponse = {
        text: '- 포인트 1\n- 포인트 2\n- 포인트 3',
      };

      const { GoogleGenAI } = await import('@google/genai');
      const mockGenerateContent = vi.fn().mockResolvedValue(mockResponse);

      (GoogleGenAI as unknown as ReturnType<typeof vi.fn>).mockImplementation(
        () => ({
          models: {
            generateContent: mockGenerateContent,
          },
        })
      );

      vi.resetModules();
      process.env.GEMINI_API_KEY = 'test-api-key';
      const { generateSummary } = await import('./gemini');

      const noteContent = '오늘은 AI 기술에 대해 공부했다. 특히 Gemini API를 사용하는 방법을 배웠고, 요약 기능을 구현하는 과정이 흥미로웠다.';
      const result = await generateSummary(noteContent);

      expect(result).toBe('- 포인트 1\n- 포인트 2\n- 포인트 3');
      expect(mockGenerateContent).toHaveBeenCalled();
    });

    it('긴 노트 내용은 토큰 제한으로 잘린다', async () => {
      const mockResponse = {
        text: '- 요약 포인트 1\n- 요약 포인트 2',
      };

      const { GoogleGenAI } = await import('@google/genai');
      const mockGenerateContent = vi.fn().mockResolvedValue(mockResponse);

      (GoogleGenAI as unknown as ReturnType<typeof vi.fn>).mockImplementation(
        () => ({
          models: {
            generateContent: mockGenerateContent,
          },
        })
      );

      vi.resetModules();
      process.env.GEMINI_API_KEY = 'test-api-key';
      const { generateSummary } = await import('./gemini');

      // 토큰 제한을 초과하는 긴 텍스트 (약 35,000자)
      const longContent = 'a'.repeat(35000);
      const result = await generateSummary(longContent);

      expect(result).toBe('- 요약 포인트 1\n- 요약 포인트 2');
      // truncateToTokenLimit이 호출되어 텍스트가 잘렸는지 확인
      const callArgs = mockGenerateContent.mock.calls[0][0];
      expect(callArgs.contents.length).toBeLessThan(longContent.length + 200);
    });

    it('요약 생성 실패 시 에러를 throw한다', async () => {
      const { GoogleGenAI } = await import('@google/genai');
      const mockGenerateContent = vi
        .fn()
        .mockRejectedValue(new Error('API error'));

      (GoogleGenAI as unknown as ReturnType<typeof vi.fn>).mockImplementation(
        () => ({
          models: {
            generateContent: mockGenerateContent,
          },
        })
      );

      vi.resetModules();
      process.env.GEMINI_API_KEY = 'test-api-key';
      const { generateSummary } = await import('./gemini');

      await expect(generateSummary('테스트 노트')).rejects.toThrow();
    });

    it('공백이 포함된 응답을 trim 처리한다', async () => {
      const mockResponse = {
        text: '  - 포인트 1\n- 포인트 2  \n',
      };

      const { GoogleGenAI } = await import('@google/genai');
      const mockGenerateContent = vi.fn().mockResolvedValue(mockResponse);

      (GoogleGenAI as unknown as ReturnType<typeof vi.fn>).mockImplementation(
        () => ({
          models: {
            generateContent: mockGenerateContent,
          },
        })
      );

      vi.resetModules();
      process.env.GEMINI_API_KEY = 'test-api-key';
      const { generateSummary } = await import('./gemini');

      const result = await generateSummary('테스트 노트');

      expect(result).toBe('- 포인트 1\n- 포인트 2');
    });

    it('Rate Limit 에러 발생 시 적절히 처리한다', async () => {
      const { GoogleGenAI } = await import('@google/genai');
      const mockGenerateContent = vi
        .fn()
        .mockRejectedValue(new Error('429 Rate limit exceeded'));

      (GoogleGenAI as unknown as ReturnType<typeof vi.fn>).mockImplementation(
        () => ({
          models: {
            generateContent: mockGenerateContent,
          },
        })
      );

      vi.resetModules();
      process.env.GEMINI_API_KEY = 'test-api-key';
      const { generateSummary } = await import('./gemini');
      const { RateLimitError } = await import('./types');

      await expect(generateSummary('테스트')).rejects.toThrow(RateLimitError);
    });
  });

  describe('generateTags', () => {
    it('노트 내용을 태그 배열로 변환한다', async () => {
      const mockResponse = {
        text: 'AI, 기술, 학습, 개발, 프로그래밍, 인공지능',
      };

      const { GoogleGenAI } = await import('@google/genai');
      const mockGenerateContent = vi.fn().mockResolvedValue(mockResponse);

      (GoogleGenAI as unknown as ReturnType<typeof vi.fn>).mockImplementation(
        () => ({
          models: {
            generateContent: mockGenerateContent,
          },
        })
      );

      vi.resetModules();
      process.env.GEMINI_API_KEY = 'test-api-key';
      const { generateTags } = await import('./gemini');

      const noteContent = '오늘은 AI 기술에 대해 공부했다. 특히 Gemini API를 사용하는 방법을 배웠고, 요약 기능을 구현하는 과정이 흥미로웠다.';
      const result = await generateTags(noteContent);

      expect(result).toEqual(['AI', '기술', '학습', '개발', '프로그래밍', '인공지능']);
      expect(mockGenerateContent).toHaveBeenCalled();
    });

    it('긴 노트 내용은 토큰 제한으로 잘린다', async () => {
      const mockResponse = {
        text: '태그1, 태그2, 태그3',
      };

      const { GoogleGenAI } = await import('@google/genai');
      const mockGenerateContent = vi.fn().mockResolvedValue(mockResponse);

      (GoogleGenAI as unknown as ReturnType<typeof vi.fn>).mockImplementation(
        () => ({
          models: {
            generateContent: mockGenerateContent,
          },
        })
      );

      vi.resetModules();
      process.env.GEMINI_API_KEY = 'test-api-key';
      const { generateTags } = await import('./gemini');

      // 토큰 제한을 초과하는 긴 텍스트 (약 35,000자)
      const longContent = 'a'.repeat(35000);
      const result = await generateTags(longContent);

      expect(result).toEqual(['태그1', '태그2', '태그3']);
      // truncateToTokenLimit이 호출되어 텍스트가 잘렸는지 확인
      const callArgs = mockGenerateContent.mock.calls[0][0];
      expect(callArgs.contents.length).toBeLessThan(longContent.length + 200);
    });

    it('태그 파싱 로직을 올바르게 처리한다', async () => {
      const mockResponse = {
        text: '  태그1  ,  태그2  ,  태그3  ,  태그4  ,  태그5  ,  태그6  ,  태그7  ',
      };

      const { GoogleGenAI } = await import('@google/genai');
      const mockGenerateContent = vi.fn().mockResolvedValue(mockResponse);

      (GoogleGenAI as unknown as ReturnType<typeof vi.fn>).mockImplementation(
        () => ({
          models: {
            generateContent: mockGenerateContent,
          },
        })
      );

      vi.resetModules();
      process.env.GEMINI_API_KEY = 'test-api-key';
      const { generateTags } = await import('./gemini');

      const result = await generateTags('테스트 노트');

      // 공백 제거 및 최대 6개 제한 확인
      expect(result).toEqual(['태그1', '태그2', '태그3', '태그4', '태그5', '태그6']);
      expect(result.length).toBe(6);
    });

    it('빈 태그는 필터링된다', async () => {
      const mockResponse = {
        text: '태그1, , 태그2, , 태그3',
      };

      const { GoogleGenAI } = await import('@google/genai');
      const mockGenerateContent = vi.fn().mockResolvedValue(mockResponse);

      (GoogleGenAI as unknown as ReturnType<typeof vi.fn>).mockImplementation(
        () => ({
          models: {
            generateContent: mockGenerateContent,
          },
        })
      );

      vi.resetModules();
      process.env.GEMINI_API_KEY = 'test-api-key';
      const { generateTags } = await import('./gemini');

      const result = await generateTags('테스트 노트');

      expect(result).toEqual(['태그1', '태그2', '태그3']);
    });

    it('태그 생성 실패 시 에러를 throw한다', async () => {
      const { GoogleGenAI } = await import('@google/genai');
      const mockGenerateContent = vi
        .fn()
        .mockRejectedValue(new Error('API error'));

      (GoogleGenAI as unknown as ReturnType<typeof vi.fn>).mockImplementation(
        () => ({
          models: {
            generateContent: mockGenerateContent,
          },
        })
      );

      vi.resetModules();
      process.env.GEMINI_API_KEY = 'test-api-key';
      const { generateTags } = await import('./gemini');

      await expect(generateTags('테스트 노트')).rejects.toThrow();
    });

    it('Rate Limit 에러 발생 시 적절히 처리한다', async () => {
      const { GoogleGenAI } = await import('@google/genai');
      const mockGenerateContent = vi
        .fn()
        .mockRejectedValue(new Error('429 Rate limit exceeded'));

      (GoogleGenAI as unknown as ReturnType<typeof vi.fn>).mockImplementation(
        () => ({
          models: {
            generateContent: mockGenerateContent,
          },
        })
      );

      vi.resetModules();
      process.env.GEMINI_API_KEY = 'test-api-key';
      const { generateTags } = await import('./gemini');
      const { RateLimitError } = await import('./types');

      await expect(generateTags('테스트')).rejects.toThrow(RateLimitError);
    });

    it('Timeout 에러 발생 시 적절히 처리한다', async () => {
      const { GoogleGenAI } = await import('@google/genai');
      const mockGenerateContent = vi
        .fn()
        .mockRejectedValue(new Error('Request timeout'));

      (GoogleGenAI as unknown as ReturnType<typeof vi.fn>).mockImplementation(
        () => ({
          models: {
            generateContent: mockGenerateContent,
          },
        })
      );

      vi.resetModules();
      process.env.GEMINI_API_KEY = 'test-api-key';
      const { generateTags } = await import('./gemini');
      const { TimeoutError } = await import('./types');

      await expect(generateTags('테스트')).rejects.toThrow(TimeoutError);
    });
  });
});

