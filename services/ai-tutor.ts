import { getEnv } from "@/lib/env";
import { WORLDS } from "@/lib/game-content";
import type { ChatMessage, WorldId } from "@/types/types";

export type AskTutorParams = {
	worldId?: WorldId;
	question: string;
	questionContext?: string;
	/** Prior turns of the conversation so follow-up questions keep context. */
	history?: ChatMessage[];
};

// The tutor talks to a local Ollama server running the minimax-m2.5 model
// via its OpenAI-compatible endpoint. Pull it once: `ollama pull minimax-m2.5`.
const DEFAULT_BASE_URL = "http://localhost:11434/v1";
const DEFAULT_MODEL = "minimax-m2.5";

const SYSTEM_PROMPT =
	'Kamu adalah "Tutor AI", asisten belajar MATEMATIKA yang ramah, sabar, dan cerdas untuk siswa SMP di Indonesia. ' +
	"Jawablah layaknya AI yang pintar — natural, jelas, dan membantu — TETAPI pengetahuan dan topikmu HANYA seputar matematika " +
	"(terutama bilangan berpangkat, bentuk akar, bentuk baku / notasi ilmiah, serta matematika SMP secara umum). " +
	"Jika siswa bertanya di luar matematika atau hanya mengobrol iseng, TOLAK dengan ramah lalu ajak kembali ke matematika dalam satu kalimat singkat. " +
	"Gunakan Bahasa Indonesia yang santai dan memotivasi, dengan contoh angka bila perlu. " +
	"Jawaban ringkas (maksimal 4 kalimat). Jika siswa sedang mengerjakan sebuah soal, beri PETUNJUK dan pancing dia berpikir langkah demi langkah — jangan langsung membeberkan jawaban akhirnya.";

type ChatRole = "system" | "user" | "assistant";
type OllamaMessage = { role: ChatRole; content: string };

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

function buildMessages(p: AskTutorParams): OllamaMessage[] {
	const messages: OllamaMessage[] = [
		{ role: "system", content: SYSTEM_PROMPT },
	];
	for (const m of p.history ?? []) {
		messages.push({
			role: m.role === "tutor" ? "assistant" : "user",
			content: m.text,
		});
	}
	messages.push({ role: "user", content: buildUserMessage(p) });
	return messages;
}

type StreamChunk = {
	choices?: { delta?: { content?: string } }[];
};

/**
 * Streams the tutor reply token-by-token from Ollama. If Ollama is unreachable
 * or yields nothing, the offline rule-based fallback is streamed instead so the
 * UI always receives a reply.
 */
export function streamTutorReply(
	params: AskTutorParams,
): ReadableStream<Uint8Array> {
	const env = getEnv();
	const baseUrl = (env.OLLAMA_BASE_URL ?? DEFAULT_BASE_URL).replace(/\/+$/, "");
	const model = env.OLLAMA_MODEL ?? DEFAULT_MODEL;
	const apiKey = env.OLLAMA_API_KEY;
	const encoder = new TextEncoder();

	return new ReadableStream<Uint8Array>({
		async start(controller) {
			try {
				const res = await fetch(`${baseUrl}/chat/completions`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
					},
					body: JSON.stringify({
						model,
						messages: buildMessages(params),
						temperature: 0.6,
						max_tokens: 320,
						stream: true,
					}),
					signal: AbortSignal.timeout(30_000),
				});
				if (!res.ok || !res.body) {
					throw new Error(`Ollama responded ${res.status}`);
				}

				const reader = res.body.getReader();
				const decoder = new TextDecoder();
				let buffer = "";
				let emitted = false;

				for (;;) {
					const { done, value } = await reader.read();
					if (done) break;
					buffer += decoder.decode(value, { stream: true });
					const lines = buffer.split("\n");
					buffer = lines.pop() ?? "";
					for (const line of lines) {
						const trimmed = line.trim();
						if (!trimmed.startsWith("data:")) continue;
						const payload = trimmed.slice(5).trim();
						if (!payload || payload === "[DONE]") continue;
						try {
							const json = JSON.parse(payload) as StreamChunk;
							const token = json.choices?.[0]?.delta?.content;
							if (token) {
								controller.enqueue(encoder.encode(token));
								emitted = true;
							}
						} catch {
							// Ignore partial/non-JSON keep-alive lines.
						}
					}
				}

				if (!emitted) {
					controller.enqueue(encoder.encode(offlineFallback(params)));
				}
				controller.close();
			} catch {
				controller.enqueue(encoder.encode(offlineFallback(params)));
				controller.close();
			}
		},
	});
}

const MATH_SIGNAL =
	/(\d|\^|√|×|÷|x²|x³|aⁿ|10ⁿ|[+\-/*=]|pangkat|akar|kuadrat|baku|ilmiah|notasi|bilangan|hitung|berapa|rumus|sederhana(?:kan)?|perkalian|pembagian|pecahan|persen|eksponen|basis|faktor)/i;
const GREETING = /\b(hai|halo|hi|hello|hey|pagi|siang|sore|malam|assalam)\b/i;
const THANKS =
	/(makasih|terima kasih|thanks|thank you|trims|mantap|keren|oke|sip)/i;

function pick(list: string[]): string {
	return list[Math.floor(Math.random() * list.length)] ?? list[0];
}

/**
 * Rule-based reply used when Ollama is unreachable. It stays in character:
 * greets, thanks, politely declines non-math chatter, and gives varied,
 * topic-aware hints for actual math questions.
 */
export function offlineFallback(p: AskTutorParams): string {
	const q = p.question.toLowerCase().trim();
	const world = p.worldId ? WORLDS[p.worldId] : null;
	const hasContext = Boolean(p.questionContext?.trim());
	const looksMath = MATH_SIGNAL.test(q) || hasContext;

	// Pure greeting (and not actually asking math).
	if (GREETING.test(q) && !looksMath) {
		return pick([
			"Hai! 👋 Aku Tutor AI khusus matematika. Mau dibantu soal pangkat, akar, atau bentuk baku?",
			"Halo! 😊 Aku siap bantu kamu soal matematika. Bagian mana yang lagi bikin bingung?",
		]);
	}

	// Short acknowledgement / thanks.
	if (THANKS.test(q) && !looksMath) {
		return pick([
			"Sama-sama! 🚀 Kalau ada soal matematika lain, langsung tanya aja ya.",
			"Senang bisa bantu! 💪 Lanjut ke soal berikutnya yuk?",
		]);
	}

	// Off-topic / random chatter → redirect politely.
	if (!looksMath) {
		return pick([
			"Hehe, aku cuma jago matematika nih 😅 Yuk kembali ke soal — ada pangkat, akar, atau bentuk baku yang mau dibahas?",
			"Maaf ya, pengetahuanku khusus matematika 📐 Coba tanya tentang sifat pangkat, menyederhanakan akar, atau notasi ilmiah!",
			"Aku Tutor Matematika, jadi di luar itu aku angkat tangan 🙈 Tapi soal hitung-hitungan? Ayo kita pecahkan bareng!",
		]);
	}

	// Topic-aware hints.
	if (q.includes("akar")) {
		return pick([
			"Petunjuk akar: pecah bilangan jadi faktor yang ada kuadratnya, lalu keluarkan. Contoh √12 = √(4×3) = 2√3. Coba uraikan punyamu! 💎",
			"Untuk akar sejenis, jumlahkan/kurangkan koefisiennya saja: 3√5 + 2√5 = 5√5. Cek dulu apakah akarnya sama ya 😊",
		]);
	}
	if (q.includes("baku") || q.includes("ilmiah") || q.includes("notasi")) {
		return "Bentuk baku itu a × 10ⁿ dengan 1 ≤ a < 10. Geser koma sampai sisa satu angka di depan koma, lalu hitung berapa langkah geserannya untuk pangkat 10-nya. ✨";
	}
	if (
		q.includes("pangkat") ||
		q.includes("kuadrat") ||
		q.includes("eksponen") ||
		q.includes("perkalian")
	) {
		return "Ingat sifat pangkat: basis sama dikali → pangkat dijumlah (aᵐ × aⁿ = aᵐ⁺ⁿ), dibagi → dikurang, dan (aᵐ)ⁿ = aᵐⁿ. Basisnya sama nggak? 🚀";
	}
	if (world) {
		return `Untuk ${world.name}, kunci rumusnya: ${world.formula}. Tulis dulu yang diketahui, lalu kerjakan selangkah demi selangkah. Kamu pasti bisa! 😊`;
	}
	return "Yuk pelan-pelan: tulis yang diketahui, pilih rumus yang cocok, lalu kerjakan satu langkah demi satu langkah. Aku temani! 😊";
}
