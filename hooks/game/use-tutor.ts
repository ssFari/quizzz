"use client";

import { useCallback, useRef, useState } from "react";
import type { ChatMessage, WorldId } from "@/types/types";

type ChatEntry = ChatMessage & { id: number };

export type UseTutor = ReturnType<typeof useTutor>;

export function useTutor(worldId?: WorldId) {
	const [messages, setMessages] = useState<ChatEntry[]>([]);
	const [isStreaming, setIsStreaming] = useState(false);
	const idRef = useRef(0);

	const ask = useCallback(
		async (question: string, questionContext?: string) => {
			const text = question.trim();
			if (!text || isStreaming) return;

			// Snapshot prior turns (excluding the new question) for tutor memory.
			const history = messages.map((m) => ({ role: m.role, text: m.text }));

			idRef.current += 1;
			const userMsg: ChatEntry = { id: idRef.current, role: "user", text };
			idRef.current += 1;
			const replyId = idRef.current;
			const replyMsg: ChatEntry = { id: replyId, role: "tutor", text: "" };
			setMessages((m) => [...m, userMsg, replyMsg]);
			setIsStreaming(true);

			try {
				const res = await fetch("/api/tutor", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						worldId,
						question: text,
						questionContext,
						history,
					}),
				});
				if (!res.ok || !res.body) throw new Error("no stream");

				const reader = res.body.getReader();
				const decoder = new TextDecoder();
				for (;;) {
					const { done, value } = await reader.read();
					if (done) break;
					const chunk = decoder.decode(value, { stream: true });
					if (!chunk) continue;
					setMessages((m) =>
						m.map((x) =>
							x.id === replyId ? { ...x, text: x.text + chunk } : x,
						),
					);
				}
			} catch {
				setMessages((m) =>
					m.map((x) =>
						x.id === replyId && !x.text
							? { ...x, text: "Tutor sedang sibuk, coba lagi sebentar ya." }
							: x,
					),
				);
			} finally {
				setIsStreaming(false);
			}
		},
		[worldId, isStreaming, messages],
	);

	return { messages, isStreaming, ask };
}
