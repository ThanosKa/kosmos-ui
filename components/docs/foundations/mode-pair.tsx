import type { CSSProperties, ReactNode } from 'react';
import { modeLabels, modes, modeVars } from '@/lib/foundations';
import type { KosmosTokens } from '@/lib/tokens';
import { cn } from '@/registry/kosmos/lib/cn';
import { eyebrowClass } from '../classes';

/**
 * Renders its children twice, on the light page and on the dark page, whatever the site theme is.
 * Kosmos utilities read their CSS variable where they are used, so each half sets its mode's
 * variables and the children inside follow it. `dark:` variants inside would follow the site.
 */
export function ModePair({
  tokens,
  children,
  className,
}: {
  tokens: KosmosTokens;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className="grid grid-cols-1 overflow-hidden rounded-2xl border border-transparent shadow-card sm:grid-cols-2">
      {modes.map((mode) => (
        <div
          key={mode}
          data-mode={mode}
          style={modeVars(tokens, mode) as CSSProperties}
          className={cn('flex min-w-0 flex-col gap-3 bg-background p-4 text-foreground', className)}
        >
          <span className={eyebrowClass}>{modeLabels[mode]}</span>
          {children}
        </div>
      ))}
    </div>
  );
}
