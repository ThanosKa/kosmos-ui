'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import { Button } from '@/registry/kosmos/ui/button';

/** A dot that runs the track once on mount. Remounting it (a new `key`) replays the run from the start. */
function EasingRun({ name }: { name: string }) {
  const [arrived, setArrived] = useState(false);

  useEffect(() => {
    // Two frames, so the start position is painted before the transition to the end begins.
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => setArrived(true));
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <>
      <span
        style={{ '--run-ease': `var(--ease-${name})` } as CSSProperties}
        className={`absolute inset-y-1 left-1 right-8 ease-(--run-ease) motion-safe:transition-[translate] motion-safe:duration-1000 motion-reduce:transition-opacity motion-reduce:duration-slow ${
          arrived ? 'motion-safe:translate-x-full motion-reduce:opacity-0' : ''
        }`}
      >
        <span className="block size-6 rounded-full bg-primary shadow-primary" />
      </span>
      <span
        aria-hidden
        className={`absolute top-1 right-1 hidden size-6 rounded-full bg-primary shadow-primary transition-opacity duration-slow motion-reduce:block ${
          arrived ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </>
  );
}

export function EasingDemo({ items }: { items: { name: string; bezier: number[] }[] }) {
  const [runs, setRuns] = useState(0);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Button variant="primary" onClick={() => setRuns((count) => count + 1)}>
          {runs === 0 ? 'Play' : 'Replay'}
        </Button>
        <p className="text-small text-muted-foreground">
          Slowed to 1000ms so the curve is visible. With reduced motion the dot cross-fades to the end instead of moving.
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
                className="size-16 rounded-lg border border-transparent bg-card text-foreground shadow-card"
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
                <span className="font-mono text-caption text-muted-foreground tabular-nums">{bezier.join(', ')}</span>
              </div>
              <div className="relative col-span-2 h-8 rounded-full border border-transparent bg-muted shadow-inset sm:col-span-1">
                {runs === 0 ? (
                  <span className="absolute top-1 left-1 size-6 rounded-full bg-primary shadow-primary" />
                ) : (
                  <EasingRun key={runs} name={name} />
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
