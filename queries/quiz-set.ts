import { asc, desc, eq, sql } from "drizzle-orm";
import {
	quizSetQuestions,
	quizSets,
	type SelectQuizSet,
	type SelectQuizSetQuestion,
} from "@/db/schema/quiz-sets";
import { db } from "@/lib/db";
import type {
	Question,
	QuizSetSummary,
	QuizSetWithQuestions,
} from "@/types/types";

function rowToSummary(
	row: SelectQuizSet & { questionCount: number },
): QuizSetSummary {
	return {
		id: row.id,
		code: row.code,
		title: row.title,
		description: row.description,
		emoji: row.emoji,
		authorName: row.authorName,
		questionCount: row.questionCount,
		isPublic: row.isPublic,
	};
}

function rowToQuestion(row: SelectQuizSetQuestion): Question {
	return {
		id: row.id,
		prompt: row.prompt,
		type: row.type,
		options: row.type === "mc" ? row.options : undefined,
		answer: row.answer,
		difficulty: row.difficulty,
		xp: row.xp,
		explanation: row.explanation,
	};
}

const countExpr = sql<number>`count(${quizSetQuestions.id})::int`;

/** Public sets students can browse, newest first. */
export async function listPublicSets(): Promise<QuizSetSummary[]> {
	const rows = await db
		.select({
			id: quizSets.id,
			code: quizSets.code,
			title: quizSets.title,
			description: quizSets.description,
			emoji: quizSets.emoji,
			authorId: quizSets.authorId,
			authorName: quizSets.authorName,
			isPublic: quizSets.isPublic,
			createdAt: quizSets.createdAt,
			updatedAt: quizSets.updatedAt,
			questionCount: countExpr,
		})
		.from(quizSets)
		.leftJoin(quizSetQuestions, eq(quizSetQuestions.setId, quizSets.id))
		.where(eq(quizSets.isPublic, true))
		.groupBy(quizSets.id)
		.orderBy(desc(quizSets.createdAt))
		.limit(60);
	return rows.map(rowToSummary);
}

/** Sets authored by one teacher (any visibility). */
export async function listSetsByAuthor(
	authorId: string,
): Promise<QuizSetSummary[]> {
	const rows = await db
		.select({
			id: quizSets.id,
			code: quizSets.code,
			title: quizSets.title,
			description: quizSets.description,
			emoji: quizSets.emoji,
			authorId: quizSets.authorId,
			authorName: quizSets.authorName,
			isPublic: quizSets.isPublic,
			createdAt: quizSets.createdAt,
			updatedAt: quizSets.updatedAt,
			questionCount: countExpr,
		})
		.from(quizSets)
		.leftJoin(quizSetQuestions, eq(quizSetQuestions.setId, quizSets.id))
		.where(eq(quizSets.authorId, authorId))
		.groupBy(quizSets.id)
		.orderBy(desc(quizSets.createdAt));
	return rows.map(rowToSummary);
}

async function loadQuestions(setId: string): Promise<Question[]> {
	const rows = await db
		.select()
		.from(quizSetQuestions)
		.where(eq(quizSetQuestions.setId, setId))
		.orderBy(asc(quizSetQuestions.position));
	return rows.map(rowToQuestion);
}

export async function getSetByCode(
	code: string,
): Promise<QuizSetWithQuestions | null> {
	const rows = await db
		.select()
		.from(quizSets)
		.where(eq(quizSets.code, code))
		.limit(1);
	const set = rows[0];
	if (!set) return null;
	const questions = await loadQuestions(set.id);
	return {
		id: set.id,
		code: set.code,
		title: set.title,
		description: set.description,
		emoji: set.emoji,
		authorName: set.authorName,
		isPublic: set.isPublic,
		questionCount: questions.length,
		questions,
	};
}

export async function getSetById(
	id: string,
): Promise<QuizSetWithQuestions | null> {
	const rows = await db
		.select()
		.from(quizSets)
		.where(eq(quizSets.id, id))
		.limit(1);
	const set = rows[0];
	if (!set) return null;
	const questions = await loadQuestions(set.id);
	return {
		id: set.id,
		code: set.code,
		title: set.title,
		description: set.description,
		emoji: set.emoji,
		authorName: set.authorName,
		isPublic: set.isPublic,
		questionCount: questions.length,
		questions,
	};
}

/** Returns the author id of a set (for ownership checks) or null. */
export async function getSetOwner(id: string): Promise<string | null> {
	const rows = await db
		.select({ authorId: quizSets.authorId })
		.from(quizSets)
		.where(eq(quizSets.id, id))
		.limit(1);
	return rows[0]?.authorId ?? null;
}

/** True when a join code is already taken. */
export async function codeExists(code: string): Promise<boolean> {
	const rows = await db
		.select({ id: quizSets.id })
		.from(quizSets)
		.where(eq(quizSets.code, code))
		.limit(1);
	return rows.length > 0;
}
