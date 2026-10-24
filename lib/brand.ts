import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseColor } from './contrast.ts';
import { parseKosmosTokens } from './tokens.ts';

/**
 * The brand colour, its hover step, the text that sits on both, and the text selection: the brand at a strength,
 * mixed into the page background, which equals `selection` laid over it. As declared in `app/global.css`.
 */
export type BrandColors = { brand: string; hover: string; foreground: string; selection: string };

/** The brand colours of a site stylesheet's `:root`. Throws when one is missing. */
export function parseBrandColors(css: string): BrandColors {
  const root = parseKosmosTokens(css).light;
  const read = (name: string) => {
    const value = root[name];
    if (!value) throw new Error(`The site stylesheet declares no --${name}`);
    return value;
  };
  const brand = read('brand');
  const strength = /^([\d.]+)%$/.exec(read('brand-selection-strength'));
  if (!strength) throw new Error('--brand-selection-strength must be a percentage');
  return { brand, hover: read('brand-hover'), foreground: read('brand-foreground'), selection: withAlpha(brand, Number(strength[1]) / 100) };
}

/** Reads the brand colours from `app/global.css`, their one source. Server and scripts only. */
export function readBrandColors(root = process.cwd()): BrandColors {
  return parseBrandColors(readFileSync(join(root, 'app/global.css'), 'utf8'));
}

/** A color as `#rrggbbaa`. */
function withAlpha(color: string, alpha: number): string {
  const { r, g, b } = parseColor(color);
  return `#${[r, g, b, alpha].map((channel) => Math.round(channel * 255).toString(16).padStart(2, '0')).join('')}`;
}

const colorPattern = /oklch\([^)]*\)|#[\da-f]{6}(?:[\da-f]{2})?\b|rgba?\([^)]*\)/gi;
const tokenPattern =
  /--(?:color-)?brand(?:-[a-z]+)*\b|\b(?:bg|text|border|ring|outline|fill|stroke|shadow|decoration|from|via|to)-brand(?:-[a-z]+)*\b|\bbrand-primary\b/g;

/** A color as its 8-bit sRGB channels, alpha left out, or `undefined` when it can't be read. */
function srgb8(value: string): string | undefined {
  if (/^rgba?\(/i.test(value)) {
    const channels = [...value.matchAll(/([\d.]+)(%?)/g)].slice(0, 3);
    if (channels.length < 3) return undefined;
    return channels.map(([, number, percent]) => Math.round(Number(number) * (percent ? 2.55 : 1))).join(',');
  }
  try {
    const { r, g, b } = parseColor(value);
    return [r, g, b].map((channel) => Math.round(channel * 255)).join(',');
  } catch {
    return undefined;
  }
}

/**
 * Every place `text` holds the brand colour, at any alpha, as `oklch()` (hue in plain degrees), 6- or 8-digit hex or
 * `rgb()`, or names a brand token or utility (`--brand`, `bg-brand`, `text-brand-foreground`, `brand-primary`).
 * Registry items must hold none: the brand belongs to the site.
 */
export function findBrand(text: string, colors: BrandColors): string[] {
  const brand = srgb8(colors.brand);
  const colorHits = [...text.matchAll(colorPattern)].map(([match]) => match).filter((match) => srgb8(match) === brand);
  const tokenHits = [...text.matchAll(tokenPattern)].map(([match]) => match);
  return [...colorHits, ...tokenHits];
}
