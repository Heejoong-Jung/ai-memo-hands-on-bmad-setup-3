// drizzle.config.ts
// Drizzle Kit 설정 파일 - 마이그레이션 및 스키마 관리
// Supabase Postgres 연결 정보 포함
// 관련 파일: drizzle/schema.ts, .env.local

import { defineConfig } from 'drizzle-kit';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

export default defineConfig({
  dialect: 'postgresql',
  schema: './drizzle/schema.ts',
  out: './drizzle/migrations',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});

