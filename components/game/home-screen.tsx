"use client";

import {
	GraduationCap,
	Medal,
	Play,
	RotateCcw,
	Star,
	Ticket,
	Trophy,
} from "lucide-react";
import { motion } from "motion/react";
import { SoundToggle } from "@/components/game/sound-toggle";
import type { UseGame } from "@/hooks/game/use-game";
import { WORLDS } from "@/lib/game-content";
import type { Player } from "@/types/types";

export function HomeScreen({
	player,
	game,
}: {
	player: Player;
	game: UseGame;
}) {
	const currentWorld = WORLDS[player.worldUnlocked];

	return (
		<div className="flex min-h-dvh flex-col items-center bg-sky-50 p-6">
			<div className="mb-8 flex w-full max-w-md items-center justify-between gap-3 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
				<div className="flex items-center gap-3">
					<div className="grid size-14 place-items-center rounded-full bg-amber-100 text-3xl shadow-inner">
						{player.avatar}
					</div>
					<div>
						<h2 className="font-heading text-lg font-extrabold text-slate-700">
							{player.name}
						</h2>
						<div className="flex items-center gap-1 text-sm font-bold text-amber-500">
							<Star className="size-4 fill-current" /> {player.xp} XP
							<span className="ml-1 text-slate-400">· ⭐ {player.stars}</span>
						</div>
					</div>
				</div>
				<SoundToggle />
			</div>

			<motion.div
				initial={{ opacity: 0, y: 16 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.35 }}
				className="mb-8 w-full max-w-md text-center"
			>
				<div className="mb-3 text-6xl">🧮</div>
				<h1 className="font-heading text-3xl font-extrabold leading-tight text-slate-700">
					Siap jadi Master Pangkat hari ini? 😏
				</h1>
				<p className="mt-2 text-sm font-semibold text-slate-500">
					Lanjutkan petualangan matematikamu, {player.name}!
				</p>
			</motion.div>

			<div className="flex w-full max-w-md flex-col gap-4">
				<button
					type="button"
					onClick={() => game.navigate("map")}
					className="flex items-center justify-center gap-3 rounded-2xl bg-sky-500 py-5 font-heading text-xl font-extrabold text-white shadow-[0_6px_0_#0369a1] transition active:translate-y-1.5 active:shadow-none"
				>
					<Play className="size-6 fill-current" /> Mulai Belajar
				</button>

				<button
					type="button"
					onClick={() => game.openWorld(player.worldUnlocked)}
					className="flex items-center gap-3 rounded-2xl border-2 border-slate-100 bg-white p-4 text-left font-bold text-slate-600 transition hover:border-sky-300"
				>
					<span className="text-2xl">{currentWorld.emoji}</span>
					<span className="flex-1">
						Lanjutkan
						<span className="block text-xs font-semibold text-slate-400">
							Dunia {player.worldUnlocked}: {currentWorld.name}
						</span>
					</span>
				</button>

				<button
					type="button"
					onClick={() => game.navigate("sets")}
					className="flex items-center gap-3 rounded-2xl bg-indigo-500 p-4 text-left font-bold text-white shadow-[0_4px_0_#4338ca] transition active:translate-y-1 active:shadow-none"
				>
					<Ticket className="size-7" />
					<span className="flex-1">
						Soal dari Guru
						<span className="block text-xs font-semibold text-indigo-100">
							Main pakai kode atau pilih dari daftar
						</span>
					</span>
				</button>

				<div className="grid grid-cols-3 gap-3">
					<button
						type="button"
						onClick={() => game.navigate("leaderboard")}
						className="flex flex-col items-center gap-2 rounded-2xl border-2 border-slate-100 bg-white py-4 font-bold text-slate-600 transition hover:border-purple-300"
					>
						<Medal className="size-7 text-purple-500" />
						<span className="text-xs">Ranking</span>
					</button>
					<button
						type="button"
						onClick={() => game.navigate("review")}
						className="flex flex-col items-center gap-2 rounded-2xl border-2 border-slate-100 bg-white py-4 font-bold text-slate-600 transition hover:border-rose-300"
					>
						<RotateCcw className="size-7 text-rose-500" />
						<span className="text-xs">Evaluasi</span>
					</button>
					<button
						type="button"
						onClick={() => game.navigate("map")}
						className="flex flex-col items-center gap-2 rounded-2xl border-2 border-slate-100 bg-white py-4 font-bold text-slate-600 transition hover:border-amber-300"
					>
						<Trophy className="size-7 text-amber-500" />
						<span className="text-xs">Peta</span>
					</button>
				</div>

				<a
					href="/guru"
					className="mt-2 flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 py-3 text-sm font-bold text-slate-400 transition hover:border-indigo-300 hover:text-indigo-500"
				>
					<GraduationCap className="size-5" /> Mode Guru — buat soal
				</a>
			</div>
		</div>
	);
}
