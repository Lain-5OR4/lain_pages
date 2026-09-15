export interface CoverPalette {
  background: string;
  foreground: string;
}

type ColorBucket = { count: number; red: number; green: number; blue: number };

function quantizeToBucketKey(red: number, green: number, blue: number): number {
  return ((red >> 5) << 6) | ((green >> 5) << 3) | (blue >> 5);
}

function averageRgb(bucket: ColorBucket): number[] {
  return [bucket.red, bucket.green, bucket.blue].map((value) => Math.round(value / bucket.count));
}

function saturationOf(rgb: number[]): number {
  return (Math.max(...rgb) - Math.min(...rgb)) / 255;
}

function scoreBySaturation(bucket: ColorBucket, rgb: number[]): number {
  return bucket.count * (1 + saturationOf(rgb) * 1.5);
}

function relativeLuminance(rgb: number[]): number {
  const linear = rgb.map((value) => {
    const channel = value / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
}

export function extractPalette(pixels: Uint8ClampedArray): CoverPalette | null {
  const buckets = new Map<number, ColorBucket>();
  for (let i = 0; i < pixels.length; i += 4) {
    if (pixels[i + 3] < 128) continue;
    const [red, green, blue] = [pixels[i], pixels[i + 1], pixels[i + 2]];
    const key = quantizeToBucketKey(red, green, blue);
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
    const rgb = averageRgb(bucket);
    const score = scoreBySaturation(bucket, rgb);
    if (score > bestScore) {
      bestScore = score;
      winner = rgb;
    }
  }
  if (!winner) return null;

  const luminance = relativeLuminance(winner);
  return {
    background: `rgb(${winner.join(", ")})`,
    foreground: (luminance + 0.05) / 0.05 >= 1.05 / (luminance + 0.05) ? "#000000" : "#ffffff",
  };
}
