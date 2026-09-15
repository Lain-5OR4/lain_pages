const DURATION_SECONDS = 20;
const OUTPUT_GAIN = 0.78;

// Resynthesis from the supplied powerline clip's measured spectrum (not a sample).
const FUNDAMENTAL_HZ = 119.5;
// Weaker odd harmonics of the fundamental (orders 2 and 6 measured negligible).
const HARMONICS: { order: number; weight: number }[] = [
  { order: 1, weight: 1 },
  { order: 2, weight: 0.015 },
  { order: 3, weight: 0.17 },
  { order: 4, weight: 0.008 },
  { order: 5, weight: 0.05 },
  { order: 7, weight: 0.014 },
];
// Two independent tones measured alongside the fundamental, not harmonically related to it.
const EXTRA_TONES: { hz: number; weight: number }[] = [
  { hz: 60.5, weight: 0.018 },
  { hz: 90, weight: 0.012 },
];
const BASE_PULSE = 0.97;
const PULSE_MODULATION: { hz: number; weight: number }[] = [
  { hz: 0.25, weight: 0.02 },
  { hz: 0.65, weight: 0.01 },
];

export function createElectricalHum(context: BaseAudioContext): AudioBuffer {
  const buffer = context.createBuffer(1, context.sampleRate * DURATION_SECONDS, context.sampleRate);
  const samples = buffer.getChannelData(0);
  const tau = Math.PI * 2;
  for (let i = 0; i < samples.length; i++) {
    const t = i / context.sampleRate;
    const phase = tau * FUNDAMENTAL_HZ * t;
    const pulse =
      BASE_PULSE +
      PULSE_MODULATION.reduce((sum, { hz, weight }) => sum + weight * Math.sin(tau * hz * t), 0);
    const tone =
      HARMONICS.reduce((sum, { order, weight }) => sum + weight * Math.sin(phase * order), 0) +
      EXTRA_TONES.reduce((sum, { hz, weight }) => sum + weight * Math.sin(tau * hz * t), 0);
    samples[i] = OUTPUT_GAIN * pulse * tone;
  }
  return buffer;
}
