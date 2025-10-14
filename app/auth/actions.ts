// app/auth/actions.ts
// 인증 관련 Server Actions
// 회원가입, 로그인 등의 서버 사이드 로직 처리
// 관련 파일: lib/supabase/server.ts, lib/validations/auth.ts, app/auth/signup/page.tsx

'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { validateEmail, validatePassword, validatePasswordMatch } from '@/lib/validations/auth'

/**
 * 회원가입 결과 타입
 */
export interface SignUpResult {
  success: boolean
  error?: string
  message?: string
}

/**
 * 로그인 결과 타입
 */
export interface SignInResult {
  success: boolean
  error?: string
}

/**
 * 비밀번호 재설정 요청 결과 타입
 */
export interface PasswordResetRequestResult {
  success: boolean
  error?: string
  message?: string
}

/**
 * 비밀번호 업데이트 결과 타입
 */
export interface PasswordUpdateResult {
  success: boolean
  error?: string
}

/**
 * 회원가입 Server Action
 * @param formData - 폼 데이터 (email, password)
 * @returns 회원가입 결과
 */
export async function signUp(formData: FormData): Promise<SignUpResult> {
  // 폼 데이터 추출
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // 이메일 유효성 검증
  const emailValidation = validateEmail(email)
  if (!emailValidation.isValid) {
    return {
      success: false,
      error: emailValidation.error
    }
  }

  // 비밀번호 유효성 검증
  const passwordValidation = validatePassword(password)
  if (!passwordValidation.isValid) {
    return {
      success: false,
      error: passwordValidation.error
    }
  }

  try {
    // Supabase 서버 클라이언트 생성
    const supabase = await createClient()

    // 회원가입 시도
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/callback`
      }
    })

    // 에러 처리
    if (error) {
      // 중복 이메일 에러
      if (error.message.includes('already registered')) {
        return {
          success: false,
          error: '이미 사용 중인 이메일입니다'
        }
      }
      
      // 기타 에러
      console.error('Sign up error:', error)
      return {
        success: false,
        error: '회원가입 중 오류가 발생했습니다. 다시 시도해주세요'
      }
    }

    // 회원가입 성공
    if (data.user) {
      // 세션이 자동으로 생성되고 쿠키에 저장됨
      // 이메일 확인이 필요한 경우 메시지 반환
      if (data.user.identities && data.user.identities.length === 0) {
        return {
          success: true,
          message: '이메일 확인이 필요합니다. 받은 메일함을 확인해주세요'
        }
      }

      // 메인 페이지로 리다이렉트
      redirect('/')
    }

    return {
      success: false,
      error: '회원가입 중 오류가 발생했습니다'
    }
  } catch (error) {
    console.error('Unexpected error during sign up:', error)
    
    // redirect 에러는 다시 throw (Next.js에서 정상적인 동작)
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error
    }
    
    return {
      success: false,
      error: '회원가입 중 오류가 발생했습니다. 다시 시도해주세요'
    }
  }
}

/**
 * 로그인 Server Action
 * @param formData - 폼 데이터 (email, password)
 * @returns 로그인 결과
 */
export async function signIn(formData: FormData): Promise<SignInResult> {
  // 폼 데이터 추출
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // 이메일 유효성 검증
  const emailValidation = validateEmail(email)
  if (!emailValidation.isValid) {
    return {
      success: false,
      error: emailValidation.error
    }
  }

  // 비밀번호 필수 입력 확인
  if (!password || password.trim() === '') {
    return {
      success: false,
      error: '비밀번호를 입력해주세요'
    }
  }

  try {
    // Supabase 서버 클라이언트 생성
    const supabase = await createClient()

    // 로그인 시도
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    // 에러 처리
    if (error) {
      // 이메일 미인증 에러 (먼저 체크)
      if (error.message.includes('Email not confirmed')) {
        return {
          success: false,
          error: '이메일 인증이 필요합니다. 이메일을 확인해주세요'
        }
      }

      // 잘못된 자격 증명 에러
      if (error.message.includes('Invalid login credentials') || 
          error.message.includes('invalid') ||
          error.status === 400) {
        return {
          success: false,
          error: '이메일 또는 비밀번호가 올바르지 않습니다'
        }
      }
      
      // 기타 에러
      console.error('Sign in error:', error)
      return {
        success: false,
        error: '로그인 중 오류가 발생했습니다. 다시 시도해주세요'
      }
    }

    // 로그인 성공 - 세션 확인
    if (data.session) {
      // 세션이 자동으로 쿠키에 저장됨
      // 메인 페이지로 리다이렉트
      redirect('/')
    }

    return {
      success: false,
      error: '로그인 중 오류가 발생했습니다'
    }
  } catch (error) {
    console.error('Unexpected error during sign in:', error)
    
    // redirect 에러는 다시 throw (Next.js에서 정상적인 동작)
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error
    }
    
    return {
      success: false,
      error: '로그인 중 오류가 발생했습니다. 다시 시도해주세요'
    }
  }
}

/**
 * 비밀번호 재설정 이메일 발송 Server Action
 * 보안상 존재하지 않는 이메일도 동일한 성공 메시지 반환
 * @param formData - 폼 데이터 (email)
 * @returns 비밀번호 재설정 요청 결과
 */
export async function requestPasswordReset(formData: FormData): Promise<PasswordResetRequestResult> {
  // 폼 데이터 추출
  const email = formData.get('email') as string

  // 이메일 유효성 검증
  const emailValidation = validateEmail(email)
  if (!emailValidation.isValid) {
    return {
      success: false,
      error: emailValidation.error
    }
  }

  try {
    // Supabase 서버 클라이언트 생성
    const supabase = await createClient()

    // 비밀번호 재설정 이메일 발송
    // redirectTo는 사용자가 이메일 링크를 클릭했을 때 이동할 URL
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/update-password`
    })

    // 보안상 존재하지 않는 이메일도 동일한 성공 메시지 반환
    // 실제 에러가 있어도 로그만 남기고 성공 메시지 표시
    if (error) {
      console.error('Password reset email error:', error)
    }

    return {
      success: true,
      message: '비밀번호 재설정 이메일을 발송했습니다. 이메일을 확인해주세요'
    }
  } catch (error) {
    console.error('Unexpected error during password reset request:', error)
    
    // 예외 발생 시에도 보안상 성공 메시지 반환
    return {
      success: true,
      message: '비밀번호 재설정 이메일을 발송했습니다. 이메일을 확인해주세요'
    }
  }
}

/**
 * 비밀번호 업데이트 Server Action
 * @param formData - 폼 데이터 (password, confirmPassword)
 * @returns 비밀번호 업데이트 결과
 */
export async function updatePassword(formData: FormData): Promise<PasswordUpdateResult> {
  // 폼 데이터 추출
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  // 비밀번호 강도 검증
  const passwordValidation = validatePassword(password)
  if (!passwordValidation.isValid) {
    return {
      success: false,
      error: passwordValidation.error
    }
  }

  // 비밀번호 일치 확인
  const passwordMatchValidation = validatePasswordMatch(password, confirmPassword)
  if (!passwordMatchValidation.isValid) {
    return {
      success: false,
      error: passwordMatchValidation.error
    }
  }

  try {
    // Supabase 서버 클라이언트 생성
    const supabase = await createClient()

    // 비밀번호 업데이트
    const { data, error } = await supabase.auth.updateUser({
      password: password
    })

    // 에러 처리
    if (error) {
      // 토큰 만료 에러 (대소문자 구분 없이 체크)
      const errorMessage = error.message.toLowerCase()
      if (errorMessage.includes('expired') || errorMessage.includes('invalid')) {
        return {
          success: false,
          error: '재설정 링크가 만료되었습니다. 다시 요청해주세요'
        }
      }
      
      // 기타 에러
      console.error('Password update error:', error)
      return {
        success: false,
        error: '비밀번호 변경 중 오류가 발생했습니다. 다시 시도해주세요'
      }
    }

    // 비밀번호 업데이트 성공 - 자동으로 로그인됨
    if (data.user) {
      // 메인 페이지로 리다이렉트
      redirect('/')
    }

    return {
      success: false,
      error: '비밀번호 변경 중 오류가 발생했습니다'
    }
  } catch (error) {
    console.error('Unexpected error during password update:', error)
    
    // redirect 에러는 다시 throw (Next.js에서 정상적인 동작)
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error
    }
    
    return {
      success: false,
      error: '비밀번호 변경 중 오류가 발생했습니다. 다시 시도해주세요'
    }
  }
}

