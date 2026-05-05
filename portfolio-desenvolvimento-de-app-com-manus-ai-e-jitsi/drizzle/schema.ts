import {
  boolean,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

/**
 * Tabela de recrutadores — autenticação própria com email e senha (hash bcrypt).
 * Separada da tabela de OAuth para suportar login independente.
 */
export const recruiters = mysqlTable("recruiters", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * Tabela de entrevistas — cada entrevista tem um candidato, cargo e sala Jitsi.
 */
export const interviews = mysqlTable("interviews", {
  id: int("id").autoincrement().primaryKey(),
  recruiterId: int("recruiterId").notNull(),
  candidateName: varchar("candidateName", { length: 255 }).notNull(),
  jobTitle: varchar("jobTitle", { length: 255 }).notNull(),
  roomName: varchar("roomName", { length: 255 }).notNull(),
  scheduledAt: timestamp("scheduledAt").notNull(),
  status: mysqlEnum("status", ["scheduled", "completed", "cancelled"])
    .default("scheduled")
    .notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * Tabela de scorecards — avaliação privada do recrutador por entrevista.
 * Visível APENAS para o recrutador que a criou.
 */
export const scorecards = mysqlTable("scorecards", {
  id: int("id").autoincrement().primaryKey(),
  interviewId: int("interviewId").notNull(),
  recruiterId: int("recruiterId").notNull(),
  // Critérios de avaliação (1–5)
  communication: int("communication").default(0).notNull(),
  technicalSkills: int("technicalSkills").default(0).notNull(),
  culturalFit: int("culturalFit").default(0).notNull(),
  proactivity: int("proactivity").default(0).notNull(),
  presentation: int("presentation").default(0).notNull(),
  // Campos de texto livre
  strengths: text("strengths"),
  improvements: text("improvements"),
  // Recomendação final
  recommendation: mysqlEnum("recommendation", ["approved", "on_hold", "rejected"]).default("on_hold").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// Tipos exportados para uso no frontend e backend
export type Recruiter = typeof recruiters.$inferSelect;
export type InsertRecruiter = typeof recruiters.$inferInsert;

export type Interview = typeof interviews.$inferSelect;
export type InsertInterview = typeof interviews.$inferInsert;

export type Scorecard = typeof scorecards.$inferSelect;
export type InsertScorecard = typeof scorecards.$inferInsert;

// Tabela users mantida para compatibilidade com o framework OAuth (não usada no fluxo principal)
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
