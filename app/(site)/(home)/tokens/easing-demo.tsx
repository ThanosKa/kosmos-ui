'use client';

import { useState } from 'react';
import { Button } from '@/registry/kosmos/ui/button';

export function EasingDemo({
  items,
}: {
  items: { name: string; bezier: number[] }[];
}) {
  const [played, setPlayed] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Button variant="primary" onClick={() => setPlayed((value) => !value)}>
          {played ? 'Reset' : 'Play'}
        </Button>
        <p className="text-small text-muted-foreground">
          Slowed to 1000ms so the curve is visible. With reduced motion the dot
          cross-fades to the end instead of moving.
        </p>
      </div>
      <ul className="flex flex-col gap-3">
        {items.map(({ name, bezier }) => {
          const [x1, y1, x2, y2] = bezier;
          return (
            <li
              key={name}
              data-token-easing={name}
              className="grid grid-cols-[64px_1fr] items-center gap-4 sm:grid-cols-[64px_160px_1fr]"
            >
              <svg
                viewBox="-4 -4 108 108"
                className="size-16 rounded-lg bg-card text-foreground shadow-card"
                aria-hidden
              >
                <path
                  d={`M0 100 C${x1 * 100} ${100 - y1 * 100} ${x2 * 100} ${100 - y2 * 100} 100 0`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                />
              </svg>
              <div className="flex min-w-0 flex-col gap-1">
                <code className="text-body font-medium">ease-{name}</code>
                <span className="font-mono text-caption tabular-nums text-muted-foreground">
                  {bezier.join(', ')}
                </span>
              </div>
              <div className="relative col-span-2 h-8 rounded-full bg-muted shadow-inset sm:col-span-1">
                <span
                  style={{ transitionTimingFunction: `var(--ease-${name})` }}
                  className={`absolute inset-y-1 left-1 right-8 motion-safe:transition-[translate] motion-safe:duration-1000 motion-reduce:transition-opacity motion-reduce:duration-slow ${
                    played
                      ? 'motion-safe:translate-x-full motion-reduce:opacity-0'
                      : ''
                  }`}
                >
                  <span className="block size-6 rounded-full bg-primary shadow-primary" />
                </span>
                <span
                  aria-hidden
                  className={`absolute top-1 right-1 hidden size-6 rounded-full bg-primary shadow-primary transition-opacity duration-slow motion-reduce:block ${
                    played ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
