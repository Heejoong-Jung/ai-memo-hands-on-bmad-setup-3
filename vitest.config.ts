// vitest.config.ts
// Vitest 테스트 프레임워크 설정
// React 컴포넌트 및 유틸리티 함수 테스트 환경 구성
// 관련 파일: package.json, lib/validations/auth.test.ts

import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})

