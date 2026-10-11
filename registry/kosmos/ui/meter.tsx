'use client';

import { Meter as MeterPrimitive } from '@base-ui/react/meter';
import * as React from 'react';
import { cn } from '@/registry/kosmos/lib/cn';

type MeterTone = 'primary' | 'success' | 'warning' | 'destructive';

// `primary` fills with chart-1: the brand indigo, stepped lighter in dark so the fill reaches 3:1 there.
const toneFill: Record<MeterTone, string> = {
  primary: 'bg-chart-1',
  success: 'bg-success',
  warning: 'bg-warning',
  destructive: 'bg-destructive',
};

type MeterContextValue = { percent: number; tone: MeterTone };

const MeterContext = React.createContext<MeterContextValue>({ percent: 0, tone: 'primary' });

/**
 * Picks the tone the way a native `<meter>` picks its color: the range splits at `low` and
 * `high` into three regions; the region holding `optimum` is good, the next one is a warning,
 * the far one is bad.
 */
function autoTone(value: number, low: number, high: number, optimum: number): MeterTone {
  const region = (n: number) => (n < low ? 0 : n > high ? 2 : 1);
  const distance = Math.abs(region(value) - region(optimum));
  return distance === 0 ? 'success' : distance === 1 ? 'warning' : 'destructive';
}

type MeterProps = MeterPrimitive.Root.Props & {
  /**
   * The fill color. `auto` colors by region: with the defaults, the top third of the range is
   * `success`, the middle third `warning` and the bottom third `destructive`.
   */
  tone?: MeterTone | 'auto';
  /** Upper end of the low region, for `tone="auto"`. Defaults to a third of the range. */
  low?: number;
  /** Lower end of the high region, for `tone="auto"`. Defaults to two thirds of the range. */
  high?: number;
  /** The best value, for `tone="auto"`. Defaults to `max`; set it to `min` when less is better, as for disk usage. */
  optimum?: number;
};

/** A value within a known range (a score, a quota), with a label, the value as text and a bar or segments. */
function Meter({
  className,
  value,
  min = 0,
  max = 100,
  tone = 'primary',
  low = min + (max - min) / 3,
  high = min + ((max - min) * 2) / 3,
  optimum = max,
  ...props
}: MeterProps) {
  const clamped = Math.min(max, Math.max(min, value));
  const percent = max === min ? 0 : ((clamped - min) / (max - min)) * 100;
  const resolvedTone = tone === 'auto' ? autoTone(clamped, low, high, optimum) : tone;
  const context = React.useMemo(() => ({ percent, tone: resolvedTone }), [percent, resolvedTone]);

  return (
    <MeterContext.Provider value={context}>
      <MeterPrimitive.Root
        data-slot="meter"
        data-tone={resolvedTone}
        value={value}
        min={min}
        max={max}
        className={cn('grid w-full grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-3 gap-y-2', className)}
        {...props}
      />
    </MeterContext.Provider>
  );
}

function MeterLabel({ className, ...props }: MeterPrimitive.Label.Props) {
  return (
    <MeterPrimitive.Label
      data-slot="meter-label"
      className={cn('col-start-1 min-w-0 text-body font-medium text-foreground', className)}
      {...props}
    />
  );
}

/** The value as text, formatted by `format` on Meter (a percentage by default). */
function MeterValue({ className, ...props }: MeterPrimitive.Value.Props) {
  return (
    <MeterPrimitive.Value
      data-slot="meter-value"
      className={cn('col-start-2 text-end text-body text-muted-foreground tabular-nums', className)}
      {...props}
    />
  );
}

/** A continuous bar on a sunken track. */
function MeterBar({ className, ...props }: MeterPrimitive.Track.Props) {
  const { tone } = React.useContext(MeterContext);
  return (
    <MeterPrimitive.Track
      data-slot="meter-bar"
      className={cn(
        'col-span-full h-1.5 overflow-hidden rounded-full border border-transparent bg-muted shadow-inset',
        className,
      )}
      {...props}
    >
      <MeterPrimitive.Indicator
        data-slot="meter-indicator"
        className={cn(
          'h-full rounded-full transition-[background-color] forced-colors:bg-[CanvasText]',
          'motion-safe:transition-[width,background-color] motion-safe:duration-slow motion-safe:ease-smooth-in-out',
          toneFill[tone],
        )}
      />
    </MeterPrimitive.Track>
  );
}

/** The value as a row of equal segments; each filled segment stands for `1 / count` of the range. */
function MeterSegments({ className, count = 20, ...props }: MeterPrimitive.Track.Props & { count?: number }) {
  const { percent, tone } = React.useContext(MeterContext);
  const filled = percent > 0 ? Math.max(1, Math.round((percent / 100) * count)) : 0;
  return (
    <MeterPrimitive.Track
      data-slot="meter-segments"
      className={cn('col-span-full flex h-3.5 gap-0.5', className)}
      {...props}
    >
      {Array.from({ length: count }, (_, index) => (
        <span
          key={index}
          data-filled={index < filled || undefined}
          className={cn(
            'min-w-0 flex-1 rounded-xs border border-transparent transition-[background-color]',
            index < filled
              ? cn(toneFill[tone], 'forced-colors:bg-[CanvasText]')
              : 'bg-muted shadow-inset forced-colors:border-[CanvasText]',
          )}
        />
      ))}
    </MeterPrimitive.Track>
  );
}

export { Meter, MeterLabel, MeterValue, MeterBar, MeterSegments, type MeterProps, type MeterTone };
