// lib/db/client.ts
// Drizzle ORM 클라이언트 설정
// Supabase Postgres 연결 및 Drizzle 인스턴스 생성
// 관련 파일: drizzle/schema.ts, lib/db/notes.ts

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@/drizzle/schema';

// Postgres 클라이언트 연결
const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);

// Drizzle ORM 인스턴스
export const db = drizzle(client, { schema });

