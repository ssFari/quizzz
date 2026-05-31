"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { quizSetQuestions, quizSets } from "@/db/schema/quiz-sets";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
	codeExists,
	getSetById,
	getSetOwner,
	listSetsByAuthor,
} from "@/queries/quiz-set";
import { quizSetInputSchema } from "@/schemas/quiz-set.schema";
import { xpForDifficulty } from "@/services/quiz";
import type {
	ActionResult,
	QuizSetSummary,
	QuizSetWithQuestions,
} from "@/types/types";

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous 0/O/1/I

type Teacher = { id: string; name: string };

async function requireTeacher(): Promise<Teacher | null> {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session?.user) return null;
	return { id: session.user.id, name: session.user.name };
}

async function uniqueCode(): Promise<string> {
	for (let attempt = 0; attempt < 8; attempt++) {
		let code = "";
		for (let i = 0; i < 6; i++) {
			code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
		}
		if (!(await codeExists(code))) return code;
	}
	// Extremely unlikely fallback.
	return `${Date.now().toString(36).toUpperCase().slice(-6)}`;
}

export async function createQuizSet(
	input: unknown,
): Promise<ActionResult<QuizSetWithQuestions>> {
	const teacher = await requireTeacher();
	if (!teacher)
		return { success: false, error: "Harus login sebagai guru dulu." };

	const parsed = quizSetInputSchema.safeParse(input);
	if (!parsed.success)
		return {
			success: false,
			error: parsed.error.issues[0]?.message ?? "Data soal tidak valid.",
		};

	try {
		const id = crypto.randomUUID();
		const code = await uniqueCode();
		const { title, description, emoji, isPublic, questions } = parsed.data;

		await db.insert(quizSets).values({
			id,
			code,
			title,
			description,
			emoji,
			isPublic,
			authorId: teacher.id,
			authorName: teacher.name,
		});
		await db.insert(quizSetQuestions).values(
			questions.map((q, position) => ({
				id: crypto.randomUUID(),
				setId: id,
				prompt: q.prompt,
				type: q.type,
				options: q.type === "mc" ? q.options.filter(Boolean) : [],
				answer: q.answer,
				explanation: q.explanation,
				difficulty: q.difficulty,
				xp: xpForDifficulty(q.difficulty),
				position,
			})),
		);

		const created = await getSetById(id);
		if (!created) return { success: false, error: "Gagal memuat soal baru." };
		return { success: true, data: created };
	} catch {
		return { success: false, error: "Gagal menyimpan soal. Coba lagi ya." };
	}
}

export async function updateQuizSet(
	setId: string,
	input: unknown,
): Promise<ActionResult<QuizSetWithQuestions>> {
	const teacher = await requireTeacher();
	if (!teacher)
		return { success: false, error: "Harus login sebagai guru dulu." };

	const owner = await getSetOwner(setId);
	if (!owner) return { success: false, error: "Soal tidak ditemukan." };
	if (owner !== teacher.id)
		return { success: false, error: "Kamu bukan pemilik soal ini." };

	const parsed = quizSetInputSchema.safeParse(input);
	if (!parsed.success)
		return {
			success: false,
			error: parsed.error.issues[0]?.message ?? "Data soal tidak valid.",
		};

	try {
		const { title, description, emoji, isPublic, questions } = parsed.data;
		await db
			.update(quizSets)
			.set({ title, description, emoji, isPublic, updatedAt: new Date() })
			.where(eq(quizSets.id, setId));

		// Replace questions wholesale — simplest correct sync for an editor.
		await db.delete(quizSetQuestions).where(eq(quizSetQuestions.setId, setId));
		await db.insert(quizSetQuestions).values(
			questions.map((q, position) => ({
				id: crypto.randomUUID(),
				setId,
				prompt: q.prompt,
				type: q.type,
				options: q.type === "mc" ? q.options.filter(Boolean) : [],
				answer: q.answer,
				explanation: q.explanation,
				difficulty: q.difficulty,
				xp: xpForDifficulty(q.difficulty),
				position,
			})),
		);

		const updated = await getSetById(setId);
		if (!updated) return { success: false, error: "Gagal memuat soal." };
		return { success: true, data: updated };
	} catch {
		return { success: false, error: "Gagal memperbarui soal. Coba lagi ya." };
	}
}

export async function deleteQuizSet(
	setId: string,
): Promise<ActionResult<{ id: string }>> {
	const teacher = await requireTeacher();
	if (!teacher)
		return { success: false, error: "Harus login sebagai guru dulu." };

	const owner = await getSetOwner(setId);
	if (!owner) return { success: false, error: "Soal tidak ditemukan." };
	if (owner !== teacher.id)
		return { success: false, error: "Kamu bukan pemilik soal ini." };

	try {
		await db.delete(quizSets).where(eq(quizSets.id, setId));
		return { success: true, data: { id: setId } };
	} catch {
		return { success: false, error: "Gagal menghapus soal." };
	}
}

/** Client-callable read of the signed-in teacher's own sets. */
export async function fetchMySets(): Promise<QuizSetSummary[]> {
	const teacher = await requireTeacher();
	if (!teacher) return [];
	return listSetsByAuthor(teacher.id);
}

/** Full set (with questions) for the editor. */
export async function fetchMySet(
	setId: string,
): Promise<QuizSetWithQuestions | null> {
	const teacher = await requireTeacher();
	if (!teacher) return null;
	const owner = await getSetOwner(setId);
	if (owner !== teacher.id) return null;
	return getSetById(setId);
}
