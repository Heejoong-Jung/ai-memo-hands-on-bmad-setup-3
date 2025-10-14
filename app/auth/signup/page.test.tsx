// app/auth/signup/page.test.tsx
// 회원가입 페이지 컴포넌트 테스트
// UI 렌더링 및 사용자 인터랙션 테스트
// 관련 파일: app/auth/signup/page.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SignUpPage from './page'

// Next.js 모듈 모킹
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
}))

// Server Action 모킹
vi.mock('../actions', () => ({
  signUp: vi.fn(),
}))

describe('SignUpPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('회원가입 폼이 렌더링되어야 함', () => {
    render(<SignUpPage />)
    
    expect(screen.getByRole('heading', { name: '회원가입', level: 2 })).toBeInTheDocument()
    expect(screen.getByLabelText('이메일')).toBeInTheDocument()
    expect(screen.getByLabelText('비밀번호')).toBeInTheDocument()
    expect(screen.getByLabelText('비밀번호 확인')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '회원가입' })).toBeInTheDocument()
  })

  it('잘못된 이메일 입력 시 에러 메시지를 표시해야 함', async () => {
    const user = userEvent.setup()
    render(<SignUpPage />)
    
    const emailInput = screen.getByLabelText('이메일')
    await user.type(emailInput, 'invalid-email')
    
    await waitFor(() => {
      expect(screen.getByText('올바른 이메일 형식이 아닙니다')).toBeInTheDocument()
    })
  })

  it('약한 비밀번호 입력 시 에러 메시지를 표시해야 함', async () => {
    const user = userEvent.setup()
    render(<SignUpPage />)
    
    const passwordInput = screen.getByLabelText('비밀번호')
    await user.type(passwordInput, '123')
    
    await waitFor(() => {
      expect(screen.getByText('비밀번호는 최소 8자 이상이어야 합니다')).toBeInTheDocument()
    })
  })

  it('비밀번호 불일치 시 에러 메시지를 표시해야 함', async () => {
    const user = userEvent.setup()
    render(<SignUpPage />)
    
    const passwordInput = screen.getByLabelText('비밀번호')
    const confirmPasswordInput = screen.getByLabelText('비밀번호 확인')
    
    await user.type(passwordInput, 'Test123!')
    await user.type(confirmPasswordInput, 'Test456!')
    
    await waitFor(() => {
      expect(screen.getByText('비밀번호가 일치하지 않습니다')).toBeInTheDocument()
    })
  })

  it('유효한 입력 시 제출 버튼이 활성화되어야 함', async () => {
    const user = userEvent.setup()
    render(<SignUpPage />)
    
    const emailInput = screen.getByLabelText('이메일')
    const passwordInput = screen.getByLabelText('비밀번호')
    const confirmPasswordInput = screen.getByLabelText('비밀번호 확인')
    const submitButton = screen.getByRole('button', { name: '회원가입' })
    
    // 초기에는 비활성화
    expect(submitButton).toBeDisabled()
    
    // 유효한 값 입력
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'Test123!')
    await user.type(confirmPasswordInput, 'Test123!')
    
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled()
    })
  })

  it('비밀번호 강도를 표시해야 함', async () => {
    const user = userEvent.setup()
    render(<SignUpPage />)
    
    const passwordInput = screen.getByLabelText('비밀번호')
    
    // 강한 비밀번호 입력
    await user.type(passwordInput, 'TestPassword123!')
    
    await waitFor(() => {
      expect(screen.getByText(/강도:/)).toBeInTheDocument()
    })
  })

  it('로그인 링크가 존재해야 함', () => {
    render(<SignUpPage />)
    
    const loginLink = screen.getByRole('link', { name: '로그인' })
    expect(loginLink).toBeInTheDocument()
    expect(loginLink).toHaveAttribute('href', '/auth/login')
  })
})

