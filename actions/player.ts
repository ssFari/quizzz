"use server";

import { eq } from "drizzle-orm";
import { players } from "@/db/schema/players";
import { db } from "@/lib/db";
import { getPlayerId, newPlayerId, setPlayerId } from "@/lib/session";
import { getLeaderboard, getPlayer, getWrongQuestions } from "@/queries/player";
import { profileSchema, quizResultSchema } from "@/schemas/game.schema";
import { applyQuizResult, mergeWrong } from "@/services/quiz";
import type {
	ActionResult,
	LeaderboardEntry,
	Player,
	QuizOutcome,
	WrongAnswer,
} from "@/types/types";

export async function saveProfile(
	input: unknown,
): Promise<ActionResult<Player>> {
	const parsed = profileSchema.safeParse(input);
	if (!parsed.success) {
		return {
			success: false,
			error: parsed.error.issues[0]?.message ?? "Data profil tidak valid.",
		};
	}

	try {
		let id = await getPlayerId();
		const now = new Date();

		if (id && (await getPlayer(id))) {
			await db
				.update(players)
				.set({
					name: parsed.data.name,
					avatar: parsed.data.avatar,
					updatedAt: now,
				})
				.where(eq(players.id, id));
		} else {
			if (!id) {
				id = newPlayerId();
				await setPlayerId(id);
			}
			await db.insert(players).values({
				id,
				name: parsed.data.name,
				avatar: parsed.data.avatar,
				updatedAt: now,
			});
		}

		const player = await getPlayer(id);
		if (!player) return { success: false, error: "Gagal menyimpan profil." };
		return { success: true, data: player };
	} catch {
		return { success: false, error: "Gagal menyimpan. Coba lagi sebentar ya." };
	}
}

export async function submitQuiz(
	input: unknown,
): Promise<ActionResult<QuizOutcome>> {
	const parsed = quizResultSchema.safeParse(input);
	if (!parsed.success)
		return { success: false, error: "Hasil kuis tidak valid." };

	try {
		const id = await getPlayerId();
		if (!id)
			return { success: false, error: "Buat profil dulu ya sebelum bermain." };

		const current = await getPlayer(id);
		if (!current) return { success: false, error: "Profil tidak ditemukan." };

		const outcome = applyQuizResult(current, parsed.data);
		const prevWrong = await getWrongQuestions(id);
		const wrong = mergeWrong(prevWrong, parsed.data.wrong);

		await db
			.update(players)
			.set({
				xp: outcome.player.xp,
				stars: outcome.player.stars,
				bestScore: outcome.player.bestScore,
				worldUnlocked: outcome.player.worldUnlocked,
				badges: outcome.player.badges,
				completedWorlds: outcome.player.completedWorlds,
				wrongQuestions: wrong,
				updatedAt: new Date(),
			})
			.where(eq(players.id, id));

		return { success: true, data: outcome };
	} catch {
		return { success: false, error: "Gagal menyimpan hasil. Coba lagi ya." };
	}
}

/** Client-callable read used by TanStack Query to refresh the leaderboard. */
export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
	const id = await getPlayerId();
	return getLeaderboard(id);
}

/** Client-callable read for the current guest's profile. */
export async function fetchPlayer(): Promise<Player | null> {
	const id = await getPlayerId();
	return id ? getPlayer(id) : null;
}

/** Client-callable read of the player's saved wrong-answer review list. */
export async function fetchWrong(): Promise<WrongAnswer[]> {
	const id = await getPlayerId();
	return id ? getWrongQuestions(id) : [];
}
