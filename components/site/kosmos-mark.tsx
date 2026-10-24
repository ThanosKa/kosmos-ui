import type * as React from 'react';

type KosmosMarkProps = React.ComponentProps<'svg'> & {
  /** The ring's color. Defaults to the brand colour; the planet takes the text color. */
  ringColor?: string;
  /** The outline around the planet, which must match what the mark sits on. Defaults to the page background. */
  gapColor?: string;
};

/**
 * A planet with a ring: the Kosmos UI mark, a placeholder until there is a real logo. The planet takes the text color
 * and the ring the brand colour; the planet's outline takes the page background, so the ring reads as passing behind it and in front.
 * `app/icon.svg` draws the same shapes for the favicon.
 */
export function KosmosMark({ ringColor = 'var(--color-brand)', gapColor = 'var(--color-background)', ...props }: KosmosMarkProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <g transform="rotate(-24 12 12)" stroke={ringColor} strokeWidth="1.75" strokeLinecap="round">
        <ellipse cx="12" cy="12" rx="11" ry="4" />
        <circle cx="12" cy="12" r="6.5" fill="currentColor" stroke={gapColor} strokeWidth="2" />
        <path d="M1 12 A11 4 0 0 0 23 12" />
      </g>
    </svg>
  );
}
