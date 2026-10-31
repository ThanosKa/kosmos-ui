'use client';

import * as React from 'react';
import { type ChartEntrance, useChartEntrance, useReducedMotion } from '@/registry/kosmos/hooks/use-chart-motion';
import { cn } from '@/registry/kosmos/lib/cn';
import { duration, ease } from '@/registry/kosmos/lib/motion';

type CandlestickChartItem = {
  /** The time the candle covers, short ("Oct 5"). Shows under the plot when there is room and `group` is left out. */
  label: string;
  /** The full time in the tooltip and for screen readers ("Mon, Oct 5, 09:00 to 12:00"). Defaults to `label`. */
  name?: string;
  /** Candles in a row with the same `group` share one label under the plot, centered over them ("Mon", "Sep"). */
  group?: string;
  open: number;
  high: number;
  low: number;
  close: number;
  /** The amount traded or counted in the candle, drawn as a faint bar along the bottom. */
  volume?: number;
};

type CandlestickChartProps = Omit<React.ComponentProps<'figure'>, 'children'> & {
  /** The candles, oldest first. */
  data: readonly CandlestickChartItem[];
  /** Names the chart for screen readers and captions its hidden table, such as "Events a minute, last 7 days". */
  label: string;
  /** Writes the open, high, low and close, and the price labels on the right. */
  format?: (value: number) => string;
  /** Writes the volume in the tooltip. */
  formatVolume?: (value: number) => string;
  /** What the volume is called in the tooltip and the hidden table. */
  volumeLabel?: string;
  /** When the candles grow in. See `ChartEntrance`. */
  entrance?: ChartEntrance;
};

/** Room under the plot for the time labels. */
const LABEL_ROOM = 22;
const PLOT_TOP = 8;
/** The share of the plot the volume bars may fill, along its bottom. */
const VOLUME_SHARE = 0.2;
const VOLUME_GAP = 8;
/** A body fills this share of its slot, up to `MAX_BODY` pixels. */
const BODY_SHARE = 0.6;
const MAX_BODY = 10;
const TOOLTIP_GAP = 8;
/** The width of one caption character in tabular figures, to make room for labels before they are measured. */
const CHAR_WIDTH = 7;
/** The axes and labels come in over this long before the candles start to grow. */
const AXES_MS = 300;
const CANDLE_STAGGER_MS = 10;
/** The candles' stagger never spreads over longer than this, however many there are. */
const SPREAD_MS = 560;
const FLAT = 0.001;

const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });
const whole = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });
const formatWhole = (value: number) => whole.format(value);
const formatCompact = (value: number) => compact.format(value);

/**
 * One candle in the plot's own units, so it draws at any size: `x` is its centre and `slot` its share of the width,
 * the prices run from 0 at the bottom of the price scale to 1 at its top, and `volume` is a share of the tallest bar.
 */
type Shape = { x: number; slot: number; open: number; high: number; low: number; close: number; volume: number };

type Tween = {
  from: Shape[];
  to: Shape[];
  rising: boolean[];
  delay: number;
  stagger: number;
  duration: number;
  ease: (t: number) => number;
  fade: readonly [number, number];
};

type Layer = { shapes: Shape[]; rising: boolean[]; opacity: number };

function cubicBezier([x1, y1, x2, y2]: readonly number[]) {
  const at = (a: number, b: number, t: number) => 3 * a * t * (1 - t) ** 2 + 3 * b * (1 - t) * t ** 2 + t ** 3;
  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let low = 0;
    let high = 1;
    for (let i = 0; i < 24; i++) {
      const mid = (low + high) / 2;
      if (at(x1, x2, mid) < x) low = mid;
      else high = mid;
    }
    return at(y1, y2, (low + high) / 2);
  };
}

const power3Out = cubicBezier(ease.power3Out);
const smoothInOut = cubicBezier(ease.smoothInOut);

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
const mix = (from: number, to: number, t: number) => from + (to - from) * t;
const mixShape = (from: Shape, to: Shape, t: number): Shape => ({
  x: mix(from.x, to.x, t),
  slot: mix(from.slot, to.slot, t),
  open: mix(from.open, to.open, t),
  high: mix(from.high, to.high, t),
  low: mix(from.low, to.low, t),
  close: mix(from.close, to.close, t),
  volume: mix(from.volume, to.volume, t),
});
/** The candle at the same place along a run of `to` candles as candle `index` of `from`. */
const counterpart = (index: number, from: number, to: number) => (from <= 1 ? 0 : Math.round((index * (to - 1)) / (from - 1)));
/** A candle shut at its open, for it to grow out of. */
const shut = (shape: Shape): Shape => ({ ...shape, high: shape.open, low: shape.open, close: shape.open, volume: 0 });

const tweenEnd = (tween: Tween) => tween.delay + tween.stagger * Math.max(tween.to.length - 1, 0) + tween.duration;

function sample(tween: Tween, elapsed: number): Layer {
  const shapes = tween.to.map((to, i) => {
    const t = clamp((elapsed - tween.delay - i * tween.stagger) / tween.duration, 0, 1);
    return mixShape(tween.from[i], to, tween.ease(t));
  });
  const t = clamp((elapsed - tween.delay) / (tweenEnd(tween) - tween.delay), 0, 1);
  return { shapes, rising: tween.rising, opacity: mix(tween.fade[0], tween.fade[1], power3Out(t)) };
}

/** Price ticks at a round step, about four across the candles' range, and the scale around them with a little room. */
function priceScale(candles: readonly CandlestickChartItem[]) {
  if (candles.length === 0) return { min: 0, max: 1, ticks: [] as number[] };
  const low = Math.min(...candles.map((candle) => candle.low));
  const high = Math.max(...candles.map((candle) => candle.high));
  const room = high > low ? (high - low) * 0.08 : Math.abs(high) * 0.1 || 1;
  const min = low - room;
  const max = high + room;
  const raw = (max - min) / 4;
  const power = 10 ** Math.floor(Math.log10(raw));
  const step = ([1, 2, 2.5, 5, 10].find((nice) => nice * power >= raw) ?? 10) * power;
  const ticks: number[] = [];
  for (let tick = Math.ceil(min / step) * step; tick <= max; tick += step) ticks.push(Math.round(tick * 100) / 100);
  return { min, max, ticks };
}

function useSize<T extends HTMLElement>() {
  const ref = React.useRef<T>(null);
  const [size, setSize] = React.useState<{ width: number; height: number } | null>(null);
  React.useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize((current) => (current && current.width === width && current.height === height ? current : { width, height }));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return [ref, size] as const;
}

/**
 * The candles as six paths per layer (wicks, bodies and volume, rising and falling), rewritten every frame. They grow
 * out of their open price on the entrance, one after another. New data starts each new candle from the old one at the
 * same place along the run while the old candles close in on the new ones and fade; under reduced motion the two sets
 * cross-fade where they stand. A chart that skips its entrance draws its first candles at once.
 */
function useCandleMotion(target: Shape[], rising: boolean[], revealed: boolean, skip: boolean, reduced: boolean) {
  const [layers, setLayers] = React.useState<Layer[]>([]);
  const motion = React.useRef<{ start: number; current: Tween; outgoing: Tween | null } | null>(null);

  React.useEffect(() => {
    if (!revealed) return;
    const previous = motion.current;
    if (!previous || previous.current.to !== target) {
      const now = performance.now();
      const reveal = duration.reveal * 1000;
      const still = (fade: readonly [number, number], length: number): Tween => ({
        from: target,
        to: target,
        rising,
        delay: 0,
        stagger: 0,
        duration: length,
        ease: power3Out,
        fade,
      });
      if (!previous) {
        motion.current = {
          start: now,
          outgoing: null,
          current: skip
            ? still([1, 1], 1)
            : reduced
              ? { ...still([0, 1], duration.slow * 1000), delay: AXES_MS }
              : {
                  from: target.map(shut),
                  to: target,
                  rising,
                  delay: AXES_MS,
                  stagger: Math.min(CANDLE_STAGGER_MS, SPREAD_MS / Math.max(target.length, 1)),
                  duration: reveal,
                  ease: power3Out,
                  fade: [1, 1],
                },
        };
      } else {
        const old = sample(previous.current, now - previous.start);
        const morph = !reduced && old.shapes.length > 0 && target.length > 0;
        motion.current = {
          start: now,
          current: morph
            ? {
                from: target.map((_, i) => old.shapes[counterpart(i, target.length, old.shapes.length)]),
                to: target,
                rising,
                delay: 0,
                stagger: 0,
                duration: reveal,
                ease: smoothInOut,
                fade: [old.opacity, 1],
              }
            : still([0, 1], duration.slow * 1000),
          outgoing: morph
            ? {
                from: old.shapes,
                to: old.shapes.map((_, k) => target[counterpart(k, old.shapes.length, target.length)]),
                rising: old.rising,
                delay: 0,
                stagger: 0,
                duration: reveal,
                ease: smoothInOut,
                fade: [old.opacity, 0],
              }
            : {
                from: old.shapes,
                to: old.shapes,
                rising: old.rising,
                delay: 0,
                stagger: 0,
                duration: duration.fast * 1000,
                ease: power3Out,
                fade: [old.opacity, 0],
              },
        };
      }
    }

    const { start, current, outgoing } = motion.current!;
    const end = Math.max(tweenEnd(current), outgoing ? tweenEnd(outgoing) : 0);
    let frame = requestAnimationFrame(function tick(now) {
      const elapsed = now - start;
      const next = [sample(current, elapsed)];
      if (outgoing && elapsed < tweenEnd(outgoing)) next.unshift(sample(outgoing, elapsed));
      setLayers(next);
      if (elapsed < end) frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [target, rising, revealed, skip, reduced]);

  return layers;
}

const fixed = (value: number) => Math.round(value * 100) / 100;

function roundedRect(x: number, y: number, width: number, height: number, radius: number) {
  const r = fixed(Math.max(0, Math.min(radius, width / 2, height / 2)));
  const w = fixed(width - 2 * r);
  const h = fixed(height - 2 * r);
  return `M${fixed(x + r)} ${fixed(y)}h${w}a${r} ${r} 0 0 1 ${r} ${r}v${h}a${r} ${r} 0 0 1 ${-r} ${r}h${-w}a${r} ${r} 0 0 1 ${-r} ${-r}v${-h}a${r} ${r} 0 0 1 ${r} ${-r}z`;
}

type Frame = { plotWidth: number; priceTop: number; priceBottom: number; plotBottom: number; volumeHeight: number };

function frameOf(size: { width: number; height: number }, axisWidth: number, withVolume: boolean): Frame {
  const plotBottom = size.height - LABEL_ROOM;
  const volumeHeight = withVolume ? plotBottom * VOLUME_SHARE : 0;
  return {
    plotWidth: Math.max(size.width - axisWidth, 1),
    priceTop: PLOT_TOP,
    priceBottom: plotBottom - volumeHeight - (withVolume ? VOLUME_GAP : 0),
    plotBottom,
    volumeHeight,
  };
}

const yOf = (frame: Frame, value: number) => mix(frame.priceBottom, frame.priceTop, value);
const bodyWidth = (frame: Frame, slot: number) => clamp(slot * frame.plotWidth * BODY_SHARE, 1, MAX_BODY);

function candlePaths(frame: Frame, shapes: readonly Shape[]) {
  let wicks = '';
  let bodies = '';
  let volume = '';
  for (const shape of shapes) {
    const x = shape.x * frame.plotWidth;
    const width = bodyWidth(frame, shape.slot);
    const high = yOf(frame, shape.high);
    const low = yOf(frame, shape.low);
    const top = Math.min(yOf(frame, shape.open), yOf(frame, shape.close));
    const height = Math.max(Math.abs(yOf(frame, shape.open) - yOf(frame, shape.close)), 1);
    const bar = shape.volume * frame.volumeHeight;
    if (low - high > 0.5) wicks += `M${fixed(x - 0.5)} ${fixed(high)}h1V${fixed(low)}h-1z`;
    if (shape.high > shape.low) bodies += roundedRect(x - width / 2, top, width, height, 1.5);
    if (bar > 0.25) volume += roundedRect(x - width / 2, frame.plotBottom - bar, width, bar, 1);
  }
  return { wicks, bodies, volume };
}

function CandleGroup({ frame, shapes, rising }: { frame: Frame; shapes: Shape[]; rising: boolean[] }) {
  return (['rising', 'falling'] as const).map((direction) => {
    const { wicks, bodies, volume } = candlePaths(
      frame,
      shapes.filter((_, i) => rising[i] === (direction === 'rising')),
    );
    return (
      <g
        key={direction}
        data-slot="candlestick-chart-candles"
        data-direction={direction}
        className={direction === 'rising' ? 'fill-success forced-colors:fill-[CanvasText]' : 'fill-destructive forced-colors:fill-[GrayText]'}
      >
        <path d={volume} className="opacity-25" />
        <path d={wicks} />
        <path d={bodies} />
      </g>
    );
  });
}

type LabelGroup = { label: string; first: number; last: number; anchor: number };

/** Runs of candles in a row with the same `group` (or `label`), each under one label centered over the run. */
function labelGroups(candles: readonly CandlestickChartItem[]): LabelGroup[] {
  const groups: LabelGroup[] = [];
  candles.forEach((candle, index) => {
    const label = candle.group ?? candle.label;
    const last = groups[groups.length - 1];
    if (last && last.label === label && last.last === index - 1) last.last = index;
    else groups.push({ label, first: index, last: index, anchor: 0 });
  });
  for (const group of groups) group.anchor = (group.first + group.last + 1) / 2;
  return groups;
}

/** Keeps the labels that fit inside the plot without touching, from the left. */
function visibleGroups(groups: readonly LabelGroup[], count: number, plotWidth: number) {
  const width = Math.max(0, ...groups.map((group) => group.label.length)) * CHAR_WIDTH + 4;
  let lastEdge = -Infinity;
  return groups.filter((group) => {
    const x = (group.anchor / count) * plotWidth;
    if (x - width / 2 < 0 || x + width / 2 > plotWidth || x - width / 2 < lastEdge + 8) return false;
    lastEdge = x + width / 2;
    return true;
  });
}

function Triangle({ down }: { down: boolean }) {
  return (
    <svg aria-hidden viewBox="0 0 8 8" className={cn('size-2 shrink-0 fill-current', down && 'rotate-180')}>
      <path d="M4 0.5 7.5 7H0.5z" />
    </svg>
  );
}

const percent = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 });

/**
 * A value over time as candles: a thin wick from the low to the high and a rounded body from the open to the close, in
 * the success color when the value rose and the destructive color when it fell, with faint volume bars along the
 * bottom. Hovering, dragging or the arrow keys inspect a candle: the rest dim, a dashed line marks it and a tooltip
 * beside it reads its open, high, low, close and volume. On entrance the axes fade in, then each candle grows out of its
 * open one after another. New data moves every candle from the old one at the same place.
 */
function CandlestickChart({
  data,
  label,
  format = formatWhole,
  formatVolume = formatCompact,
  volumeLabel = 'Volume',
  entrance,
  className,
  ...props
}: CandlestickChartProps) {
  const figure = React.useRef<HTMLElement>(null);
  const { revealed, instant } = useChartEntrance(figure, entrance);
  const reduced = useReducedMotion();
  const count = data.length;
  const withVolume = data.some((candle) => (candle.volume ?? 0) > 0);
  const [ref, size] = useSize<HTMLDivElement>();
  const [tooltipRef, tooltipSize] = useSize<HTMLDivElement>();
  const [inspected, setInspected] = React.useState<number | null>(null);
  const [held, setHeld] = React.useState<number | null>(null);
  const [slides, setSlides] = React.useState(false);
  const [shownData, setShownData] = React.useState(data);
  const [version, setVersion] = React.useState(0);
  const dragging = React.useRef(false);

  if (data !== shownData) {
    setShownData(data);
    setVersion(version + 1);
    setInspected(null);
    setHeld(null);
    setSlides(false);
  }

  const inspect = (index: number | null) => {
    setSlides(inspected !== null && index !== null);
    setInspected(index);
    if (index !== null) setHeld(index);
  };

  // Keyed by content, so a parent that rebuilds the same candles on every render does not restart the motion.
  const signature = data.map((c) => `${c.open},${c.high},${c.low},${c.close},${c.volume ?? 0}`).join(';');
  const { scale, target, rising, groups } = React.useMemo(() => {
    const scale = priceScale(data);
    const maxVolume = Math.max(0, ...data.map((candle) => candle.volume ?? 0)) || 1;
    const at = (price: number) => (price - scale.min) / (scale.max - scale.min);
    return {
      scale,
      groups: labelGroups(data),
      target: data.map((candle, i) => ({
        x: (i + 0.5) / data.length,
        slot: 1 / data.length,
        open: at(candle.open),
        // A flat candle keeps a sliver of range, so it draws as a line instead of vanishing like a shut one.
        high: at(candle.high) + (candle.high > candle.low ? 0 : FLAT),
        low: at(candle.low) - (candle.high > candle.low ? 0 : FLAT),
        close: at(candle.close),
        volume: Math.max(candle.volume ?? 0, 0) / maxVolume,
      })),
      rising: data.map((candle) => candle.close >= candle.open),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature]);
  const layers = useCandleMotion(target, rising, revealed, instant || entrance === 'none', reduced);

  const axisWidth = Math.max(32, ...scale.ticks.map((tick) => format(tick).length * CHAR_WIDTH + 8));
  const frame = size ? frameOf(size, axisWidth, withVolume) : null;
  const shownIndex = held !== null && held < count ? held : count - 1;
  const shown = data[shownIndex];
  const labels = frame && count > 0 ? visibleGroups(groups, count, frame.plotWidth) : [];
  const litGroup = inspected === null ? null : groups.find((group) => inspected >= group.first && inspected <= group.last);

  const indexAt = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!frame || count === 0) return null;
    const x = event.clientX - event.currentTarget.getBoundingClientRect().left;
    return clamp(Math.floor((x / frame.plotWidth) * count), 0, count - 1);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (count === 0) return;
    if (event.key === 'Escape') {
      inspect(null);
      return;
    }
    const step = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1, PageDown: -10, PageUp: 10 }[event.key];
    const jump = { Home: 0, End: count - 1 }[event.key];
    if (step === undefined && jump === undefined) return;
    event.preventDefault();
    inspect(jump ?? clamp((inspected ?? count) + (step ?? 0), 0, count - 1));
  };

  const tooltip = (() => {
    if (!frame || !shown) return null;
    const shape = target[shownIndex];
    const x = shape.x * frame.plotWidth;
    const half = bodyWidth(frame, shape.slot) / 2;
    const width = tooltipSize?.width ?? 0;
    const height = tooltipSize?.height ?? 0;
    const room = frame.plotWidth + axisWidth;
    const right = x + half + TOOLTIP_GAP;
    const left = right + width <= room ? right : clamp(x - half - TOOLTIP_GAP - width, 0, Math.max(room - width, 0));
    const middle = (yOf(frame, shape.high) + yOf(frame, shape.low)) / 2;
    return { x, left, top: clamp(middle - height / 2, 0, Math.max(frame.plotBottom - height, 0)) };
  })();

  const describe = (candle: CandlestickChartItem) =>
    `${candle.name ?? candle.label}: open ${format(candle.open)}, high ${format(candle.high)}, low ${format(candle.low)}, close ${format(candle.close)}` +
    (withVolume ? `, ${volumeLabel.toLowerCase()} ${formatWhole(candle.volume ?? 0)}` : '');
  const change = shown && shown.open !== 0 ? ((shown.close - shown.open) / Math.abs(shown.open)) * 100 : 0;

  return (
    <figure
      ref={figure}
      data-slot="candlestick-chart"
      data-instant={instant || undefined}
      className={cn('m-0 flex min-w-0 flex-col data-instant:**:transition-none', className)}
      {...props}
    >
      <div ref={ref} data-slot="candlestick-chart-plot" className="relative h-56 w-full">
        {frame ? (
          <>
            <svg aria-hidden width={size!.width} height={size!.height} className="absolute inset-0 overflow-visible">
              {layers.map((layer, l) => {
                const current = l === layers.length - 1;
                const dim = current && inspected !== null && inspected < layer.shapes.length;
                return (
                  <g key={l} opacity={layer.opacity}>
                    <g className={cn('transition-[opacity] duration-fast', dim && 'opacity-45')}>
                      <CandleGroup
                        frame={frame}
                        shapes={dim ? layer.shapes.filter((_, i) => i !== inspected) : layer.shapes}
                        rising={dim ? layer.rising.filter((_, i) => i !== inspected) : layer.rising}
                      />
                    </g>
                    {dim ? <CandleGroup frame={frame} shapes={[layer.shapes[inspected!]]} rising={[layer.rising[inspected!]]} /> : null}
                  </g>
                );
              })}
            </svg>

            <div aria-hidden data-slot="candlestick-chart-axis">
              {scale.ticks.map((tick, i) => (
                <span
                  key={`${version}-${tick}`}
                  style={
                    {
                      '--y': `${yOf(frame, (tick - scale.min) / (scale.max - scale.min))}px`,
                      '--delay': `${100 + i * 40}ms`,
                    } as React.CSSProperties
                  }
                  className={cn(
                    'absolute top-(--y) right-0 -translate-y-1/2 text-caption whitespace-nowrap text-muted-foreground tabular-nums',
                    'transition-[opacity] delay-(--delay) duration-base ease-power3-out starting:opacity-0',
                    !revealed && 'opacity-0',
                  )}
                >
                  {format(tick)}
                </span>
              ))}
            </div>

            <div aria-hidden data-slot="candlestick-chart-labels">
              {labels.map((group, i) => (
                <span
                  key={`${version}-${group.first}`}
                  style={
                    {
                      '--x': `${(group.anchor / count) * frame.plotWidth}px`,
                      '--y': `${frame.plotBottom + 4}px`,
                      '--delay': `${150 + i * 25}ms`,
                    } as React.CSSProperties
                  }
                  className={cn(
                    'absolute top-(--y) left-(--x) -translate-x-1/2 text-caption whitespace-nowrap',
                    'transition-[opacity,translate] delay-(--delay) duration-base ease-power3-out',
                    'starting:opacity-0 motion-safe:starting:translate-y-1',
                    !revealed && 'opacity-0 motion-safe:translate-y-1',
                  )}
                >
                  <span className={cn('text-muted-foreground transition-[color]', litGroup === group && 'text-foreground')}>
                    {group.label}
                  </span>
                </span>
              ))}
            </div>

            {tooltip ? (
              <div
                aria-hidden
                data-slot="candlestick-chart-cursor"
                style={{ '--x': `${tooltip.x}px`, '--h': `${frame.plotBottom}px` } as React.CSSProperties}
                className={cn(
                  'pointer-events-none absolute top-0 left-(--x) h-(--h) w-0 border-l border-dashed border-foreground/40',
                  'transition-[opacity] duration-fast ease-power3-out',
                  slides && 'motion-safe:transition-[opacity,left] motion-safe:duration-base',
                  inspected === null ? 'opacity-0' : 'opacity-100 duration-base',
                )}
              />
            ) : null}
          </>
        ) : null}

        <div
          role={count > 0 ? 'slider' : 'group'}
          tabIndex={count > 0 ? 0 : undefined}
          aria-label={count > 0 ? `${label}. Use the arrow keys to read each candle.` : label}
          aria-orientation={count > 0 ? 'horizontal' : undefined}
          aria-valuemin={count > 0 ? 0 : undefined}
          aria-valuemax={count > 0 ? count - 1 : undefined}
          aria-valuenow={count > 0 ? shownIndex : undefined}
          aria-valuetext={shown ? describe(shown) : undefined}
          onKeyDown={onKeyDown}
          onBlur={() => inspect(null)}
          onPointerDown={(event) => {
            if (count === 0) return;
            dragging.current = true;
            event.currentTarget.setPointerCapture(event.pointerId);
            inspect(indexAt(event));
          }}
          onPointerMove={(event) => {
            if (count > 0 && (event.pointerType === 'mouse' || dragging.current)) inspect(indexAt(event));
          }}
          onPointerUp={() => {
            dragging.current = false;
          }}
          onPointerLeave={() => {
            dragging.current = false;
            inspect(null);
          }}
          onPointerCancel={() => {
            dragging.current = false;
            inspect(null);
          }}
          data-slot="candlestick-chart-input"
          style={{ '--h': `${frame?.plotBottom ?? 0}px` } as React.CSSProperties}
          className="absolute inset-x-0 top-0 h-(--h) touch-pan-y rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        />

        {shown ? (
          <div
            ref={tooltipRef}
            aria-hidden
            data-slot="candlestick-chart-tooltip"
            style={{ '--x': `${tooltip?.left ?? 0}px`, '--y': `${tooltip?.top ?? 0}px` } as React.CSSProperties}
            className={cn(
              'pointer-events-none absolute top-(--y) left-(--x) grid w-max max-w-full min-w-[min(calc(var(--spacing)*44),100%)] gap-1.5 rounded-xl border border-transparent bg-popover px-2.5 py-2 text-caption text-popover-foreground tabular-nums shadow-popover',
              'transition-[opacity] duration-fast ease-power3-out',
              slides && 'motion-safe:transition-[opacity,left,top] motion-safe:duration-base',
              inspected === null ? 'opacity-0' : 'opacity-100 duration-base',
            )}
          >
            <div className="font-medium wrap-break-word">{shown.name ?? shown.label}</div>
            <div className={cn('flex items-center gap-1 font-medium', change >= 0 ? 'text-tint-green-foreground' : 'text-tint-red-foreground')}>
              <Triangle down={change < 0} />
              {change >= 0 ? '+' : '−'}
              {percent.format(Math.abs(change))}%
            </div>
            <dl className="grid grid-cols-2 gap-x-3 gap-y-1">
              {(
                [
                  ['Open', shown.open],
                  ['High', shown.high],
                  ['Low', shown.low],
                  ['Close', shown.close],
                ] as const
              ).map(([name, value]) => (
                <div key={name} className="flex items-baseline justify-between gap-2">
                  <dt className="text-muted-foreground">{name}</dt>
                  <dd className="font-medium">{format(value)}</dd>
                </div>
              ))}
            </dl>
            {withVolume ? (
              <div className="flex items-baseline justify-between gap-2 border-t border-border pt-1.5">
                <span className="text-muted-foreground">{volumeLabel}</span>
                <span className="font-medium">{formatVolume(shown.volume ?? 0)}</span>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      {/* A table keeps its content width at 1px, so the visually hidden box is a wrapper. */}
      <div className="sr-only">
        <table>
          <caption>{label}</caption>
          <thead>
            <tr>
              <th scope="col">Time</th>
              <th scope="col">Open</th>
              <th scope="col">High</th>
              <th scope="col">Low</th>
              <th scope="col">Close</th>
              {withVolume ? <th scope="col">{volumeLabel}</th> : null}
            </tr>
          </thead>
          <tbody>
            {data.map((candle, index) => (
              <tr key={index}>
                <th scope="row">{candle.name ?? candle.label}</th>
                <td>{format(candle.open)}</td>
                <td>{format(candle.high)}</td>
                <td>{format(candle.low)}</td>
                <td>{format(candle.close)}</td>
                {withVolume ? <td>{formatWhole(candle.volume ?? 0)}</td> : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}

export { CandlestickChart, type CandlestickChartItem, type CandlestickChartProps };
