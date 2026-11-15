'use client';

import * as React from 'react';
import { type ChartEntrance, useChartEntrance, useCountUp, useReducedMotion } from '@/registry/kosmos/hooks/use-chart-motion';
import { cn } from '@/registry/kosmos/lib/cn';

type SegmentedGaugeTone = 'primary' | 'success' | 'warning' | 'destructive';

type SegmentedGaugeProps = Omit<React.ComponentProps<'div'>, 'children'> & {
  /** The amount used, such as events this month. A value past `max` lights every segment. */
  value: number;
  /** The limit the value is a share of. */
  max?: number;
  /** Names the gauge for screen readers, such as "Event quota, Fernhill Books". */
  label: string;
  /** Writes the value in the middle and for screen readers. Gets the value, not the share. */
  format?: (value: number) => string;
  /** A short line above the value, such as "Last 30 days". Hidden when the gauge is under 256px wide. */
  caption?: React.ReactNode;
  /** A short line under the value, such as "51% left". Hidden when the gauge is under 256px wide. */
  description?: React.ReactNode;
  /** The color of the lit segments. Leave it out to color by how full the gauge is. */
  tone?: SegmentedGaugeTone;
  /** With no `tone`, the lit segments turn `warning` from this value and `destructive` past `max`. */
  high?: number;
  /** When the segments rise in. See `ChartEntrance`. */
  entrance?: ChartEntrance;
};

const SEGMENTS = 18;
const CENTER = { x: 100, y: 100 };
const INNER = 62;
const OUTER = 94;
/** The space between two segments, the same at the inner and the outer edge. */
const GAP = 3;
/** The stroke in the segment's own color that rounds its corners; it eats into the gap from both sides. */
const ROUNDING = 3;
/** The time between one segment lighting and the next, so a change sweeps along the arc. */
const STEP_MS = 32;
/** How far each segment rises out of the ring's middle as the gauge comes in. */
const RISE = 6;
/** The time between one segment rising and the next, left to right. */
const RISE_STEP_MS = 20;
/** On the entrance the lit segments start lighting once most of the track is up. */
const LIGHT_AT_MS = 300;
/** The text in the middle comes in as the lighting starts, one line after another. */
const TEXT_AT_MS = 250;
const TEXT_STEP_MS = 80;

const toneClass: Record<SegmentedGaugeTone, string> = {
  primary: 'fill-chart-1 stroke-chart-1',
  success: 'fill-success stroke-success',
  warning: 'fill-warning stroke-warning',
  destructive: 'fill-destructive stroke-destructive',
};

// Rounded, so the server and the browser write the same path despite their different trig precision.
const round = (n: number) => Math.round(n * 100) / 100;
const point = (radius: number, angle: number) => `${round(CENTER.x + radius * Math.cos(angle))} ${round(CENTER.y - radius * Math.sin(angle))}`;

/**
 * Each segment is a wedge of the half ring from the left end to the right. Its sides are pulled in by half the gap at
 * every radius, so the gap stays straight instead of widening outward.
 */
const segments = Array.from({ length: SEGMENTS }, (_, i) => {
  const start = Math.PI - (Math.PI * i) / SEGMENTS;
  const end = Math.PI - (Math.PI * (i + 1)) / SEGMENTS;
  const middle = (start + end) / 2;
  const inset = (radius: number) => Math.asin((GAP + ROUNDING) / 2 / radius);
  const outer = OUTER - ROUNDING / 2;
  const inner = INNER + ROUNDING / 2;
  return {
    d: [
      `M ${point(outer, start - inset(outer))}`,
      `A ${outer} ${outer} 0 0 1 ${point(outer, end + inset(outer))}`,
      `L ${point(inner, end + inset(inner))}`,
      `A ${inner} ${inner} 0 0 0 ${point(inner, start - inset(inner))}`,
      'Z',
    ].join(' '),
    /** Where the segment starts before it rises: pulled toward the ring's middle along its own angle. */
    sunk: { x: round(-RISE * Math.cos(middle)), y: round(RISE * Math.sin(middle)) },
  };
});

const delay = (ms: number) => ({ '--delay': `${ms}ms` }) as React.CSSProperties;

/** The classes that fade a line of text in and rise it a little once the gauge is revealed, after its `--delay`. */
const rise = (revealed: boolean) =>
  cn(
    'transition-[opacity] duration-reveal ease-power3-out motion-safe:transition-[opacity,translate] motion-safe:delay-(--delay)',
    !revealed && 'opacity-0 motion-safe:translate-y-1.5',
  );

/** Lit segments for a share: at least one for any use, and never all of them until the limit is reached. */
function litCount(share: number) {
  if (share <= 0) return 0;
  if (share >= 1) return SEGMENTS;
  return Math.min(Math.max(Math.round(share * SEGMENTS), 1), SEGMENTS - 1);
}

/**
 * A share of a limit as a half ring of segments, the used ones lit, with the value in the middle. On entrance the
 * segments rise out of the ring's middle one after another, then the used ones light along the arc and the value
 * counts up. When the value changes the segments light or go out one after another from where the old value ended, so
 * the change sweeps along the arc, and going out is quicker than lighting. Past `high` the lit segments turn warning,
 * past `max` destructive. Under reduced motion everything cross-fades.
 */
function SegmentedGauge({
  value,
  max = 100,
  label,
  format,
  caption,
  description,
  tone,
  high = max * 0.9,
  entrance,
  className,
  ...props
}: SegmentedGaugeProps) {
  const root = React.useRef<HTMLDivElement>(null);
  const { revealed, instant } = useChartEntrance(root, entrance);
  const reduced = useReducedMotion();
  const used = Math.max(value, 0);
  const share = max > 0 ? used / max : 0;
  const write = format ?? ((amount: number) => `${max > 0 ? Math.round((amount / max) * 100) : 0}%`);
  const resolvedTone = tone ?? (used > max ? 'destructive' : used >= high ? 'warning' : 'primary');

  const lit = revealed ? litCount(share) : 0;
  const [sweep, setSweep] = React.useState({ lit, from: lit, lead: 0, revealed });
  if (lit !== sweep.lit || revealed !== sweep.revealed) {
    setSweep({ lit, from: sweep.lit, lead: revealed && !sweep.revealed ? LIGHT_AT_MS : 0, revealed });
  }
  const { from, lead } = sweep;

  const [lightingStarted, setLightingStarted] = React.useState(false);
  React.useEffect(() => {
    if (!revealed || instant || reduced || lightingStarted) return;
    const timer = setTimeout(() => setLightingStarted(true), LIGHT_AT_MS);
    return () => clearTimeout(timer);
  }, [revealed, instant, reduced, lightingStarted]);
  const lighting = revealed && (instant || reduced || lightingStarted || entrance === 'none');
  const shown = useCountUp(used, { ready: lighting, instant });

  return (
    <div
      ref={root}
      data-slot="segmented-gauge"
      data-tone={resolvedTone}
      data-instant={instant || undefined}
      className={cn('@container/segmented-gauge relative mx-auto w-full max-w-72 data-instant:**:transition-none', className)}
      {...props}
    >
      <div
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={Math.max(max, 0)}
        aria-valuenow={Math.min(used, Math.max(max, 0))}
        aria-valuetext={write(used)}
        data-slot="segmented-gauge-meter"
      >
        <svg aria-hidden viewBox="0 0 200 102" className="block w-full overflow-visible">
          {segments.map(({ d, sunk }, i) => {
            const on = i < lit;
            const changed = (i >= from && i < lit) || (i >= lit && i < from);
            const order = lit > from ? i - from : from - 1 - i;
            return (
              <g
                key={i}
                style={{ '--sunk-x': `${sunk.x}px`, '--sunk-y': `${sunk.y}px`, '--rise-delay': `${i * RISE_STEP_MS}ms` } as React.CSSProperties}
                className={cn(
                  'transition-[opacity] duration-reveal ease-power3-out',
                  'motion-safe:transition-[opacity,translate] motion-safe:delay-(--rise-delay)',
                  !revealed && 'opacity-0 motion-safe:translate-x-(--sunk-x) motion-safe:translate-y-(--sunk-y)',
                )}
              >
                <path
                  d={d}
                  strokeWidth={ROUNDING}
                  strokeLinejoin="round"
                  data-slot="segmented-gauge-segment"
                  data-lit={on || undefined}
                  style={delay(changed ? lead + order * STEP_MS : 0)}
                  className={cn(
                    'transition-[fill,stroke] motion-safe:delay-(--delay)',
                    on ? 'duration-slow' : 'duration-fast',
                    on ? toneClass[resolvedTone] : 'fill-muted stroke-muted',
                    on
                      ? 'forced-colors:fill-[CanvasText] forced-colors:stroke-[CanvasText]'
                      : 'forced-colors:fill-[GrayText] forced-colors:stroke-[GrayText]',
                  )}
                />
              </g>
            );
          })}
        </svg>
      </div>

      <div
        data-slot="segmented-gauge-center"
        className="absolute inset-x-[19%] bottom-0 flex flex-col items-center text-center"
      >
        {caption ? (
          <span
            data-slot="segmented-gauge-caption"
            style={delay(TEXT_AT_MS)}
            className={cn('hidden max-w-[70%] truncate text-caption text-muted-foreground @3xs/segmented-gauge:block', rise(revealed))}
          >
            {caption}
          </span>
        ) : null}
        <span
          aria-hidden
          data-slot="segmented-gauge-value"
          style={delay(TEXT_AT_MS + TEXT_STEP_MS)}
          className={cn('text-title whitespace-nowrap tabular-nums @3xs/segmented-gauge:text-display', rise(revealed))}
        >
          {write(shown)}
        </span>
        {description ? (
          <span
            data-slot="segmented-gauge-description"
            style={delay(TEXT_AT_MS + 2 * TEXT_STEP_MS)}
            className={cn('hidden max-w-[90%] truncate text-small text-muted-foreground @3xs/segmented-gauge:block', rise(revealed))}
          >
            {description}
          </span>
        ) : null}
      </div>
    </div>
  );
}

export { SegmentedGauge, type SegmentedGaugeProps, type SegmentedGaugeTone };
