// lib/validations/auth.ts
// 인증 관련 유효성 검증 함수
// 이메일 형식 및 비밀번호 강도 검증
// 관련 파일: app/auth/actions.ts, app/auth/signup/page.tsx

/**
 * 이메일 형식 유효성 검증 결과
 */
export interface EmailValidationResult {
  isValid: boolean
  error?: string
}

/**
 * 비밀번호 강도 검증 결과
 */
export interface PasswordValidationResult {
  isValid: boolean
  error?: string
  strength?: 'weak' | 'medium' | 'strong'
}

/**
 * 이메일 형식 검증
 * @param email - 검증할 이메일 주소
 * @returns 검증 결과
 */
export function validateEmail(email: string): EmailValidationResult {
  if (!email || email.trim() === '') {
    return { isValid: false, error: '이메일을 입력해주세요' }
  }

  // 표준 이메일 정규식
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  
  if (!emailRegex.test(email)) {
    return { isValid: false, error: '올바른 이메일 형식이 아닙니다' }
  }

  return { isValid: true }
}

/**
 * 비밀번호 강도 검증
 * 요구사항: 최소 8자, 영문자 + 숫자 + 특수문자 조합
 * @param password - 검증할 비밀번호
 * @returns 검증 결과
 */
export function validatePassword(password: string): PasswordValidationResult {
  if (!password || password.trim() === '') {
    return { isValid: false, error: '비밀번호를 입력해주세요' }
  }

  // 최소 길이 체크
  if (password.length < 8) {
    return { 
      isValid: false, 
      error: '비밀번호는 최소 8자 이상이어야 합니다',
      strength: 'weak'
    }
  }

  // 영문자 포함 여부
  const hasLetter = /[a-zA-Z]/.test(password)
  // 숫자 포함 여부
  const hasNumber = /\d/.test(password)
  // 특수문자 포함 여부
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)

  // 모든 조건 충족 확인
  if (!hasLetter || !hasNumber || !hasSpecialChar) {
    return {
      isValid: false,
      error: '비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다',
      strength: 'weak'
    }
  }

  // 강도 판정
  let strength: 'weak' | 'medium' | 'strong' = 'medium'
  if (password.length >= 12 && /[A-Z]/.test(password) && /[a-z]/.test(password)) {
    strength = 'strong'
  }

  return { 
    isValid: true,
    strength
  }
}

/**
 * 비밀번호 일치 확인
 * @param password - 비밀번호
 * @param confirmPassword - 확인용 비밀번호
 * @returns 일치 여부
 */
export function validatePasswordMatch(
  password: string, 
  confirmPassword: string
): { isValid: boolean; error?: string } {
  if (password !== confirmPassword) {
    return { isValid: false, error: '비밀번호가 일치하지 않습니다' }
  }
  return { isValid: true }
}

