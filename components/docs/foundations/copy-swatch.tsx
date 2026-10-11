'use client';

import { Check, Copy } from 'lucide-react';
import { useEffect, useState, type CSSProperties } from 'react';
import type { Mode } from '@/lib/foundations';
import { Button } from '@/registry/kosmos/ui/button';

type Swatch = { color: string; background: string; line: string };

/** A color token in light and dark, side by side. Clicking it copies its Tailwind class. */
export function CopySwatch({ tokenClass, swatches }: { tokenClass: string; swatches: Record<Mode, Swatch> }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timeout = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(timeout);
  }, [copied]);

  return (
    <>
      <Button
        variant="item"
        data-copy-swatch={tokenClass}
        aria-label={`Copy ${tokenClass}`}
        onClick={async () => {
          await navigator.clipboard.writeText(tokenClass);
          setCopied(true);
        }}
        className="h-auto w-full flex-col items-stretch gap-2 p-1.5"
      >
        <span className="grid h-16 grid-cols-2 overflow-hidden rounded-sm">
          {(['light', 'dark'] as const).map((mode) => (
            <span
              key={mode}
              style={{
                '--swatch-color': swatches[mode].color,
                '--swatch-background': swatches[mode].background,
                '--swatch-line': swatches[mode].line,
              } as CSSProperties}
              className="bg-(--swatch-background) p-2"
            >
              <span className="block size-full rounded-md bg-(--swatch-color) outline-1 -outline-offset-1 outline-(--swatch-line)" />
            </span>
          ))}
        </span>
        <span className="flex items-center justify-between gap-2 px-1">
          <code className="truncate font-mono text-body">{tokenClass}</code>
          <span className="flex shrink-0 items-center gap-1 text-caption text-muted-foreground">
            {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
            {copied ? 'Copied' : 'Copy'}
          </span>
        </span>
      </Button>
      <span aria-live="polite" className="sr-only">
        {copied ? `Copied ${tokenClass}` : ''}
      </span>
    </>
  );
}
