"use client";

import { Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGameStore } from "@/stores/game.store";

export function SoundToggle({ className }: { className?: string }) {
	const enabled = useGameStore((s) => s.soundEnabled);
	const toggle = useGameStore((s) => s.toggleSound);

	return (
		<button
			type="button"
			onClick={toggle}
			aria-label={enabled ? "Matikan suara" : "Nyalakan suara"}
			className={cn(
				"grid size-11 place-items-center rounded-full bg-white text-slate-500 shadow-sm transition active:scale-95",
				className,
			)}
		>
			{enabled ? (
				<Volume2 className="size-5" />
			) : (
				<VolumeX className="size-5" />
			)}
		</button>
	);
}
