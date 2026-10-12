import type { CSSProperties } from 'react';
import { radiusScale, shadowTokens } from '@/lib/foundations';
import { readKosmosTokens } from '@/lib/tokens';
import { cn } from '@/registry/kosmos/lib/cn';
import { ModePair } from './mode-pair';

export function ShadowSurfaces() {
  const tokens = readKosmosTokens();

  return (
    <ul className="not-prose my-6 flex flex-col gap-8">
      {shadowTokens().map((shadow) => (
        <li key={shadow.name} data-token-shadow={shadow.name} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <code className="font-mono text-body font-medium">{shadow.name}</code>
              <span className="text-caption text-muted-foreground">
                on <code className="font-mono">{shadow.fill}</code>
              </span>
            </div>
            <p className="text-small text-muted-foreground">{shadow.surface}</p>
          </div>
          <ModePair tokens={tokens} className="p-6">
            <span
              style={{ '--tile-shadow': `var(--${shadow.name})` } as CSSProperties}
              className={cn('block h-16 rounded-xl border border-transparent shadow-(--tile-shadow)', shadow.fill)}
            />
          </ModePair>
        </li>
      ))}
    </ul>
  );
}

export function RadiusScale() {
  return (
    <ul className="not-prose my-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
      {radiusScale().map((radius) => (
        <li key={radius.name} data-token-radius={radius.name} className="flex items-center gap-4">
          <span
            style={{ '--tile-radius': radius.value } as CSSProperties}
            className="size-16 shrink-0 rounded-(--tile-radius) border border-transparent bg-card shadow-card"
          />
          <div className="flex min-w-0 flex-col gap-0.5">
            <div className="flex flex-wrap items-baseline gap-x-2">
              <code className="font-mono text-body font-medium">{radius.className}</code>
              <span className="font-mono text-caption text-muted-foreground tabular-nums">{radius.px}</span>
            </div>
            <p className="text-small text-muted-foreground">{radius.use}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
