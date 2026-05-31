"use client";

import { BookOpen, LogOut, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { useDeleteSet, useMySets } from "@/hooks/teacher/use-teacher";
import { signOut } from "@/lib/auth-client";

const SKELETON_SLOTS = ["a", "b"];

export function TeacherDashboard({
	teacherName,
	onNew,
	onEdit,
}: {
	teacherName: string;
	onNew: () => void;
	onEdit: (id: string) => void;
}) {
	const { data, isLoading } = useMySets();
	const del = useDeleteSet();
	const sets = data ?? [];

	async function handleDelete(id: string, title: string) {
		const res = await del.mutateAsync(id);
		if (res.success) toast.success(`"${title}" dihapus.`);
		else toast.error(res.error);
	}

	return (
		<div className="min-h-dvh bg-indigo-50 p-6">
			<div className="mx-auto max-w-md">
				<div className="mb-6 flex items-center justify-between gap-3 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
					<div>
						<p className="text-xs font-bold uppercase tracking-widest text-indigo-400">
							Mode Guru
						</p>
						<h2 className="font-heading text-lg font-extrabold text-slate-700">
							{teacherName}
						</h2>
					</div>
					<button
						type="button"
						onClick={() => signOut()}
						className="flex items-center gap-1.5 rounded-xl border-2 border-slate-200 px-3 py-2 text-sm font-bold text-slate-500 transition hover:border-rose-300 hover:text-rose-500"
					>
						<LogOut className="size-4" /> Keluar
					</button>
				</div>

				<button
					type="button"
					onClick={onNew}
					className="mb-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-500 py-4 font-heading text-lg font-extrabold text-white shadow-[0_5px_0_#4338ca] transition active:translate-y-1 active:shadow-none"
				>
					<Plus className="size-6" /> Buat Soal Baru
				</button>

				<h3 className="mb-3 font-bold text-slate-500">Soal buatanmu</h3>

				{isLoading ? (
					<div className="space-y-3">
						{SKELETON_SLOTS.map((s) => (
							<Skeleton key={s} className="h-24 w-full rounded-2xl" />
						))}
					</div>
				) : sets.length === 0 ? (
					<div className="rounded-[2rem] bg-white p-8 text-center shadow-sm">
						<div className="mb-2 text-5xl">✏️</div>
						<p className="font-bold text-slate-600">
							Belum ada soal. Klik “Buat Soal Baru” untuk mulai.
						</p>
					</div>
				) : (
					<div className="flex flex-col gap-3">
						{sets.map((set) => (
							<div
								key={set.id}
								className="rounded-2xl border-2 border-slate-100 bg-white p-4"
							>
								<div className="flex items-start gap-3">
									<span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-indigo-100 text-2xl">
										{set.emoji}
									</span>
									<div className="flex-1">
										<h4 className="font-heading font-extrabold text-slate-700">
											{set.title}
										</h4>
										<p className="flex items-center gap-1 text-xs font-semibold text-slate-400">
											<BookOpen className="size-3.5" /> {set.questionCount} soal
											· {set.isPublic ? "publik" : "privat"}
										</p>
									</div>
								</div>
								<div className="mt-3 flex items-center gap-2">
									<span className="rounded-lg bg-slate-100 px-3 py-1.5 font-mono text-sm font-extrabold tracking-widest text-slate-600">
										{set.code}
									</span>
									<span className="flex-1" />
									<button
										type="button"
										onClick={() => onEdit(set.id)}
										aria-label="Edit"
										className="grid size-9 place-items-center rounded-lg text-indigo-500 transition hover:bg-indigo-50"
									>
										<Pencil className="size-4" />
									</button>
									<button
										type="button"
										disabled={del.isPending}
										onClick={() => handleDelete(set.id, set.title)}
										aria-label="Hapus"
										className="grid size-9 place-items-center rounded-lg text-rose-500 transition hover:bg-rose-50 disabled:opacity-50"
									>
										<Trash2 className="size-4" />
									</button>
								</div>
							</div>
						))}
					</div>
				)}

				<a
					href="/"
					className="mt-6 block text-center text-xs font-semibold text-slate-400 hover:text-slate-600"
				>
					← Kembali ke game
				</a>
			</div>
		</div>
	);
}
