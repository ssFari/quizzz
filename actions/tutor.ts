"use server";

import { z } from "zod";
import { askTutor } from "@/services/ai-tutor";
import type { ActionResult } from "@/types/types";

const tutorSchema = z.object({
	worldId: z.union([z.literal(1), z.literal(2), z.literal(3)]).optional(),
	question: z.string().trim().min(1).max(500),
	questionContext: z.string().max(500).optional(),
});

export async function askTutorAction(
	input: unknown,
): Promise<ActionResult<string>> {
	const parsed = tutorSchema.safeParse(input);
	if (!parsed.success) {
		return { success: false, error: "Pertanyaan tidak valid." };
	}
	try {
		const reply = await askTutor(parsed.data);
		return { success: true, data: reply };
	} catch {
		return {
			success: false,
			error: "Tutor sedang sibuk, coba lagi sebentar ya.",
		};
	}
}
