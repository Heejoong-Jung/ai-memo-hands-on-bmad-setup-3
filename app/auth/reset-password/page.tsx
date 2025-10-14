// app/auth/reset-password/page.tsx
// 비밀번호 재설정 요청 페이지
// 이메일 입력 후 재설정 링크 발송
// 관련 파일: app/auth/actions.ts, lib/validations/auth.ts, app/auth/login/page.tsx

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { requestPasswordReset } from '../actions'
import { validateEmail } from '@/lib/validations/auth'

/**
 * 비밀번호 재설정 요청 페이지
 * 이메일을 입력받아 재설정 링크를 발송
 */
export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [successMessage, setSuccessMessage] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  /**
   * 이메일 입력 핸들러 - 실시간 유효성 검증
   */
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmail(value)
    
    // 실시간 이메일 검증
    if (value) {
      const validation = validateEmail(value)
      setEmailError(validation.isValid ? '' : validation.error || '')
    } else {
      setEmailError('')
    }
  }

  /**
   * 폼 제출 핸들러
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setSuccessMessage('')
    setIsLoading(true)

    try {
      // 최종 이메일 유효성 검증
      const emailValidation = validateEmail(email)
      if (!emailValidation.isValid) {
        setEmailError(emailValidation.error || '')
        setIsLoading(false)
        return
      }

      // FormData 생성
      const formData = new FormData()
      formData.append('email', email)

      // 비밀번호 재설정 요청
      const result = await requestPasswordReset(formData)

      if (result.success) {
        setSuccessMessage(result.message || '이메일을 확인해주세요')
        setEmail('') // 성공 시 입력 필드 초기화
      } else {
        setError(result.error || '요청 중 오류가 발생했습니다')
      }
    } catch (err) {
      console.error('Reset password error:', err)
      setError('요청 중 오류가 발생했습니다. 다시 시도해주세요')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">비밀번호 찾기</CardTitle>
          <CardDescription className="text-center">
            가입한 이메일 주소를 입력하세요
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {/* 성공 메시지 */}
            {successMessage && (
              <div className="p-3 text-sm text-green-600 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                {successMessage}
              </div>
            )}

            {/* 에러 메시지 */}
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                {error}
              </div>
            )}

            {/* 이메일 입력 */}
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={handleEmailChange}
                required
                disabled={isLoading}
                className={emailError ? 'border-red-500 focus-visible:ring-red-500' : ''}
                autoComplete="email"
              />
              {emailError && (
                <p className="text-sm text-red-600">{emailError}</p>
              )}
            </div>

            {/* 안내 메시지 */}
            <div className="text-sm text-gray-600 dark:text-gray-400">
              입력하신 이메일로 비밀번호 재설정 링크를 보내드립니다.
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            {/* 제출 버튼 */}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !!emailError || !email}
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
                  발송 중...
                </>
              ) : (
                '재설정 이메일 발송'
              )}
            </Button>

            {/* 로그인 페이지 링크 */}
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
