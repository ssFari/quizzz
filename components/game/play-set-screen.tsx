"use client";

import { useMemo } from "react";
import { QuizBoard } from "@/components/game/quiz-board";
import type { UseGame } from "@/hooks/game/use-game";
import { useQuiz } from "@/hooks/game/use-quiz";
import { useTutor } from "@/hooks/game/use-tutor";
import { SET_THEME } from "@/lib/world-theme";
import type { QuizRunResult, QuizSetWithQuestions } from "@/types/types";

export function PlaySetScreen({ game }: { game: UseGame }) {
	if (!game.activeSet) return null;
	return <SetRunner set={game.activeSet} onFinish={game.finishSet} />;
}

function SetRunner({
	set,
	onFinish,
}: {
	set: QuizSetWithQuestions;
	onFinish: (result: QuizRunResult) => void;
}) {
	const maxScore = useMemo(
		() => set.questions.reduce((sum, q) => sum + q.xp, 0),
		[set],
	);
	const quiz = useQuiz({
		questions: set.questions,
		maxScore,
		mode: "latihan",
		onComplete: onFinish,
	});
	const tutor = useTutor();

	return <QuizBoard quiz={quiz} theme={SET_THEME} tutor={tutor} />;
}
