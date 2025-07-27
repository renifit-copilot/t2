import { pgTable, serial, varchar, text, integer, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

// Типы ролей
export const UserRole = {
  STUDENT: 'student',
  MENTOR: 'mentor',
  TEACHER: 'teacher',
} as const;

export type UserRoleType = typeof UserRole[keyof typeof UserRole];

// Таблица кодов доступа
export const accessCodes = pgTable('access_codes', {
  id: serial('id').primaryKey(),
  code: varchar('code', { length: 16 }).unique().notNull(),
  role: text('role', { enum: ['student', 'mentor', 'teacher'] }).notNull(),
  groupCode: varchar('group_code', { length: 16 }),
  expiresAt: text('expires_at'),
});

// Таблица пользователей
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  telegramId: varchar('telegram_id', { length: 32 }).unique().notNull(),
  username: varchar('username', { length: 64 }),
  fullName: varchar('full_name', { length: 128 }),
  role: text('role', { enum: ['student', 'mentor', 'teacher'] }).notNull(),
  groupCode: varchar('group_code', { length: 16 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Таблица слотов занятий
export const slots = pgTable('slots', {
  id: serial('id').primaryKey(),
  date: timestamp('date').notNull(),
  groupCode: varchar('group_code', { length: 16 }).notNull(),
  mentorId: integer('mentor_id').references(() => users.id).notNull(),
  type: text('type').notNull(),
});

// Таблица отзывов
export const feedback = pgTable('feedback', {
  id: serial('id').primaryKey(),
  studentId: integer('student_id').references(() => users.id).notNull(),
  slotId: integer('slot_id').references(() => slots.id).notNull(),
  rating: integer('rating').notNull(),
  comment: text('comment'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Отношения
export const usersRelations = relations(users, ({ many }) => ({
  slots: many(slots),
  feedback: many(feedback),
}));

export const slotsRelations = relations(slots, ({ one, many }) => ({
  mentor: one(users, {
    fields: [slots.mentorId],
    references: [users.id],
  }),
  feedback: many(feedback),
}));

export const feedbackRelations = relations(feedback, ({ one }) => ({
  student: one(users, {
    fields: [feedback.studentId],
    references: [users.id],
  }),
  slot: one(slots, {
    fields: [feedback.slotId],
    references: [slots.id],
  }),
}));
