"use client";

import { Send, Sparkles, Zap } from "lucide-react";
import { useTutor } from "@/hooks/game/use-tutor";
import { cn } from "@/lib/utils";
import type { WorldId } from "@/types/types";

export function TutorPanel({
	worldId,
	questionContext,
}: {
	worldId: WorldId;
	questionContext?: string;
}) {
	const tutor = useTutor(worldId);

	return (
		<div className="flex h-full flex-col overflow-hidden rounded-t-3xl">
			<div className="flex items-center gap-2 bg-violet-500 p-4 text-white">
				<Sparkles className="size-5" />
				<span className="font-heading text-lg font-extrabold">AI Tutor</span>
			</div>

			<div className="flex flex-1 flex-col gap-3 overflow-y-auto bg-slate-50 p-4">
				{tutor.messages.length === 0 && (
					<div className="max-w-[85%] self-start rounded-2xl rounded-tl-sm bg-violet-100 p-3 text-sm font-semibold text-violet-900">
						Hai! Aku Tutor AI. Mau dibantu petunjuk soal ini? 😊
					</div>
				)}
				{tutor.messages.map((m) => (
					<div
						key={m.id}
						className={cn(
							"max-w-[85%] rounded-2xl p-3 text-sm font-semibold",
							m.role === "tutor"
								? "self-start rounded-tl-sm bg-violet-100 text-violet-900"
								: "ml-auto rounded-tr-sm bg-sky-500 text-white",
						)}
					>
						{m.text}
					</div>
				))}
				{tutor.isTyping && (
					<p className="animate-pulse p-2 text-xs font-bold text-violet-400">
						Tutor sedang berpikir…
					</p>
				)}
			</div>

			<div className="space-y-2 border-t border-slate-100 bg-white p-3">
				{questionContext && (
					<button
						type="button"
						onClick={() =>
							tutor.ask("Bantu aku dengan soal ini", questionContext)
						}
						disabled={tutor.isTyping}
						className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 py-2.5 font-bold text-slate-800 transition active:scale-[0.99] disabled:opacity-50"
					>
						<Zap className="size-4" /> Minta petunjuk soal ini
					</button>
				)}
				<form
					onSubmit={(e) => {
						e.preventDefault();
						const fd = new FormData(e.currentTarget);
						tutor.ask(String(fd.get("q") ?? ""));
						e.currentTarget.reset();
					}}
					className="flex gap-2"
				>
					<input
						name="q"
						autoComplete="off"
						placeholder="Tulis pertanyaan…"
						className="flex-1 rounded-xl border-2 border-slate-200 px-3 py-2.5 text-sm font-semibold outline-none focus:border-violet-400"
					/>
					<button
						type="submit"
						aria-label="Kirim"
						className="grid size-11 shrink-0 place-items-center rounded-xl bg-violet-500 text-white"
					>
						<Send className="size-5" />
					</button>
				</form>
			</div>
		</div>
	);
}
