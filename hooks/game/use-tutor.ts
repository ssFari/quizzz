"use client";

import { useCallback, useRef, useState } from "react";
import { askTutorAction } from "@/actions/tutor";
import type { ChatMessage, WorldId } from "@/types/types";

type ChatEntry = ChatMessage & { id: number };

export function useTutor(worldId?: WorldId) {
	const [messages, setMessages] = useState<ChatEntry[]>([]);
	const [isTyping, setIsTyping] = useState(false);
	const idRef = useRef(0);

	const ask = useCallback(
		async (question: string, questionContext?: string) => {
			const text = question.trim();
			if (!text || isTyping) return;

			idRef.current += 1;
			const userMsg: ChatEntry = { id: idRef.current, role: "user", text };
			setMessages((m) => [...m, userMsg]);
			setIsTyping(true);

			const res = await askTutorAction({
				worldId,
				question: text,
				questionContext,
			});

			idRef.current += 1;
			const reply: ChatEntry = {
				id: idRef.current,
				role: "tutor",
				text: res.success ? res.data : res.error,
			};
			setMessages((m) => [...m, reply]);
			setIsTyping(false);
		},
		[worldId, isTyping],
	);

	return { messages, isTyping, ask };
}
