// app/auth/update-password/page.test.tsx
// 비밀번호 변경 페이지 컴포넌트 테스트
// 렌더링, 사용자 입력, 유효성 검증, 제출 동작 테스트
// 관련 파일: app/auth/update-password/page.tsx, app/auth/actions.ts

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import UpdatePasswordPage from './page'
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
  updatePassword: vi.fn(),
}))

describe('UpdatePasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('렌더링', () => {
    it('페이지 제목이 표시된다', () => {
      render(<UpdatePasswordPage />)
      expect(screen.getByText('새 비밀번호 설정')).toBeInTheDocument()
    })

    it('새 비밀번호 입력 필드가 표시된다', () => {
      render(<UpdatePasswordPage />)
      expect(screen.getByLabelText('새 비밀번호')).toBeInTheDocument()
    })

    it('비밀번호 확인 입력 필드가 표시된다', () => {
      render(<UpdatePasswordPage />)
      expect(screen.getByLabelText('비밀번호 확인')).toBeInTheDocument()
    })

    it('제출 버튼이 표시된다', () => {
      render(<UpdatePasswordPage />)
      expect(screen.getByRole('button', { name: '비밀번호 변경' })).toBeInTheDocument()
    })

    it('로그인 페이지로 돌아가는 링크가 표시된다', () => {
      render(<UpdatePasswordPage />)
      const loginLink = screen.getByText('로그인으로 돌아가기')
      expect(loginLink).toBeInTheDocument()
      expect(loginLink).toHaveAttribute('href', '/auth/login')
    })
  })

  describe('비밀번호 유효성 검증', () => {
    it('8자 미만의 비밀번호는 에러 메시지를 표시한다', async () => {
      render(<UpdatePasswordPage />)
      const passwordInput = screen.getByLabelText('새 비밀번호')
      
      fireEvent.change(passwordInput, { target: { value: 'Test1!' } })
      
      await waitFor(() => {
        expect(screen.getByText('비밀번호는 최소 8자 이상이어야 합니다')).toBeInTheDocument()
      })
    })

    it('영문자가 없으면 에러 메시지를 표시한다', async () => {
      render(<UpdatePasswordPage />)
      const passwordInput = screen.getByLabelText('새 비밀번호')
      
      fireEvent.change(passwordInput, { target: { value: '12345678!' } })
      
      await waitFor(() => {
        expect(screen.getByText('비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다')).toBeInTheDocument()
      })
    })

    it('숫자가 없으면 에러 메시지를 표시한다', async () => {
      render(<UpdatePasswordPage />)
      const passwordInput = screen.getByLabelText('새 비밀번호')
      
      fireEvent.change(passwordInput, { target: { value: 'TestTest!' } })
      
      await waitFor(() => {
        expect(screen.getByText('비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다')).toBeInTheDocument()
      })
    })

    it('특수문자가 없으면 에러 메시지를 표시한다', async () => {
      render(<UpdatePasswordPage />)
      const passwordInput = screen.getByLabelText('새 비밀번호')
      
      fireEvent.change(passwordInput, { target: { value: 'TestTest123' } })
      
      await waitFor(() => {
        expect(screen.getByText('비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다')).toBeInTheDocument()
      })
    })

    it('유효한 비밀번호는 에러 메시지가 표시되지 않는다', async () => {
      render(<UpdatePasswordPage />)
      const passwordInput = screen.getByLabelText('새 비밀번호')
      
      fireEvent.change(passwordInput, { target: { value: 'TestTest123!' } })
      
      await waitFor(() => {
        expect(screen.queryByText('비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다')).not.toBeInTheDocument()
      })
    })

    it('비밀번호 강도 표시기가 작동한다', async () => {
      render(<UpdatePasswordPage />)
      const passwordInput = screen.getByLabelText('새 비밀번호')
      
      // 약한 비밀번호
      fireEvent.change(passwordInput, { target: { value: 'Test123!' } })
      await waitFor(() => {
        expect(screen.getByText('보통')).toBeInTheDocument()
      })

      // 강한 비밀번호
      fireEvent.change(passwordInput, { target: { value: 'TestTest123!' } })
      await waitFor(() => {
        expect(screen.getByText('강함')).toBeInTheDocument()
      })
    })
  })

  describe('비밀번호 일치 확인', () => {
    it('비밀번호가 일치하지 않으면 에러 메시지를 표시한다', async () => {
      render(<UpdatePasswordPage />)
      const passwordInput = screen.getByLabelText('새 비밀번호')
      const confirmPasswordInput = screen.getByLabelText('비밀번호 확인')
      
      fireEvent.change(passwordInput, { target: { value: 'TestTest123!' } })
      fireEvent.change(confirmPasswordInput, { target: { value: 'TestTest456!' } })
      
      await waitFor(() => {
        expect(screen.getByText('비밀번호가 일치하지 않습니다')).toBeInTheDocument()
      })
    })

    it('비밀번호가 일치하면 에러 메시지가 표시되지 않는다', async () => {
      render(<UpdatePasswordPage />)
      const passwordInput = screen.getByLabelText('새 비밀번호')
      const confirmPasswordInput = screen.getByLabelText('비밀번호 확인')
      
      fireEvent.change(passwordInput, { target: { value: 'TestTest123!' } })
      fireEvent.change(confirmPasswordInput, { target: { value: 'TestTest123!' } })
      
      await waitFor(() => {
        expect(screen.queryByText('비밀번호가 일치하지 않습니다')).not.toBeInTheDocument()
      })
    })

    it('에러가 있으면 제출 버튼이 비활성화된다', async () => {
      render(<UpdatePasswordPage />)
      const passwordInput = screen.getByLabelText('새 비밀번호')
      const confirmPasswordInput = screen.getByLabelText('비밀번호 확인')
      const submitButton = screen.getByRole('button', { name: '비밀번호 변경' })
      
      fireEvent.change(passwordInput, { target: { value: 'TestTest123!' } })
      fireEvent.change(confirmPasswordInput, { target: { value: 'TestTest456!' } })
      
      await waitFor(() => {
        expect(submitButton).toBeDisabled()
      })
    })
  })

  describe('폼 제출', () => {
    it('유효한 비밀번호를 입력하고 제출하면 updatePassword가 호출된다', async () => {
      const mockUpdatePassword = vi.mocked(actions.updatePassword)
      mockUpdatePassword.mockResolvedValue({ success: true })

      render(<UpdatePasswordPage />)
      const passwordInput = screen.getByLabelText('새 비밀번호')
      const confirmPasswordInput = screen.getByLabelText('비밀번호 확인')
      const submitButton = screen.getByRole('button', { name: '비밀번호 변경' })
      
      fireEvent.change(passwordInput, { target: { value: 'TestTest123!' } })
      fireEvent.change(confirmPasswordInput, { target: { value: 'TestTest123!' } })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(mockUpdatePassword).toHaveBeenCalled()
      })
    })

    it('실패 시 에러 메시지를 표시한다', async () => {
      const mockUpdatePassword = vi.mocked(actions.updatePassword)
      mockUpdatePassword.mockResolvedValue({
        success: false,
        error: '재설정 링크가 만료되었습니다. 다시 요청해주세요'
      })

      render(<UpdatePasswordPage />)
      const passwordInput = screen.getByLabelText('새 비밀번호')
      const confirmPasswordInput = screen.getByLabelText('비밀번호 확인')
      const submitButton = screen.getByRole('button', { name: '비밀번호 변경' })
      
      fireEvent.change(passwordInput, { target: { value: 'TestTest123!' } })
      fireEvent.change(confirmPasswordInput, { target: { value: 'TestTest123!' } })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText('재설정 링크가 만료되었습니다. 다시 요청해주세요')).toBeInTheDocument()
      })
    })

    it('제출 중 로딩 상태를 표시한다', async () => {
      const mockUpdatePassword = vi.mocked(actions.updatePassword)
      mockUpdatePassword.mockImplementation(() => 
        new Promise((resolve) => setTimeout(() => resolve({ success: true }), 100))
      )

      render(<UpdatePasswordPage />)
      const passwordInput = screen.getByLabelText('새 비밀번호')
      const confirmPasswordInput = screen.getByLabelText('비밀번호 확인')
      const submitButton = screen.getByRole('button', { name: '비밀번호 변경' })
      
      fireEvent.change(passwordInput, { target: { value: 'TestTest123!' } })
      fireEvent.change(confirmPasswordInput, { target: { value: 'TestTest123!' } })
      fireEvent.click(submitButton)
      
      // 로딩 중 버튼 텍스트 확인
      expect(screen.getByText('변경 중...')).toBeInTheDocument()
      
      // 로딩 중 버튼 비활성화 확인
      expect(submitButton).toBeDisabled()
    })
  })
})

