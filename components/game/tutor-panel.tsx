"use client";

import { Bot, Send, Sparkles, Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef } from "react";
import type { UseTutor } from "@/hooks/game/use-tutor";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
	"Jelaskan sifat-sifat pangkat",
	"Cara menyederhanakan √72",
	"Apa itu bentuk baku?",
];

export function TutorPanel({
	tutor,
	questionContext,
}: {
	tutor: UseTutor;
	questionContext?: string;
}) {
	const scrollRef = useRef<HTMLDivElement>(null);
	const lastMessage = tutor.messages.at(-1);
	const waitingFirstToken =
		tutor.isStreaming && lastMessage?.role === "tutor" && !lastMessage.text;

	// Keep the latest message (and streaming tokens) in view.
	useEffect(() => {
		const el = scrollRef.current;
		if (!el || tutor.messages.length === 0) return;
		el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
	}, [tutor.messages]);

	return (
		<div className="flex h-full flex-col overflow-hidden rounded-t-3xl bg-slate-50">
			{/* Header */}
			<div className="relative flex items-center gap-3 bg-gradient-to-r from-violet-600 via-violet-500 to-fuchsia-500 px-4 py-3.5 text-white">
				<div className="grid size-10 place-items-center rounded-2xl bg-white/20 backdrop-blur">
					<Bot className="size-6" />
				</div>
				<div className="flex-1">
					<div className="flex items-center gap-1.5">
						<span className="font-heading text-lg font-extrabold">
							AI Tutor
						</span>
						<Sparkles className="size-4 text-amber-300" />
					</div>
					<div className="flex items-center gap-1.5 text-xs font-semibold text-violet-100">
						<span className="size-2 animate-pulse rounded-full bg-emerald-400" />
						Khusus matematika · siap membantu
					</div>
				</div>
			</div>

			{/* Messages */}
			<div
				ref={scrollRef}
				className="flex flex-1 flex-col gap-3 overflow-y-auto p-4"
			>
				{tutor.messages.length === 0 && (
					<EmptyState
						onPick={(text) => tutor.ask(text)}
						disabled={tutor.isStreaming}
					/>
				)}

				<AnimatePresence initial={false}>
					{tutor.messages.map((m) => {
						if (m.role === "tutor" && !m.text) return null;
						const isTutor = m.role === "tutor";
						return (
							<motion.div
								key={m.id}
								initial={{ opacity: 0, y: 10, scale: 0.97 }}
								animate={{ opacity: 1, y: 0, scale: 1 }}
								transition={{ type: "spring", damping: 22, stiffness: 320 }}
								className={cn(
									"flex items-end gap-2",
									isTutor ? "justify-start" : "justify-end",
								)}
							>
								{isTutor && (
									<div className="grid size-8 shrink-0 place-items-center rounded-full bg-violet-100 text-violet-600">
										<Bot className="size-4.5" />
									</div>
								)}
								<div
									className={cn(
										"max-w-[80%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm font-semibold leading-relaxed shadow-sm",
										isTutor
											? "rounded-bl-md bg-white text-slate-700"
											: "rounded-br-md bg-gradient-to-br from-sky-500 to-blue-500 text-white",
									)}
								>
									{m.text}
								</div>
							</motion.div>
						);
					})}
				</AnimatePresence>

				{waitingFirstToken && (
					<motion.div
						initial={{ opacity: 0, y: 6 }}
						animate={{ opacity: 1, y: 0 }}
						className="flex items-end gap-2"
					>
						<div className="grid size-8 shrink-0 place-items-center rounded-full bg-violet-100 text-violet-600">
							<Bot className="size-4.5" />
						</div>
						<div className="rounded-2xl rounded-bl-md bg-white px-4 py-3 shadow-sm">
							<TypingDots />
						</div>
					</motion.div>
				)}
			</div>

			{/* Composer */}
			<div className="space-y-2 border-t border-slate-100 bg-white p-3">
				{questionContext && (
					<button
						type="button"
						onClick={() =>
							tutor.ask("Bantu aku dengan soal ini", questionContext)
						}
						disabled={tutor.isStreaming}
						className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 py-2.5 font-bold text-white shadow-sm transition active:scale-[0.99] disabled:opacity-50"
					>
						<Zap className="size-4" /> Minta petunjuk soal ini
					</button>
				)}
				<form
					onSubmit={(e) => {
						e.preventDefault();
						const fd = new FormData(e.currentTarget);
						tutor.ask(String(fd.get("q") ?? ""), questionContext);
						e.currentTarget.reset();
					}}
					className="flex items-center gap-2"
				>
					<input
						name="q"
						autoComplete="off"
						disabled={tutor.isStreaming}
						placeholder="Tanya apa saja tentang matematika…"
						className="flex-1 rounded-full border-2 border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none transition focus:border-violet-400 focus:bg-white disabled:opacity-50"
					/>
					<button
						type="submit"
						aria-label="Kirim"
						disabled={tutor.isStreaming}
						className="grid size-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white shadow-md transition active:scale-95 disabled:opacity-50"
					>
						<Send className="size-5" />
					</button>
				</form>
			</div>
		</div>
	);
}

function EmptyState({
	onPick,
	disabled,
}: {
	onPick: (text: string) => void;
	disabled: boolean;
}) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 8 }}
			animate={{ opacity: 1, y: 0 }}
			className="flex flex-col items-start gap-3"
		>
			<div className="flex items-end gap-2">
				<div className="grid size-8 shrink-0 place-items-center rounded-full bg-violet-100 text-violet-600">
					<Bot className="size-4.5" />
				</div>
				<div className="max-w-[85%] rounded-2xl rounded-bl-md bg-white px-3.5 py-2.5 text-sm font-semibold leading-relaxed text-slate-700 shadow-sm">
					Hai! Aku Tutor AI khusus matematika 📐 Tanya apa saja soal pangkat,
					akar, atau bentuk baku — atau pilih topik di bawah ya!
				</div>
			</div>
			<div className="flex flex-wrap gap-2 pl-10">
				{SUGGESTIONS.map((s) => (
					<button
						key={s}
						type="button"
						disabled={disabled}
						onClick={() => onPick(s)}
						className="rounded-full border-2 border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-600 transition hover:border-violet-300 hover:bg-violet-100 disabled:opacity-50"
					>
						{s}
					</button>
				))}
			</div>
		</motion.div>
	);
}

function TypingDots() {
	return (
		<span className="flex items-center gap-1">
			{[0, 0.15, 0.3].map((delay) => (
				<motion.span
					key={delay}
					className="size-2 rounded-full bg-violet-400"
					animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
					transition={{
						duration: 0.8,
						repeat: Number.POSITIVE_INFINITY,
						delay,
					}}
				/>
			))}
		</span>
	);
}
