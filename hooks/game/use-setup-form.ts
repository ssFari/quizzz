"use client";

import { useState } from "react";
import { AVATARS } from "@/lib/game-content";
import type { ProfileInput } from "@/schemas/game.schema";

export function useSetupForm(
	onSubmit: (input: ProfileInput) => void,
	initial?: { name?: string; avatar?: string },
) {
	const [name, setName] = useState(initial?.name ?? "");
	const [avatar, setAvatar] = useState(initial?.avatar ?? AVATARS[0]);

	const canSubmit = name.trim().length > 0;

	const submit = () => {
		if (canSubmit) onSubmit({ name: name.trim(), avatar });
	};

	return { name, setName, avatar, setAvatar, canSubmit, submit };
}
