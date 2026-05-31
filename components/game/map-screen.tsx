"use client";

import { Lock } from "lucide-react";
import { motion } from "motion/react";
import { TopBar } from "@/components/game/top-bar";
import type { UseGame } from "@/hooks/game/use-game";
import { WORLDS } from "@/lib/game-content";
import { cn } from "@/lib/utils";
import { WORLD_THEME } from "@/lib/world-theme";
import type { Player, WorldId } from "@/types/types";

export function MapScreen({ player, game }: { player: Player; game: UseGame }) {
	const worlds = Object.values(WORLDS);

	return (
		<div className="min-h-dvh bg-sky-100 p-6">
			<div className="mx-auto max-w-md">
				<TopBar
					title="PETA DUNIA"
					accent="text-sky-800"
					onBack={() => game.navigate("home")}
				/>

				<div className="relative mt-2 flex flex-col gap-7">
					<div className="absolute top-10 bottom-10 left-1/2 -z-10 w-2 -translate-x-1/2 rounded-full bg-sky-200" />

					{worlds.map((world, i) => {
						const id = world.id as WorldId;
						const unlocked = id <= player.worldUnlocked;
						const done = player.completedWorlds.includes(id);
						const theme = WORLD_THEME[id];
						const alignRight = i % 2 === 1;

						return (
							<motion.div
								key={id}
								initial={{ opacity: 0, y: 18 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.3, delay: i * 0.08 }}
								className={cn(
									"flex w-full",
									alignRight ? "justify-end" : "justify-start",
								)}
							>
								<button
									type="button"
									disabled={!unlocked}
									onClick={() => game.openWorld(id)}
									className={cn(
										"flex w-[82%] items-center gap-4 rounded-3xl p-5 text-left transition",
										unlocked
											? cn(
													"bg-gradient-to-br text-white active:translate-y-1",
													theme.gradient,
													theme.shadow,
												)
											: "cursor-not-allowed bg-slate-300 text-slate-500 shadow-[0_6px_0_#94a3b8]",
									)}
								>
									<span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-white/25 text-4xl shadow-inner">
										{unlocked ? world.emoji : <Lock className="size-7" />}
									</span>
									<span className="flex-1">
										<span className="block text-[11px] font-bold uppercase tracking-widest opacity-90">
											Dunia {id} {done && "· ✓ Selesai"}
										</span>
										<span className="font-heading block text-xl font-extrabold leading-tight drop-shadow-sm">
											{world.name}
										</span>
										<span className="block text-xs font-semibold opacity-90">
											{world.subtitle}
										</span>
									</span>
								</button>
							</motion.div>
						);
					})}
				</div>
			</div>
		</div>
	);
}
