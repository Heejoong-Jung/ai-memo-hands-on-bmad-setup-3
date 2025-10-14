// drizzle/schema.ts
// Drizzle ORM 스키마 정의 파일 - Notes 테이블
// Supabase Postgres 데이터베이스 구조 정의
// 관련 파일: drizzle.config.ts, lib/db/notes.ts

import { pgTable, uuid, text, timestamp, index } from 'drizzle-orm/pg-core';

export const notes = pgTable(
  'notes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull(),
    title: text('title').notNull(),
    content: text('content').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index('notes_user_id_idx').on(table.userId),
    createdAtIdx: index('notes_created_at_idx').on(table.createdAt),
  })
);

// TypeScript 타입 추론
export type Note = typeof notes.$inferSelect;
export type NewNote = typeof notes.$inferInsert;

