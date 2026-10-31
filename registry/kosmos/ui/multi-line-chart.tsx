'use client';

import * as React from 'react';
import { type ChartEntrance, useChartEntrance, useCountUp, useReducedMotion } from '@/registry/kosmos/hooks/use-chart-motion';
import { cn } from '@/registry/kosmos/lib/cn';
import { duration, ease } from '@/registry/kosmos/lib/motion';
import { Button } from '@/registry/kosmos/ui/button';

type MultiLineChartSeries = {
  /** Keys the series in `hiddenSeries` and `emphasized`. */
  id: string;
  /** Names the series in the legend and the hidden table. */
  name: string;
  /** A shorter name for the tooltip ("Copperline"). Defaults to `name`. */
  short?: string;
  /** One value per point, oldest first. A missing or negative value counts as zero. */
  values: readonly number[];
};

type MultiLineChartPoint = {
  /** Heads the tooltip and is what screen readers hear for this point ("Sun, Oct 11"). */
  label: string;
  /** A label on the x axis under this point, such as "Oct" on the first of a month. */
  tick?: string;
};

type MultiLineChartProps = Omit<React.ComponentProps<'figure'>, 'children'> & {
  /** Up to five series, each in the next chart color. The first draws on top. */
  series: readonly MultiLineChartSeries[];
  /** The points every series runs across, oldest first. */
  points: readonly MultiLineChartPoint[];
  /** Names the chart for screen readers and captions its hidden table, such as "Events per day by project, last 12 months". */
  label: string;
  /** Writes the values in the tooltip, the screen reader's reading and the hidden table. */
  format?: (value: number) => string;
  /** The ids of the series to leave out. The scale fits the rest. */
  hiddenSeries?: readonly string[];
  /** The id of a series to bring forward while the others fade, such as the one whose legend item is hovered. */
  emphasized?: string | null;
  /** When the lines draw in. See `ChartEntrance`. */
  entrance?: ChartEntrance;
};

/** The space between the tooltip and the cursor. */
const TOOLTIP_GAP = 12;
/** Tick labels closer than this drop some, so they never crowd. */
const LABEL_SPACE = 44;
/** The lines draw one after another once the axis labels are on their way. */
const LINE_AT_MS = 200;
const LINE_STEP_MS = 140;
const DRAW_MS = 1400;
const MOVE_MS = duration.slow * 1000;
const RESCALE_MS = duration.reveal * 1000;

const whole = new Intl.NumberFormat('en-US');
const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 2 });
const formatWhole = (value: number) => whole.format(value);

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
const round = (value: number) => Math.round(value * 10) / 10;
const seriesColor = (index: number) => `var(--chart-${Math.min(index, 4) + 1})`;
const clean = (value: number | undefined) => (value !== undefined && Number.isFinite(value) ? Math.max(value, 0) : 0);

/** A CSS `cubic-bezier()` as a function of time, for a value drawn frame by frame. */
function cubicBezier([x1, y1, x2, y2]: readonly [number, number, number, number]) {
  const at = (a: number, b: number, t: number) => 3 * a * t * (1 - t) ** 2 + 3 * b * t ** 2 * (1 - t) + t ** 3;
  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let low = 0;
    let high = 1;
    for (let step = 0; step < 24; step++) {
      const t = (low + high) / 2;
      if (at(x1, x2, t) < x) low = t;
      else high = t;
    }
    return at(y1, y2, (low + high) / 2);
  };
}

const smoothInOut = cubicBezier(ease.smoothInOut);

/**
 * A number that moves to each new `target` from the one it shows, over `ms` on `easing`. A change mid-move carries on
 * from where it is. `instant` follows the target at once, for a pointer being dragged or reduced motion.
 */
function useTween(target: number, ms: number, easing: (t: number) => number, instant = false) {
  const [value, setValue] = React.useState(target);
  const current = React.useRef(target);

  React.useEffect(() => {
    const from = current.current;
    if (instant || from === target) {
      current.current = target;
      setValue(target);
      return;
    }
    const start = performance.now();
    let frame = requestAnimationFrame(function tick(now) {
      const t = Math.min((now - start) / ms, 1);
      current.current = from + (target - from) * easing(t);
      setValue(current.current);
      if (t < 1) frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [target, ms, easing, instant]);

  return value;
}

/** True `ms` after `ready` first turns true, so a part of the entrance starts once the marks before it are in. */
function useAfter(ready: boolean, ms: number) {
  const [after, setAfter] = React.useState(false);
  React.useEffect(() => {
    if (!ready || after) return;
    const timer = setTimeout(() => setAfter(true), ms);
    return () => clearTimeout(timer);
  }, [ready, after, ms]);
  return after;
}

/** The element's content size, measured as it changes. Zero until the first measure in the browser. */
function useSize(element: Element | null) {
  const [size, setSize] = React.useState({ width: 0, height: 0 });
  React.useEffect(() => {
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setSize({ width: entry.contentRect.width, height: entry.contentRect.height }));
    observer.observe(element);
    return () => observer.disconnect();
  }, [element]);
  return size;
}

/** A round top for the axis and three to five ticks from zero up to it. */
function niceScale(max: number) {
  if (!(max > 0)) return { top: 1, ticks: [0] };
  const rough = max / 4;
  const power = 10 ** Math.floor(Math.log10(rough));
  const step = [1, 2, 2.5, 5, 10].map((factor) => factor * power).find((candidate) => candidate >= rough) ?? rough;
  const top = Math.ceil((max * 1.04) / step) * step;
  return { top, ticks: Array.from({ length: Math.round(top / step) + 1 }, (_, i) => i * step) };
}

type Line = { d: string; ys: number[]; slopes: number[] };

/**
 * A monotone cubic through the points, so the curve never swings past a point's value. Keeps each point's height and
 * slope, so a marker can read the same curve between two points. A single point is a dot in the middle.
 */
function trace(values: readonly number[], width: number, height: number, scale: number): Line {
  const last = values.length - 1;
  const ys = values.map((value) => height * (1 - value * scale));
  if (last === 0) return { d: `M${round(width / 2)},${round(ys[0])}h0`, ys, slopes: [0] };
  const dx = width / last;
  const secants = ys.slice(1).map((y, i) => (y - ys[i]) / dx);
  const slopes = ys.map((_, i) => {
    if (i === 0) return secants[0];
    if (i === last) return secants[last - 1];
    const [before, after] = [secants[i - 1], secants[i]];
    if (before * after <= 0) return 0;
    return 2 * Math.sign(before) * Math.min(Math.abs(before), Math.abs(after), Math.abs(before + after) / 4);
  });
  let d = `M0,${round(ys[0])}`;
  for (let i = 0; i < last; i++) {
    const x = i * dx;
    d += `C${round(x + dx / 3)},${round(ys[i] + (slopes[i] * dx) / 3)} ${round(x + (2 * dx) / 3)},${round(ys[i + 1] - (slopes[i + 1] * dx) / 3)} ${round(x + dx)},${round(ys[i + 1])}`;
  }
  return { d, ys, slopes };
}

/** The height of the curve at a place between two points, on the same cubic the path draws. */
function heightAt({ ys, slopes }: Line, at: number, dx: number) {
  const last = ys.length - 1;
  if (last === 0) return ys[0];
  const i = clamp(Math.floor(at), 0, last - 1);
  const t = clamp(at - i, 0, 1);
  return (
    (2 * t ** 3 - 3 * t ** 2 + 1) * ys[i] +
    (t ** 3 - 2 * t ** 2 + t) * dx * slopes[i] +
    (3 * t ** 2 - 2 * t ** 3) * ys[i + 1] +
    (t ** 3 - t ** 2) * dx * slopes[i + 1]
  );
}

/** One row of the tooltip; its value counts from the one shown to the next point's. */
function TooltipRow({
  name,
  color,
  on,
  value,
  format,
  ready,
  instant,
}: {
  name: string;
  color: string;
  on: boolean;
  value: number;
  format: (value: number) => string;
  ready: boolean;
  instant: boolean;
}) {
  const shown = useCountUp(value, { ready, instant });
  return (
    <li className="flex items-center gap-2">
      <span
        aria-hidden
        style={{ '--series': color } as React.CSSProperties}
        className={cn(
          'size-2 shrink-0 rounded-full transition-[background-color] forced-colors:bg-[CanvasText]',
          on ? 'bg-(--series)' : 'bg-transparent ring-1 ring-(--series) ring-inset',
        )}
      />
      <span className="min-w-0 flex-1 truncate text-muted-foreground">{name}</span>
      <span className={cn('shrink-0 font-medium transition-[color]', !on && 'font-normal text-muted-foreground')}>{format(shown)}</span>
    </li>
  );
}

/**
 * One line per series across the points, with a dashed cursor on the selected point, a marker where it crosses each
 * line and a tooltip beside it. Hovering or dragging scrubs the point and letting go selects it; the arrow keys move a
 * point, Page Up and Page Down a twelfth of the range. The cursor, the markers and the tooltip ride to a new point, the
 * markers along the curve of their line. Hiding a series fades its line out while the others morph to the new scale.
 * On the entrance the axis labels fade in, the lines draw across one after another, then the cursor grows down and the
 * tooltip rises in. Under reduced motion every change cross-fades.
 */
function MultiLineChart({
  series,
  points,
  label,
  format = formatWhole,
  hiddenSeries: hidden = [],
  emphasized = null,
  entrance,
  className,
  ...props
}: MultiLineChartProps) {
  const figure = React.useRef<HTMLElement>(null);
  const [plot, setPlot] = React.useState<HTMLDivElement | null>(null);
  const [axis, setAxis] = React.useState<HTMLDivElement | null>(null);
  const [tooltip, setTooltip] = React.useState<HTMLDivElement | null>(null);
  const { revealed, instant } = useChartEntrance(figure, entrance);
  const reduced = useReducedMotion();
  const { width, height } = useSize(plot);
  const gutter = useSize(axis).width;
  const tooltipWidth = useSize(tooltip).width;

  const count = points.length;
  const last = Math.max(count - 1, 0);
  const empty = count === 0 || series.length === 0;
  const page = Math.max(1, Math.round(count / 12));

  // A chart that skips its entrance lands with its transitions off for the frames it takes to measure and draw.
  const [skipped, setSkipped] = React.useState(entrance === 'none');
  if (instant && !skipped) setSkipped(true);
  const ready = revealed && width > 0;
  const [settled, setSettled] = React.useState(false);
  React.useEffect(() => {
    if (!skipped || !ready || settled) return;
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setSettled(true));
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [skipped, ready, settled]);
  const still = skipped && !settled;

  const cursorAtMs = LINE_AT_MS + Math.max(series.length - 1, 0) * LINE_STEP_MS + DRAW_MS;
  const tooltipAtMs = cursorAtMs + duration.slow * 1000;
  const introDone = useAfter(ready, tooltipAtMs + duration.base * 1000) || skipped;
  const tooltipReady = useAfter(ready, tooltipAtMs) || skipped;

  const [selected, setSelected] = React.useState(last);
  const [hovered, setHovered] = React.useState<number | null>(null);
  const [dragging, setDragging] = React.useState(false);
  const [shownCount, setShownCount] = React.useState(count);
  if (count !== shownCount) {
    setShownCount(count);
    setSelected(last);
    setHovered(null);
  }
  const point = clamp(hovered ?? selected, 0, last);

  const values = React.useMemo(() => series.map((each) => points.map((_, i) => clean(each.values[i]))), [series, points]);
  const isShown = (id: string) => !hidden.includes(id);
  const { top, ticks } = React.useMemo(
    () => niceScale(Math.max(0, ...series.flatMap((each, i) => (hidden.includes(each.id) ? [] : values[i])))),
    [series, values, hidden],
  );
  const scale = useTween(1 / top, RESCALE_MS, smoothInOut, reduced || still);
  const lines = React.useMemo(
    () => (width > 0 && count > 0 ? values.map((each) => trace(each, width, height, scale)) : []),
    [values, width, height, scale, count],
  );
  const lit = emphasized && series.some((each) => each.id === emphasized) && isShown(emphasized) ? emphasized : null;

  const dx = last > 0 ? width / last : 0;
  const xAt = (at: number) => (last > 0 ? at * dx : width / 2);
  const position = useTween(point, MOVE_MS, smoothInOut, reduced || still || hovered !== null);
  const x = xAt(position);
  const fits = xAt(point) + TOOLTIP_GAP + tooltipWidth <= width;
  const side = useTween(fits ? 0 : 1, MOVE_MS, smoothInOut, reduced || still);
  const right = Math.min(x + TOOLTIP_GAP, width - tooltipWidth);
  const left = Math.max(x - TOOLTIP_GAP - tooltipWidth, -gutter);
  const tooltipLeft = right + (left - right) * side;

  const marked = points.flatMap((each, index) => (each.tick ? [{ index, label: each.tick }] : []));
  const axisTicks = marked.length > 0 ? marked : count > 0 ? [...new Set([0, last])].map((index) => ({ index, label: points[index].label })) : [];
  const longest = Math.max(0, ...axisTicks.map((tick) => tick.label.length));
  const space = Math.max(LABEL_SPACE, longest * 7 + 8);
  const tickGap = axisTicks.length > 1 ? ((axisTicks[axisTicks.length - 1].index - axisTicks[0].index) * dx) / (axisTicks.length - 1) : width;
  const every = Math.max(1, Math.ceil(space / Math.max(tickGap, 1)));
  const shownTicks = axisTicks.filter((_, i) => (axisTicks.length - 1 - i) % every === 0);
  const tableRows = marked.length > 0 ? marked.map((tick) => tick.index) : points.map((_, index) => index);

  /** A delay for the entrance only, so a later change moves at once, plus a stagger that stays. */
  const at = (introMs: number, stagger = 0) => `${introDone ? stagger : introMs + stagger}ms`;

  const pointAt = (clientX: number) => {
    const rect = plot?.getBoundingClientRect();
    if (!rect || rect.width === 0) return selected;
    return clamp(Math.round(((clientX - rect.left) / rect.width) * last), 0, last);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    const step = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1, PageDown: -page, PageUp: page }[event.key];
    const jump = { Home: 0, End: last }[event.key];
    if (step === undefined && jump === undefined) return;
    event.preventDefault();
    setHovered(null);
    setSelected(jump ?? clamp(point + (step ?? 0), 0, last));
  };

  const reading = empty
    ? ''
    : `${points[point].label}: ${series
        .filter((each) => isShown(each.id))
        .map((each) => `${each.name} ${format(values[series.indexOf(each)][point])}`)
        .join(', ')}`;

  return (
    <figure
      ref={figure}
      data-slot="multi-line-chart"
      data-instant={still || undefined}
      className={cn('m-0 flex min-w-0 flex-col data-instant:**:transition-none', className)}
      {...props}
    >
      <div className="flex">
        <div ref={setAxis} aria-hidden data-slot="multi-line-chart-axis" className="relative h-44 w-10 shrink-0">
          {ticks.map((tick, i) => (
            <span
              key={`${top}-${tick}`}
              style={{ '--y': `${(1 - tick / top) * 100}%`, '--delay': at(0, i * 40) } as React.CSSProperties}
              className={cn(
                'absolute end-2 top-(--y) -translate-y-1/2 text-caption whitespace-nowrap text-muted-foreground tabular-nums',
                'transition-[opacity] delay-(--delay) duration-base ease-power3-out starting:opacity-0',
                !ready && 'opacity-0',
              )}
            >
              {compact.format(tick)}
            </span>
          ))}
        </div>

        <div
          ref={setPlot}
          data-slot="multi-line-chart-plot"
          {...(empty
            ? {}
            : {
                role: 'slider',
                tabIndex: 0,
                'aria-label': label,
                'aria-valuemin': 0,
                'aria-valuemax': last,
                'aria-valuenow': point,
                'aria-valuetext': reading,
              })}
          onKeyDown={empty ? undefined : onKeyDown}
          onPointerDown={(event) => {
            if (empty || event.button !== 0) return;
            event.currentTarget.setPointerCapture(event.pointerId);
            setDragging(true);
            setHovered(pointAt(event.clientX));
          }}
          onPointerMove={(event) => {
            if (!empty && (event.pointerType === 'mouse' || dragging)) setHovered(pointAt(event.clientX));
          }}
          onPointerUp={(event) => {
            if (!dragging) return;
            setDragging(false);
            setSelected(pointAt(event.clientX));
            if (event.pointerType !== 'mouse') setHovered(null);
          }}
          onPointerLeave={() => {
            if (!dragging) setHovered(null);
          }}
          onPointerCancel={() => {
            setDragging(false);
            setHovered(null);
          }}
          className="relative h-44 min-w-0 flex-1 touch-pan-y rounded-sm select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          {/* The first series draws on top, so its line is laid last. */}
          {series
            .map((each, index) => ({ each, index }))
            .reverse()
            .map(({ each, index }) => {
              const line = lines[index];
              const on = isShown(each.id);
              return (
                <div
                  // Under reduced motion a new scale cross-fades the lines in instead of morphing them.
                  key={reduced ? `${each.id}-${top}` : each.id}
                  data-slot="multi-line-chart-line"
                  style={
                    {
                      '--series': seriesColor(index),
                      '--draw': `${DRAW_MS}ms`,
                      '--delay': at(LINE_AT_MS + index * LINE_STEP_MS),
                    } as React.CSSProperties
                  }
                  className={cn(
                    'pointer-events-none absolute inset-0 [clip-path:inset(-4px)]',
                    'transition-[opacity] delay-(--delay) duration-reveal ease-power3-out motion-reduce:starting:opacity-0',
                    'motion-safe:transition-[clip-path] motion-safe:duration-(--draw) motion-safe:ease-smooth-in-out',
                    !ready && 'motion-safe:[clip-path:inset(-4px_calc(100%+4px)_-4px_-4px)] motion-reduce:opacity-0',
                    lit === each.id && 'z-10',
                  )}
                >
                  {line ? (
                    <svg
                      aria-hidden
                      viewBox={`0 0 ${width} ${height}`}
                      className={cn(
                        'absolute inset-0 size-full overflow-visible transition-[opacity] duration-base ease-power3-out',
                        !on && 'opacity-0',
                        on && lit !== null && lit !== each.id && 'opacity-25',
                      )}
                    >
                      <path
                        d={line.d}
                        fill="none"
                        stroke="var(--series)"
                        strokeWidth={1.5}
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        className="forced-colors:stroke-[CanvasText]"
                      />
                    </svg>
                  ) : null}
                </div>
              );
            })}

          {empty ? null : (
            <div
              // Under reduced motion a new point cross-fades the cursor in instead of riding to it.
              key={reduced && hovered === null ? `point-${selected}` : 'cursor'}
              aria-hidden
              style={{ '--x': `${x}px` } as React.CSSProperties}
              className="pointer-events-none absolute inset-0 z-20 transition-[opacity] duration-base ease-power3-out motion-reduce:starting:opacity-0"
            >
              <span
                data-slot="multi-line-chart-cursor"
                style={{ '--delay': at(cursorAtMs) } as React.CSSProperties}
                className={cn(
                  'absolute inset-y-0 left-(--x) origin-top border-l border-dashed border-foreground/30',
                  'transition-[opacity] delay-(--delay) duration-slow ease-smooth-in-out motion-safe:transition-[scale]',
                  !ready && 'motion-safe:scale-y-0 motion-reduce:opacity-0',
                )}
              />
              {lines.length
                ? series.map((each, index) => (
                    <span
                      key={each.id}
                      data-slot="multi-line-chart-marker"
                      style={
                        {
                          '--series': seriesColor(index),
                          '--y': `${heightAt(lines[index], position, dx)}px`,
                          '--delay': at(cursorAtMs + duration.base * 1000),
                        } as React.CSSProperties
                      }
                      className={cn(
                        'absolute top-(--y) left-(--x) size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-card bg-(--series)',
                        'transition-[opacity] delay-(--delay) duration-base ease-power3-out forced-colors:bg-[CanvasText]',
                        (!ready || !isShown(each.id)) && 'opacity-0',
                        isShown(each.id) && lit !== null && lit !== each.id && 'opacity-25',
                      )}
                    />
                  ))
                : null}
              <div
                ref={setTooltip}
                data-slot="multi-line-chart-tooltip"
                style={{ '--left': `${tooltipLeft}px` } as React.CSSProperties}
                className={cn(
                  'absolute top-0 left-(--left) grid w-40 grid-cols-[minmax(0,1fr)] gap-1.5 rounded-xl border border-transparent bg-popover px-2.5 py-1.5',
                  'text-caption text-popover-foreground tabular-nums shadow-popover',
                  // Rises in on the same timer that starts its count, so it never shows before its numbers.
                  'transition-[opacity] duration-base ease-power3-out motion-safe:transition-[opacity,translate]',
                  !tooltipReady && 'opacity-0 motion-safe:translate-y-1',
                )}
              >
                <div className="truncate font-medium">{points[point].label}</div>
                <ul className="flex flex-col gap-1">
                  {series.map((each, index) => (
                    <TooltipRow
                      key={each.id}
                      name={each.short ?? each.name}
                      color={seriesColor(index)}
                      on={isShown(each.id)}
                      value={values[index][point]}
                      format={format}
                      ready={tooltipReady}
                      instant={still}
                    />
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      <div aria-hidden data-slot="multi-line-chart-ticks" className="relative ms-10 mt-2 h-4">
        {width > 0
          ? shownTicks.map((tick, i) => (
              <span
                key={tick.index}
                style={{ '--x': `${xAt(tick.index)}px`, '--w': `${width}px`, '--delay': at(100, i * 30) } as React.CSSProperties}
                className={cn(
                  // Centered under its point, but never past either edge of the plot.
                  'absolute top-0 left-0 max-w-full truncate text-caption whitespace-nowrap text-muted-foreground',
                  '[translate:clamp(0px,calc(var(--x)_-_50%),calc(var(--w)_-_100%))]',
                  'transition-[opacity] delay-(--delay) duration-base ease-power3-out starting:opacity-0',
                  !ready && 'opacity-0',
                )}
              >
                {tick.label}
              </span>
            ))
          : null}
      </div>

      {/* A table keeps its content width at 1px, so the visually hidden box is a wrapper. */}
      <div className="sr-only">
        <table>
          <caption>{label}</caption>
          <thead>
            <tr>
              <th scope="col">Point</th>
              {series.map((each) => (
                <th key={each.id} scope="col">
                  {each.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableRows.map((index) => (
              <tr key={index}>
                <th scope="row">{points[index].label}</th>
                {series.map((each, i) => (
                  <td key={each.id}>{format(values[i][index])}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}

type MultiLineChartLegendProps = Omit<React.ComponentProps<'ul'>, 'children'> & {
  /** The same series as the chart, in the same order, so each takes the same color. */
  series: readonly Pick<MultiLineChartSeries, 'id' | 'name'>[];
  /** The ids of the series left out of the chart. */
  hiddenSeries?: readonly string[];
  /** Called with the new hidden ids when an item is pressed. The last series shown stays shown. */
  onHiddenSeriesChange?: (hiddenSeries: string[]) => void;
  /** Called with the id of the item under the pointer or focus, and `null` as it leaves. */
  onEmphasizedChange?: (id: string | null) => void;
  /** When the items rise in. See `ChartEntrance`. */
  entrance?: ChartEntrance;
};

/** A row of toggles, one per series, each with its color dot: filled while the series shows, hollow while it is hidden. */
function MultiLineChartLegend({
  series,
  hiddenSeries: hidden = [],
  onHiddenSeriesChange,
  onEmphasizedChange,
  entrance,
  className,
  ...props
}: MultiLineChartLegendProps) {
  const list = React.useRef<HTMLUListElement>(null);
  const { revealed, instant } = useChartEntrance(list, entrance);

  const toggle = (id: string) => {
    if (hidden.includes(id)) return onHiddenSeriesChange?.(hidden.filter((each) => each !== id));
    const shownCount = series.filter((each) => !hidden.includes(each.id)).length;
    if (shownCount > 1) onHiddenSeriesChange?.([...hidden, id]);
  };

  return (
    <ul
      ref={list}
      data-slot="multi-line-chart-legend"
      data-instant={instant || undefined}
      className={cn('flex flex-wrap items-center gap-0.5 data-instant:**:transition-none', className)}
      {...props}
    >
      {series.map((each, index) => {
        const on = !hidden.includes(each.id);
        return (
          <li
            key={each.id}
            data-slot="multi-line-chart-legend-item"
            style={{ '--series': seriesColor(index), '--delay': `${index * 60}ms` } as React.CSSProperties}
            className={cn(
              'min-w-0 transition-[opacity] delay-(--delay) duration-reveal ease-power3-out motion-safe:transition-[opacity,translate]',
              !revealed && 'opacity-0 motion-safe:translate-y-1.5',
            )}
          >
            <Button
              variant="item"
              size="sm"
              aria-pressed={on}
              onClick={() => toggle(each.id)}
              onPointerEnter={() => onEmphasizedChange?.(each.id)}
              onPointerLeave={() => onEmphasizedChange?.(null)}
              onFocus={() => onEmphasizedChange?.(each.id)}
              onBlur={() => onEmphasizedChange?.(null)}
              className={cn('max-w-full gap-1.5 transition-[background-color,color]', !on && 'text-muted-foreground')}
            >
              <span
                aria-hidden
                className={cn(
                  'size-2 shrink-0 rounded-full transition-[background-color] forced-colors:bg-[CanvasText]',
                  on ? 'bg-(--series)' : 'bg-transparent ring-1 ring-(--series) ring-inset',
                )}
              />
              <span className="truncate">{each.name}</span>
            </Button>
          </li>
        );
      })}
    </ul>
  );
}

export {
  MultiLineChart,
  MultiLineChartLegend,
  type MultiLineChartLegendProps,
  type MultiLineChartPoint,
  type MultiLineChartProps,
  type MultiLineChartSeries,
};
