// app/test-gemini/page.tsx
// Gemini API 테스트 페이지
// 개발자가 Gemini API를 웹 UI에서 테스트할 수 있는 페이지
// 관련 파일: app/test-gemini/form.tsx, app/test-gemini/actions.ts

import { TestGeminiForm } from './form';
import Link from 'next/link';

export default function TestGeminiPage() {
  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Gemini API 테스트</h1>
            <p className="mt-2 text-gray-600">
              Google Gemini API를 테스트하고 응답을 확인해보세요.
            </p>
          </div>
          <Link
            href="/"
            className="rounded-md bg-gray-100 px-4 py-2 text-sm hover:bg-gray-200"
          >
            홈으로
          </Link>
        </div>
      </div>

      <TestGeminiForm />

      <div className="mt-8 rounded-lg border border-gray-200 bg-gray-50 p-4">
        <h3 className="mb-2 font-semibold text-sm">ℹ️ 안내사항</h3>
        <ul className="space-y-1 text-sm text-gray-600">
          <li>• 이 페이지는 개발/테스트 목적으로 사용됩니다.</li>
          <li>• Gemini API 키가 .env.local에 설정되어 있어야 합니다.</li>
          <li>• 최대 8,000 토큰(약 32,000자)까지 입력할 수 있습니다.</li>
          <li>• 요청은 gemini-2.0-flash 모델을 사용합니다.</li>
          <li>
            • API 호출은 서버에서 처리되므로 API 키가 클라이언트에 노출되지
            않습니다.
          </li>
        </ul>
      </div>
    </div>
  );
}

