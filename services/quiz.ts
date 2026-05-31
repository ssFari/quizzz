import {
	PASS_THRESHOLD,
	PERFECT_BONUS,
	QUESTION_BANK,
} from "@/lib/game-content";
import type {
	BadgeId,
	Difficulty,
	Player,
	Question,
	QuizOutcome,
	QuizResultInput,
	WorldId,
	WrongAnswer,
} from "@/types/types";

/** Normalise free-text answers so "1 / 8" and "1/8" compare equal. */
export function normalizeAnswer(value: string): string {
	return value.trim().toLowerCase().replace(/\s+/g, "").replace(/\./g, ",");
}

export function checkAnswer(question: Question, raw: string): boolean {
	return normalizeAnswer(raw) === normalizeAnswer(question.answer);
}

export function difficultyMeta(d: Difficulty): {
	label: string;
	seconds: number;
} {
	switch (d) {
		case "mudah":
			return { label: "Mudah", seconds: 45 };
		case "sedang":
			return { label: "Sedang", seconds: 45 };
		case "sulit":
			return { label: "HOTS", seconds: 60 };
	}
}

export function maxScoreFor(worldId: WorldId): number {
	return QUESTION_BANK[worldId].reduce((sum, q) => sum + q.xp, 0);
}

export function computeStars(percent: number): number {
	if (percent >= 90) return 3;
	if (percent >= PASS_THRESHOLD) return 2;
	return 1;
}

const BADGE_BY_WORLD: Record<WorldId, BadgeId> = {
	1: "master_pangkat",
	2: "raja_akar",
	3: "ahli_bentuk_baku",
};

/**
 * Pure: given the current player and a finished-quiz payload, compute the
 * next player state plus what changed. Used by both the persist action and
 * the optimistic client summary so the numbers always match.
 */
export function applyQuizResult(
	player: Player,
	input: QuizResultInput,
): QuizOutcome {
	const passed = input.scorePercent >= PASS_THRESHOLD;
	const perfect =
		input.wrong.length === 0 && input.correctCount === input.totalCount;

	const badges = new Set<BadgeId>(player.badges);
	const newBadges: BadgeId[] = [];

	if (passed) {
		const earned = BADGE_BY_WORLD[input.worldId];
		if (!badges.has(earned)) {
			badges.add(earned);
			newBadges.push(earned);
		}
	}
	if (perfect && !badges.has("perfect_score")) {
		badges.add("perfect_score");
		newBadges.push("perfect_score");
	}

	const gained = input.xpGained + (perfect ? PERFECT_BONUS : 0);
	const prevUnlocked = player.worldUnlocked;
	const worldUnlocked = (
		passed
			? Math.min(3, Math.max(prevUnlocked, input.worldId + 1))
			: prevUnlocked
	) as WorldId;

	const completed = new Set<WorldId>(player.completedWorlds);
	if (passed) completed.add(input.worldId);

	const next: Player = {
		...player,
		xp: player.xp + gained,
		stars: player.stars + input.stars,
		bestScore: Math.max(player.bestScore, input.scorePercent),
		worldUnlocked,
		badges: [...badges],
		completedWorlds: [...completed],
	};

	return {
		player: next,
		unlockedNewWorld: worldUnlocked > prevUnlocked,
		newBadges,
	};
}

/** Merge newly-missed questions into the kept list, newest first, de-duplicated. */
export function mergeWrong(
	prev: WrongAnswer[],
	incoming: WrongAnswer[],
	cap = 12,
): WrongAnswer[] {
	const seen = new Set<string>();
	const out: WrongAnswer[] = [];
	for (const w of [...incoming, ...prev]) {
		if (seen.has(w.prompt)) continue;
		seen.add(w.prompt);
		out.push(w);
		if (out.length >= cap) break;
	}
	return out;
}
