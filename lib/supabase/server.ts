// lib/supabase/server.ts
// Supabase 서버 사이드 클라이언트 (Server Components, Server Actions용)
// 서버에서 안전하게 Supabase Auth 및 데이터 접근
// 관련 파일: lib/supabase/client.ts, app/auth/actions.ts

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * 서버 컴포넌트/Server Actions용 Supabase 클라이언트 생성
 * 쿠키 기반 세션 관리
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component에서는 쿠키 설정이 제한될 수 있음
            // Middleware나 Server Actions에서 호출 시 작동
          }
        },
      },
    }
  )
}

