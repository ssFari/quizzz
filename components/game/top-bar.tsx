import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function TopBar({
	title,
	onBack,
	accent = "text-slate-700",
	right,
}: {
	title: string;
	onBack?: () => void;
	accent?: string;
	right?: ReactNode;
}) {
	return (
		<div className="mb-6 flex items-center justify-between gap-2">
			{onBack ? (
				<button
					type="button"
					onClick={onBack}
					aria-label="Kembali"
					className="grid size-11 place-items-center rounded-full bg-white text-slate-600 shadow-sm transition active:scale-95"
				>
					<ArrowLeft className="size-5" />
				</button>
			) : (
				<span className="size-11" />
			)}
			<h2 className={cn("font-heading text-lg font-extrabold", accent)}>
				{title}
			</h2>
			<div className="grid size-11 place-items-center">{right}</div>
		</div>
	);
}
