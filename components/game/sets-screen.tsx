"use client";

import { ArrowRight, BookOpen, Search, Ticket } from "lucide-react";
import { useState } from "react";
import { TopBar } from "@/components/game/top-bar";
import { Skeleton } from "@/components/ui/skeleton";
import type { UseGame } from "@/hooks/game/use-game";
import { useJoinSet, usePublicSets } from "@/hooks/game/use-sets";

const SKELETON_SLOTS = ["a", "b", "c"];

export function SetsScreen({ game }: { game: UseGame }) {
	const { data, isLoading } = usePublicSets();
	const { join, isJoining } = useJoinSet(game.startSet);
	const [code, setCode] = useState("");
	const sets = data ?? [];

	return (
		<div className="min-h-dvh bg-indigo-50 p-6">
			<div className="mx-auto max-w-md">
				<TopBar
					title="SOAL DARI GURU"
					accent="text-indigo-700"
					onBack={() => game.navigate("home")}
				/>

				<form
					onSubmit={(e) => {
						e.preventDefault();
						if (code.trim()) join(code);
					}}
					className="mb-6 rounded-3xl border-2 border-indigo-100 bg-white p-4"
				>
					<div className="mb-2 flex items-center gap-2 font-bold text-indigo-600">
						<Ticket className="size-5" /> Punya kode dari guru?
					</div>
					<div className="flex gap-2">
						<input
							value={code}
							onChange={(e) => setCode(e.target.value.toUpperCase())}
							maxLength={6}
							autoComplete="off"
							placeholder="Contoh: 7KQ2MZ"
							className="flex-1 rounded-xl border-2 border-slate-200 px-3 py-3 text-center text-lg font-extrabold uppercase tracking-[0.3em] text-slate-700 outline-none focus:border-indigo-400"
						/>
						<button
							type="submit"
							disabled={isJoining || code.trim().length < 6}
							aria-label="Gabung"
							className="grid size-12 shrink-0 place-items-center rounded-xl bg-indigo-500 text-white shadow-[0_4px_0_#4338ca] transition active:translate-y-1 active:shadow-none disabled:opacity-50"
						>
							<ArrowRight className="size-5" />
						</button>
					</div>
				</form>

				<div className="mb-3 flex items-center gap-2 font-bold text-slate-500">
					<Search className="size-5" /> Daftar soal publik
				</div>

				{isLoading ? (
					<div className="space-y-3">
						{SKELETON_SLOTS.map((s) => (
							<Skeleton key={s} className="h-20 w-full rounded-2xl" />
						))}
					</div>
				) : sets.length === 0 ? (
					<div className="rounded-[2rem] bg-white p-8 text-center shadow-sm">
						<div className="mb-2 text-5xl">🗂️</div>
						<p className="font-bold text-slate-600">
							Belum ada soal publik. Minta gurumu membuat soal, atau masukkan
							kode di atas.
						</p>
					</div>
				) : (
					<div className="flex flex-col gap-3">
						{sets.map((set) => (
							<button
								key={set.id}
								type="button"
								disabled={isJoining}
								onClick={() => join(set.code)}
								className="flex items-center gap-3 rounded-2xl border-2 border-slate-100 bg-white p-4 text-left transition hover:border-indigo-300 disabled:opacity-60"
							>
								<span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-indigo-100 text-2xl">
									{set.emoji}
								</span>
								<span className="flex-1">
									<span className="block font-heading font-extrabold text-slate-700">
										{set.title}
									</span>
									<span className="flex items-center gap-1 text-xs font-semibold text-slate-400">
										<BookOpen className="size-3.5" /> {set.questionCount} soal ·
										oleh {set.authorName}
									</span>
								</span>
								<ArrowRight className="size-5 text-indigo-400" />
							</button>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
