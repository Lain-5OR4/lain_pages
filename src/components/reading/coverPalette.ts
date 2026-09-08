export interface CoverPalette {
  background: string;
  foreground: string;
}

// Quantize a small cover sample so nearby shades vote for the same color.
// A modest saturation weight keeps large illustrations from losing to white margins.
export function extractPalette(pixels: Uint8ClampedArray): CoverPalette | null {
  const buckets = new Map<number, { count: number; red: number; green: number; blue: number }>();
  for (let i = 0; i < pixels.length; i += 4) {
    if (pixels[i + 3] < 128) continue;
    const [red, green, blue] = [pixels[i], pixels[i + 1], pixels[i + 2]];
    const key = ((red >> 5) << 6) | ((green >> 5) << 3) | (blue >> 5);
    const bucket = buckets.get(key) ?? { count: 0, red: 0, green: 0, blue: 0 };
    bucket.count++;
    bucket.red += red;
    bucket.green += green;
    bucket.blue += blue;
    buckets.set(key, bucket);
  }
  let winner: number[] | null = null;
  let bestScore = 0;
  for (const bucket of buckets.values()) {
    const rgb = [bucket.red, bucket.green, bucket.blue].map((value) =>
      Math.round(value / bucket.count),
    );
    const saturation = (Math.max(...rgb) - Math.min(...rgb)) / 255;
    const score = bucket.count * (1 + saturation * 1.5);
    if (score > bestScore) {
      bestScore = score;
      winner = rgb;
    }
  }
  if (!winner) return null;
  const linear = winner.map((value) => {
    const channel = value / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  const luminance = linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
  return {
    background: `rgb(${winner.join(", ")})`,
    foreground: (luminance + 0.05) / 0.05 >= 1.05 / (luminance + 0.05) ? "#000000" : "#ffffff",
  };
}
