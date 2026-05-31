"use client";

import { BookOpen, ChevronRight, Crown, Gamepad2 } from "lucide-react";
import { motion } from "motion/react";
import type { ReactNode } from "react";
import { TopBar } from "@/components/game/top-bar";
import type { UseGame } from "@/hooks/game/use-game";
import { WORLDS } from "@/lib/game-content";
import { cn } from "@/lib/utils";
import { WORLD_THEME } from "@/lib/world-theme";

export function WorldScreen({ game }: { game: UseGame }) {
	const world = WORLDS[game.selectedWorld];
	const theme = WORLD_THEME[world.id];

	return (
		<div className="min-h-dvh bg-sky-50 p-6">
			<div className="mx-auto max-w-md">
				<TopBar
					title={world.name}
					accent={theme.text}
					onBack={() => game.navigate("map")}
				/>

				<motion.div
					initial={{ opacity: 0, scale: 0.96 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.3 }}
					className={cn(
						"relative mb-7 overflow-hidden rounded-[2rem] bg-gradient-to-br p-8 text-center text-white shadow-lg",
						theme.gradient,
					)}
				>
					<div className="pointer-events-none absolute -top-4 -right-4 text-9xl opacity-15">
						{world.emoji}
					</div>
					<div className="relative text-6xl drop-shadow">{world.emoji}</div>
					<h1 className="font-heading relative mt-2 text-3xl font-extrabold">
						{world.name}
					</h1>
					<p className="relative mt-1 inline-block rounded-full bg-black/15 px-3 py-1 text-sm font-semibold">
						{world.subtitle}
					</p>
				</motion.div>

				<div className="flex flex-col gap-4">
					<ActionCard
						onClick={() => game.navigate("learn")}
						icon={<BookOpen className="size-7" />}
						soft={theme.soft}
						text={theme.text}
						title="Pahami Konsep"
						subtitle="Materi dasar & rumus penting"
					/>
					<ActionCard
						onClick={() => game.startQuiz(world.id, "latihan")}
						icon={<Gamepad2 className="size-7" />}
						soft="bg-emerald-100"
						text="text-emerald-600"
						title="Mulai Latihan"
						subtitle="10 soal · 3 nyawa · berhadiah XP"
					/>
					<ActionCard
						onClick={() => game.startQuiz(world.id, "boss")}
						icon={<Crown className="size-7" />}
						soft="bg-amber-100"
						text="text-amber-600"
						title={world.id === 3 ? "Final Challenge" : "Boss Level"}
						subtitle="Soal teracak · 2 nyawa · lebih menantang"
					/>
				</div>
			</div>
		</div>
	);
}

function ActionCard({
	onClick,
	icon,
	soft,
	text,
	title,
	subtitle,
}: {
	onClick: () => void;
	icon: ReactNode;
	soft: string;
	text: string;
	title: string;
	subtitle: string;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className="group flex items-center gap-4 rounded-2xl border-2 border-slate-100 bg-white p-5 text-left shadow-sm transition hover:border-slate-300"
		>
			<span
				className={cn(
					"grid size-14 place-items-center rounded-xl transition group-hover:scale-110",
					soft,
					text,
				)}
			>
				{icon}
			</span>
			<span className="flex-1">
				<span className="font-heading block text-lg font-extrabold text-slate-700">
					{title}
				</span>
				<span className="block text-sm font-semibold text-slate-500">
					{subtitle}
				</span>
			</span>
			<ChevronRight className="size-5 text-slate-300" />
		</button>
	);
}
