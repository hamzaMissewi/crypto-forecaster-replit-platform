import { pgTable, text, serial, integer, boolean, timestamp, jsonb, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Export auth and chat models
export * from "./models/auth";
export * from "./models/chat";

import { users } from "./models/auth";

// Crypto Favorites
export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(), // Matching the auth user id type (string/varchar)
  symbol: text("symbol").notNull(), // e.g., "bitcoin"
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Time Machine Scenarios
export const scenarios = pgTable("scenarios", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  coinId: text("coin_id").notNull(), // e.g., "bitcoin"
  date: timestamp("date").notNull(),
  investmentAmount: decimal("investment_amount").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Schemas
export const insertFavoriteSchema = createInsertSchema(favorites).omit({ id: true, createdAt: true });
export const insertScenarioSchema = createInsertSchema(scenarios).omit({ id: true, createdAt: true });

// Types
export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type Scenario = typeof scenarios.$inferSelect;
export type InsertScenario = z.infer<typeof insertScenarioSchema>;
