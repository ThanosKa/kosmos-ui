type Rgba = { r: number; g: number; b: number; alpha: number };

const white: Rgba = { r: 1, g: 1, b: 1, alpha: 1 };

function oklchToRgba(lightness: number, chroma: number, hueDegrees: number, alpha: number): Rgba {
  const hue = (hueDegrees * Math.PI) / 180;
  const a = chroma * Math.cos(hue);
  const b = chroma * Math.sin(hue);
  const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const encode = (linear: number) => {
    const clipped = Math.min(1, Math.max(0, linear));
    return clipped <= 0.0031308 ? 12.92 * clipped : 1.055 * clipped ** (1 / 2.4) - 0.055;
  };
  return {
    r: encode(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    g: encode(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    b: encode(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
    alpha,
  };
}

/** A CSS color (`oklch()` or hex, with or without alpha) as sRGB channels and alpha, each from 0 to 1. */
export function parseColor(value: string): Rgba {
  const oklch = /^oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+)\s*(?:\/\s*([\d.]+)(%?))?\s*\)$/.exec(value.trim());
  if (oklch) {
    const [, l, lPercent, c, h, alpha, alphaPercent] = oklch;
    const opacity = alpha === undefined ? 1 : Number(alpha) / (alphaPercent ? 100 : 1);
    return oklchToRgba(Number(l) / (lPercent ? 100 : 1), Number(c), Number(h), opacity);
  }
  const hex = /^#([\da-f]{2})([\da-f]{2})([\da-f]{2})([\da-f]{2})?$/i.exec(value.trim());
  if (hex) {
    const [r, g, b, alpha] = [hex[1], hex[2], hex[3], hex[4] ?? 'ff'].map((pair) => parseInt(pair, 16) / 255);
    return { r, g, b, alpha };
  }
  throw new Error(`Can't read "${value}" as a color: use oklch() or #rrggbb`);
}

function over(top: Rgba, bottom: Rgba): Rgba {
  const mix = (front: number, back: number) => front * top.alpha + back * (1 - top.alpha);
  return { r: mix(top.r, bottom.r), g: mix(top.g, bottom.g), b: mix(top.b, bottom.b), alpha: 1 };
}

function luminance({ r, g, b }: Rgba) {
  const linear = (channel: number) => (channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
}

/**
 * The WCAG 2 contrast ratio between two CSS colors (`oklch()` or hex, with or without alpha), from 1 to 21.
 * A see-through background is laid over `backdrop` first, and a see-through foreground over that result, the
 * way the browser paints a translucent hover fill on a card and text on top of it.
 */
export function contrastRatio(foreground: string, background: string, backdrop = '#ffffff'): number {
  const base = over(parseColor(background), over(parseColor(backdrop), white));
  const front = over(parseColor(foreground), base);
  const [lighter, darker] = [luminance(front), luminance(base)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
}
