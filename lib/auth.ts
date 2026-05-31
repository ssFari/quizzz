import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { account, session, user, verification } from "@/db/schema/auth";
import { db } from "@/lib/db";

// Auth is for teachers (guru) only — email + password. Students remain
// anonymous guests handled by lib/session.ts.
export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",
		schema: { user, session, account, verification },
	}),
	emailAndPassword: {
		enabled: true,
		autoSignIn: true,
		minPasswordLength: 6,
	},
	secret: process.env.BETTER_AUTH_SECRET,
	baseURL: process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL,
});
