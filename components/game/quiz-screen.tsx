"use client";

import { useCallback } from "react";
import { QuizBoard } from "@/components/game/quiz-board";
import type { UseGame } from "@/hooks/game/use-game";
import { useQuiz } from "@/hooks/game/use-quiz";
import { useTutor } from "@/hooks/game/use-tutor";
import { getQuestions } from "@/lib/game-content";
import { WORLD_THEME } from "@/lib/world-theme";
import { maxScoreFor } from "@/services/quiz";
import type { QuizRunResult } from "@/types/types";

export function QuizScreen({ game }: { game: UseGame }) {
	const worldId = game.selectedWorld;
	const mode = game.mode;
	const finishQuiz = game.finishQuiz;

	const onComplete = useCallback(
		(result: QuizRunResult) => finishQuiz({ ...result, worldId, mode }),
		[finishQuiz, worldId, mode],
	);

	const quiz = useQuiz({
		questions: getQuestions(worldId),
		maxScore: maxScoreFor(worldId),
		mode,
		onComplete,
	});
	const tutor = useTutor(worldId);

	return <QuizBoard quiz={quiz} theme={WORLD_THEME[worldId]} tutor={tutor} />;
}
