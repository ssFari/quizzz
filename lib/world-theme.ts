import type { WorldId } from "@/types/types";

// Literal Tailwind class strings per world so the JIT can see them.
type WorldTheme = {
	solid: string;
	soft: string;
	text: string;
	ring: string;
	gradient: string;
	shadow: string;
};

export const WORLD_THEME: Record<WorldId, WorldTheme> = {
	1: {
		solid: "bg-sky-500",
		soft: "bg-sky-100",
		text: "text-sky-600",
		ring: "border-sky-200",
		gradient: "from-sky-400 to-blue-500",
		shadow: "shadow-[0_6px_0_#0284c7]",
	},
	2: {
		solid: "bg-emerald-500",
		soft: "bg-emerald-100",
		text: "text-emerald-600",
		ring: "border-emerald-200",
		gradient: "from-emerald-400 to-teal-500",
		shadow: "shadow-[0_6px_0_#059669]",
	},
	3: {
		solid: "bg-violet-500",
		soft: "bg-violet-100",
		text: "text-violet-600",
		ring: "border-violet-200",
		gradient: "from-violet-400 to-purple-500",
		shadow: "shadow-[0_6px_0_#7c3aed]",
	},
};
