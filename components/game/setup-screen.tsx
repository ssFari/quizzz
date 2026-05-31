"use client";

import { ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import { useSetupForm } from "@/hooks/game/use-setup-form";
import { AVATARS } from "@/lib/game-content";
import { cn } from "@/lib/utils";
import type { ProfileInput } from "@/schemas/game.schema";

export function SetupScreen({
	onSubmit,
	isSaving,
	initialName,
	initialAvatar,
}: {
	onSubmit: (input: ProfileInput) => void;
	isSaving: boolean;
	initialName?: string;
	initialAvatar?: string;
}) {
	const form = useSetupForm(onSubmit, {
		name: initialName,
		avatar: initialAvatar,
	});

	return (
		<div className="flex min-h-dvh flex-col items-center justify-center bg-sky-50 p-6">
			<motion.div
				initial={{ opacity: 0, y: 20, scale: 0.96 }}
				animate={{ opacity: 1, y: 0, scale: 1 }}
				transition={{ duration: 0.35, ease: "easeOut" }}
				className="w-full max-w-sm rounded-[2rem] border-4 border-sky-200 bg-white p-7 shadow-xl"
			>
				<div className="mb-5 text-center">
					<div className="mb-2 text-5xl">🧙‍♂️</div>
					<h1 className="font-heading text-2xl font-extrabold text-sky-600">
						Buat Profil Kamu!
					</h1>
					<p className="text-sm font-semibold text-slate-500">
						Tanpa password — progress tersimpan di perangkat ini.
					</p>
				</div>

				<span className="mb-2 block text-sm font-bold text-slate-600">
					Pilih avatar
				</span>
				<div className="mb-5 grid grid-cols-4 gap-2">
					{AVATARS.map((a) => (
						<button
							key={a}
							type="button"
							onClick={() => form.setAvatar(a)}
							aria-pressed={form.avatar === a}
							className={cn(
								"grid aspect-square place-items-center rounded-2xl text-3xl transition",
								form.avatar === a
									? "scale-105 bg-amber-200 shadow ring-2 ring-amber-400"
									: "bg-slate-50 hover:bg-slate-100",
							)}
						>
							{a}
						</button>
					))}
				</div>

				<label
					htmlFor="player-name"
					className="mb-2 block text-sm font-bold text-slate-600"
				>
					Nama panggilan
				</label>
				<input
					id="player-name"
					value={form.name}
					onChange={(e) => form.setName(e.target.value)}
					maxLength={18}
					placeholder="Contoh: Rara"
					className="mb-6 w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-lg font-bold text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white"
				/>

				<button
					type="button"
					onClick={form.submit}
					disabled={!form.canSubmit || isSaving}
					className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-4 font-heading text-lg font-extrabold text-white shadow-[0_5px_0_#059669] transition active:translate-y-1 active:shadow-none disabled:opacity-50 disabled:shadow-none"
				>
					{isSaving ? (
						"Menyimpan…"
					) : (
						<>
							Mulai Petualangan
							<ChevronRight className="size-5" />
						</>
					)}
				</button>
			</motion.div>
		</div>
	);
}
