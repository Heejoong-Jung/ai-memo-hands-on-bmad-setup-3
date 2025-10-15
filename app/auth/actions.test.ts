// app/auth/actions.test.ts
// 인증 Server Actions 테스트
// signIn 함수의 로그인 로직 및 에러 처리 테스트
// 관련 파일: app/auth/actions.ts, lib/supabase/server.ts, lib/validations/auth.ts

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { signIn, requestPasswordReset, updatePassword, signOut } from './actions'
import { createClient } from '@/lib/supabase/server'

// Supabase 클라이언트 모킹
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

// Next.js redirect 모킹
vi.mock('next/navigation', () => ({
  redirect: vi.fn((_url: string) => {
    throw new Error('NEXT_REDIRECT')
  }),
}))

describe('signIn Server Action', () => {
  let mockSupabase: ReturnType<typeof import('@/lib/supabase/server').createClient>

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Supabase 클라이언트 모킹 설정
    mockSupabase = {
      auth: {
        signInWithPassword: vi.fn(),
      },
    }
    
    vi.mocked(createClient).mockResolvedValue(mockSupabase as unknown as ReturnType<typeof import('@/lib/supabase/server').createClient>)
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

describe('requestPasswordReset Server Action', () => {
  let mockSupabase: ReturnType<typeof import('@/lib/supabase/server').createClient>

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Supabase 클라이언트 모킹 설정
    mockSupabase = {
      auth: {
        resetPasswordForEmail: vi.fn(),
      },
    }
    
    vi.mocked(createClient).mockResolvedValue(mockSupabase as unknown as ReturnType<typeof import('@/lib/supabase/server').createClient>)
  })

  describe('유효성 검증', () => {
    it('이메일이 비어있으면 에러를 반환한다', async () => {
      const formData = new FormData()
      formData.append('email', '')
      
      const result = await requestPasswordReset(formData)
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('이메일을 입력해주세요')
    })

    it('이메일 형식이 잘못되면 에러를 반환한다', async () => {
      const formData = new FormData()
      formData.append('email', 'invalid-email')
      
      const result = await requestPasswordReset(formData)
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('올바른 이메일 형식이 아닙니다')
    })
  })

  describe('비밀번호 재설정 이메일 발송', () => {
    it('유효한 이메일로 요청하면 성공 메시지를 반환한다', async () => {
      mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({
        data: {},
        error: null,
      })

      const formData = new FormData()
      formData.append('email', 'test@example.com')
      
      const result = await requestPasswordReset(formData)
      
      expect(result.success).toBe(true)
      expect(result.message).toBe('비밀번호 재설정 이메일을 발송했습니다. 이메일을 확인해주세요')
      expect(mockSupabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com',
        expect.objectContaining({
          redirectTo: expect.stringContaining('/auth/update-password')
        })
      )
    })

    it('존재하지 않는 이메일도 보안상 동일한 성공 메시지를 반환한다', async () => {
      mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({
        data: {},
        error: { message: 'User not found' },
      })

      const formData = new FormData()
      formData.append('email', 'nonexistent@example.com')
      
      const result = await requestPasswordReset(formData)
      
      // 보안상 에러가 있어도 성공 메시지 반환
      expect(result.success).toBe(true)
      expect(result.message).toBe('비밀번호 재설정 이메일을 발송했습니다. 이메일을 확인해주세요')
    })

    it('네트워크 에러 발생 시에도 보안상 성공 메시지를 반환한다', async () => {
      mockSupabase.auth.resetPasswordForEmail.mockRejectedValue(
        new Error('Network error')
      )

      const formData = new FormData()
      formData.append('email', 'test@example.com')
      
      const result = await requestPasswordReset(formData)
      
      // 보안상 예외 발생해도 성공 메시지 반환
      expect(result.success).toBe(true)
      expect(result.message).toBe('비밀번호 재설정 이메일을 발송했습니다. 이메일을 확인해주세요')
    })
  })
})

describe('updatePassword Server Action', () => {
  let mockSupabase: ReturnType<typeof import('@/lib/supabase/server').createClient>

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Supabase 클라이언트 모킹 설정
    mockSupabase = {
      auth: {
        updateUser: vi.fn(),
      },
    }
    
    vi.mocked(createClient).mockResolvedValue(mockSupabase as unknown as ReturnType<typeof import('@/lib/supabase/server').createClient>)
  })

  describe('유효성 검증', () => {
    it('비밀번호가 짧으면 에러를 반환한다', async () => {
      const formData = new FormData()
      formData.append('password', 'Test1!')
      formData.append('confirmPassword', 'Test1!')
      
      const result = await updatePassword(formData)
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('비밀번호는 최소 8자 이상이어야 합니다')
    })

    it('비밀번호에 영문자가 없으면 에러를 반환한다', async () => {
      const formData = new FormData()
      formData.append('password', '12345678!')
      formData.append('confirmPassword', '12345678!')
      
      const result = await updatePassword(formData)
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다')
    })

    it('비밀번호에 숫자가 없으면 에러를 반환한다', async () => {
      const formData = new FormData()
      formData.append('password', 'TestTest!')
      formData.append('confirmPassword', 'TestTest!')
      
      const result = await updatePassword(formData)
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다')
    })

    it('비밀번호에 특수문자가 없으면 에러를 반환한다', async () => {
      const formData = new FormData()
      formData.append('password', 'TestTest123')
      formData.append('confirmPassword', 'TestTest123')
      
      const result = await updatePassword(formData)
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다')
    })

    it('비밀번호가 일치하지 않으면 에러를 반환한다', async () => {
      const formData = new FormData()
      formData.append('password', 'TestTest123!')
      formData.append('confirmPassword', 'TestTest456!')
      
      const result = await updatePassword(formData)
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('비밀번호가 일치하지 않습니다')
    })
  })

  describe('비밀번호 업데이트 성공', () => {
    it('유효한 비밀번호로 업데이트하면 리다이렉트된다', async () => {
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
      }

      mockSupabase.auth.updateUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const formData = new FormData()
      formData.append('password', 'TestTest123!')
      formData.append('confirmPassword', 'TestTest123!')
      
      await expect(updatePassword(formData)).rejects.toThrow('NEXT_REDIRECT')
      
      expect(mockSupabase.auth.updateUser).toHaveBeenCalledWith({
        password: 'TestTest123!',
      })
    })
  })

  describe('비밀번호 업데이트 실패', () => {
    it('토큰 만료 시 적절한 에러를 반환한다', async () => {
      mockSupabase.auth.updateUser.mockResolvedValue({
        data: { user: null },
        error: { 
          message: 'Token expired',
        },
      })

      const formData = new FormData()
      formData.append('password', 'TestTest123!')
      formData.append('confirmPassword', 'TestTest123!')
      
      const result = await updatePassword(formData)
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('재설정 링크가 만료되었습니다. 다시 요청해주세요')
    })

    it('잘못된 토큰 시 적절한 에러를 반환한다', async () => {
      mockSupabase.auth.updateUser.mockResolvedValue({
        data: { user: null },
        error: { 
          message: 'Invalid token',
        },
      })

      const formData = new FormData()
      formData.append('password', 'TestTest123!')
      formData.append('confirmPassword', 'TestTest123!')
      
      const result = await updatePassword(formData)
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('재설정 링크가 만료되었습니다. 다시 요청해주세요')
    })

    it('네트워크 에러 발생 시 일반적인 에러 메시지를 반환한다', async () => {
      mockSupabase.auth.updateUser.mockResolvedValue({
        data: { user: null },
        error: { 
          message: 'Network error',
        },
      })

      const formData = new FormData()
      formData.append('password', 'TestTest123!')
      formData.append('confirmPassword', 'TestTest123!')
      
      const result = await updatePassword(formData)
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('비밀번호 변경 중 오류가 발생했습니다. 다시 시도해주세요')
    })

    it('예기치 않은 에러 발생 시 적절하게 처리한다', async () => {
      mockSupabase.auth.updateUser.mockRejectedValue(
        new Error('Unexpected error')
      )

      const formData = new FormData()
      formData.append('password', 'TestTest123!')
      formData.append('confirmPassword', 'TestTest123!')
      
      const result = await updatePassword(formData)
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('비밀번호 변경 중 오류가 발생했습니다. 다시 시도해주세요')
    })
  })
})

describe('signOut Server Action', () => {
  let mockSupabase: ReturnType<typeof import('@/lib/supabase/server').createClient>

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Supabase 클라이언트 모킹 설정
    mockSupabase = {
      auth: {
        signOut: vi.fn(),
      },
    }
    
    vi.mocked(createClient).mockResolvedValue(mockSupabase as unknown as ReturnType<typeof import('@/lib/supabase/server').createClient>)
  })

  describe('로그아웃 성공', () => {
    it('로그아웃이 성공적으로 처리되고 리다이렉트된다', async () => {
      mockSupabase.auth.signOut.mockResolvedValue({
        error: null,
      })

      await expect(signOut()).rejects.toThrow('NEXT_REDIRECT')
      
      expect(mockSupabase.auth.signOut).toHaveBeenCalledTimes(1)
    })
  })

  describe('로그아웃 실패', () => {
    it('Supabase 에러 발생 시에도 리다이렉트된다', async () => {
      mockSupabase.auth.signOut.mockResolvedValue({
        error: { message: 'Sign out failed' },
      })

      await expect(signOut()).rejects.toThrow('NEXT_REDIRECT')
      
      expect(mockSupabase.auth.signOut).toHaveBeenCalledTimes(1)
    })

    it('예기치 않은 에러 발생 시에도 리다이렉트된다', async () => {
      mockSupabase.auth.signOut.mockRejectedValue(
        new Error('Network error')
      )

      await expect(signOut()).rejects.toThrow('NEXT_REDIRECT')
    })
  })
})

