"use client";

import { Home, RefreshCcw, Star } from "lucide-react";
import { motion } from "motion/react";
import type { UseGame } from "@/hooks/game/use-game";
import { cn } from "@/lib/utils";

const STAR_SLOTS = [1, 2, 3];

export function SetSummaryScreen({ game }: { game: UseGame }) {
	const data = game.setSummary;
	if (!data) return null;

	const { result, set } = data;
	const great = result.scorePercent >= 70;

	return (
		<div className="flex min-h-dvh items-center justify-center bg-indigo-50 p-6">
			<motion.div
				initial={{ opacity: 0, scale: 0.9 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ type: "spring", damping: 18, stiffness: 220 }}
				className="w-full max-w-sm rounded-[2rem] border border-slate-100 bg-white p-8 text-center shadow-2xl"
			>
				<div className="mb-2 text-5xl">{set.emoji}</div>
				<p className="text-xs font-bold uppercase tracking-widest text-slate-400">
					Soal oleh {set.authorName}
				</p>
				<h2 className="font-heading mt-1 mb-1 text-2xl font-extrabold text-slate-700">
					{set.title}
				</h2>
				<p
					className={cn(
						"font-heading mb-4 text-lg font-extrabold",
						great ? "text-emerald-600" : "text-amber-600",
					)}
				>
					{great ? "Mantap! 🎉" : "Terus berlatih ya! 💪"}
				</p>

				<div className="mb-5 flex justify-center gap-2">
					{STAR_SLOTS.map((n) => (
						<Star
							key={n}
							className={cn(
								"size-10",
								n <= result.stars
									? "fill-amber-400 text-amber-400"
									: "fill-slate-200 text-slate-200",
							)}
						/>
					))}
				</div>

				<div className="mb-6 space-y-2 rounded-3xl border-2 border-slate-100 bg-slate-50 p-5">
					<Row
						label="Nilai"
						value={`${result.scorePercent}`}
						accent="text-indigo-600"
					/>
					<Row
						label="Benar"
						value={`${result.correctCount}/${result.totalCount}`}
						accent="text-emerald-600"
					/>
					<Row
						label="XP didapat"
						value={`+${result.xpGained}`}
						accent="text-amber-500"
					/>
				</div>

				<div className="flex flex-col gap-3">
					<button
						type="button"
						onClick={() => game.navigate("sets")}
						className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-500 py-4 font-heading text-lg font-extrabold text-white shadow-[0_4px_0_#4338ca] transition active:translate-y-1 active:shadow-none"
					>
						<RefreshCcw className="size-5" /> Soal Guru Lain
					</button>
					<button
						type="button"
						onClick={() => game.navigate("home")}
						className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 bg-white py-4 font-bold text-slate-600 transition hover:bg-slate-50"
					>
						<Home className="size-5" /> Beranda
					</button>
				</div>
			</motion.div>
		</div>
	);
}

function Row({
	label,
	value,
	accent,
}: {
	label: string;
	value: string;
	accent: string;
}) {
	return (
		<div className="flex items-center justify-between">
			<span className="font-bold text-slate-500">{label}</span>
			<span className={cn("font-heading text-xl font-extrabold", accent)}>
				{value}
			</span>
		</div>
	);
}
