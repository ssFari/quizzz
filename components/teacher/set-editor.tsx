"use client";

import { ArrowLeft, Check, Plus, Save, Trash2 } from "lucide-react";
import { useId, useMemo, useState } from "react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { useMySet, useSaveSet } from "@/hooks/teacher/use-teacher";
import { cn } from "@/lib/utils";
import { quizSetInputSchema } from "@/schemas/quiz-set.schema";
import type { Difficulty, QuestionType } from "@/types/types";

type Draft = {
	key: string;
	prompt: string;
	type: QuestionType;
	options: string[];
	correctIndex: number;
	shortAnswer: string;
	explanation: string;
	difficulty: Difficulty;
};

const DIFFICULTIES: Difficulty[] = ["mudah", "sedang", "sulit"];
const DIFFICULTY_LABEL: Record<Difficulty, string> = {
	mudah: "Mudah",
	sedang: "Sedang",
	sulit: "HOTS",
};

function emptyDraft(): Draft {
	return {
		key: crypto.randomUUID(),
		prompt: "",
		type: "mc",
		options: ["", "", "", ""],
		correctIndex: 0,
		shortAnswer: "",
		explanation: "",
		difficulty: "mudah",
	};
}

export function SetEditor({
	setId,
	onDone,
}: {
	setId: string | null;
	onDone: () => void;
}) {
	const editing = setId !== null;
	const { data: existing, isLoading } = useMySet(setId);
	const save = useSaveSet();

	if (editing && isLoading) {
		return (
			<div className="mx-auto max-w-md space-y-3 p-6">
				<Skeleton className="h-10 w-full rounded-2xl" />
				<Skeleton className="h-40 w-full rounded-2xl" />
				<Skeleton className="h-40 w-full rounded-2xl" />
			</div>
		);
	}

	return (
		<EditorForm
			key={existing?.id ?? "new"}
			setId={setId}
			initial={
				existing
					? {
							title: existing.title,
							description: existing.description,
							emoji: existing.emoji,
							isPublic: existing.isPublic,
							drafts: existing.questions.map((q) => ({
								key: crypto.randomUUID(),
								prompt: q.prompt,
								type: q.type,
								options:
									q.type === "mc"
										? [...(q.options ?? []), "", "", "", ""].slice(0, 4)
										: ["", "", "", ""],
								correctIndex:
									q.type === "mc"
										? Math.max(0, (q.options ?? []).indexOf(q.answer))
										: 0,
								shortAnswer: q.type === "short" ? q.answer : "",
								explanation: q.explanation,
								difficulty: q.difficulty,
							})),
						}
					: null
			}
			saving={save.isPending}
			onSave={async (input) => {
				const res = await save.mutateAsync({ setId, input });
				if (res.success) {
					toast.success(
						editing
							? "Soal diperbarui! ✅"
							: `Soal dibuat! Kode: ${res.data.code}`,
					);
					onDone();
				} else {
					toast.error(res.error);
				}
			}}
			onCancel={onDone}
		/>
	);
}

type InitialState = {
	title: string;
	description: string;
	emoji: string;
	isPublic: boolean;
	drafts: Draft[];
};

function EditorForm({
	setId,
	initial,
	saving,
	onSave,
	onCancel,
}: {
	setId: string | null;
	initial: InitialState | null;
	saving: boolean;
	onSave: (input: {
		title: string;
		description: string;
		emoji: string;
		isPublic: boolean;
		questions: {
			prompt: string;
			type: QuestionType;
			options: string[];
			answer: string;
			explanation: string;
			difficulty: Difficulty;
		}[];
	}) => void;
	onCancel: () => void;
}) {
	const publicId = useId();
	const [title, setTitle] = useState(initial?.title ?? "");
	const [description, setDescription] = useState(initial?.description ?? "");
	const [emoji, setEmoji] = useState(initial?.emoji ?? "📘");
	const [isPublic, setIsPublic] = useState(initial?.isPublic ?? true);
	const [drafts, setDrafts] = useState<Draft[]>(
		initial?.drafts.length ? initial.drafts : [emptyDraft()],
	);

	function patch(key: string, fields: Partial<Draft>) {
		setDrafts((list) =>
			list.map((d) => (d.key === key ? { ...d, ...fields } : d)),
		);
	}

	const questions = useMemo(
		() =>
			drafts.map((d) => {
				const options = d.options.map((o) => o.trim()).filter(Boolean);
				return {
					prompt: d.prompt.trim(),
					type: d.type,
					options: d.type === "mc" ? options : [],
					answer:
						d.type === "mc"
							? (d.options[d.correctIndex]?.trim() ?? "")
							: d.shortAnswer.trim(),
					explanation: d.explanation.trim(),
					difficulty: d.difficulty,
				};
			}),
		[drafts],
	);

	function handleSave() {
		const payload = { title, description, emoji, isPublic, questions };
		const parsed = quizSetInputSchema.safeParse(payload);
		if (!parsed.success) {
			toast.error(parsed.error.issues[0]?.message ?? "Periksa lagi isiannya.");
			return;
		}
		onSave(parsed.data);
	}

	return (
		<div className="min-h-dvh bg-indigo-50 p-6">
			<div className="mx-auto max-w-md">
				<div className="mb-5 flex items-center justify-between gap-2">
					<button
						type="button"
						onClick={onCancel}
						aria-label="Batal"
						className="grid size-11 place-items-center rounded-full bg-white text-slate-600 shadow-sm transition active:scale-95"
					>
						<ArrowLeft className="size-5" />
					</button>
					<h2 className="font-heading text-lg font-extrabold text-indigo-700">
						{setId ? "Edit Soal" : "Buat Soal Baru"}
					</h2>
					<span className="size-11" />
				</div>

				<div className="mb-4 space-y-3 rounded-3xl border-2 border-indigo-100 bg-white p-4">
					<div className="flex gap-3">
						<input
							value={emoji}
							onChange={(e) => setEmoji(e.target.value.slice(0, 4))}
							aria-label="Emoji"
							className="w-16 rounded-2xl border-2 border-slate-200 bg-slate-50 py-3 text-center text-2xl outline-none focus:border-indigo-400"
						/>
						<input
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							maxLength={80}
							placeholder="Judul paket soal"
							className="flex-1 rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-3 font-bold text-slate-700 outline-none focus:border-indigo-400 focus:bg-white"
						/>
					</div>
					<textarea
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						maxLength={280}
						rows={2}
						placeholder="Deskripsi singkat (opsional)"
						className="w-full resize-none rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-indigo-400 focus:bg-white"
					/>
					<label
						htmlFor={publicId}
						className="flex cursor-pointer items-center justify-between rounded-2xl bg-slate-50 px-4 py-3"
					>
						<span className="text-sm font-bold text-slate-600">
							Tampilkan di daftar publik
						</span>
						<input
							id={publicId}
							type="checkbox"
							checked={isPublic}
							onChange={(e) => setIsPublic(e.target.checked)}
							className="size-5 accent-indigo-500"
						/>
					</label>
				</div>

				<div className="space-y-4">
					{drafts.map((d, i) => (
						<QuestionCard
							key={d.key}
							draft={d}
							index={i}
							canDelete={drafts.length > 1}
							onPatch={(fields) => patch(d.key, fields)}
							onDelete={() =>
								setDrafts((list) => list.filter((x) => x.key !== d.key))
							}
						/>
					))}
				</div>

				<button
					type="button"
					onClick={() => setDrafts((list) => [...list, emptyDraft()])}
					className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-indigo-300 py-3 font-bold text-indigo-500 transition hover:bg-indigo-100/50"
				>
					<Plus className="size-5" /> Tambah Soal
				</button>

				<button
					type="button"
					onClick={handleSave}
					disabled={saving}
					className="mt-3 mb-10 flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-4 font-heading text-lg font-extrabold text-white shadow-[0_5px_0_#059669] transition active:translate-y-1 active:shadow-none disabled:opacity-50"
				>
					<Save className="size-5" /> {saving ? "Menyimpan…" : "Simpan Soal"}
				</button>
			</div>
		</div>
	);
}

function QuestionCard({
	draft,
	index,
	canDelete,
	onPatch,
	onDelete,
}: {
	draft: Draft;
	index: number;
	canDelete: boolean;
	onPatch: (fields: Partial<Draft>) => void;
	onDelete: () => void;
}) {
	return (
		<div className="rounded-3xl border-2 border-slate-100 bg-white p-4">
			<div className="mb-3 flex items-center justify-between">
				<span className="font-heading font-extrabold text-slate-700">
					Soal {index + 1}
				</span>
				{canDelete && (
					<button
						type="button"
						onClick={onDelete}
						aria-label="Hapus soal"
						className="grid size-8 place-items-center rounded-lg text-rose-500 transition hover:bg-rose-50"
					>
						<Trash2 className="size-4" />
					</button>
				)}
			</div>

			<textarea
				value={draft.prompt}
				onChange={(e) => onPatch({ prompt: e.target.value })}
				rows={2}
				placeholder="Tulis pertanyaan…"
				className="mb-3 w-full resize-none rounded-2xl border-2 border-slate-200 bg-slate-50 px-3 py-2.5 font-semibold text-slate-700 outline-none focus:border-indigo-400 focus:bg-white"
			/>

			<div className="mb-3 flex gap-2">
				<TypeChip
					active={draft.type === "mc"}
					onClick={() => onPatch({ type: "mc" })}
				>
					Pilihan Ganda
				</TypeChip>
				<TypeChip
					active={draft.type === "short"}
					onClick={() => onPatch({ type: "short" })}
				>
					Isian Singkat
				</TypeChip>
			</div>

			{draft.type === "mc" ? (
				<div className="mb-3 space-y-2">
					<p className="text-xs font-bold text-slate-400">
						Tandai ✓ untuk jawaban benar
					</p>
					{draft.options.map((opt, oi) => (
						<div
							// biome-ignore lint/suspicious/noArrayIndexKey: fixed 4-slot option list
							key={oi}
							className="flex items-center gap-2"
						>
							<button
								type="button"
								onClick={() => onPatch({ correctIndex: oi })}
								aria-label={`Tandai opsi ${oi + 1} benar`}
								className={cn(
									"grid size-9 shrink-0 place-items-center rounded-xl border-2 transition",
									draft.correctIndex === oi
										? "border-emerald-500 bg-emerald-500 text-white"
										: "border-slate-200 text-slate-300",
								)}
							>
								<Check className="size-5" strokeWidth={3} />
							</button>
							<input
								value={opt}
								onChange={(e) => {
									const options = [...draft.options];
									options[oi] = e.target.value;
									onPatch({ options });
								}}
								placeholder={`Opsi ${oi + 1}`}
								className="flex-1 rounded-xl border-2 border-slate-200 bg-slate-50 px-3 py-2 font-semibold text-slate-700 outline-none focus:border-indigo-400 focus:bg-white"
							/>
						</div>
					))}
				</div>
			) : (
				<input
					value={draft.shortAnswer}
					onChange={(e) => onPatch({ shortAnswer: e.target.value })}
					placeholder="Jawaban benar"
					className="mb-3 w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-3 py-2.5 font-semibold text-slate-700 outline-none focus:border-indigo-400 focus:bg-white"
				/>
			)}

			<input
				value={draft.explanation}
				onChange={(e) => onPatch({ explanation: e.target.value })}
				placeholder="Pembahasan (opsional)"
				className="mb-3 w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-600 outline-none focus:border-indigo-400 focus:bg-white"
			/>

			<div className="flex gap-2">
				{DIFFICULTIES.map((d) => (
					<TypeChip
						key={d}
						active={draft.difficulty === d}
						onClick={() => onPatch({ difficulty: d })}
					>
						{DIFFICULTY_LABEL[d]}
					</TypeChip>
				))}
			</div>
		</div>
	);
}

function TypeChip({
	active,
	onClick,
	children,
}: {
	active: boolean;
	onClick: () => void;
	children: React.ReactNode;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				"flex-1 rounded-xl border-2 py-2 text-sm font-bold transition",
				active
					? "border-indigo-500 bg-indigo-500 text-white"
					: "border-slate-200 bg-white text-slate-500 hover:border-indigo-300",
			)}
		>
			{children}
		</button>
	);
}
