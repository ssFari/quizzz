"use server";

import { eq } from "drizzle-orm";
import { players } from "@/db/schema/players";
import { db } from "@/lib/db";
import { getPlayerId } from "@/lib/session";
import { getPlayer, getWrongQuestions } from "@/queries/player";
import { getSetByCode, listPublicSets } from "@/queries/quiz-set";
import { joinCodeSchema, setResultSchema } from "@/schemas/quiz-set.schema";
import { mergeWrong } from "@/services/quiz";
import type {
	ActionResult,
	Player,
	QuizSetSummary,
	QuizSetWithQuestions,
} from "@/types/types";

/** Public list of teacher sets for students to browse. */
export async function fetchPublicSets(): Promise<QuizSetSummary[]> {
	return listPublicSets();
}

/** Resolve a join code to a playable set. */
export async function joinSetByCode(
	rawCode: string,
): Promise<ActionResult<QuizSetWithQuestions>> {
	const parsed = joinCodeSchema.safeParse(rawCode);
	if (!parsed.success)
		return {
			success: false,
			error: parsed.error.issues[0]?.message ?? "Kode tidak valid.",
		};

	const set = await getSetByCode(parsed.data);
	if (!set)
		return { success: false, error: "Kode tidak ditemukan. Cek lagi ya." };
	if (set.questions.length === 0)
		return { success: false, error: "Soal ini belum punya pertanyaan." };
	return { success: true, data: set };
}

/** Award XP + record missed questions after finishing a teacher set. */
export async function submitSetResult(
	input: unknown,
): Promise<ActionResult<Player>> {
	const parsed = setResultSchema.safeParse(input);
	if (!parsed.success) return { success: false, error: "Hasil tidak valid." };

	try {
		const id = await getPlayerId();
		if (!id)
			return { success: false, error: "Buat profil dulu ya sebelum bermain." };

		const current = await getPlayer(id);
		if (!current) return { success: false, error: "Profil tidak ditemukan." };

		const prevWrong = await getWrongQuestions(id);
		const wrong = mergeWrong(prevWrong, parsed.data.wrong);
		const next: Player = { ...current, xp: current.xp + parsed.data.xpGained };

		await db
			.update(players)
			.set({ xp: next.xp, wrongQuestions: wrong, updatedAt: new Date() })
			.where(eq(players.id, id));

		return { success: true, data: next };
	} catch {
		return { success: false, error: "Gagal menyimpan hasil. Coba lagi ya." };
	}
}
