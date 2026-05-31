"use client";

import { RotateCcw } from "lucide-react";
import { TopBar } from "@/components/game/top-bar";
import { Skeleton } from "@/components/ui/skeleton";
import type { UseGame } from "@/hooks/game/use-game";
import { useWrongQuestions } from "@/hooks/game/use-wrong-questions";

const SKELETON_SLOTS = ["a", "b", "c"];

export function ReviewScreen({ game }: { game: UseGame }) {
	const { data, isLoading } = useWrongQuestions(true);
	const wrong = data ?? [];

	return (
		<div className="min-h-dvh bg-rose-50 p-6">
			<div className="mx-auto max-w-md">
				<TopBar
					title="EVALUASI"
					accent="text-rose-700"
					onBack={() => game.navigate("home")}
				/>

				{isLoading ? (
					<div className="space-y-3">
						{SKELETON_SLOTS.map((s) => (
							<Skeleton key={s} className="h-20 w-full rounded-2xl" />
						))}
					</div>
				) : wrong.length === 0 ? (
					<div className="rounded-[2rem] bg-white p-8 text-center shadow-sm">
						<div className="mb-2 text-5xl">🎉</div>
						<p className="font-bold text-slate-600">
							Belum ada soal salah. Keren! Kerjakan latihan dulu untuk membuat
							daftar evaluasi.
						</p>
					</div>
				) : (
					<div className="flex flex-col gap-3">
						<div className="mb-1 flex items-center gap-2 font-bold text-rose-600">
							<RotateCcw className="size-5" /> {wrong.length} soal untuk
							dipelajari ulang
						</div>
						{wrong.map((w) => (
							<div
								key={w.prompt}
								className="rounded-2xl border-2 border-rose-100 bg-white p-4"
							>
								<p className="font-bold text-slate-700">{w.prompt}</p>
								<p className="mt-1 text-sm font-semibold text-slate-500">
									Jawaban: {w.answer}. {w.explanation}
								</p>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
