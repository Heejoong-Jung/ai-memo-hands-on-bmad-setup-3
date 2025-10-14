// lib/validations/auth.test.ts
// 인증 유효성 검증 함수 단위 테스트
// 이메일, 비밀번호 검증 로직 테스트
// 관련 파일: lib/validations/auth.ts

import { describe, it, expect } from 'vitest'
import { validateEmail, validatePassword, validatePasswordMatch } from './auth'

describe('validateEmail', () => {
  it('유효한 이메일 형식을 통과해야 함', () => {
    const result = validateEmail('test@example.com')
    expect(result.isValid).toBe(true)
    expect(result.error).toBeUndefined()
  })

  it('빈 이메일은 실패해야 함', () => {
    const result = validateEmail('')
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('이메일을 입력해주세요')
  })

  it('잘못된 이메일 형식은 실패해야 함', () => {
    const result = validateEmail('invalid-email')
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('올바른 이메일 형식이 아닙니다')
  })

  it('@가 없는 이메일은 실패해야 함', () => {
    const result = validateEmail('test.example.com')
    expect(result.isValid).toBe(false)
  })

  it('도메인이 없는 이메일은 실패해야 함', () => {
    const result = validateEmail('test@')
    expect(result.isValid).toBe(false)
  })
})

describe('validatePassword', () => {
  it('유효한 비밀번호는 통과해야 함', () => {
    const result = validatePassword('Test123!@#')
    expect(result.isValid).toBe(true)
    expect(result.error).toBeUndefined()
  })

  it('빈 비밀번호는 실패해야 함', () => {
    const result = validatePassword('')
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('비밀번호를 입력해주세요')
  })

  it('8자 미만 비밀번호는 실패해야 함', () => {
    const result = validatePassword('Test1!')
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('비밀번호는 최소 8자 이상이어야 합니다')
    expect(result.strength).toBe('weak')
  })

  it('영문자가 없는 비밀번호는 실패해야 함', () => {
    const result = validatePassword('12345678!')
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다')
  })

  it('숫자가 없는 비밀번호는 실패해야 함', () => {
    const result = validatePassword('TestTest!')
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다')
  })

  it('특수문자가 없는 비밀번호는 실패해야 함', () => {
    const result = validatePassword('Test1234')
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다')
  })

  it('강한 비밀번호는 strong으로 판정되어야 함', () => {
    const result = validatePassword('TestPassword123!')
    expect(result.isValid).toBe(true)
    expect(result.strength).toBe('strong')
  })

  it('중간 강도 비밀번호는 medium으로 판정되어야 함', () => {
    const result = validatePassword('test123!')
    expect(result.isValid).toBe(true)
    expect(result.strength).toBe('medium')
  })
})

describe('validatePasswordMatch', () => {
  it('일치하는 비밀번호는 통과해야 함', () => {
    const result = validatePasswordMatch('Test123!', 'Test123!')
    expect(result.isValid).toBe(true)
    expect(result.error).toBeUndefined()
  })

  it('일치하지 않는 비밀번호는 실패해야 함', () => {
    const result = validatePasswordMatch('Test123!', 'Test456!')
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('비밀번호가 일치하지 않습니다')
  })

  it('빈 문자열도 일치하면 통과해야 함', () => {
    const result = validatePasswordMatch('', '')
    expect(result.isValid).toBe(true)
  })
})

