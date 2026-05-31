import { sql } from "drizzle-orm";
import { integer, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import type { BadgeId, WorldId, WrongAnswer } from "@/types/types";

export const players = pgTable("players", {
	// Guest id — also stored in the httpOnly `player_id` cookie.
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	avatar: text("avatar").notNull().default("🦊"),
	xp: integer("xp").notNull().default(0),
	stars: integer("stars").notNull().default(0),
	worldUnlocked: integer("world_unlocked")
		.$type<WorldId>()
		.notNull()
		.default(1),
	bestScore: integer("best_score").notNull().default(0),
	badges: jsonb("badges")
		.$type<BadgeId[]>()
		.notNull()
		.default(sql`'[]'::jsonb`),
	completedWorlds: jsonb("completed_worlds")
		.$type<WorldId[]>()
		.notNull()
		.default(sql`'[]'::jsonb`),
	wrongQuestions: jsonb("wrong_questions")
		.$type<WrongAnswer[]>()
		.notNull()
		.default(sql`'[]'::jsonb`),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type SelectPlayer = typeof players.$inferSelect;
export type InsertPlayer = typeof players.$inferInsert;
