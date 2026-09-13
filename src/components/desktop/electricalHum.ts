/** Resynthesis from the supplied powerline clip's measured spectrum (not a sample). */
export function createElectricalHum(context: BaseAudioContext): AudioBuffer {
  const duration = 20;
  const buffer = context.createBuffer(1, context.sampleRate * duration, context.sampleRate);
  const samples = buffer.getChannelData(0);
  const tau = Math.PI * 2;
  // Dominant line at 119.5 Hz, with much weaker odd harmonics around 358.5/597.5 Hz.
  // All frequencies and modulation complete integer cycles in this loop.
  for (let i = 0; i < samples.length; i++) {
    const t = i / context.sampleRate;
    const phase = tau * 119.5 * t;
    const pulse = 0.97 + 0.02 * Math.sin(tau * 0.25 * t) + 0.01 * Math.sin(tau * 0.65 * t);
    samples[i] =
      0.78 *
      pulse *
      (Math.sin(phase) +
        0.015 * Math.sin(phase * 2) +
        0.17 * Math.sin(phase * 3) +
        0.008 * Math.sin(phase * 4) +
        0.05 * Math.sin(phase * 5) +
        0.014 * Math.sin(phase * 7) +
        0.018 * Math.sin(tau * 60.5 * t) +
        0.012 * Math.sin(tau * 90 * t));
  }
  return buffer;
}
