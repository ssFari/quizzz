import { sql } from "drizzle-orm";
import {
	boolean,
	index,
	integer,
	jsonb,
	pgTable,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import type { Difficulty, QuestionType } from "@/types/types";
import { user } from "./auth";

// A quiz pack authored by a teacher. Students reach it via the public list or
// by typing its short join code (Kahoot-style).
export const quizSets = pgTable(
	"quiz_sets",
	{
		id: text("id").primaryKey(),
		/** Short, human-typeable join code (uppercase A–Z/0–9). Unique. */
		code: text("code").notNull().unique(),
		title: text("title").notNull(),
		description: text("description").notNull().default(""),
		emoji: text("emoji").notNull().default("📘"),
		authorId: text("author_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		/** Snapshot of the author name so the student list needs no join. */
		authorName: text("author_name").notNull().default("Guru"),
		isPublic: boolean("is_public").notNull().default(true),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at").notNull().defaultNow(),
	},
	(t) => [index("quiz_sets_author_idx").on(t.authorId)],
);

export const quizSetQuestions = pgTable(
	"quiz_set_questions",
	{
		id: text("id").primaryKey(),
		setId: text("set_id")
			.notNull()
			.references(() => quizSets.id, { onDelete: "cascade" }),
		prompt: text("prompt").notNull(),
		type: text("type").$type<QuestionType>().notNull().default("mc"),
		/** Choices for multiple-choice; null/empty for short-answer. */
		options: jsonb("options")
			.$type<string[]>()
			.notNull()
			.default(sql`'[]'::jsonb`),
		answer: text("answer").notNull(),
		explanation: text("explanation").notNull().default(""),
		difficulty: text("difficulty")
			.$type<Difficulty>()
			.notNull()
			.default("mudah"),
		xp: integer("xp").notNull().default(10),
		/** Display order within the set. */
		position: integer("position").notNull().default(0),
		createdAt: timestamp("created_at").notNull().defaultNow(),
	},
	(t) => [index("quiz_set_questions_set_idx").on(t.setId)],
);

export type SelectQuizSet = typeof quizSets.$inferSelect;
export type InsertQuizSet = typeof quizSets.$inferInsert;
export type SelectQuizSetQuestion = typeof quizSetQuestions.$inferSelect;
export type InsertQuizSetQuestion = typeof quizSetQuestions.$inferInsert;
