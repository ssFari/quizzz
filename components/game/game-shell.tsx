"use client";

import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";
import { HomeScreen } from "@/components/game/home-screen";
import { LeaderboardScreen } from "@/components/game/leaderboard-screen";
import { LearnScreen } from "@/components/game/learn-screen";
import { MapScreen } from "@/components/game/map-screen";
import { PlaySetScreen } from "@/components/game/play-set-screen";
import { QuizScreen } from "@/components/game/quiz-screen";
import { ReviewScreen } from "@/components/game/review-screen";
import { SetSummaryScreen } from "@/components/game/set-summary-screen";
import { SetsScreen } from "@/components/game/sets-screen";
import { SetupScreen } from "@/components/game/setup-screen";
import { SummaryScreen } from "@/components/game/summary-screen";
import { WorldScreen } from "@/components/game/world-screen";
import { useGame } from "@/hooks/game/use-game";
import type { LeaderboardEntry, Player } from "@/types/types";

export function GameShell({
	initialPlayer,
	initialLeaderboard,
}: {
	initialPlayer: Player | null;
	initialLeaderboard: LeaderboardEntry[];
}) {
	const game = useGame(initialPlayer, initialLeaderboard);
	const { player, screen } = game;

	let content: ReactNode;
	if (!player || screen === "setup") {
		content = (
			<SetupScreen
				onSubmit={game.saveProfile}
				isSaving={game.isSavingProfile}
				initialName={player?.name}
				initialAvatar={player?.avatar}
			/>
		);
	} else if (screen === "map") {
		content = <MapScreen player={player} game={game} />;
	} else if (screen === "world") {
		content = <WorldScreen game={game} />;
	} else if (screen === "learn") {
		content = <LearnScreen game={game} />;
	} else if (screen === "quiz") {
		content = <QuizScreen game={game} />;
	} else if (screen === "summary") {
		content = <SummaryScreen game={game} />;
	} else if (screen === "leaderboard") {
		content = <LeaderboardScreen game={game} />;
	} else if (screen === "review") {
		content = <ReviewScreen game={game} />;
	} else if (screen === "sets") {
		content = <SetsScreen game={game} />;
	} else if (screen === "playset") {
		content = <PlaySetScreen game={game} />;
	} else if (screen === "setsummary") {
		content = <SetSummaryScreen game={game} />;
	} else {
		content = <HomeScreen player={player} game={game} />;
	}

	return (
		<AnimatePresence mode="wait">
			<motion.div
				key={screen}
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				transition={{ duration: 0.2 }}
			>
				{content}
			</motion.div>
		</AnimatePresence>
	);
}
