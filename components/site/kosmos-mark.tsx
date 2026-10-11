import type * as React from 'react';

/**
 * A planet with a ring: the Kosmos UI mark, a placeholder until there is a real logo. Takes the text color;
 * the planet's outline takes the page background, so the ring reads as passing behind it and in front.
 */
export function KosmosMark(props: React.ComponentProps<'svg'>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <g transform="rotate(-24 12 12)" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
        <ellipse cx="12" cy="12" rx="11" ry="4" />
        <circle cx="12" cy="12" r="6.5" fill="currentColor" stroke="var(--color-background)" strokeWidth="2" />
        <path d="M1 12 A11 4 0 0 0 23 12" />
      </g>
    </svg>
  );
}
