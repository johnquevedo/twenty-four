export type SoundEffect = "success" | "error" | "click" | "pause";

let audioContext: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") {
    return null;
  }

  if (!audioContext) {
    const Context = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Context) {
      return null;
    }
    audioContext = new Context();
  }

  return audioContext;
}

interface Tone {
  frequency: number;
  duration: number;
  type?: OscillatorType;
  gain?: number;
}

function scheduleTone(context: AudioContext, tone: Tone, offset: number) {
  const oscillator = context.createOscillator();
  const gainNode = context.createGain();

  oscillator.type = tone.type ?? "sine";
  oscillator.frequency.setValueAtTime(tone.frequency, context.currentTime + offset);

  const start = context.currentTime + offset;
  const end = start + tone.duration;

  gainNode.gain.setValueAtTime(0.0001, start);
  gainNode.gain.exponentialRampToValueAtTime(tone.gain ?? 0.18, start + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, end);

  oscillator.connect(gainNode);
  gainNode.connect(context.destination);

  oscillator.start(start);
  oscillator.stop(end);
}

export function playSound(effect: SoundEffect, enabled: boolean) {
  if (!enabled) {
    return;
  }

  const context = getContext();
  if (!context) {
    return;
  }

  if (context.state === "suspended") {
    void context.resume();
  }

  const patterns: Record<SoundEffect, Tone[]> = {
    click: [{ frequency: 440, duration: 0.07, type: "triangle", gain: 0.1 }],
    success: [
      { frequency: 523.25, duration: 0.09, type: "triangle", gain: 0.11 },
      { frequency: 659.25, duration: 0.09, type: "triangle", gain: 0.11 },
      { frequency: 783.99, duration: 0.12, type: "triangle", gain: 0.12 },
    ],
    error: [
      { frequency: 220, duration: 0.08, type: "sawtooth", gain: 0.08 },
      { frequency: 180, duration: 0.12, type: "sawtooth", gain: 0.08 },
    ],
    pause: [{ frequency: 300, duration: 0.1, type: "square", gain: 0.07 }],
  };

  let offset = 0;
  for (const tone of patterns[effect]) {
    scheduleTone(context, tone, offset);
    offset += tone.duration;
  }
}
