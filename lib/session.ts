import { cookies } from "next/headers";

// Guest identity: a random id stored in an httpOnly cookie. No password,
// no account — just enough to tie progress + leaderboard to a device.
// (Importing next/headers makes this module server-only by construction.)

const COOKIE_NAME = "player_id";
const ONE_YEAR = 60 * 60 * 24 * 365;

export async function getPlayerId(): Promise<string | null> {
	const store = await cookies();
	return store.get(COOKIE_NAME)?.value ?? null;
}

export async function setPlayerId(id: string): Promise<void> {
	const store = await cookies();
	store.set(COOKIE_NAME, id, {
		httpOnly: true,
		sameSite: "lax",
		secure: process.env.NODE_ENV === "production",
		maxAge: ONE_YEAR,
		path: "/",
	});
}

export function newPlayerId(): string {
	return crypto.randomUUID();
}
