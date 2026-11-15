'use client';

import { Meter as MeterPrimitive } from '@base-ui/react/meter';
import * as React from 'react';
import { cn } from '@/registry/kosmos/lib/cn';
import { autoTone, type MeterTone } from '@/registry/kosmos/ui/meter';

type GaugeTone = MeterTone;
type GaugeSize = 'xs' | 'sm' | 'md' | 'lg';

const arcStroke: Record<GaugeTone, string> = {
  primary: 'stroke-accent-text',
  success: 'stroke-success',
  warning: 'stroke-warning',
  destructive: 'stroke-destructive',
};

/** `strokeWidth` is in viewBox units (100 across), so the stroke and the gap between the arcs scale with the ring. */
const sizeStyles: Record<GaugeSize, { box: string; text: string | null; strokeWidth: number }> = {
  xs: { box: 'size-5', text: null, strokeWidth: 18 },
  sm: { box: 'size-8', text: 'text-caption font-medium', strokeWidth: 12 },
  md: { box: 'size-16', text: 'text-title font-medium', strokeWidth: 9 },
  lg: { box: 'size-32', text: 'text-display', strokeWidth: 7 },
};

const VIEW_BOX = 100;
const CENTER = VIEW_BOX / 2;
const GAP_RATIO = 0.5;
const LENGTH = 100;

/**
 * Splits the ring into a value arc and a track arc, a gap apart at both joins. Lengths are in `pathLength` units; the
 * gap is `GAP_RATIO` of a stroke between the round caps, so it looks the same at every size and value.
 */
function arcs(percent: number, strokeWidth: number, radius: number) {
  const full = '100 100';
  if (percent <= 0) return { value: { array: '0 100', offset: 0 }, track: { array: full, offset: 0 } };
  if (percent >= 100) return { value: { array: full, offset: 0 }, track: { array: '0 100', offset: 0 } };
  const gap = ((strokeWidth * (1 + GAP_RATIO)) / (2 * Math.PI * radius)) * LENGTH;
  const room = LENGTH - 2 * gap;
  const value = (percent / 100) * room;
  const track = room - value;
  return {
    value: { array: `${value} 100`, offset: -gap / 2 },
    track: { array: `${track} 100`, offset: -(gap / 2 + value + gap) },
  };
}

type GaugeProps = Omit<MeterPrimitive.Root.Props, 'value' | 'children'> & {
  /** The current value. Leave it out with `indeterminate`. */
  value?: number;
  /** Shows a spinner instead of the arc, for a value that is still being worked out. The gauge then has no value. */
  indeterminate?: boolean;
  /** The arc color. `auto` colors by region, the way `Meter` does. */
  tone?: GaugeTone | 'auto';
  /** Upper end of the low region, for `tone="auto"`. Defaults to a third of the range. */
  low?: number;
  /** Lower end of the high region, for `tone="auto"`. Defaults to two thirds of the range. */
  high?: number;
  /** The best value, for `tone="auto"`. Defaults to `max`; set it to `min` when less is better. */
  optimum?: number;
  size?: GaugeSize;
  /** Shows the value in the center: the number alone by default, or as `format` says. Ignored at `xs`. */
  showValue?: boolean;
  /** Replaces the value in the center, for an icon or your own text. */
  children?: React.ReactNode;
};

/** A value within a known range as a ring that fills clockwise from the top, with an optional label in the center. */
function Gauge({
  className,
  value,
  indeterminate = false,
  min = 0,
  max = 100,
  tone = 'primary',
  low = min + (max - min) / 3,
  high = min + ((max - min) * 2) / 3,
  optimum = max,
  size = 'md',
  showValue = false,
  format = { style: 'decimal', maximumFractionDigits: 0 },
  getAriaValueText,
  children,
  ...props
}: GaugeProps) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const { box, text, strokeWidth } = sizeStyles[size];
  const radius = CENTER - strokeWidth / 2;
  const clamped = Math.min(max, Math.max(min, value ?? min));
  const percent = max === min ? 0 : ((clamped - min) / (max - min)) * 100;
  const resolvedTone = tone === 'auto' ? autoTone(clamped, low, high, optimum) : tone;

  const rootClassName = cn('relative inline-grid shrink-0 place-items-center', box, className);
  const labelClassName = cn('relative text-foreground tabular-nums', text);
  const circle = {
    cx: CENTER,
    cy: CENTER,
    r: radius,
    fill: 'none',
    strokeWidth,
    strokeLinecap: 'round' as const,
    pathLength: LENGTH,
  };

  if (indeterminate) {
    return (
      <div
        role="progressbar"
        aria-busy
        data-slot="gauge"
        data-indeterminate=""
        className={rootClassName}
        {...(props as React.ComponentProps<'div'>)}
      >
        <svg aria-hidden viewBox={`0 0 ${VIEW_BOX} ${VIEW_BOX}`} className="absolute inset-0 size-full">
          <circle {...circle} className="stroke-muted forced-colors:stroke-[GrayText]" />
          <circle
            {...circle}
            strokeDasharray="25 75"
            className={cn(
              'origin-center motion-safe:animate-spin motion-reduce:animate-pulse',
              'stroke-accent-text forced-colors:stroke-[CanvasText]',
            )}
          />
        </svg>
        {children && text ? <span className={labelClassName}>{children}</span> : null}
      </div>
    );
  }

  const final = arcs(percent, strokeWidth, radius);
  const current = mounted ? final : arcs(0, strokeWidth, radius);
  const vars = {
    '--value-array': current.value.array,
    '--value-offset': current.value.offset,
    '--track-array': current.track.array,
    '--track-offset': current.track.offset,
    '--value-array-final': final.value.array,
    '--value-offset-final': final.value.offset,
    '--track-array-final': final.track.array,
    '--track-offset-final': final.track.offset,
  } as React.CSSProperties;
  const motion =
    'motion-safe:transition-[stroke-dasharray,stroke-dashoffset,stroke,opacity] motion-safe:duration-slow motion-safe:ease-smooth-in-out';

  return (
    <MeterPrimitive.Root
      data-slot="gauge"
      data-tone={resolvedTone}
      value={clamped}
      min={min}
      max={max}
      format={format}
      getAriaValueText={getAriaValueText ?? (() => `${Math.round(percent)}%`)}
      className={rootClassName}
      {...props}
    >
      <svg
        aria-hidden
        viewBox={`0 0 ${VIEW_BOX} ${VIEW_BOX}`}
        style={vars}
        className="absolute inset-0 size-full -rotate-90"
      >
        <circle
          {...circle}
          data-slot="gauge-track"
          className={cn(
            'stroke-muted forced-colors:stroke-[GrayText]',
            '[stroke-dasharray:var(--track-array-final)] [stroke-dashoffset:var(--track-offset-final)]',
            'transition-[opacity] motion-safe:[stroke-dasharray:var(--track-array)] motion-safe:[stroke-dashoffset:var(--track-offset)]',
            motion,
            percent >= 100 && 'opacity-0',
          )}
        />
        <circle
          {...circle}
          data-slot="gauge-arc"
          data-mounted={mounted || undefined}
          className={cn(
            arcStroke[resolvedTone],
            'forced-colors:stroke-[CanvasText]',
            '[stroke-dasharray:var(--value-array-final)] [stroke-dashoffset:var(--value-offset-final)]',
            'transition-[opacity,stroke] motion-reduce:not-data-mounted:opacity-0',
            'motion-safe:[stroke-dasharray:var(--value-array)] motion-safe:[stroke-dashoffset:var(--value-offset)]',
            motion,
            percent <= 0 && 'opacity-0',
          )}
        />
      </svg>
      {text ? (
        children ? (
          <span data-slot="gauge-label" className={labelClassName}>
            {children}
          </span>
        ) : showValue ? (
          <MeterPrimitive.Value data-slot="gauge-label" className={labelClassName} />
        ) : null
      ) : null}
    </MeterPrimitive.Root>
  );
}

export { Gauge, type GaugeProps, type GaugeSize, type GaugeTone };
