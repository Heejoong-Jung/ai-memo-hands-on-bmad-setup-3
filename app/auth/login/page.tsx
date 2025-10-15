// app/auth/login/page.tsx
// 로그인 페이지 컴포넌트
// 이메일/비밀번호로 로그인하는 UI 제공
// 관련 파일: app/auth/actions.ts, app/auth/signup/page.tsx, lib/validations/auth.ts

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { signIn } from '../actions'
import { validateEmail } from '@/lib/validations/auth'

/**
 * 로그인 페이지
 * 이메일/비밀번호 기반 인증
 */
export default function LoginPage() {
  const _router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState<string>('')
  const [error, setError] = useState<string>('')
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
      formData.append('password', password)

      // 로그인 시도
      const result = await signIn(formData)

      if (!result.success) {
        setError(result.error || '로그인 중 오류가 발생했습니다')
        setIsLoading(false)
        return
      }

      // 성공 시 리다이렉트 (Server Action에서 처리됨)
      // 여기까지 도달하면 redirect로 인해 페이지가 전환됨
    } catch (err) {
      console.error('Login error:', err)
      setError('로그인 중 오류가 발생했습니다. 다시 시도해주세요')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">로그인</CardTitle>
          <CardDescription className="text-center">
            이메일과 비밀번호로 로그인하세요
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {/* 전역 에러 메시지 */}
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

            {/* 비밀번호 입력 */}
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>

            {/* 비밀번호 찾기 링크 */}
            <div className="text-right">
              <Link 
                href="/auth/reset-password" 
                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                비밀번호를 잊으셨나요?
              </Link>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            {/* 로그인 버튼 */}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !!emailError}
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
                  로그인 중...
                </>
              ) : (
                '로그인'
              )}
            </Button>

            {/* 회원가입 링크 */}
            <div className="text-sm text-center text-gray-600 dark:text-gray-400">
              계정이 없으신가요?{' '}
              <Link
                href="/auth/signup"
                className="font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                회원가입
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

