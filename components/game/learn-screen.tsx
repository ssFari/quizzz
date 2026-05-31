"use client";

import { ArrowLeft, Gamepad2, Sparkles } from "lucide-react";
import type { UseGame } from "@/hooks/game/use-game";
import { WORLDS } from "@/lib/game-content";
import { cn } from "@/lib/utils";
import { WORLD_THEME } from "@/lib/world-theme";

export function LearnScreen({ game }: { game: UseGame }) {
	const world = WORLDS[game.selectedWorld];
	const theme = WORLD_THEME[world.id];

	return (
		<div className="min-h-dvh bg-white">
			<div
				className={cn(
					"sticky top-0 z-10 flex items-center gap-3 bg-gradient-to-br p-4 text-white shadow-md",
					theme.gradient,
				)}
			>
				<button
					type="button"
					onClick={() => game.navigate("world")}
					aria-label="Kembali"
					className="grid size-10 place-items-center rounded-full bg-white/20"
				>
					<ArrowLeft className="size-5" />
				</button>
				<h2 className="font-heading flex-1 text-lg font-extrabold">
					Konsep · {world.name}
				</h2>
				<span className="text-2xl">{world.emoji}</span>
			</div>

			<div className="mx-auto max-w-md p-6 pb-28">
				<div className={cn("mb-5 rounded-2xl p-5", theme.soft)}>
					<h3
						className={cn(
							"font-heading mb-2 flex items-center gap-2 text-lg font-extrabold",
							theme.text,
						)}
					>
						<Sparkles className="size-5" /> Ringkasan
					</h3>
					<p className="font-semibold text-slate-700">{world.lesson}</p>
				</div>

				<div className="mb-5 whitespace-pre-line rounded-2xl border-2 border-slate-100 bg-white p-5 font-semibold leading-relaxed text-slate-700">
					{world.concept}
				</div>

				<div className="mb-6 grid gap-3">
					<InfoChip label="Rumus penting" value={world.formula} />
					<InfoChip label="Contoh" value={world.example} />
				</div>

				<button
					type="button"
					onClick={() => game.startQuiz(world.id, "latihan")}
					className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-4 font-heading text-lg font-extrabold text-white shadow-[0_5px_0_#059669] transition active:translate-y-1 active:shadow-none"
				>
					<Gamepad2 className="size-5" /> Lanjut ke Latihan
				</button>
			</div>
		</div>
	);
}

function InfoChip({ label, value }: { label: string; value: string }) {
	return (
		<div className="rounded-2xl bg-slate-50 p-4">
			<p className="text-xs font-bold uppercase tracking-wide text-slate-400">
				{label}
			</p>
			<p className="font-heading text-lg font-extrabold text-slate-700">
				{value}
			</p>
		</div>
	);
}
