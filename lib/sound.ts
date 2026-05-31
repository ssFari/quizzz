// Tiny WebAudio blip for correct/wrong feedback. Lives in lib because it is a
// pure browser helper; callers (hooks) decide when to fire it.

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
	if (typeof window === "undefined") return null;
	if (ctx) return ctx;
	const w = window as typeof window & {
		webkitAudioContext?: typeof AudioContext;
	};
	const Ctor = w.AudioContext ?? w.webkitAudioContext;
	if (!Ctor) return null;
	ctx = new Ctor();
	return ctx;
}

export function playTone(kind: "good" | "bad"): void {
	const ac = getCtx();
	if (!ac) return;
	try {
		const osc = ac.createOscillator();
		const gain = ac.createGain();
		osc.connect(gain);
		gain.connect(ac.destination);
		osc.type = "sine";
		osc.frequency.value = kind === "good" ? 720 : 240;
		gain.gain.setValueAtTime(0.001, ac.currentTime);
		gain.gain.exponentialRampToValueAtTime(0.08, ac.currentTime + 0.02);
		gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.18);
		osc.start();
		osc.stop(ac.currentTime + 0.2);
	} catch {
		// Autoplay policies / unsupported context — silently ignore.
	}
}
