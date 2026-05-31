"use client";

import { useQuery } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { fetchPublicSets, joinSetByCode } from "@/actions/set-play";
import type { QuizSetWithQuestions } from "@/types/types";

/** Public list of teacher sets for the browse view. */
export function usePublicSets() {
	return useQuery({
		queryKey: ["public-sets"],
		queryFn: () => fetchPublicSets(),
	});
}

/** Resolve a join code (or a list item's code) to a full, playable set. */
export function useJoinSet(onJoined: (set: QuizSetWithQuestions) => void) {
	const [isJoining, setIsJoining] = useState(false);

	const join = useCallback(
		async (code: string) => {
			if (isJoining) return;
			setIsJoining(true);
			const res = await joinSetByCode(code);
			setIsJoining(false);
			if (res.success) onJoined(res.data);
			else toast.error(res.error);
		},
		[isJoining, onJoined],
	);

	return { join, isJoining };
}
