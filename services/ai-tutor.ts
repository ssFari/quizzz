import { getEnv } from "@/lib/env";
import { WORLDS } from "@/lib/game-content";
import type { WorldId } from "@/types/types";

export type AskTutorParams = {
	worldId?: WorldId;
	question: string;
	questionContext?: string;
};

// The tutor talks to a local Ollama server running the minimax-m2.5 model
// via its OpenAI-compatible endpoint. Pull it once: `ollama pull minimax-m2.5`.
const DEFAULT_BASE_URL = "http://localhost:11434/v1";
const DEFAULT_MODEL = "minimax-m2.5";

const SYSTEM_PROMPT =
	"Kamu adalah Tutor AI Matematika yang ramah, sabar, dan bersemangat untuk siswa SMP kelas VIII di Indonesia. " +
	"Materi: bilangan berpangkat bulat, bentuk akar, dan bentuk baku (notasi ilmiah). " +
	"Jawab dalam Bahasa Indonesia, santai dan memotivasi, maksimal 3 kalimat. " +
	"Berikan PETUNJUK, ingatkan rumus atau sifat yang relevan, dan ajak berpikir langkah demi langkah. " +
	"JANGAN langsung memberikan jawaban akhir jika siswa sedang mengerjakan soal.";

function buildUserMessage(p: AskTutorParams): string {
	const world = p.worldId ? WORLDS[p.worldId] : null;
	const materi = world
		? `Materi saat ini: ${world.name} (${world.subtitle}).`
		: "";
	const soal = p.questionContext
		? `Soal yang sedang dikerjakan: "${p.questionContext}".`
		: "";
	return [materi, soal, `Pertanyaan siswa: "${p.question}"`]
		.filter(Boolean)
		.join("\n");
}

type ChatCompletion = {
	choices?: { message?: { content?: string } }[];
};

export async function askTutor(params: AskTutorParams): Promise<string> {
	const env = getEnv();
	const baseUrl = env.OLLAMA_BASE_URL ?? DEFAULT_BASE_URL;
	const model = env.OLLAMA_MODEL ?? DEFAULT_MODEL;

	try {
		return await viaOllama(
			baseUrl,
			model,
			env.OLLAMA_API_KEY,
			buildUserMessage(params),
		);
	} catch {
		return offlineFallback(params);
	}
}

async function viaOllama(
	baseUrl: string,
	model: string,
	apiKey: string | undefined,
	userMessage: string,
): Promise<string> {
	const res = await fetch(`${baseUrl.replace(/\/+$/, "")}/chat/completions`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
		},
		body: JSON.stringify({
			model,
			messages: [
				{ role: "system", content: SYSTEM_PROMPT },
				{ role: "user", content: userMessage },
			],
			temperature: 0.6,
			max_tokens: 320,
			stream: false,
		}),
		signal: AbortSignal.timeout(20_000),
	});
	if (!res.ok) throw new Error(`Ollama responded ${res.status}`);
	const data = (await res.json()) as ChatCompletion;
	const text = data.choices?.[0]?.message?.content?.trim();
	if (!text) throw new Error("empty Ollama response");
	return text;
}

/** Rule-based reply used when Ollama is unreachable or returns nothing. */
export function offlineFallback(p: AskTutorParams): string {
	const t = p.question.toLowerCase();
	if (t.includes("akar")) {
		return "Petunjuk akar: cari faktor kuadrat di dalam akar lalu keluarkan. Contoh √12 = √(4×3) = 2√3. Coba kamu uraikan dulu ya! 💎";
	}
	if (t.includes("baku") || t.includes("ilmiah") || t.includes("notasi")) {
		return "Bentuk baku itu a × 10ⁿ dengan 1 ≤ a < 10. Geser koma sampai tersisa satu angka di depan koma, lalu hitung berapa langkah geserannya untuk pangkat 10. ✨";
	}
	if (
		t.includes("pangkat") ||
		t.includes("kuadrat") ||
		t.includes("perkalian")
	) {
		return "Ingat sifat pangkat: basis sama dikali → pangkat dijumlah (aᵐ × aⁿ = aᵐ⁺ⁿ), dibagi → dikurang. Cek dulu basisnya sama atau tidak ya! 🚀";
	}
	const world = p.worldId ? WORLDS[p.worldId] : null;
	if (world) {
		return `Untuk ${world.name}, ingat rumus kuncinya: ${world.formula}. Tulis yang diketahui lalu kerjakan langkah demi langkah. Kamu pasti bisa! 😊`;
	}
	return "Yuk pelan-pelan: tulis yang diketahui, ingat rumus yang cocok, lalu kerjakan satu langkah demi satu langkah. Semangat! 😊";
}
