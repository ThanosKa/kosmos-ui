'use client';

import { useId, useState, type ReactNode } from 'react';
import { cn } from '@/registry/kosmos/lib/cn';

type PresetCardProps = {
  title: string;
  description?: string;
  /** Sits at the end of the header row: a button, a segmented control, an avatar group. */
  action?: ReactNode;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
};

/** One card on the Presets preview: a title, an optional description and action, then the composition. */
export function PresetCard({ title, description, action, className, bodyClassName, children }: PresetCardProps) {
  const id = useId();
  return (
    <section
      aria-labelledby={id}
      className={cn('flex min-w-0 flex-col rounded-2xl border border-transparent bg-card text-card-foreground shadow-card', className)}
    >
      <header className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2 px-4 pt-4">
        <div className="flex min-w-0 flex-col gap-0.5">
          <h3 id={id} className="text-title">
            {title}
          </h3>
          {description ? <p className="text-small text-pretty text-muted-foreground">{description}</p> : null}
        </div>
        {action}
      </header>
      <div className={cn('flex min-w-0 flex-col gap-4 p-4', bodyClassName)}>{children}</div>
    </section>
  );
}

type PresetStageProps = Omit<PresetCardProps, 'children' | 'bodyClassName'> & {
  /** The stage height, such as `h-80`. */
  stageClassName?: string;
  /** Renders the scene; portal the pinned overlay into `container`. */
  children: (container: HTMLElement) => ReactNode;
};

/**
 * A card whose body is a small inset screen with an overlay pinned open in it. `transform` makes the
 * stage the containing block of every `fixed` descendant, so a dialog, drawer, menu or toast portalled
 * into it fills the stage instead of the page. Pin the overlay with controlled `open`, `modal={false}`
 * and `initialFocus={false}`, as on the review previews.
 */
export function PresetStage({ stageClassName, children, ...card }: PresetStageProps) {
  const [container, setContainer] = useState<HTMLElement | null>(null);
  return (
    // The card's 16px corner is the stage's 12px corner plus the 4px gap around it.
    <PresetCard {...card} bodyClassName="p-1 pt-4">
      <div
        ref={setContainer}
        className={cn(
          'relative h-80 w-full overflow-hidden rounded-xl border border-transparent bg-background p-3 shadow-inset [transform:translateZ(0)]',
          stageClassName,
        )}
      >
        {container ? children(container) : null}
      </div>
    </PresetCard>
  );
}

/** A faint stand-in for the page behind a pinned overlay: a few rows of muted text. */
export function StageBackdropRows({ rows }: { rows: readonly string[] }) {
  return (
    <ul aria-hidden className="flex flex-col divide-y divide-border text-body text-muted-foreground">
      {rows.map((row) => (
        <li key={row} className="truncate py-2">
          {row}
        </li>
      ))}
    </ul>
  );
}
