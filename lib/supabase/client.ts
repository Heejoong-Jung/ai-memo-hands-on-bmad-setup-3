// lib/supabase/client.ts
// Supabase 클라이언트 사이드 클라이언트 (브라우저용)
// 클라이언트 컴포넌트에서 Supabase Auth 및 데이터 접근
// 관련 파일: lib/supabase/server.ts, app/auth/signup/page.tsx

import { createBrowserClient } from '@supabase/ssr'

/**
 * 브라우저용 Supabase 클라이언트 생성
 * 클라이언트 컴포넌트에서 사용
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

