// All global types live in this file.
// Zod-inferred → schemas/, Drizzle-inferred → db/schema/.

// ─── Game content ──────────────────────────────────────
export type WorldId = 1 | 2 | 3;

export type Difficulty = "mudah" | "sedang" | "sulit";

export type QuestionType = "mc" | "short";

export type Question = {
	id: string;
	prompt: string;
	type: QuestionType;
	/** Only for multiple-choice questions. */
	options?: string[];
	answer: string;
	difficulty: Difficulty;
	xp: number;
	explanation: string;
};

export type World = {
	id: WorldId;
	name: string;
	emoji: string;
	subtitle: string;
	/** Hue used to theme the world (CSS custom prop value). */
	accent: string;
	lesson: string;
	concept: string;
	formula: string;
	example: string;
};

export type MiniQuestion = {
	prompt: string;
	answer: string;
	options: string[];
};

// ─── Player & progress ─────────────────────────────────
export type BadgeId =
	| "master_pangkat"
	| "raja_akar"
	| "ahli_bentuk_baku"
	| "perfect_score";

export type Player = {
	id: string;
	name: string;
	avatar: string;
	xp: number;
	stars: number;
	worldUnlocked: WorldId;
	bestScore: number;
	badges: BadgeId[];
	completedWorlds: WorldId[];
};

export type LeaderboardEntry = {
	id: string;
	rank: number;
	name: string;
	avatar: string;
	xp: number;
	bestScore: number;
	isMe: boolean;
};

// ─── Quiz runtime ──────────────────────────────────────
export type QuizMode = "latihan" | "boss";

export type WrongAnswer = {
	prompt: string;
	answer: string;
	explanation: string;
};

export type QuizResultInput = {
	worldId: WorldId;
	mode: QuizMode;
	/** 0..100 percentage of max score. */
	scorePercent: number;
	xpGained: number;
	stars: number;
	correctCount: number;
	totalCount: number;
	wrong: WrongAnswer[];
};

export type QuizOutcome = {
	player: Player;
	unlockedNewWorld: boolean;
	newBadges: BadgeId[];
};

// ─── AI tutor ──────────────────────────────────────────
export type ChatRole = "user" | "tutor";

export type ChatMessage = {
	role: ChatRole;
	text: string;
};

// ─── Action result envelope ────────────────────────────
export type ActionResult<T> =
	| { success: true; data: T }
	| { success: false; error: string };
