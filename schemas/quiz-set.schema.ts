import { z } from "zod";

export const questionDraftSchema = z
	.object({
		prompt: z.string().trim().min(1, "Pertanyaan tidak boleh kosong").max(300),
		type: z.enum(["mc", "short"]),
		options: z.array(z.string().trim().max(120)).max(4).default([]),
		answer: z.string().trim().min(1, "Jawaban tidak boleh kosong").max(120),
		explanation: z.string().trim().max(500).default(""),
		difficulty: z.enum(["mudah", "sedang", "sulit"]),
	})
	.refine(
		(q) => {
			if (q.type !== "mc") return true;
			const opts = q.options.filter((o) => o.trim().length > 0);
			return opts.length >= 2 && opts.length <= 4;
		},
		{ message: "Soal pilihan ganda butuh 2–4 opsi", path: ["options"] },
	)
	.refine(
		(q) => {
			if (q.type !== "mc") return true;
			return q.options.some((o) => o.trim() === q.answer.trim());
		},
		{ message: "Jawaban harus salah satu dari opsi", path: ["answer"] },
	);

export type QuestionDraft = z.infer<typeof questionDraftSchema>;

export const quizSetInputSchema = z.object({
	title: z.string().trim().min(1, "Judul wajib diisi").max(80),
	description: z.string().trim().max(280).default(""),
	emoji: z.string().trim().min(1).max(8).default("📘"),
	isPublic: z.boolean().default(true),
	questions: z
		.array(questionDraftSchema)
		.min(1, "Tambahkan minimal 1 soal")
		.max(50),
});
export type QuizSetInput = z.infer<typeof quizSetInputSchema>;

export const joinCodeSchema = z
	.string()
	.trim()
	.toUpperCase()
	.regex(/^[A-Z0-9]{6}$/, "Kode harus 6 karakter (huruf/angka)");

export const setResultSchema = z.object({
	setId: z.string().min(1),
	xpGained: z.number().int().min(0).max(2000),
	correctCount: z.number().int().min(0).max(50),
	totalCount: z.number().int().min(1).max(50),
	wrong: z
		.array(
			z.object({
				prompt: z.string().max(300),
				answer: z.string().max(120),
				explanation: z.string().max(500),
			}),
		)
		.max(50),
});
export type SetResultPayload = z.infer<typeof setResultSchema>;
