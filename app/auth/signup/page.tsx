// app/auth/signup/page.tsx
// 회원가입 페이지
// 이메일/비밀번호로 회원가입 폼 제공
// 관련 파일: app/auth/actions.ts, lib/validations/auth.ts, components/ui/button.tsx

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signUp } from '../actions'
import { validateEmail, validatePassword, validatePasswordMatch } from '@/lib/validations/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function SignUpPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // 실시간 유효성 검증 상태
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [confirmPasswordError, setConfirmPasswordError] = useState('')
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | null>(null)

  // 이메일 실시간 검증
  useEffect(() => {
    if (email) {
      const result = validateEmail(email)
      setEmailError(result.isValid ? '' : result.error || '')
    } else {
      setEmailError('')
    }
  }, [email])

  // 비밀번호 실시간 검증
  useEffect(() => {
    if (password) {
      const result = validatePassword(password)
      setPasswordError(result.isValid ? '' : result.error || '')
      setPasswordStrength(result.strength || null)
    } else {
      setPasswordError('')
      setPasswordStrength(null)
    }
  }, [password])

  // 비밀번호 확인 실시간 검증
  useEffect(() => {
    if (confirmPassword) {
      const result = validatePasswordMatch(password, confirmPassword)
      setConfirmPasswordError(result.isValid ? '' : result.error || '')
    } else {
      setConfirmPasswordError('')
    }
  }, [password, confirmPassword])

  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setSuccessMessage('')

    // 최종 유효성 검증
    const emailValidation = validateEmail(email)
    if (!emailValidation.isValid) {
      setError(emailValidation.error || '이메일이 유효하지 않습니다')
      return
    }

    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
      setError(passwordValidation.error || '비밀번호가 유효하지 않습니다')
      return
    }

    const passwordMatchValidation = validatePasswordMatch(password, confirmPassword)
    if (!passwordMatchValidation.isValid) {
      setError(passwordMatchValidation.error || '비밀번호가 일치하지 않습니다')
      return
    }

    setIsLoading(true)

    try {
      // FormData 생성
      const formData = new FormData()
      formData.append('email', email)
      formData.append('password', password)

      // Server Action 호출
      const result = await signUp(formData)

      if (result.success) {
        if (result.message) {
          setSuccessMessage(result.message)
        }
        // redirect()가 호출되어 자동으로 이동됨
      } else {
        setError(result.error || '회원가입에 실패했습니다')
      }
    } catch (err) {
      // redirect 에러가 아닌 경우만 처리
      if (!(err instanceof Error && err.message === 'NEXT_REDIRECT')) {
        console.error('Sign up error:', err)
        setError('회원가입 중 오류가 발생했습니다')
      }
    } finally {
      setIsLoading(false)
    }
  }

  // 비밀번호 강도 색상
  const getStrengthColor = () => {
    switch (passwordStrength) {
      case 'weak':
        return 'text-red-500'
      case 'medium':
        return 'text-yellow-500'
      case 'strong':
        return 'text-green-500'
      default:
        return ''
    }
  }

  // 비밀번호 강도 텍스트
  const getStrengthText = () => {
    switch (passwordStrength) {
      case 'weak':
        return '약함'
      case 'medium':
        return '보통'
      case 'strong':
        return '강함'
      default:
        return ''
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">회원가입</CardTitle>
          <CardDescription>
            이메일과 비밀번호로 계정을 만드세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 이메일 입력 */}
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className={emailError ? 'border-red-500' : ''}
              />
              {emailError && (
                <p className="text-sm text-red-500">{emailError}</p>
              )}
            </div>

            {/* 비밀번호 입력 */}
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                placeholder="최소 8자, 영문/숫자/특수문자 포함"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className={passwordError ? 'border-red-500' : ''}
              />
              {passwordError && (
                <p className="text-sm text-red-500">{passwordError}</p>
              )}
              {passwordStrength && !passwordError && (
                <p className={`text-sm ${getStrengthColor()}`}>
                  강도: {getStrengthText()}
                </p>
              )}
            </div>

            {/* 비밀번호 확인 입력 */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">비밀번호 확인</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="비밀번호를 다시 입력하세요"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                className={confirmPasswordError ? 'border-red-500' : ''}
              />
              {confirmPasswordError && (
                <p className="text-sm text-red-500">{confirmPasswordError}</p>
              )}
            </div>

            {/* 에러 메시지 */}
            {error && (
              <div className="rounded-md bg-red-50 p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* 성공 메시지 */}
            {successMessage && (
              <div className="rounded-md bg-green-50 p-3">
                <p className="text-sm text-green-600">{successMessage}</p>
              </div>
            )}

            {/* 제출 버튼 */}
            <Button
              type="submit"
              className="w-full"
              disabled={
                isLoading || 
                !!emailError || 
                !!passwordError || 
                !!confirmPasswordError ||
                !email ||
                !password ||
                !confirmPassword
              }
            >
              {isLoading ? '처리 중...' : '회원가입'}
            </Button>

            {/* 로그인 링크 */}
            <p className="text-center text-sm text-muted-foreground">
              이미 계정이 있으신가요?{' '}
              <Link href="/auth/login" className="text-primary underline-offset-4 hover:underline">
                로그인
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

