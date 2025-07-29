import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  timestamp,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// Типы ролей
export const UserRole = {
  STUDENT: 'student',
  MENTOR: 'mentor',
  TEACHER: 'teacher',
} as const

export type UserRoleType = typeof UserRole[keyof typeof UserRole]

// ─────────────────────────────────────────────
// Коды доступа (для регистрации)
export const accessCodes = pgTable('access_codes', {
  id: serial('id').primaryKey(),
  code: varchar('code', { length: 16 }).unique().notNull(),
  role: text('role', { enum: ['student', 'mentor', 'teacher'] }).notNull(),
  groupCode: varchar('group_code', { length: 16 }),
  expiresAt: text('expires_at'), // можно не использовать
})

// ─────────────────────────────────────────────
// Пользователи
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  telegramId: varchar('telegram_id', { length: 32 }).unique().notNull(),
  username: varchar('username', { length: 64 }),
  fullName: varchar('full_name', { length: 128 }),
  role: text('role', { enum: ['student', 'mentor', 'teacher'] }).notNull(),
  groupCode: varchar('group_code', { length: 16 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ─────────────────────────────────────────────
// Назначения наставников (вместо слотов)
export const mentorAssignments = pgTable('mentor_assignments', {
  id: serial('id').primaryKey(),
  mentorId: varchar('mentor_id', { length: 32 }).notNull(), // Telegram ID
  groupCode: varchar('group_code', { length: 16 }).notNull(),
  fromDate: timestamp('from_date').notNull(),
  toDate: timestamp('to_date').notNull(),
})

// ─────────────────────────────────────────────
// Отзывы
export const feedback = pgTable('feedback', {
  id: serial('id').primaryKey(),
  studentId: varchar('student_id', { length: 32 }).notNull(), // Telegram ID
  mentorId: varchar('mentor_id', { length: 32 }).notNull(),   // Telegram ID
  groupCode: varchar('group_code', { length: 16 }).notNull(),
  rating: integer('rating').notNull(),
  comment: text('comment'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ─────────────────────────────────────────────
// Relations (если хочешь использовать)
export const usersRelations = relations(users, ({ many }) => ({
  feedbacks: many(feedback),
  assignments: many(mentorAssignments),
}))

export const feedbackRelations = relations(feedback, ({ one }) => ({
  student: one(users, {
    fields: [feedback.studentId],
    references: [users.telegramId],
  }),
  mentor: one(users, {
    fields: [feedback.mentorId],
    references: [users.telegramId],
  }),
}))

export const assignmentsRelations = relations(mentorAssignments, ({ one }) => ({
  mentor: one(users, {
    fields: [mentorAssignments.mentorId],
    references: [users.telegramId],
  }),
}))
