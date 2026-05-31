import { create } from "zustand";
import { persist } from "zustand/middleware";

type GameStore = {
	soundEnabled: boolean;
	toggleSound: () => void;
};

export const useGameStore = create<GameStore>()(
	persist(
		(set) => ({
			soundEnabled: true,
			toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
		}),
		{ name: "dpa-game" },
	),
);
