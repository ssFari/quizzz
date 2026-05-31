"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	createQuizSet,
	deleteQuizSet,
	fetchMySet,
	fetchMySets,
	updateQuizSet,
} from "@/actions/quiz-set";
import type { QuizSetInput } from "@/schemas/quiz-set.schema";
import type { ActionResult, QuizSetWithQuestions } from "@/types/types";

export function useMySets() {
	return useQuery({ queryKey: ["my-sets"], queryFn: () => fetchMySets() });
}

export function useMySet(setId: string | null) {
	return useQuery({
		queryKey: ["my-set", setId],
		queryFn: () => (setId ? fetchMySet(setId) : Promise.resolve(null)),
		enabled: setId !== null,
	});
}

export function useSaveSet() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (vars: {
			setId: string | null;
			input: QuizSetInput;
		}): Promise<ActionResult<QuizSetWithQuestions>> =>
			vars.setId
				? updateQuizSet(vars.setId, vars.input)
				: createQuizSet(vars.input),
		onSuccess: () => qc.invalidateQueries({ queryKey: ["my-sets"] }),
	});
}

export function useDeleteSet() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (setId: string) => deleteQuizSet(setId),
		onSuccess: () => qc.invalidateQueries({ queryKey: ["my-sets"] }),
	});
}
