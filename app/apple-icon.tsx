/* eslint-disable no-restricted-syntax -- ImageResponse (Satori) renders inline styles only; it reads no stylesheet or class */
import { ImageResponse } from 'next/og';
import { KosmosMark } from '@/components/site/kosmos-mark';
import { tokenColors } from '@/components/site/token-colors';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  const color = tokenColors('light');
  return new ImageResponse(
    (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', background: color.background }}>
        <KosmosMark width={128} height={128} ringColor={color.brand} gapColor={color.background} style={{ color: color.foreground }} />
      </div>
    ),
    size,
  );
}
