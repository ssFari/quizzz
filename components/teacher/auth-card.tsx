"use client";

import { GraduationCap, LogIn } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { signIn, signUp } from "@/lib/auth-client";

export function AuthCard() {
	const [mode, setMode] = useState<"signin" | "signup">("signin");
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [busy, setBusy] = useState(false);

	const isSignup = mode === "signup";
	const canSubmit =
		email.trim().length > 3 &&
		password.length >= 6 &&
		(!isSignup || name.trim().length > 0);

	async function submit() {
		if (!canSubmit || busy) return;
		setBusy(true);
		try {
			const res = isSignup
				? await signUp.email({
						name: name.trim(),
						email: email.trim(),
						password,
					})
				: await signIn.email({ email: email.trim(), password });
			if (res.error) {
				toast.error(res.error.message ?? "Gagal masuk. Periksa data kamu.");
			} else {
				toast.success(isSignup ? "Akun guru dibuat! 🎉" : "Selamat datang! 👋");
			}
		} catch {
			toast.error("Terjadi kesalahan. Coba lagi ya.");
		} finally {
			setBusy(false);
		}
	}

	return (
		<div className="flex min-h-dvh items-center justify-center bg-indigo-50 p-6">
			<div className="w-full max-w-sm rounded-[2rem] border-4 border-indigo-200 bg-white p-7 shadow-xl">
				<div className="mb-5 text-center">
					<div className="mx-auto mb-2 grid size-14 place-items-center rounded-full bg-indigo-100 text-indigo-600">
						<GraduationCap className="size-8" />
					</div>
					<h1 className="font-heading text-2xl font-extrabold text-indigo-600">
						{isSignup ? "Daftar Guru" : "Masuk Guru"}
					</h1>
					<p className="text-sm font-semibold text-slate-500">
						Buat & kelola soal untuk muridmu.
					</p>
				</div>

				{isSignup && (
					<Field
						label="Nama"
						value={name}
						onChange={setName}
						placeholder="Bu/Pak …"
					/>
				)}
				<Field
					label="Email"
					type="email"
					value={email}
					onChange={setEmail}
					placeholder="guru@sekolah.id"
				/>
				<Field
					label="Password"
					type="password"
					value={password}
					onChange={setPassword}
					placeholder="Minimal 6 karakter"
				/>

				<button
					type="button"
					onClick={submit}
					disabled={!canSubmit || busy}
					className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-500 py-4 font-heading text-lg font-extrabold text-white shadow-[0_5px_0_#4338ca] transition active:translate-y-1 active:shadow-none disabled:opacity-50 disabled:shadow-none"
				>
					<LogIn className="size-5" />
					{busy ? "Memproses…" : isSignup ? "Daftar" : "Masuk"}
				</button>

				<button
					type="button"
					onClick={() => setMode(isSignup ? "signin" : "signup")}
					className="mt-4 w-full text-center text-sm font-bold text-slate-500 hover:text-indigo-600"
				>
					{isSignup
						? "Sudah punya akun? Masuk"
						: "Belum punya akun? Daftar guru"}
				</button>

				<a
					href="/"
					className="mt-2 block text-center text-xs font-semibold text-slate-400 hover:text-slate-600"
				>
					← Kembali ke game
				</a>
			</div>
		</div>
	);
}

function Field({
	label,
	value,
	onChange,
	type = "text",
	placeholder,
}: {
	label: string;
	value: string;
	onChange: (v: string) => void;
	type?: string;
	placeholder?: string;
}) {
	return (
		<label className="mb-3 block">
			<span className="mb-1 block text-sm font-bold text-slate-600">
				{label}
			</span>
			<input
				type={type}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder={placeholder}
				autoComplete={type === "password" ? "current-password" : "off"}
				className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-3 font-bold text-slate-700 outline-none transition focus:border-indigo-400 focus:bg-white"
			/>
		</label>
	);
}
