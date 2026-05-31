import { desc, eq } from "drizzle-orm";
import { players, type SelectPlayer } from "@/db/schema/players";
import { db } from "@/lib/db";
import type { LeaderboardEntry, Player, WrongAnswer } from "@/types/types";

function rowToPlayer(row: SelectPlayer): Player {
	return {
		id: row.id,
		name: row.name,
		avatar: row.avatar,
		xp: row.xp,
		stars: row.stars,
		worldUnlocked: row.worldUnlocked,
		bestScore: row.bestScore,
		badges: row.badges,
		completedWorlds: row.completedWorlds,
	};
}

export async function getPlayer(id: string): Promise<Player | null> {
	const rows = await db
		.select()
		.from(players)
		.where(eq(players.id, id))
		.limit(1);
	const row = rows[0];
	return row ? rowToPlayer(row) : null;
}

export async function getWrongQuestions(id: string): Promise<WrongAnswer[]> {
	const rows = await db
		.select({ wrong: players.wrongQuestions })
		.from(players)
		.where(eq(players.id, id))
		.limit(1);
	return rows[0]?.wrong ?? [];
}

export async function getLeaderboard(
	meId: string | null,
): Promise<LeaderboardEntry[]> {
	const rows = await db
		.select()
		.from(players)
		.orderBy(desc(players.xp))
		.limit(10);

	return rows.map((row, index) => ({
		id: row.id,
		rank: index + 1,
		name: row.name,
		avatar: row.avatar,
		xp: row.xp,
		bestScore: row.bestScore,
		isMe: row.id === meId,
	}));
}
