"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchWrong } from "@/actions/player";

export function useWrongQuestions(enabled: boolean) {
	return useQuery({
		queryKey: ["wrong"],
		queryFn: () => fetchWrong(),
		enabled,
	});
}
