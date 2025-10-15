// drizzle/schema.ts
// Drizzle ORM 스키마 정의 파일 - Notes 및 Summaries 테이블
// Supabase Postgres 데이터베이스 구조 정의
// 관련 파일: drizzle.config.ts, lib/db/notes.ts, lib/db/summaries.ts

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
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => ({
    userIdIdx: index('notes_user_id_idx').on(table.userId),
    createdAtIdx: index('notes_created_at_idx').on(table.createdAt),
    deletedAtIdx: index('notes_deleted_at_idx').on(table.deletedAt),
  })
);

// TypeScript 타입 추론
export type Note = typeof notes.$inferSelect;
export type NewNote = typeof notes.$inferInsert;

export const summaries = pgTable(
  'summaries',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    noteId: uuid('note_id')
      .notNull()
      .references(() => notes.id, { onDelete: 'cascade' }),
    model: text('model').notNull(),
    content: text('content').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    noteIdIdx: index('summaries_note_id_idx').on(table.noteId),
  })
);

// TypeScript 타입 추론
export type Summary = typeof summaries.$inferSelect;
export type NewSummary = typeof summaries.$inferInsert;

export const noteTags = pgTable(
  'note_tags',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    noteId: uuid('note_id')
      .notNull()
      .references(() => notes.id, { onDelete: 'cascade' }),
    tag: text('tag').notNull(),
  },
  (table) => ({
    noteIdIdx: index('note_tags_note_id_idx').on(table.noteId),
    tagIdx: index('note_tags_tag_idx').on(table.tag),
  })
);

// TypeScript 타입 추론
export type NoteTag = typeof noteTags.$inferSelect;
export type NewNoteTag = typeof noteTags.$inferInsert;

