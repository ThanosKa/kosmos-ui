import { ImageResponse } from 'next/og';
import { appName } from '@/lib/shared';
import { KosmosMark } from './kosmos-mark';
import { tokenColors } from './token-colors';

export const socialImageSize = { width: 1200, height: 630 };

/** A Google Fonts cut with just the glyphs of `text`, or `null` when the font can't be fetched. */
async function loadFont(family: string, weight: 400 | 600, text: string): Promise<ArrayBuffer | null> {
  try {
    const query = new URLSearchParams({ family: `${family}:wght@${weight}`, text });
    const css = await fetch(`https://fonts.googleapis.com/css2?${query}`, { signal: AbortSignal.timeout(5000) }).then(
      (response) => response.text(),
    );
    const url = /src: url\((.+?)\) format\('(?:opentype|truetype)'\)/.exec(css)?.[1];
    if (!url) return null;
    const font = await fetch(url, { signal: AbortSignal.timeout(5000) });
    return font.ok ? await font.arrayBuffer() : null;
  } catch {
    return null;
  }
}

/**
 * Geist in regular and semibold, plus a symbol font for the ⌘ some descriptions mention, which Geist lacks.
 * Without network the image falls back to the regular Geist that `next/og` bundles.
 */
async function loadFonts(text: string) {
  const [regular, semibold, symbols] = await Promise.all([
    loadFont('Geist', 400, text),
    loadFont('Geist', 600, text),
    loadFont('Noto Sans Symbols 2', 400, text),
  ]);
  if (!regular || !semibold) return undefined;
  return [
    { name: 'Geist', data: regular, weight: 400 as const },
    { name: 'Geist', data: semibold, weight: 600 as const },
    ...(symbols ? [{ name: 'Symbols', data: symbols, weight: 400 as const }] : []),
  ];
}

function clip(text: string, max: number) {
  if (text.length <= max) return text;
  return `${text.slice(0, text.lastIndexOf(' ', max))}…`;
}

type SocialImageOptions = {
  /** The section above the title, such as Components. */
  eyebrow?: string;
  title: string;
  description?: string;
};

/** The 1200×630 card for links to the site: the mark, then the page's section, title and description. */
export async function socialImage({ eyebrow, title, description }: SocialImageOptions) {
  const color = tokenColors('light');
  const fonts = await loadFonts([appName, eyebrow?.toUpperCase(), title, description, '…'].join(''));

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: '100%',
          height: '100%',
          padding: 80,
          background: color.background,
          color: color.foreground,
          fontFamily: 'Geist',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <KosmosMark width={52} height={52} ringColor={color.brand} gapColor={color.background} style={{ color: color.foreground }} />
          <span style={{ fontSize: 36, fontWeight: 600, letterSpacing: '-0.02em' }}>{appName}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {eyebrow ? (
            <span style={{ fontSize: 26, color: color.mutedForeground, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {eyebrow}
            </span>
          ) : null}
          <span style={{ fontSize: 76, fontWeight: 600, lineHeight: 1.1, letterSpacing: '-0.03em', maxWidth: 1000 }}>
            {clip(title, 60)}
          </span>
          {description ? (
            <span style={{ fontSize: 32, lineHeight: 1.4, color: color.mutedForeground, maxWidth: 1000 }}>
              {clip(description, 150)}
            </span>
          ) : null}
        </div>
      </div>
    ),
    { ...socialImageSize, fonts },
  );
}
