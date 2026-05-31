import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/db/schema";

let cached: ReturnType<typeof drizzle<typeof schema>> | null = null;

function getDb() {
	if (cached) return cached;
	const url = process.env.DATABASE_URL;
	if (!url) throw new Error("DATABASE_URL is not set");
	cached = drizzle(neon(url), { schema });
	return cached;
}

// Lazy Proxy avoids a build-time crash when env is not yet present
// (e.g. during the Vercel build step before runtime env injection).
export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
	get(_t, prop, receiver) {
		return Reflect.get(getDb(), prop, receiver);
	},
});

export type DB = ReturnType<typeof drizzle<typeof schema>>;
