// app/auth/reset-password/page.test.tsx
// 비밀번호 찾기 페이지 컴포넌트 테스트
// 렌더링, 사용자 입력, 유효성 검증, 제출 동작 테스트
// 관련 파일: app/auth/reset-password/page.tsx, app/auth/actions.ts

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import ResetPasswordPage from './page'
import * as actions from '../actions'

// Next.js 라우터 모킹
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
  }),
}))

// Server Actions 모킹
vi.mock('../actions', () => ({
  requestPasswordReset: vi.fn(),
}))

describe('ResetPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('렌더링', () => {
    it('페이지 제목이 표시된다', () => {
      render(<ResetPasswordPage />)
      expect(screen.getByText('비밀번호 찾기')).toBeInTheDocument()
    })

    it('이메일 입력 필드가 표시된다', () => {
      render(<ResetPasswordPage />)
      expect(screen.getByLabelText('이메일')).toBeInTheDocument()
    })

    it('제출 버튼이 표시된다', () => {
      render(<ResetPasswordPage />)
      expect(screen.getByRole('button', { name: '재설정 이메일 발송' })).toBeInTheDocument()
    })

    it('로그인 페이지로 돌아가는 링크가 표시된다', () => {
      render(<ResetPasswordPage />)
      const loginLink = screen.getByText('로그인으로 돌아가기')
      expect(loginLink).toBeInTheDocument()
      expect(loginLink).toHaveAttribute('href', '/auth/login')
    })
  })

  describe('이메일 유효성 검증', () => {
    it('유효하지 않은 이메일 형식이면 에러 메시지를 표시한다', async () => {
      render(<ResetPasswordPage />)
      const emailInput = screen.getByLabelText('이메일')
      
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
      
      await waitFor(() => {
        expect(screen.getByText('올바른 이메일 형식이 아닙니다')).toBeInTheDocument()
      })
    })

    it('유효한 이메일 형식이면 에러 메시지가 표시되지 않는다', async () => {
      render(<ResetPasswordPage />)
      const emailInput = screen.getByLabelText('이메일')
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      
      await waitFor(() => {
        expect(screen.queryByText('올바른 이메일 형식이 아닙니다')).not.toBeInTheDocument()
      })
    })

    it('이메일 에러가 있으면 제출 버튼이 비활성화된다', async () => {
      render(<ResetPasswordPage />)
      const emailInput = screen.getByLabelText('이메일')
      const submitButton = screen.getByRole('button', { name: '재설정 이메일 발송' })
      
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
      
      await waitFor(() => {
        expect(submitButton).toBeDisabled()
      })
    })
  })

  describe('폼 제출', () => {
    it('유효한 이메일을 입력하고 제출하면 requestPasswordReset이 호출된다', async () => {
      const mockRequestPasswordReset = vi.mocked(actions.requestPasswordReset)
      mockRequestPasswordReset.mockResolvedValue({
        success: true,
        message: '비밀번호 재설정 이메일을 발송했습니다. 이메일을 확인해주세요'
      })

      render(<ResetPasswordPage />)
      const emailInput = screen.getByLabelText('이메일')
      const submitButton = screen.getByRole('button', { name: '재설정 이메일 발송' })
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(mockRequestPasswordReset).toHaveBeenCalled()
      })
    })

    it('성공 시 성공 메시지를 표시한다', async () => {
      const mockRequestPasswordReset = vi.mocked(actions.requestPasswordReset)
      mockRequestPasswordReset.mockResolvedValue({
        success: true,
        message: '비밀번호 재설정 이메일을 발송했습니다. 이메일을 확인해주세요'
      })

      render(<ResetPasswordPage />)
      const emailInput = screen.getByLabelText('이메일')
      const submitButton = screen.getByRole('button', { name: '재설정 이메일 발송' })
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText('비밀번호 재설정 이메일을 발송했습니다. 이메일을 확인해주세요')).toBeInTheDocument()
      })
    })

    it('실패 시 에러 메시지를 표시한다', async () => {
      const mockRequestPasswordReset = vi.mocked(actions.requestPasswordReset)
      mockRequestPasswordReset.mockResolvedValue({
        success: false,
        error: '요청 처리 중 오류가 발생했습니다'
      })

      render(<ResetPasswordPage />)
      const emailInput = screen.getByLabelText('이메일')
      const submitButton = screen.getByRole('button', { name: '재설정 이메일 발송' })
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText('요청 처리 중 오류가 발생했습니다')).toBeInTheDocument()
      })
    })

    it('제출 중 로딩 상태를 표시한다', async () => {
      const mockRequestPasswordReset = vi.mocked(actions.requestPasswordReset)
      mockRequestPasswordReset.mockImplementation(() => 
        new Promise((resolve) => setTimeout(() => resolve({ success: true }), 100))
      )

      render(<ResetPasswordPage />)
      const emailInput = screen.getByLabelText('이메일')
      const submitButton = screen.getByRole('button', { name: '재설정 이메일 발송' })
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.click(submitButton)
      
      // 로딩 중 버튼 텍스트 확인
      expect(screen.getByText('발송 중...')).toBeInTheDocument()
      
      // 로딩 중 버튼 비활성화 확인
      expect(submitButton).toBeDisabled()
    })
  })
})

