"use client";

import { Star, Trophy } from "lucide-react";
import { TopBar } from "@/components/game/top-bar";
import type { UseGame } from "@/hooks/game/use-game";
import { cn } from "@/lib/utils";

function rankStyle(rank: number): string {
	if (rank === 1) return "bg-amber-100 text-amber-600";
	if (rank === 2) return "bg-slate-200 text-slate-600";
	if (rank === 3) return "bg-orange-100 text-orange-700";
	return "bg-slate-100 text-slate-400";
}

export function LeaderboardScreen({ game }: { game: UseGame }) {
	const list = game.leaderboard;

	return (
		<div className="min-h-dvh bg-purple-50 p-6">
			<div className="mx-auto max-w-md">
				<TopBar
					title="LEADERBOARD"
					accent="text-purple-800"
					onBack={() => game.navigate("home")}
				/>
				<div className="rounded-[2rem] border-4 border-purple-100 bg-white p-6 shadow-xl">
					<div className="mb-6 text-center">
						<Trophy className="mx-auto mb-2 size-12 text-amber-400" />
						<p className="font-semibold text-slate-500">Top 10 Pemain</p>
					</div>

					{list.length === 0 ? (
						<p className="py-8 text-center font-bold text-slate-400">
							Belum ada data. Jadilah yang pertama! 🚀
						</p>
					) : (
						<div className="flex flex-col gap-2">
							{list.map((e) => (
								<div
									key={e.id}
									className={cn(
										"flex items-center justify-between rounded-2xl p-3",
										e.isMe && "bg-sky-50 ring-2 ring-sky-200",
									)}
								>
									<div className="flex items-center gap-3">
										<span
											className={cn(
												"grid size-8 place-items-center rounded-full text-sm font-extrabold",
												rankStyle(e.rank),
											)}
										>
											{e.rank}
										</span>
										<span className="grid size-10 place-items-center rounded-full border border-slate-100 bg-white text-xl">
											{e.avatar}
										</span>
										<span
											className={cn(
												"font-extrabold",
												e.isMe ? "text-sky-700" : "text-slate-700",
											)}
										>
											{e.name}
											{e.isMe && " (Kamu)"}
										</span>
									</div>
									<span className="flex items-center gap-1 font-extrabold text-amber-500">
										{e.xp}
										<Star className="size-3.5 fill-current" />
									</span>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
