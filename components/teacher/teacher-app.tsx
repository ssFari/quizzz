"use client";

import { useState } from "react";
import { AuthCard } from "@/components/teacher/auth-card";
import { SetEditor } from "@/components/teacher/set-editor";
import { TeacherDashboard } from "@/components/teacher/teacher-dashboard";
import { useSession } from "@/lib/auth-client";

type View = { name: "list" } | { name: "editor"; setId: string | null };

export function TeacherApp() {
	const { data: session, isPending } = useSession();
	const [view, setView] = useState<View>({ name: "list" });

	if (isPending) {
		return (
			<div className="grid min-h-dvh place-items-center bg-indigo-50">
				<p className="animate-pulse font-bold text-indigo-400">Memuat…</p>
			</div>
		);
	}

	if (!session?.user) return <AuthCard />;

	if (view.name === "editor") {
		return (
			<SetEditor setId={view.setId} onDone={() => setView({ name: "list" })} />
		);
	}

	return (
		<TeacherDashboard
			teacherName={session.user.name}
			onNew={() => setView({ name: "editor", setId: null })}
			onEdit={(setId) => setView({ name: "editor", setId })}
		/>
	);
}
