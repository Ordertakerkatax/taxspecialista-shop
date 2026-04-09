import { pgTable, text, integer, timestamp, pgEnum, uuid } from "drizzle-orm/pg-core";

export const paymentMethodEnum = pgEnum("payment_method", ["gcash", "bank_transfer"]);
export const paymentStatusEnum = pgEnum("payment_status", ["pending", "approved", "rejected"]);
export const consultationTierEnum = pgEnum("consultation_tier", ["basic", "comprehensive"]);

export const paymentSubmissions = pgTable("payment_submissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull(),
  tier: consultationTierEnum("tier").notNull(),
  paymentMethod: paymentMethodEnum("payment_method").notNull(),
  referenceNumber: text("reference_number").notNull(),
  screenshotUrl: text("screenshot_url"),
  amountPhp: integer("amount_php").notNull(),
  status: paymentStatusEnum("status").default("pending").notNull(),
  rejectionReason: text("rejection_reason"),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const consultationSessions = pgTable("consultation_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  paymentId: uuid("payment_id").references(() => paymentSubmissions.id).notNull().unique(),
  email: text("email").notNull(),
  tier: consultationTierEnum("tier").notNull(),
  sessionToken: text("session_token").notNull().unique(),
  activatedAt: timestamp("activated_at").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const messageRoleEnum = pgEnum("message_role", ["user", "assistant"]);

export const chatMessages = pgTable("chat_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: uuid("session_id").references(() => consultationSessions.id).notNull(),
  role: messageRoleEnum("role").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ChatMessage = typeof chatMessages.$inferSelect;
export type NewChatMessage = typeof chatMessages.$inferInsert;
