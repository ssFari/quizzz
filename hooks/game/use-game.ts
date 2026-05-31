"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { fetchLeaderboard, saveProfile, submitQuiz } from "@/actions/player";
import type { ProfileInput } from "@/schemas/game.schema";
import type {
	LeaderboardEntry,
	Player,
	QuizMode,
	QuizOutcome,
	QuizResultInput,
	WorldId,
} from "@/types/types";

export type Screen =
	| "setup"
	| "home"
	| "map"
	| "world"
	| "learn"
	| "quiz"
	| "summary"
	| "leaderboard"
	| "review";

export type SummaryData = {
	result: QuizResultInput;
	outcome: QuizOutcome | null;
};

export function useGame(
	initialPlayer: Player | null,
	initialLeaderboard: LeaderboardEntry[],
) {
	const [player, setPlayer] = useState<Player | null>(initialPlayer);
	const [screen, setScreen] = useState<Screen>(
		initialPlayer ? "home" : "setup",
	);
	const [selectedWorld, setSelectedWorld] = useState<WorldId>(1);
	const [mode, setMode] = useState<QuizMode>("latihan");
	const [summary, setSummary] = useState<SummaryData | null>(null);
	const qc = useQueryClient();

	const leaderboardQuery = useQuery({
		queryKey: ["leaderboard"],
		queryFn: () => fetchLeaderboard(),
		initialData: initialLeaderboard,
	});

	const profileMutation = useMutation({
		mutationFn: (input: ProfileInput) => saveProfile(input),
		onSuccess: (res) => {
			if (res.success) {
				setPlayer(res.data);
				if (screen === "setup") setScreen("home");
				toast.success("Profil tersimpan! 🎉");
				qc.invalidateQueries({ queryKey: ["leaderboard"] });
			} else {
				toast.error(res.error);
			}
		},
		onError: () => toast.error("Gagal menyimpan profil."),
	});

	const navigate = useCallback((next: Screen) => setScreen(next), []);

	const openWorld = useCallback(
		(id: WorldId) => {
			const unlocked = player?.worldUnlocked ?? 1;
			if (id > unlocked) {
				toast.error(
					"Dunia ini masih terkunci 🔒 Selesaikan dunia sebelumnya dulu.",
				);
				return;
			}
			setSelectedWorld(id);
			setScreen("world");
		},
		[player],
	);

	const startQuiz = useCallback((id: WorldId, quizMode: QuizMode) => {
		setSelectedWorld(id);
		setMode(quizMode);
		setScreen("quiz");
	}, []);

	const finishQuiz = useCallback(
		async (result: QuizResultInput) => {
			setSummary({ result, outcome: null });
			setScreen("summary");
			const res = await submitQuiz(result);
			if (res.success) {
				setPlayer(res.data.player);
				setSummary({ result, outcome: res.data });
				qc.invalidateQueries({ queryKey: ["leaderboard"] });
			} else {
				toast.error(res.error);
			}
		},
		[qc],
	);

	return {
		player,
		screen,
		selectedWorld,
		mode,
		summary,
		leaderboard: leaderboardQuery.data ?? [],
		isSavingProfile: profileMutation.isPending,
		saveProfile: (input: ProfileInput) => profileMutation.mutate(input),
		navigate,
		openWorld,
		startQuiz,
		finishQuiz,
	};
}

export type UseGame = ReturnType<typeof useGame>;
