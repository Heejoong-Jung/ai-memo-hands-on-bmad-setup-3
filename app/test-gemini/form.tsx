// app/test-gemini/form.tsx
// Gemini API 테스트 폼 (Client Component)
// 프롬프트 입력 및 응답 표시
// 관련 파일: app/test-gemini/page.tsx, app/test-gemini/actions.ts

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { testGeminiAction } from './actions';

export function TestGeminiForm() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [truncated, setTruncated] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResponse('');
    setTruncated(false);
    setIsLoading(true);

    try {
      const result = await testGeminiAction(prompt);

      if (result.success) {
        setResponse(result.response || '');
        setTruncated(result.truncated || false);
      } else {
        setError(result.error || '오류가 발생했습니다.');
      }
    } catch (_err) {
      setError('요청 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 입력 폼 */}
      <Card>
        <CardHeader>
          <CardTitle>프롬프트 입력</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Gemini에게 물어볼 내용을 입력하세요..."
                rows={6}
                disabled={isLoading}
                className="resize-none"
              />
              <p className="mt-2 text-sm text-gray-500">
                {prompt.length} 글자 (최대 32,000자, 약 8,000 토큰)
              </p>
            </div>

            <Button type="submit" disabled={isLoading || !prompt.trim()}>
              {isLoading ? '생성 중...' : 'Gemini에게 질문하기'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* 경고 메시지 */}
      {truncated && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <p className="text-sm text-yellow-800">
              ⚠️ 프롬프트가 토큰 제한(8k)을 초과하여 자동으로 잘렸습니다.
            </p>
          </CardContent>
        </Card>
      )}

      {/* 에러 메시지 */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-sm text-red-800">❌ {error}</p>
          </CardContent>
        </Card>
      )}

      {/* 응답 결과 */}
      {response && (
        <Card>
          <CardHeader>
            <CardTitle>Gemini 응답</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap rounded-lg bg-gray-50 p-4 text-sm">
                {response}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 샘플 프롬프트 */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-sm">💡 샘플 프롬프트</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <button
            type="button"
            onClick={() =>
              setPrompt('Next.js의 App Router와 Pages Router의 차이점을 설명해주세요.')
            }
            className="block w-full rounded-md bg-white px-4 py-2 text-left text-sm hover:bg-gray-100"
            disabled={isLoading}
          >
            Next.js App Router vs Pages Router
          </button>
          <button
            type="button"
            onClick={() =>
              setPrompt(
                '다음 텍스트를 3-5개의 불릿 포인트로 요약해주세요:\n\n인공지능 기술의 발전은 우리 삶의 많은 부분을 변화시키고 있습니다. 특히 자연어 처리 기술은 기계가 인간의 언어를 이해하고 생성할 수 있게 해주는 핵심 기술입니다.'
              )
            }
            className="block w-full rounded-md bg-white px-4 py-2 text-left text-sm hover:bg-gray-100"
            disabled={isLoading}
          >
            텍스트 요약 테스트
          </button>
          <button
            type="button"
            onClick={() =>
              setPrompt(
                '다음 노트의 주제를 나타내는 태그를 최대 6개 생성해주세요:\n\n오늘 팀 회의에서 새로운 프로젝트 기획안을 논의했다. React와 TypeScript를 사용하여 웹 애플리케이션을 개발하기로 결정했으며, 디자인 시스템은 Tailwind CSS를 활용하기로 했다.'
              )
            }
            className="block w-full rounded-md bg-white px-4 py-2 text-left text-sm hover:bg-gray-100"
            disabled={isLoading}
          >
            태그 생성 테스트
          </button>
        </CardContent>
      </Card>
    </div>
  );
}

