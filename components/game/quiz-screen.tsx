"use client";

import { Check, Clock, Heart, MessageCircle, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { TutorPanel } from "@/components/game/tutor-panel";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import type { UseGame } from "@/hooks/game/use-game";
import { useQuiz } from "@/hooks/game/use-quiz";
import { cn } from "@/lib/utils";
import { WORLD_THEME } from "@/lib/world-theme";

const HEART_SLOTS = ["h1", "h2", "h3"];
const OPTION_LABELS = ["A", "B", "C", "D"];

export function QuizScreen({ game }: { game: UseGame }) {
	const worldId = game.selectedWorld;
	const quiz = useQuiz(worldId, game.mode, game.finishQuiz);
	const theme = WORLD_THEME[worldId];
	const q = quiz.current;
	const answered = quiz.phase !== "playing";
	const isLast = quiz.index >= quiz.total - 1 || quiz.lives <= 0;

	return (
		<div className="relative mx-auto flex min-h-dvh max-w-md flex-col overflow-hidden bg-slate-50">
			<div className="z-10 bg-white px-5 py-4 shadow-sm">
				<div className="mb-3 flex items-center justify-between">
					<div className="flex gap-1 rounded-full border border-slate-200 bg-slate-100 p-2">
						{HEART_SLOTS.slice(0, quiz.maxLives).map((slot, i) => (
							<Heart
								key={slot}
								className={cn(
									"size-5",
									i < quiz.lives
										? "fill-rose-500 text-rose-500"
										: "fill-slate-300 text-slate-300",
								)}
							/>
						))}
					</div>
					<div
						className={cn(
							"flex items-center gap-2 rounded-full border-2 px-4 py-1.5 font-heading font-extrabold",
							quiz.seconds <= 10
								? "animate-pulse border-rose-200 bg-rose-50 text-rose-600"
								: "border-slate-200 bg-white text-slate-600",
						)}
					>
						<Clock className="size-5" /> {quiz.seconds}s
					</div>
				</div>
				<div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
					<div
						className={cn("h-full rounded-full transition-all", theme.solid)}
						style={{ width: `${quiz.progress}%` }}
					/>
				</div>
				<div className="mt-1 flex justify-between text-[11px] font-bold uppercase tracking-widest text-slate-400">
					<span>
						Soal {quiz.index + 1}/{quiz.total}
					</span>
					<span>{quiz.difficultyLabel}</span>
				</div>
			</div>

			<div className="flex-1 overflow-y-auto p-5 pb-28">
				<h3 className="font-heading mt-2 mb-8 text-2xl font-extrabold leading-snug text-slate-800">
					{q.prompt}
				</h3>
				<div className="flex flex-col gap-3">
					{q.options?.map((opt, idx) => {
						const isCorrect = opt === q.answer;
						const isChosen = opt === quiz.selected;
						return (
							<button
								key={opt}
								type="button"
								disabled={answered}
								onClick={() => quiz.handleAnswer(opt)}
								className={cn(
									"flex items-center justify-between rounded-2xl border-2 p-4 text-left font-bold transition",
									!answered &&
										"border-slate-200 bg-white text-slate-700 hover:border-sky-400 hover:bg-sky-50",
									answered &&
										isCorrect &&
										"border-emerald-600 bg-emerald-500 text-white",
									answered &&
										isChosen &&
										!isCorrect &&
										"border-rose-600 bg-rose-500 text-white",
									answered &&
										!isCorrect &&
										!isChosen &&
										"border-slate-200 bg-slate-50 text-slate-400 opacity-60",
								)}
							>
								<span>
									<span className="mr-2 opacity-50">{OPTION_LABELS[idx]}.</span>
									{opt}
								</span>
								{answered && isCorrect && (
									<Check className="size-6" strokeWidth={3} />
								)}
								{answered && isChosen && !isCorrect && (
									<X className="size-6" strokeWidth={3} />
								)}
							</button>
						);
					})}
				</div>
			</div>

			<Sheet>
				<SheetTrigger
					render={
						<button
							type="button"
							aria-label="Tanya AI Tutor"
							className="absolute right-5 bottom-6 z-20 grid size-14 place-items-center rounded-full bg-violet-500 text-white shadow-[0_4px_0_#6d28d9] transition active:translate-y-1 active:shadow-none"
						/>
					}
				>
					<MessageCircle className="size-7" />
				</SheetTrigger>
				<SheetContent
					side="bottom"
					showCloseButton={false}
					className="h-[70dvh] rounded-t-3xl p-0"
				>
					<TutorPanel worldId={worldId} questionContext={q.prompt} />
				</SheetContent>
			</Sheet>

			<AnimatePresence>
				{answered && (
					<motion.div
						initial={{ y: "100%" }}
						animate={{ y: 0 }}
						exit={{ y: "100%" }}
						transition={{ type: "spring", damping: 30, stiffness: 320 }}
						className={cn(
							"absolute inset-x-0 bottom-0 z-30 rounded-t-3xl border-t-8 p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.12)]",
							quiz.phase === "correct"
								? "border-emerald-500 bg-emerald-50"
								: "border-rose-500 bg-rose-50",
						)}
					>
						<div className="mb-3 flex items-center gap-3">
							<div
								className={cn(
									"grid size-12 place-items-center rounded-full text-white",
									quiz.phase === "correct" ? "bg-emerald-500" : "bg-rose-500",
								)}
							>
								{quiz.phase === "correct" ? (
									<Check className="size-7" strokeWidth={3} />
								) : (
									<X className="size-7" strokeWidth={3} />
								)}
							</div>
							<h4
								className={cn(
									"font-heading text-2xl font-extrabold",
									quiz.phase === "correct"
										? "text-emerald-700"
										: "text-rose-700",
								)}
							>
								{quiz.phase === "correct"
									? "Tepat sekali!"
									: quiz.selected === null
										? "Waktu habis!"
										: "Kurang tepat!"}
							</h4>
						</div>
						<div className="mb-5 rounded-2xl border border-slate-100 bg-white/80 p-4">
							<p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-400">
								Pembahasan
							</p>
							<p className="font-semibold leading-relaxed text-slate-700">
								{q.explanation}
							</p>
						</div>
						<button
							type="button"
							onClick={quiz.next}
							className={cn(
								"w-full rounded-2xl py-4 font-heading text-lg font-extrabold text-white shadow-[0_4px_0_rgba(0,0,0,0.2)] transition active:translate-y-1 active:shadow-none",
								quiz.phase === "correct" ? "bg-emerald-500" : "bg-rose-500",
							)}
						>
							{isLast ? "Lihat Hasil" : "Lanjut"}
						</button>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
