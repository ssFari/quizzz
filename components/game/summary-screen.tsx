"use client";

import { Medal, RefreshCcw, Star, X } from "lucide-react";
import { motion } from "motion/react";
import type { ReactNode } from "react";
import type { UseGame } from "@/hooks/game/use-game";
import { PASS_THRESHOLD, PERFECT_BONUS } from "@/lib/game-content";
import { cn } from "@/lib/utils";

const STAR_SLOTS = [1, 2, 3];

export function SummaryScreen({ game }: { game: UseGame }) {
	const data = game.summary;
	if (!data) return null;

	const { result, outcome } = data;
	const passed = result.scorePercent >= PASS_THRESHOLD;
	const perfect =
		result.wrong.length === 0 && result.correctCount === result.totalCount;
	const totalXp = result.xpGained + (perfect ? PERFECT_BONUS : 0);

	return (
		<div className="flex min-h-dvh items-center justify-center bg-slate-50 p-6">
			<motion.div
				initial={{ opacity: 0, scale: 0.9 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ type: "spring", damping: 18, stiffness: 220 }}
				className="relative w-full max-w-sm rounded-[2rem] border border-slate-100 bg-white p-8 pt-14 text-center shadow-2xl"
			>
				<div className="absolute -top-12 left-1/2 -translate-x-1/2">
					<div
						className={cn(
							"grid size-24 place-items-center rounded-full border-4 border-white text-white shadow-xl",
							passed ? "bg-emerald-500" : "bg-rose-500",
						)}
					>
						{passed ? <Medal className="size-12" /> : <X className="size-12" />}
					</div>
				</div>

				<h2
					className={cn(
						"font-heading mb-1 text-3xl font-extrabold",
						passed ? "text-emerald-600" : "text-rose-600",
					)}
				>
					{passed ? "Luar Biasa!" : "Jangan Menyerah!"}
				</h2>

				<div className="my-5 flex justify-center gap-2">
					{STAR_SLOTS.map((n) => (
						<Star
							key={n}
							className={cn(
								"size-11",
								n <= result.stars
									? "fill-amber-400 text-amber-400"
									: "fill-slate-200 text-slate-200",
							)}
						/>
					))}
				</div>

				<div className="mb-6 space-y-2 rounded-3xl border-2 border-slate-100 bg-slate-50 p-5">
					<Row
						label="Nilai akhir"
						value={
							<span className="font-heading text-2xl font-extrabold text-sky-600">
								{result.scorePercent}
							</span>
						}
					/>
					<Row
						label="XP didapat"
						value={
							<span className="font-heading text-xl font-extrabold text-amber-500">
								+{totalXp}
							</span>
						}
					/>
					{perfect && (
						<p className="rounded-full bg-amber-100 py-1 text-xs font-bold text-amber-600">
							🔥 Perfect! Bonus +{PERFECT_BONUS} XP
						</p>
					)}
					{outcome?.unlockedNewWorld && (
						<p className="rounded-full bg-emerald-100 py-1 text-xs font-bold text-emerald-700">
							🔓 Dunia baru terbuka!
						</p>
					)}
				</div>

				{result.wrong.length > 0 && (
					<details className="mb-5 rounded-2xl border-2 border-slate-100 bg-white p-4 text-left">
						<summary className="cursor-pointer font-bold text-slate-600">
							Pembahasan {result.wrong.length} soal yang salah
						</summary>
						<div className="mt-3 space-y-2">
							{result.wrong.map((w) => (
								<div key={w.prompt} className="rounded-xl bg-slate-50 p-3">
									<p className="font-bold text-slate-700">{w.prompt}</p>
									<p className="text-sm font-semibold text-slate-500">
										Jawaban: {w.answer}. {w.explanation}
									</p>
								</div>
							))}
						</div>
					</details>
				)}

				<div className="flex flex-col gap-3">
					<button
						type="button"
						onClick={() => game.navigate("map")}
						className="w-full rounded-2xl bg-sky-500 py-4 font-heading text-lg font-extrabold text-white shadow-[0_4px_0_#0369a1] transition active:translate-y-1 active:shadow-none"
					>
						Kembali ke Peta
					</button>
					{!passed && (
						<button
							type="button"
							onClick={() => game.startQuiz(result.worldId, result.mode)}
							className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 bg-white py-4 font-bold text-slate-600 transition hover:bg-slate-50"
						>
							<RefreshCcw className="size-5" /> Ulangi
						</button>
					)}
				</div>
			</motion.div>
		</div>
	);
}

function Row({ label, value }: { label: string; value: ReactNode }) {
	return (
		<div className="flex items-center justify-between">
			<span className="font-bold text-slate-500">{label}</span>
			{value}
		</div>
	);
}
