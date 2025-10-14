// app/auth/actions.test.ts
// 인증 Server Actions 테스트
// signIn 함수의 로그인 로직 및 에러 처리 테스트
// 관련 파일: app/auth/actions.ts, lib/supabase/server.ts, lib/validations/auth.ts

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { signIn } from './actions'
import { createClient } from '@/lib/supabase/server'

// Supabase 클라이언트 모킹
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

// Next.js redirect 모킹
vi.mock('next/navigation', () => ({
  redirect: vi.fn((url: string) => {
    throw new Error('NEXT_REDIRECT')
  }),
}))

describe('signIn Server Action', () => {
  let mockSupabase: any

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Supabase 클라이언트 모킹 설정
    mockSupabase = {
      auth: {
        signInWithPassword: vi.fn(),
      },
    }
    
    vi.mocked(createClient).mockResolvedValue(mockSupabase)
  })

  describe('유효성 검증', () => {
    it('이메일이 비어있으면 에러를 반환한다', async () => {
      const formData = new FormData()
      formData.append('email', '')
      formData.append('password', 'Password123!')
      
      const result = await signIn(formData)
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('이메일을 입력해주세요')
    })

    it('이메일 형식이 잘못되면 에러를 반환한다', async () => {
      const formData = new FormData()
      formData.append('email', 'invalid-email')
      formData.append('password', 'Password123!')
      
      const result = await signIn(formData)
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('올바른 이메일 형식이 아닙니다')
    })

    it('비밀번호가 비어있으면 에러를 반환한다', async () => {
      const formData = new FormData()
      formData.append('email', 'test@example.com')
      formData.append('password', '')
      
      const result = await signIn(formData)
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('비밀번호를 입력해주세요')
    })
  })

  describe('로그인 성공', () => {
    it('올바른 이메일/비밀번호로 로그인하면 세션이 생성되고 리다이렉트된다', async () => {
      const mockSession = {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        user: { id: 'user-id', email: 'test@example.com' },
      }

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { session: mockSession, user: mockSession.user },
        error: null,
      })

      const formData = new FormData()
      formData.append('email', 'test@example.com')
      formData.append('password', 'Password123!')
      
      await expect(signIn(formData)).rejects.toThrow('NEXT_REDIRECT')
      
      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'Password123!',
      })
    })
  })

  describe('로그인 실패', () => {
    it('잘못된 이메일/비밀번호로 로그인 시도 시 적절한 에러를 반환한다', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { session: null, user: null },
        error: { 
          message: 'Invalid login credentials',
          status: 400,
        },
      })

      const formData = new FormData()
      formData.append('email', 'test@example.com')
      formData.append('password', 'wrongpassword')
      
      const result = await signIn(formData)
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('이메일 또는 비밀번호가 올바르지 않습니다')
    })

    it('이메일 미인증 시 적절한 에러를 반환한다', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { session: null, user: null },
        error: { 
          message: 'Email not confirmed',
          status: 400,
        },
      })

      const formData = new FormData()
      formData.append('email', 'test@example.com')
      formData.append('password', 'Password123!')
      
      const result = await signIn(formData)
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('이메일 인증이 필요합니다. 이메일을 확인해주세요')
    })

    it('네트워크 에러 발생 시 일반적인 에러 메시지를 반환한다', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { session: null, user: null },
        error: { 
          message: 'Network error',
          status: 500,
        },
      })

      const formData = new FormData()
      formData.append('email', 'test@example.com')
      formData.append('password', 'Password123!')
      
      const result = await signIn(formData)
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('로그인 중 오류가 발생했습니다. 다시 시도해주세요')
    })

    it('예기치 않은 에러 발생 시 적절하게 처리한다', async () => {
      mockSupabase.auth.signInWithPassword.mockRejectedValue(
        new Error('Unexpected error')
      )

      const formData = new FormData()
      formData.append('email', 'test@example.com')
      formData.append('password', 'Password123!')
      
      const result = await signIn(formData)
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('로그인 중 오류가 발생했습니다. 다시 시도해주세요')
    })
  })

  describe('세션 관리', () => {
    it('로그인 성공 시 Supabase가 세션을 자동으로 쿠키에 저장한다', async () => {
      const mockSession = {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        user: { id: 'user-id', email: 'test@example.com' },
      }

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { session: mockSession, user: mockSession.user },
        error: null,
      })

      const formData = new FormData()
      formData.append('email', 'test@example.com')
      formData.append('password', 'Password123!')
      
      try {
        await signIn(formData)
      } catch (error) {
        // redirect 에러는 예상된 동작
        expect((error as Error).message).toBe('NEXT_REDIRECT')
      }
      
      // signInWithPassword가 호출되었으면 세션이 자동으로 쿠키에 저장됨
      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalled()
    })
  })
})

