// app/auth/login/page.test.tsx
// 로그인 페이지 컴포넌트 테스트
// 로그인 폼 렌더링, 유효성 검증, 제출 로직 테스트
// 관련 파일: app/auth/login/page.tsx, app/auth/actions.ts

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginPage from './page'
import * as actions from '../actions'

// Next.js 라우터 모킹
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
}))

// Server Actions 모킹
vi.mock('../actions', () => ({
  signIn: vi.fn(),
}))

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('UI 렌더링', () => {
    it('로그인 폼이 올바르게 렌더링된다', () => {
      render(<LoginPage />)
      
      expect(screen.getByRole('heading', { name: '로그인' })).toBeInTheDocument()
      expect(screen.getByText('이메일과 비밀번호로 로그인하세요')).toBeInTheDocument()
      expect(screen.getByLabelText('이메일')).toBeInTheDocument()
      expect(screen.getByLabelText('비밀번호')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /로그인/i })).toBeInTheDocument()
    })

    it('회원가입 링크가 존재한다', () => {
      render(<LoginPage />)
      
      const signupLink = screen.getByText('회원가입')
      expect(signupLink).toBeInTheDocument()
      expect(signupLink.closest('a')).toHaveAttribute('href', '/auth/signup')
    })

    it('비밀번호 찾기 링크가 존재한다', () => {
      render(<LoginPage />)
      
      const forgotPasswordLink = screen.getByText('비밀번호를 잊으셨나요?')
      expect(forgotPasswordLink).toBeInTheDocument()
    })
  })

  describe('이메일 유효성 검증', () => {
    it('올바른 이메일 형식을 입력하면 에러가 표시되지 않는다', async () => {
      const user = userEvent.setup()
      render(<LoginPage />)
      
      const emailInput = screen.getByLabelText('이메일')
      await user.type(emailInput, 'test@example.com')
      
      // 에러 메시지가 없어야 함
      await waitFor(() => {
        expect(screen.queryByText('올바른 이메일 형식이 아닙니다')).not.toBeInTheDocument()
      })
    })

    it('잘못된 이메일 형식을 입력하면 에러가 표시된다', async () => {
      const user = userEvent.setup()
      render(<LoginPage />)
      
      const emailInput = screen.getByLabelText('이메일')
      await user.type(emailInput, 'invalid-email')
      
      // 에러 메시지가 표시되어야 함
      await waitFor(() => {
        expect(screen.getByText('올바른 이메일 형식이 아닙니다')).toBeInTheDocument()
      })
    })

    it('이메일 에러가 있으면 로그인 버튼이 비활성화된다', async () => {
      const user = userEvent.setup()
      render(<LoginPage />)
      
      const emailInput = screen.getByLabelText('이메일')
      const loginButton = screen.getByRole('button', { name: /로그인/i })
      
      await user.type(emailInput, 'invalid-email')
      
      await waitFor(() => {
        expect(loginButton).toBeDisabled()
      })
    })
  })

  describe('폼 제출', () => {
    it('올바른 정보로 로그인 시도 시 signIn이 호출된다', async () => {
      const user = userEvent.setup()
      const mockSignIn = vi.mocked(actions.signIn)
      mockSignIn.mockResolvedValue({ success: true })

      render(<LoginPage />)
      
      const emailInput = screen.getByLabelText('이메일')
      const passwordInput = screen.getByLabelText('비밀번호')
      const loginButton = screen.getByRole('button', { name: /로그인/i })
      
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'Password123!')
      await user.click(loginButton)
      
      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledTimes(1)
      })
    })

    it('로그인 실패 시 에러 메시지가 표시된다', async () => {
      const user = userEvent.setup()
      const mockSignIn = vi.mocked(actions.signIn)
      mockSignIn.mockResolvedValue({ 
        success: false, 
        error: '이메일 또는 비밀번호가 올바르지 않습니다' 
      })

      render(<LoginPage />)
      
      const emailInput = screen.getByLabelText('이메일')
      const passwordInput = screen.getByLabelText('비밀번호')
      const loginButton = screen.getByRole('button', { name: /로그인/i })
      
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'wrongpassword')
      await user.click(loginButton)
      
      await waitFor(() => {
        expect(screen.getByText('이메일 또는 비밀번호가 올바르지 않습니다')).toBeInTheDocument()
      })
    })

    it('로그인 진행 중 로딩 상태가 표시된다', async () => {
      const user = userEvent.setup()
      const mockSignIn = vi.mocked(actions.signIn)
      
      // 느린 응답 시뮬레이션
      mockSignIn.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ success: true }), 100))
      )

      render(<LoginPage />)
      
      const emailInput = screen.getByLabelText('이메일')
      const passwordInput = screen.getByLabelText('비밀번호')
      const loginButton = screen.getByRole('button', { name: /로그인/i })
      
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'Password123!')
      await user.click(loginButton)
      
      // 로딩 상태 확인
      expect(screen.getByText('로그인 중...')).toBeInTheDocument()
      expect(loginButton).toBeDisabled()
    })

    it('로딩 중에는 입력 필드가 비활성화된다', async () => {
      const user = userEvent.setup()
      const mockSignIn = vi.mocked(actions.signIn)
      
      mockSignIn.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ success: true }), 100))
      )

      render(<LoginPage />)
      
      const emailInput = screen.getByLabelText('이메일')
      const passwordInput = screen.getByLabelText('비밀번호')
      const loginButton = screen.getByRole('button', { name: /로그인/i })
      
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'Password123!')
      await user.click(loginButton)
      
      // 입력 필드가 비활성화되어야 함
      expect(emailInput).toBeDisabled()
      expect(passwordInput).toBeDisabled()
    })
  })

  describe('반응형 레이아웃', () => {
    it('모바일 뷰포트에서도 정상적으로 렌더링된다', () => {
      // 모바일 뷰포트 설정
      global.innerWidth = 375
      global.innerHeight = 667
      
      render(<LoginPage />)
      
      expect(screen.getByRole('heading', { name: '로그인' })).toBeInTheDocument()
      expect(screen.getByLabelText('이메일')).toBeInTheDocument()
      expect(screen.getByLabelText('비밀번호')).toBeInTheDocument()
    })
  })
})

