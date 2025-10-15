// app/auth/update-password/page.tsx
// 비밀번호 변경 페이지 컴포넌트
// 이메일 링크를 통해 접근하여 새 비밀번호 설정
// 관련 파일: app/auth/actions.ts, app/auth/reset-password/page.tsx, lib/validations/auth.ts

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { validatePassword, validatePasswordMatch } from '@/lib/validations/auth'
import { updatePassword } from '../actions'

/**
 * 비밀번호 변경 페이지
 * 비밀번호 재설정 이메일 링크를 통해 접근
 */
export default function UpdatePasswordPage() {
  const _router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string>('')
  const [confirmPasswordError, setConfirmPasswordError] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong'>('weak')

  /**
   * 비밀번호 입력 핸들러 - 실시간 강도 검증
   */
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPassword(value)
    setError('')
    
    // 실시간 비밀번호 검증
    if (value) {
      const validation = validatePassword(value)
      setPasswordError(validation.isValid ? '' : validation.error || '')
      setPasswordStrength(validation.strength || 'weak')
    } else {
      setPasswordError('')
      setPasswordStrength('weak')
    }

    // 확인 비밀번호가 이미 입력되어 있으면 일치 여부 확인
    if (confirmPassword) {
      const matchValidation = validatePasswordMatch(value, confirmPassword)
      setConfirmPasswordError(matchValidation.isValid ? '' : matchValidation.error || '')
    }
  }

  /**
   * 비밀번호 확인 입력 핸들러 - 실시간 일치 확인
   */
  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setConfirmPassword(value)
    setError('')
    
    // 실시간 비밀번호 일치 확인
    if (value) {
      const matchValidation = validatePasswordMatch(password, value)
      setConfirmPasswordError(matchValidation.isValid ? '' : matchValidation.error || '')
    } else {
      setConfirmPasswordError('')
    }
  }

  /**
   * 비밀번호 강도 표시 색상
   */
  const getStrengthColor = () => {
    switch (passwordStrength) {
      case 'strong':
        return 'bg-green-500'
      case 'medium':
        return 'bg-yellow-500'
      default:
        return 'bg-red-500'
    }
  }

  /**
   * 비밀번호 강도 표시 텍스트
   */
  const getStrengthText = () => {
    switch (passwordStrength) {
      case 'strong':
        return '강함'
      case 'medium':
        return '보통'
      default:
        return '약함'
    }
  }

  /**
   * 폼 제출 핸들러
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // 최종 비밀번호 유효성 검증
      const passwordValidation = validatePassword(password)
      if (!passwordValidation.isValid) {
        setPasswordError(passwordValidation.error || '')
        setIsLoading(false)
        return
      }

      // 최종 비밀번호 일치 확인
      const matchValidation = validatePasswordMatch(password, confirmPassword)
      if (!matchValidation.isValid) {
        setConfirmPasswordError(matchValidation.error || '')
        setIsLoading(false)
        return
      }

      // FormData 생성
      const formData = new FormData()
      formData.append('password', password)
      formData.append('confirmPassword', confirmPassword)

      // 비밀번호 업데이트 시도
      const result = await updatePassword(formData)

      if (!result.success) {
        setError(result.error || '비밀번호 변경 중 오류가 발생했습니다')
        setIsLoading(false)
        return
      }

      // 성공 시 리다이렉트 (Server Action에서 처리됨)
      // 여기까지 도달하면 redirect로 인해 페이지가 전환됨
    } catch (err) {
      console.error('Password update error:', err)
      setError('비밀번호 변경 중 오류가 발생했습니다. 다시 시도해주세요')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">새 비밀번호 설정</CardTitle>
          <CardDescription className="text-center">
            새로운 비밀번호를 입력해주세요
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {/* 에러 메시지 */}
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                {error}
              </div>
            )}

            {/* 새 비밀번호 입력 */}
            <div className="space-y-2">
              <Label htmlFor="password">새 비밀번호</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={handlePasswordChange}
                required
                disabled={isLoading}
                className={passwordError ? 'border-red-500 focus-visible:ring-red-500' : ''}
                autoComplete="new-password"
              />
              {password && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getStrengthColor()} transition-all duration-300`}
                        style={{
                          width: passwordStrength === 'strong' ? '100%' : passwordStrength === 'medium' ? '66%' : '33%'
                        }}
                      />
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {getStrengthText()}
                    </span>
                  </div>
                </div>
              )}
              {passwordError && (
                <p className="text-sm text-red-600">{passwordError}</p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400">
                최소 8자, 영문, 숫자, 특수문자 포함
              </p>
            </div>

            {/* 비밀번호 확인 입력 */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">비밀번호 확인</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                required
                disabled={isLoading}
                className={confirmPasswordError ? 'border-red-500 focus-visible:ring-red-500' : ''}
                autoComplete="new-password"
              />
              {confirmPasswordError && (
                <p className="text-sm text-red-600">{confirmPasswordError}</p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            {/* 제출 버튼 */}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !!passwordError || !!confirmPasswordError}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  변경 중...
                </>
              ) : (
                '비밀번호 변경'
              )}
            </Button>

            {/* 로그인 페이지로 돌아가기 */}
            <div className="text-sm text-center text-gray-600 dark:text-gray-400">
              <Link
                href="/auth/login"
                className="font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                로그인으로 돌아가기
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

