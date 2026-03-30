import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, decimal } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
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

/**
 * Seating tables for the wedding
 */
export const seatingTables = mysqlTable("seating_tables", {
  id: int("id").autoincrement().primaryKey(),
  tableNumber: int("table_number").notNull().unique(),
  capacity: int("capacity").notNull().default(8),
  status: mysqlEnum("status", ["available", "reserved", "full"]).default("available").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SeatingTable = typeof seatingTables.$inferSelect;
export type InsertSeatingTable = typeof seatingTables.$inferInsert;

/**
 * Guest bookings for tables
 */
export const bookings = mysqlTable("bookings", {
  id: int("id").autoincrement().primaryKey(),
  tableId: int("table_id").notNull(),
  guestName: varchar("guest_name", { length: 255 }).notNull(),
  guestEmail: varchar("guest_email", { length: 320 }).notNull(),
  guestPhone: varchar("guest_phone", { length: 20 }),
  numberOfGuests: int("number_of_guests").notNull().default(1),
  specialRequests: text("special_requests"),
  confirmationCode: varchar("confirmation_code", { length: 64 }).notNull().unique(),
  emailSent: boolean("email_sent").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = typeof bookings.$inferInsert;

/**
 * Guest information for admin management
 */
export const guests = mysqlTable("guests", {
  id: int("id").autoincrement().primaryKey(),
  bookingId: int("booking_id").notNull(),
  firstName: varchar("first_name", { length: 255 }).notNull(),
  lastName: varchar("last_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  dietaryRestrictions: varchar("dietary_restrictions", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Guest = typeof guests.$inferSelect;
export type InsertGuest = typeof guests.$inferInsert;

/**
 * Email logs for tracking sent emails
 */
export const emailLogs = mysqlTable("email_logs", {
  id: int("id").autoincrement().primaryKey(),
  bookingId: int("booking_id"),
  recipientEmail: varchar("recipient_email", { length: 320 }).notNull(),
  emailType: mysqlEnum("email_type", ["confirmation", "reminder", "cancellation"]).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["sent", "failed", "pending"]).default("pending").notNull(),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EmailLog = typeof emailLogs.$inferSelect;
export type InsertEmailLog = typeof emailLogs.$inferInsert;

/**
 * Wedding event configuration
 */
export const weddingConfig = mysqlTable("wedding_config", {
  id: int("id").autoincrement().primaryKey(),
  eventDate: timestamp("event_date").notNull(),
  eventLocation: varchar("event_location", { length: 255 }),
  groomName: varchar("groom_name", { length: 255 }).notNull(),
  brideName: varchar("bride_name", { length: 255 }).notNull(),
  totalTables: int("total_tables").notNull().default(25),
  guestCapacity: int("guest_capacity").notNull().default(200),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type WeddingConfig = typeof weddingConfig.$inferSelect;
export type InsertWeddingConfig = typeof weddingConfig.$inferInsert;