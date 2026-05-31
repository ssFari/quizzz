import { GameShell } from "@/components/game/game-shell";
import { getPlayerId } from "@/lib/session";
import { getLeaderboard, getPlayer } from "@/queries/player";
import type { LeaderboardEntry, Player } from "@/types/types";

// Reads run at request time (cookies). Wrap so a missing/unconfigured DB still
// renders the setup screen instead of crashing the page.
async function safe<T>(promise: Promise<T>, fallback: T): Promise<T> {
	try {
		return await promise;
	} catch {
		return fallback;
	}
}

export default async function Page() {
	const id = await getPlayerId();
	const player = await safe<Player | null>(
		id ? getPlayer(id) : Promise.resolve(null),
		null,
	);
	const leaderboard = await safe<LeaderboardEntry[]>(getLeaderboard(id), []);

	return <GameShell initialPlayer={player} initialLeaderboard={leaderboard} />;
}
