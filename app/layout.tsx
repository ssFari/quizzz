import type { Metadata, Viewport } from "next";
import { Baloo_2, Nunito } from "next/font/google";
import { Providers } from "@/app/providers";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const sans = Nunito({
	subsets: ["latin"],
	variable: "--font-sans",
	weight: ["400", "600", "700", "800"],
});

const display = Baloo_2({
	subsets: ["latin"],
	variable: "--font-display",
	weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
	title: "Dunia Pangkat & Akar",
	description:
		"Petualangan matematika SMP kelas VIII: bilangan berpangkat, bentuk akar, dan bentuk baku. Kumpulkan XP, bintang, dan badge!",
};

export const viewport: Viewport = {
	themeColor: "#0ea5e9",
};

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html
			lang="id"
			className={`${sans.variable} ${display.variable} h-full antialiased`}
		>
			<body className="min-h-full font-sans">
				<Providers>{children}</Providers>
				<Toaster position="top-center" richColors />
			</body>
		</html>
	);
}
