import { z } from "zod";

export const profileSchema = z.object({
	name: z.string().trim().min(1, "Isi nama panggilan dulu ya").max(18),
	avatar: z.string().min(1).max(8),
});
export type ProfileInput = z.infer<typeof profileSchema>;

const wrongAnswerSchema = z.object({
	prompt: z.string().max(300),
	answer: z.string().max(100),
	explanation: z.string().max(500),
});

export const quizResultSchema = z.object({
	worldId: z.union([z.literal(1), z.literal(2), z.literal(3)]),
	mode: z.enum(["latihan", "boss"]),
	scorePercent: z.number().int().min(0).max(100),
	xpGained: z.number().int().min(0).max(2000),
	stars: z.number().int().min(0).max(3),
	correctCount: z.number().int().min(0).max(50),
	totalCount: z.number().int().min(1).max(50),
	wrong: z.array(wrongAnswerSchema).max(50),
});
export type QuizResultPayload = z.infer<typeof quizResultSchema>;

const tutorMessageSchema = z.object({
	role: z.enum(["user", "tutor"]),
	text: z.string().max(2000),
});

export const tutorRequestSchema = z.object({
	worldId: z.union([z.literal(1), z.literal(2), z.literal(3)]).optional(),
	question: z.string().trim().min(1).max(500),
	questionContext: z.string().max(500).optional(),
	/** Prior turns so the tutor can follow up coherently. Capped to keep prompts small. */
	history: z.array(tutorMessageSchema).max(12).optional(),
});
export type TutorRequest = z.infer<typeof tutorRequestSchema>;
