import { tutorRequestSchema } from "@/schemas/game.schema";
import { streamTutorReply } from "@/services/ai-tutor";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request): Promise<Response> {
	let body: unknown;
	try {
		body = await req.json();
	} catch {
		return new Response("Permintaan tidak valid.", { status: 400 });
	}

	const parsed = tutorRequestSchema.safeParse(body);
	if (!parsed.success) {
		return new Response("Pertanyaan tidak valid.", { status: 422 });
	}

	const stream = streamTutorReply(parsed.data);
	return new Response(stream, {
		headers: {
			"Content-Type": "text/plain; charset=utf-8",
			"Cache-Control": "no-store",
			"X-Accel-Buffering": "no",
		},
	});
}
