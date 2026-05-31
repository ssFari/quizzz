"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FAST_BONUS, FAST_BONUS_THRESHOLD } from "@/lib/game-content";
import { playTone } from "@/lib/sound";
import { checkAnswer, computeStars, difficultyMeta } from "@/services/quiz";
import { useGameStore } from "@/stores/game.store";
import type {
	Question,
	QuizMode,
	QuizRunResult,
	WrongAnswer,
} from "@/types/types";

export type QuizPhase = "playing" | "correct" | "wrong";

const TIMEOUT = "__timeout__";

function shuffle<T>(list: readonly T[]): T[] {
	const arr = [...list];
	for (let i = arr.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[arr[i], arr[j]] = [arr[j], arr[i]];
	}
	return arr;
}

export type UseQuizOptions = {
	questions: Question[];
	/** Sum of all question XP — used to turn raw score into a percentage. */
	maxScore: number;
	mode: QuizMode;
	onComplete: (result: QuizRunResult) => void;
};

export function useQuiz({
	questions: source,
	maxScore,
	mode,
	onComplete,
}: UseQuizOptions) {
	const soundEnabled = useGameStore((s) => s.soundEnabled);

	const [questions] = useState<Question[]>(() =>
		mode === "boss" ? shuffle(source) : source,
	);
	const [index, setIndex] = useState(0);
	const [lives, setLives] = useState(mode === "boss" ? 2 : 3);
	const [rawScore, setRawScore] = useState(0);
	const [earnedXp, setEarnedXp] = useState(0);
	const [correctCount, setCorrectCount] = useState(0);
	const [wrong, setWrong] = useState<WrongAnswer[]>([]);
	const [phase, setPhase] = useState<QuizPhase>("playing");
	const [selected, setSelected] = useState<string | null>(null);
	const [seconds, setSeconds] = useState(
		() => difficultyMeta(questions[0].difficulty).seconds,
	);

	const current = questions[index];
	const lockRef = useRef(false);
	const secondsRef = useRef(seconds);
	secondsRef.current = seconds;

	const handleAnswer = useCallback(
		(raw: string) => {
			if (lockRef.current) return;
			lockRef.current = true;

			const q = questions[index];
			const timedOut = raw === TIMEOUT;
			const correct = !timedOut && checkAnswer(q, raw);
			setSelected(timedOut ? null : raw);

			if (correct) {
				const fast =
					secondsRef.current >= FAST_BONUS_THRESHOLD ? FAST_BONUS : 0;
				setRawScore((v) => v + q.xp);
				setEarnedXp((v) => v + q.xp + fast);
				setCorrectCount((v) => v + 1);
				setPhase("correct");
				if (soundEnabled) playTone("good");
			} else {
				setLives((v) => v - 1);
				setWrong((w) => [
					...w,
					{ prompt: q.prompt, answer: q.answer, explanation: q.explanation },
				]);
				setPhase("wrong");
				if (soundEnabled) playTone("bad");
			}
		},
		[index, questions, soundEnabled],
	);

	// Countdown — runs only while the player is answering.
	useEffect(() => {
		if (phase !== "playing") return;
		const t = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
		return () => clearInterval(t);
		// phase flips to "playing" on every new question, so the timer
		// restarts per-question without needing `index` here.
	}, [phase]);

	// Fire a timeout exactly once when the clock hits zero.
	useEffect(() => {
		if (phase === "playing" && seconds === 0) handleAnswer(TIMEOUT);
	}, [seconds, phase, handleAnswer]);

	const finish = useCallback(() => {
		const safeMax = maxScore > 0 ? maxScore : 1;
		const percent = Math.round((rawScore / safeMax) * 100);
		onComplete({
			scorePercent: percent,
			xpGained: earnedXp,
			stars: computeStars(percent),
			correctCount,
			totalCount: questions.length,
			wrong,
		});
	}, [
		rawScore,
		earnedXp,
		correctCount,
		wrong,
		maxScore,
		questions.length,
		onComplete,
	]);

	const next = useCallback(() => {
		const isLastQuestion = index >= questions.length - 1;
		if (lives <= 0 || isLastQuestion) {
			finish();
			return;
		}
		const nextIndex = index + 1;
		setIndex(nextIndex);
		setSelected(null);
		setPhase("playing");
		setSeconds(difficultyMeta(questions[nextIndex].difficulty).seconds);
		lockRef.current = false;
	}, [index, lives, questions, finish]);

	const meta = difficultyMeta(current.difficulty);

	return {
		current,
		index,
		total: questions.length,
		lives,
		maxLives: mode === "boss" ? 2 : 3,
		seconds,
		phase,
		selected,
		earnedXp,
		correctCount,
		wrong,
		difficultyLabel: meta.label,
		progress: Math.round(
			((index + (phase === "playing" ? 0 : 1)) / questions.length) * 100,
		),
		handleAnswer,
		next,
	};
}

export type UseQuiz = ReturnType<typeof useQuiz>;
