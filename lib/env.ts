import { z } from "zod";

const isProd = process.env.NODE_ENV === "production";

// Treat empty strings (common in copied .env files) as "not set".
const emptyToUndefined = (v: unknown) => (v === "" ? undefined : v);

const schema = z.object({
	DATABASE_URL: isProd
		? z.preprocess(emptyToUndefined, z.url())
		: z.preprocess(emptyToUndefined, z.url().optional()),
	NEXT_PUBLIC_APP_URL: z.preprocess(emptyToUndefined, z.url().optional()),

	// ── AI tutor — Ollama (OpenAI-compatible). Absent → offline fallback. ──
	OLLAMA_BASE_URL: z.preprocess(emptyToUndefined, z.url().optional()),
	OLLAMA_MODEL: z.preprocess(emptyToUndefined, z.string().optional()),
	OLLAMA_API_KEY: z.preprocess(emptyToUndefined, z.string().optional()),
});

export type Env = z.infer<typeof schema>;

let cached: Env | null = null;

export function getEnv(): Env {
	if (cached) return cached;
	const parsed = schema.safeParse(process.env);
	if (!parsed.success) {
		const lines = parsed.error.issues
			.map((i) => `  · ${i.path.join(".")}: ${i.message}`)
			.join("\n");
		throw new Error(`Env validation failed:\n${lines}`);
	}
	cached = parsed.data;
	return cached;
}
