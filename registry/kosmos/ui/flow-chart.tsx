'use client';

import { ArrowRight } from 'lucide-react';
import * as React from 'react';
import { type ChartEntrance, useChartEntrance, useCountUp, useReducedMotion } from '@/registry/kosmos/hooks/use-chart-motion';
import { cn } from '@/registry/kosmos/lib/cn';
import { duration, ease } from '@/registry/kosmos/lib/motion';
import { Button } from '@/registry/kosmos/ui/button';

type FlowChartNode = {
  /** Matches `source` or `target` in a flow. */
  id: string;
  label: string;
  /** Any CSS color. Defaults to `--chart-1` to `--chart-5`, in order down the column. */
  color?: string;
};

type FlowChartFlow = {
  /** The `id` of a source. */
  source: string;
  /** The `id` of a target. */
  target: string;
  value: number;
};

type FlowChartProps = Omit<React.ComponentProps<'figure'>, 'children'> & {
  /** The left column, top to bottom. */
  sources: readonly FlowChartNode[];
  /** The right column, top to bottom. */
  targets: readonly FlowChartNode[];
  /** How much goes from each source to each target. A pair missing here has no band. */
  flows: readonly FlowChartFlow[];
  /** Names the chart for screen readers and captions its hidden table, such as "Signups by source and plan, last 30 days". */
  label: string;
  /** What the values count, in the plural ("signups"). It names the total and reads in the tooltip. */
  unit?: string;
  /** The heading over the sources in the legend and the hidden table. */
  sourceLabel?: string;
  /** The heading over the targets in the legend and the hidden table. */
  targetLabel?: string;
  /** A second figure beside the total: what flows into one target, such as `{ target: 'pro', label: 'Chose Pro' }`. */
  targetTotal?: { target: string; label: string };
  /** The flow selected at first, with its tooltip open. Defaults to the first flow; `null` selects none. */
  defaultSelected?: { source: string; target: string } | null;
  /** Writes the totals, the band amounts and the tooltip amount. */
  format?: (value: number) => string;
  /** When the chart flows in. See `ChartEntrance`. */
  entrance?: ChartEntrance;
};

type Side = 'source' | 'target';
type Node = { key: string; label: string; side: Side; color: string };
type Link = { key: string; source: string; target: string; value: number };
type Bar = { x: number; y: number; height: number; amount: number; share: number };
type Band = Link & {
  amount: number;
  /** The band's top edge where it leaves the left bar and where it lands on the right one. */
  left: number;
  right: number;
  thickness: number;
  ofSource: number;
  ofTarget: number;
  d: string;
};

const BAR_WIDTH = 24;
/** Room outside each bar, so its share pill, a little wider than the bar, stays inside the plot. */
const EDGE = 8;
const GAP = 4;
/** How far the soft edge of the entrance fades, from bands in full to none. */
const FEATHER = 48;
/** A bar shows its share pill from this height, and a band its labels from this thickness. */
const MIN_PILL = 22;
const MIN_LABEL = 16;
const TOOLTIP_OFFSET = 8;
const LEFT_BARS_AT_MS = 250;
const BAR_STAGGER_MS = 70;
const LABEL_STAGGER_MS = 30;
const LEGEND_AT_MS = 240;
const LEGEND_STAGGER_MS = 40;
/** The bands start flowing in once the left bars are mostly up, and take this long to cross, slow enough to read as flowing. */
const FLOW_AT_MS = 450;
const SWEEP_MS = duration.reveal * 1000 * 2.6;
const SETTLE_MS = FLOW_AT_MS + SWEEP_MS;

const sides: Side[] = ['source', 'target'];
const whole = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 2 });
const formatAmount = (value: number) => (Math.abs(value) < 1_000_000 ? whole : compact).format(value);
const formatShare = (share: number) => `${Math.round(share * 100)}%`;
const round = (n: number) => Math.round(n * 100) / 100;
const hue = (index: number) => `var(--chart-${(index % 5) + 1})`;
/** A band's shape as CSS too, so browsers that support it move the band to its new place. */
const bandPath = '[d:var(--d)] motion-safe:transition-[d] motion-safe:duration-reveal motion-safe:ease-power3-out';
const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);
const linkKey = (source: string, target: string) => `${source}>${target}`;

const cubic = (u: number, a: number, b: number) => 3 * (1 - u) ** 2 * u * a + 3 * (1 - u) * u ** 2 * b + u ** 3;

/** The time into the sweep at which `ease-smooth-in-out` has covered `progress` of the way, so marks wait for the edge. */
function sweepTime(progress: number) {
  const [x1, y1, x2, y2] = ease.smoothInOut;
  const target = Math.min(Math.max(progress, 0), 1);
  let low = 0;
  let high = 1;
  for (let i = 0; i < 24; i++) {
    const middle = (low + high) / 2;
    if (cubic(middle, y1, y2) < target) low = middle;
    else high = middle;
  }
  return cubic((low + high) / 2, x1, x2) * SWEEP_MS;
}

function useSize<T extends Element>() {
  const [size, setSize] = React.useState<{ width: number; height: number } | null>(null);
  const ref = React.useCallback((element: T | null) => {
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

/** False until `on`, then true `ms` later, and true from then on. */
function useDelayed(on: boolean, ms: number) {
  const [done, setDone] = React.useState(false);
  React.useEffect(() => {
    if (!on || done) return;
    const timer = setTimeout(() => setDone(true), ms);
    return () => clearTimeout(timer);
  }, [on, ms, done]);
  return done;
}

/** Keys every node by its column, so a source and a target may share an id, and merges flows into one link per pair. */
function normalize(sources: readonly FlowChartNode[], targets: readonly FlowChartNode[], flows: readonly FlowChartFlow[]) {
  const nodes: Node[] = sides.flatMap((side) =>
    (side === 'source' ? sources : targets).map((node, i) => ({
      key: `${side}:${node.id}`,
      label: node.label,
      side,
      color: node.color ?? hue(i),
    })),
  );
  const known = new Set(nodes.map((node) => node.key));
  const links = new Map<string, Link>();
  for (const flow of flows) {
    const source = `source:${flow.source}`;
    const target = `target:${flow.target}`;
    if (!known.has(source) || !known.has(target)) continue;
    const key = linkKey(source, target);
    const value = Number.isFinite(flow.value) ? Math.max(flow.value, 0) : 0;
    links.set(key, { key, source, target, value: (links.get(key)?.value ?? 0) + value });
  }
  return { nodes, links: [...links.values()] };
}

/**
 * Every node and link gets a place, the hidden ones too: a hidden bar has no height at the spot it would take, and its
 * bands no thickness, so showing it again grows each mark out of its own spot instead of mounting it.
 */
function layoutFlows(width: number, height: number, nodes: readonly Node[], links: readonly Link[], hidden: ReadonlySet<string>) {
  const order = new Map(nodes.map((node, i) => [node.key, i]));
  const amountOf = (link: Link) => (hidden.has(link.source) || hidden.has(link.target) ? 0 : link.value);
  const total = links.reduce((sum, link) => sum + amountOf(link), 0);
  const columns = sides.map((side) => nodes.filter((node) => node.side === side));
  const amounts = columns.map((column, c) =>
    column.map((node) => links.reduce((sum, link) => sum + (link[sides[c]] === node.key ? amountOf(link) : 0), 0)),
  );
  const gaps = amounts.map((column) => GAP * Math.max(column.filter((amount) => amount > 0).length - 1, 0));
  const scale = total > 0 ? Math.max(0, Math.min(...gaps.map((gap) => (height - gap) / total))) : 0;
  const x0 = EDGE + BAR_WIDTH;
  const x1 = Math.max(width - EDGE - BAR_WIDTH, x0);
  const middle = (x0 + x1) / 2;

  const bars: Record<string, Bar> = {};
  const ends: Record<string, { left: number; right: number }> = {};
  columns.forEach((column, c) => {
    const side = sides[c];
    const other = sides[1 - c];
    let y = (height - (total * scale + gaps[c])) / 2;
    let placed = 0;
    column.forEach((node, i) => {
      const amount = amounts[c][i];
      const top = amount === 0 && placed > 0 ? y - GAP / 2 : y;
      bars[node.key] = { x: c === 0 ? EDGE : x1, y: top, height: amount * scale, amount, share: total > 0 ? amount / total : 0 };
      let cursor = top;
      const own = links.filter((link) => link[side] === node.key).sort((a, b) => order.get(a[other])! - order.get(b[other])!);
      for (const link of own) {
        ends[link.key] = { ...ends[link.key], [c === 0 ? 'left' : 'right']: cursor };
        cursor += amountOf(link) * scale;
      }
      if (amount > 0) {
        y += amount * scale + GAP;
        placed += 1;
      }
    });
  });

  const bands: Band[] = [...links]
    .sort((a, b) => order.get(a.source)! - order.get(b.source)! || order.get(a.target)! - order.get(b.target)!)
    .map((link) => {
      const amount = amountOf(link);
      const thickness = amount * scale;
      const left = round(ends[link.key].left);
      const right = round(ends[link.key].right);
      const [a, b, m, t] = [round(x0), round(x1), round(middle), round(thickness)];
      const d = `M${a} ${left}C${m} ${left} ${m} ${right} ${b} ${right}L${b} ${round(right + t)}C${m} ${round(right + t)} ${m} ${round(left + t)} ${a} ${round(left + t)}Z`;
      const share = (bar: Bar) => (bar.amount ? amount / bar.amount : 0);
      return { ...link, amount, left, right, thickness, ofSource: share(bars[link.source]), ofTarget: share(bars[link.target]), d };
    });

  return { bars, bands, total, x0, x1 };
}

/** A number that counts with the chart. It is aria-hidden or labelled elsewhere, so it skips the screen-reader copy. */
function CountValue({ value, format, ready, instant }: { value: number; format: (value: number) => string; ready: boolean; instant: boolean }) {
  return format(useCountUp(value, { ready, instant }));
}

/**
 * A two-column flow chart: the sources stack into rounded bars on the left, the targets on the right, and a band joins
 * each pair, as thick at each end as its amount and shaded from a light tint of its source to a stronger one of its
 * target. One band is selected, drawn on top with a tooltip that reads its share of the source, its amount and its
 * share of the target. On the way in the left bars grow, the bands flow across behind a soft edge, the right bars grow
 * as it reaches them, and the tooltip comes last. Hiding a node in the legend, or new data, moves every band and bar to
 * its new place; under reduced motion the plot fades in again at its new layout.
 */
function FlowChart({
  sources,
  targets,
  flows,
  label,
  unit,
  sourceLabel = 'Source',
  targetLabel = 'Target',
  targetTotal,
  defaultSelected,
  format = formatAmount,
  entrance,
  className,
  ...props
}: FlowChartProps) {
  const figure = React.useRef<HTMLElement>(null);
  const { revealed, instant } = useChartEntrance(figure, entrance);
  const reduced = useReducedMotion();
  const [plotRef, size] = useSize<HTMLDivElement>();
  const [tooltipRef, tooltipSize] = useSize<HTMLDivElement>();
  const uid = React.useId().replace(/[^a-zA-Z0-9]/g, '');
  const buttons = React.useRef(new Map<string, HTMLElement>());

  const { nodes, links } = React.useMemo(() => normalize(sources, targets, flows), [sources, targets, flows]);
  const [hidden, setHidden] = React.useState<ReadonlySet<string>>(() => new Set());
  const [selected, setSelected] = React.useState<string | null | undefined>(undefined);
  const [roving, setRoving] = React.useState<string | null>(null);
  const [hoveredBand, setHoveredBand] = React.useState<string | null>(null);
  const [focusedBand, setFocusedBand] = React.useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = React.useState<string | null>(null);
  const [tipBand, setTipBand] = React.useState<string | null>(null);
  const [shownData, setShownData] = React.useState(links);
  const [version, setVersion] = React.useState(0);
  if (links !== shownData) {
    setShownData(links);
    setVersion(version + 1);
    setSelected(undefined);
    setHoveredBand(null);
    setHoveredNode(null);
  }

  // A chart that skips its entrance lands at once: no delays, no sweep, the tooltip open from the start.
  const [skipped, setSkipped] = React.useState(entrance === 'none');
  if (instant && !skipped) setSkipped(true);
  const [landed, setLanded] = React.useState(false);
  const measured = size !== null;
  React.useEffect(() => {
    if (!skipped || landed || !measured) return;
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setLanded(true));
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [skipped, landed, measured]);
  const still = instant || (skipped && !landed);

  const nodeByKey = new Map(nodes.map((node) => [node.key, node]));
  const isShown = (link: Link) => !hidden.has(link.source) && !hidden.has(link.target) && link.value > 0;
  const shownLinks = links.filter(isShown);
  const shownKeys = new Set(shownLinks.map((link) => link.key));
  const geometry = size ? layoutFlows(size.width, size.height, nodes, links, hidden) : null;
  const total = shownLinks.reduce((sum, link) => sum + link.value, 0);
  const totalTarget = targetTotal ? `target:${targetTotal.target}` : null;
  const targetSum = shownLinks.reduce((sum, link) => sum + (link.target === totalTarget ? link.value : 0), 0);

  const ordered = geometry?.bands.filter((band) => band.amount > 0) ?? [];
  const firstShown = ordered[0]?.key ?? shownLinks[0]?.key ?? null;
  const pick = (key: string | null | undefined) => (key && shownKeys.has(key) ? key : null);
  const defaultKey =
    defaultSelected === null ? null : (pick(defaultSelected && linkKey(`source:${defaultSelected.source}`, `target:${defaultSelected.target}`)) ?? firstShown);
  const current = selected === undefined ? defaultKey : selected === null ? null : (pick(selected) ?? firstShown);
  const focusable = pick(roving) ?? current ?? firstShown;

  const preview = pick(hoveredBand) ?? pick(focusedBand);
  const active = preview ?? current;
  if (active && active !== tipBand) setTipBand(active);

  const settledByTime = useDelayed(revealed, SETTLE_MS);
  const edgeAt = (x: number) => FLOW_AT_MS + sweepTime((x + FEATHER / 2) / ((size?.width ?? 0) + FEATHER));
  const rightBarsAt = geometry ? edgeAt(geometry.x1) - 150 : SETTLE_MS;
  const rightByTime = useDelayed(revealed, Math.round(rightBarsAt));
  const settled = skipped || settledByTime;
  const rightReady = skipped || rightByTime;
  const sweeping = !reduced && !settled;
  const at = (ms: number) => `${settled ? 0 : Math.round(ms)}ms`;

  const previewLink = preview ? links.find((link) => link.key === preview) : undefined;
  const bandLit = (band: Band) =>
    previewLink ? band.key === preview : hoveredNode ? band.source === hoveredNode || band.target === hoveredNode : true;
  const barLit = (key: string) =>
    previewLink ? previewLink.source === key || previewLink.target === key : hoveredNode ? key === hoveredNode : true;

  const toggle = (node: Node) => {
    const shownInColumn = nodes.filter((other) => other.side === node.side && !hidden.has(other.key));
    if (!hidden.has(node.key) && shownInColumn.length === 1) return;
    const next = new Set(hidden);
    if (next.has(node.key)) next.delete(node.key);
    else next.add(node.key);
    setHidden(next);
  };

  const select = (key: string) => {
    setSelected(key);
    setRoving(key);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setSelected(null);
      setHoveredBand(null);
      setFocusedBand(null);
      setHoveredNode(null);
      return;
    }
    const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[event.key];
    const jump = { Home: 0, End: ordered.length - 1 }[event.key];
    if ((step === undefined && jump === undefined) || ordered.length === 0) return;
    event.preventDefault();
    const index = ordered.findIndex((band) => band.key === focusable);
    const next = ordered[jump ?? Math.min(Math.max(index + (step ?? 0), 0), ordered.length - 1)];
    setRoving(next.key);
    buttons.current.get(next.key)?.focus();
  };

  const tip = tipBand ? geometry?.bands.find((band) => band.key === tipBand) : undefined;
  const tipHeight = tooltipSize?.height ?? 48;
  const tipTop = (() => {
    if (!tip || !size) return 0;
    const top = (tip.left + tip.right) / 2;
    const above = top - TOOLTIP_OFFSET - tipHeight;
    const below = top + tip.thickness + TOOLTIP_OFFSET;
    const placed = above >= 0 ? above : below + tipHeight <= size.height ? below : top + tip.thickness / 2 - tipHeight / 2;
    return Math.min(Math.max(placed, 0), Math.max(size.height - tipHeight, 0));
  })();

  const columns = sides.map((side) => nodes.filter((node) => node.side === side));
  const columnLabels = { source: sourceLabel, target: targetLabel };
  const rise = (ms: number) => ({
    style: { '--delay': at(ms) } as React.CSSProperties,
    className: cn(
      'transition-[opacity,translate] delay-(--delay) duration-reveal ease-power3-out',
      !revealed && 'opacity-0 motion-safe:translate-y-1',
    ),
  });
  const legendRise = rise(LEGEND_AT_MS);
  const amountLabel = (value: number) => (unit ? `${format(value)} ${unit}` : format(value));
  const figures = [
    { key: 'total', label: unit ? capitalize(unit) : 'Total', value: total },
    ...(targetTotal ? [{ key: 'target', label: targetTotal.label, value: targetSum }] : []),
  ];

  return (
    <figure
      ref={figure}
      data-slot="flow-chart"
      data-instant={still || undefined}
      style={{ '--flow-at': `${FLOW_AT_MS}ms`, '--sweep-ms': `${SWEEP_MS}ms` } as React.CSSProperties}
      className={cn('@container/flow-chart m-0 min-w-0 data-instant:**:transition-none', className)}
      {...props}
    >
      <div className="flex min-w-0 flex-col gap-5 @lg/flow-chart:flex-row @lg/flow-chart:gap-6">
        <div className="flex min-w-0 flex-col gap-4 @lg/flow-chart:w-56 @lg/flow-chart:shrink-0">
          <dl data-slot="flow-chart-summary" className="grid grid-cols-2 gap-4">
            {figures.map((item, i) => {
              const { style, className } = rise(120 + i * 60);
              return (
                <div key={item.key} style={style} className={cn('flex min-w-0 flex-col gap-1', className)}>
                  <dt className="truncate text-small text-muted-foreground" title={item.label}>
                    {item.label}
                  </dt>
                  <dd className="text-display tabular-nums">
                    <span aria-hidden>
                      <CountValue value={item.value} format={format} ready={revealed} instant={still} />
                    </span>
                    <span className="sr-only">{format(item.value)}</span>
                  </dd>
                </div>
              );
            })}
          </dl>
          <div data-slot="flow-chart-legend" className="grid grid-cols-2 gap-4">
            {columns.map((column, c) => (
              <div key={sides[c]} role="group" aria-labelledby={`${uid}-${sides[c]}`} className="flex min-w-0 flex-col gap-1">
                <p
                  id={`${uid}-${sides[c]}`}
                  style={legendRise.style}
                  className={cn('truncate text-caption tracking-[0.05em] text-muted-foreground uppercase', legendRise.className)}
                >
                  {columnLabels[sides[c]]}
                </p>
                <ul className="-ms-2 flex min-w-0 flex-col items-start">
                  {column.map((node) => {
                    const index = nodes.indexOf(node);
                    const isHidden = hidden.has(node.key);
                    return (
                      <li
                        key={node.key}
                        style={{ '--delay': at(LEGEND_AT_MS + index * LEGEND_STAGGER_MS) } as React.CSSProperties}
                        className={cn('max-w-full transition-[opacity] delay-(--delay) duration-reveal', !revealed && 'opacity-0')}
                      >
                        <Button
                          data-slot="flow-chart-legend-item"
                          data-hidden={isHidden || undefined}
                          variant="item"
                          size="sm"
                          aria-pressed={!isHidden}
                          title={node.label}
                          onClick={() => toggle(node)}
                          onPointerEnter={() => setHoveredNode(isHidden ? null : node.key)}
                          onPointerLeave={() => setHoveredNode(null)}
                          onFocus={(event) => {
                            if (!isHidden && event.currentTarget.matches(':focus-visible')) setHoveredNode(node.key);
                          }}
                          onBlur={() => setHoveredNode(null)}
                          style={{ '--series': node.color } as React.CSSProperties}
                          className={cn(
                            'max-w-full justify-start gap-1.5 font-normal transition-[background-color,color]',
                            isHidden && 'text-muted-foreground',
                          )}
                        >
                          <span
                            aria-hidden
                            className={cn(
                              'size-2 shrink-0 rounded-sm transition-[background-color,box-shadow] forced-colors:bg-[CanvasText]',
                              isHidden ? 'bg-transparent shadow-[inset_0_0_0_1px_var(--series)]' : 'bg-(--series)',
                            )}
                          />
                          <span className="truncate">{node.label}</span>
                        </Button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div
          ref={plotRef}
          role="group"
          aria-roledescription="flow chart"
          aria-label={`${label}. Use the arrow keys to move between flows, Enter to select one and Escape to clear.`}
          onKeyDown={onKeyDown}
          onPointerLeave={() => {
            setHoveredBand(null);
            setHoveredNode(null);
          }}
          data-slot="flow-chart-plot"
          className="relative h-56 min-w-0 shrink-0 @lg/flow-chart:h-auto @lg/flow-chart:min-h-56 @lg/flow-chart:flex-1"
        >
          {geometry && size ? (
            // Under reduced motion a change mounts the plot again, so it fades in at its new layout instead of moving.
            <div key={reduced ? `${version}:${[...hidden].sort().join()}` : undefined} className="absolute inset-0">
              <svg aria-hidden width={size.width} height={size.height} className="absolute inset-0 overflow-visible">
                <defs>
                  {geometry.bands.map((band, i) => (
                    <linearGradient
                      key={band.key}
                      id={`${uid}-band-${i}`}
                      gradientUnits="userSpaceOnUse"
                      x1={geometry.x0}
                      x2={geometry.x1}
                      y1={0}
                      y2={0}
                    >
                      <stop
                        offset={0}
                        stopOpacity={0.25}
                        style={{ '--stop': nodeByKey.get(band.source)!.color } as React.CSSProperties}
                        className="[stop-color:var(--stop)]"
                      />
                      <stop
                        offset={1}
                        stopOpacity={0.55}
                        style={{ '--stop': nodeByKey.get(band.target)!.color } as React.CSSProperties}
                        className="[stop-color:var(--stop)]"
                      />
                    </linearGradient>
                  ))}
                  <linearGradient id={`${uid}-edge`} gradientUnits="userSpaceOnUse" x1={-FEATHER} x2={0} y1={0} y2={0}>
                    <stop offset={0} stopColor="currentColor" stopOpacity={1} />
                    <stop offset={1} stopColor="currentColor" stopOpacity={0} />
                  </linearGradient>
                  <mask
                    id={`${uid}-sweep`}
                    maskUnits="userSpaceOnUse"
                    x={-FEATHER}
                    y={-1}
                    width={size.width + 2 * FEATHER}
                    height={size.height + 2}
                    className="[mask-type:alpha]"
                  >
                    <rect
                      x={-(size.width + FEATHER)}
                      y={-1}
                      width={size.width + FEATHER}
                      height={size.height + 2}
                      fill={`url(#${uid}-edge)`}
                      style={{ '--sweep': `${size.width + FEATHER}px` } as React.CSSProperties}
                      className={cn(
                        'transition-[translate] delay-(--flow-at) duration-(--sweep-ms) ease-smooth-in-out',
                        revealed && 'translate-x-(--sweep)',
                      )}
                    />
                  </mask>
                </defs>

                <g
                  mask={sweeping ? `url(#${uid}-sweep)` : undefined}
                  style={{ '--delay': at(FLOW_AT_MS) } as React.CSSProperties}
                  className={cn(
                    'transition-[opacity] delay-(--delay) duration-reveal starting:opacity-0',
                    !revealed && 'motion-reduce:opacity-0',
                  )}
                >
                  {[false, true].map((onTop) => (
                    <g key={String(onTop)}>
                      {geometry.bands.map((band, i) => {
                        const shown = band.amount > 0;
                        const lit = bandLit(band);
                        const look = onTop ? (band.key === active && lit ? '' : 'pointer-events-none opacity-0') : lit ? '' : 'opacity-45';
                        return (
                          <g key={band.key} className={cn('transition-[opacity] duration-reveal', !shown && 'opacity-0')}>
                            <g
                              data-slot={onTop ? undefined : 'flow-chart-band'}
                              data-active={(onTop && band.key === active) || undefined}
                              onPointerEnter={() => setHoveredBand(band.key)}
                              onPointerLeave={() => setHoveredBand(null)}
                              onClick={() => select(band.key)}
                              style={{ '--d': `path('${band.d}')` } as React.CSSProperties}
                              className={cn(
                                'group/band cursor-pointer transition-[opacity] motion-safe:duration-reveal motion-safe:ease-power3-out',
                                look,
                                !shown && 'pointer-events-none',
                              )}
                            >
                              {/* A card-colored path under the tint, so the band is opaque and one on top hides the ones it crosses. */}
                              <path d={band.d} className={cn('fill-card', bandPath)} />
                              <path
                                d={band.d}
                                fill={`url(#${uid}-band-${i})`}
                                className={cn(
                                  'stroke-card stroke-1 forced-colors:fill-[GrayText] forced-colors:stroke-[Canvas]',
                                  'forced-colors:group-data-active/band:fill-[Highlight]',
                                  bandPath,
                                )}
                              />
                            </g>
                          </g>
                        );
                      })}
                    </g>
                  ))}
                </g>

                {columns.map((column, c) =>
                  column.map((node, i) => {
                    const bar = geometry.bars[node.key];
                    const delay = c === 0 ? LEFT_BARS_AT_MS + i * BAR_STAGGER_MS : rightBarsAt + i * BAR_STAGGER_MS;
                    return (
                      <g
                        key={node.key}
                        style={{ '--delay': at(delay) } as React.CSSProperties}
                        className={cn(
                          'origin-top transition-[opacity] delay-(--delay) duration-reveal ease-power3-out [transform-box:fill-box]',
                          'starting:opacity-0 motion-safe:transition-[scale,opacity]',
                          !revealed && 'opacity-0 motion-safe:scale-y-0',
                        )}
                      >
                        <rect
                          data-slot="flow-chart-bar"
                          x={bar.x}
                          y={bar.y}
                          width={BAR_WIDTH}
                          height={bar.height}
                          rx={Math.min(6, bar.height / 2)}
                          onPointerEnter={() => setHoveredNode(node.key)}
                          onPointerLeave={() => setHoveredNode(null)}
                          // Geometry as CSS too, so browsers that support it move a bar to its new place.
                          style={{ '--series': node.color, '--y': `${bar.y}px`, '--h': `${bar.height}px` } as React.CSSProperties}
                          className={cn(
                            'fill-(--series) [height:var(--h)] [y:var(--y)] transition-[opacity] forced-colors:fill-[CanvasText]',
                            'motion-safe:transition-[opacity,y,height] motion-safe:duration-reveal motion-safe:ease-power3-out',
                            hidden.has(node.key) ? 'opacity-0' : !barLit(node.key) && 'opacity-45',
                          )}
                        />
                      </g>
                    );
                  }),
                )}
              </svg>

              {columns.map((column, c) =>
                column.map((node, i) => {
                  const bar = geometry.bars[node.key];
                  const barAt = c === 0 ? LEFT_BARS_AT_MS + i * BAR_STAGGER_MS : rightBarsAt + i * BAR_STAGGER_MS;
                  const showPill = revealed && bar.height >= MIN_PILL;
                  return (
                    <span
                      key={node.key}
                      aria-hidden
                      data-slot="flow-chart-share"
                      style={
                        {
                          '--x': `${bar.x + BAR_WIDTH / 2}px`,
                          '--y': `${bar.y + bar.height / 2}px`,
                          '--delay': at(barAt + 300),
                        } as React.CSSProperties
                      }
                      className={cn(
                        'pointer-events-none absolute top-(--y) left-(--x) -translate-1/2 rounded-full border border-transparent bg-secondary px-1.5',
                        'text-caption font-medium text-secondary-foreground tabular-nums shadow-control',
                        'transition-[opacity] delay-(--delay) duration-base starting:opacity-0',
                        'motion-safe:transition-[opacity,top] motion-safe:duration-reveal motion-safe:ease-power3-out',
                        !showPill && 'opacity-0',
                      )}
                    >
                      <CountValue value={bar.share} format={formatShare} ready={c === 0 ? revealed : rightReady} instant={still} />
                    </span>
                  );
                }),
              )}

              {geometry.bands.map((band, i) => {
                const source = nodeByKey.get(band.source)!;
                const target = nodeByKey.get(band.target)!;
                const thick = band.thickness >= MIN_LABEL;
                const center = band.left + band.thickness / 2;
                return (
                  <Button
                    key={band.key}
                    ref={(node: HTMLElement | null) => {
                      if (node) buttons.current.set(band.key, node);
                      else buttons.current.delete(band.key);
                    }}
                    data-slot="flow-chart-band-label"
                    variant="item"
                    size="sm"
                    tabIndex={band.key === focusable ? 0 : -1}
                    inert={band.amount === 0}
                    aria-pressed={band.key === current}
                    aria-label={`${source.label} to ${target.label}: ${amountLabel(band.amount)}, ${formatShare(band.ofSource)} of ${source.label}, ${formatShare(band.ofTarget)} of ${target.label}`}
                    onClick={() => select(band.key)}
                    onFocus={(event) => {
                      setRoving(band.key);
                      if (event.currentTarget.matches(':focus-visible')) setFocusedBand(band.key);
                    }}
                    onBlur={() => setFocusedBand(null)}
                    onPointerEnter={() => setHoveredBand(band.key)}
                    style={
                      {
                        // Clear of the share pill, which reaches up to EDGE past its bar.
                        '--x': `${geometry.x0 + EDGE + 2}px`,
                        '--y': `${center}px`,
                        '--delay': at(edgeAt(geometry.x0 + 24) + i * LABEL_STAGGER_MS),
                      } as React.CSSProperties
                    }
                    className={cn(
                      'absolute top-(--y) left-(--x) h-5 -translate-y-1/2 rounded-md px-1 text-caption tabular-nums hover:not-data-disabled:bg-transparent',
                      'transition-[opacity,translate] delay-(--delay) duration-reveal ease-power3-out starting:opacity-0',
                      'motion-safe:transition-[opacity,translate,top]',
                      !revealed && 'opacity-0 motion-safe:-translate-x-1.5',
                      !thick && 'pointer-events-none',
                    )}
                  >
                    <span aria-hidden className={cn('transition-[opacity] duration-base', !thick && 'opacity-0')}>
                      <CountValue value={band.amount} format={format} ready={revealed} instant={still} />
                    </span>
                  </Button>
                );
              })}

              {geometry.bands.map((band, i) => (
                <span
                  key={band.key}
                  aria-hidden
                  data-slot="flow-chart-target-share"
                  style={
                    {
                      '--r': `${size.width - geometry.x1 + EDGE + 4}px`,
                      '--y': `${band.right + band.thickness / 2}px`,
                      '--delay': at(edgeAt(geometry.x1 - 24) + i * LABEL_STAGGER_MS),
                    } as React.CSSProperties
                  }
                  className={cn(
                    'pointer-events-none absolute top-(--y) right-(--r) -translate-y-1/2 text-caption font-medium tabular-nums',
                    'transition-[opacity,translate] delay-(--delay) duration-reveal ease-power3-out starting:opacity-0',
                    'motion-safe:transition-[opacity,translate,top]',
                    !revealed && 'opacity-0 motion-safe:translate-x-1.5',
                    band.thickness < MIN_LABEL && 'opacity-0',
                  )}
                >
                  <CountValue value={band.ofTarget} format={formatShare} ready={rightReady} instant={still} />
                </span>
              ))}

              {tip ? (
                <div
                  aria-hidden
                  style={{ '--y': `${tipTop}px` } as React.CSSProperties}
                  className="pointer-events-none absolute inset-x-0 top-(--y) flex justify-center motion-safe:transition-[top] motion-safe:duration-slow motion-safe:ease-smooth-in-out"
                >
                  <div
                    ref={tooltipRef}
                    data-slot="flow-chart-tooltip"
                    className={cn(
                      'flex h-12 max-w-full min-w-0 items-center gap-2 rounded-lg border border-transparent bg-popover px-2.5 text-caption whitespace-nowrap text-popover-foreground tabular-nums shadow-popover',
                      'transition-[opacity,translate] duration-base ease-power3-out starting:opacity-0',
                      !(settled && active) && 'opacity-0 motion-safe:translate-y-1',
                    )}
                  >
                    <TooltipValue value={tip.ofSource} format={formatShare} ready={settled} instant={still}>
                      of {nodeByKey.get(tip.source)!.label}
                    </TooltipValue>
                    <ArrowRight aria-hidden className="size-3 shrink-0 text-muted-foreground" />
                    <TooltipValue value={tip.amount} format={format} ready={settled} instant={still}>
                      {unit}
                    </TooltipValue>
                    <ArrowRight aria-hidden className="size-3 shrink-0 text-muted-foreground" />
                    <TooltipValue value={tip.ofTarget} format={formatShare} ready={settled} instant={still}>
                      of {nodeByKey.get(tip.target)!.label}
                    </TooltipValue>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      {/* A table keeps its content width at 1px, so the visually hidden box is a wrapper. */}
      <div className="sr-only">
        <table>
          <caption>{label}</caption>
          <thead>
            <tr>
              <th scope="col">{sourceLabel}</th>
              <th scope="col">{targetLabel}</th>
              <th scope="col">{unit ? capitalize(unit) : 'Value'}</th>
            </tr>
          </thead>
          <tbody>
            {links
              .filter((link) => !hidden.has(link.source) && !hidden.has(link.target))
              .map((link) => (
                <tr key={link.key}>
                  <th scope="row">{nodeByKey.get(link.source)!.label}</th>
                  <td>{nodeByKey.get(link.target)!.label}</td>
                  <td>{format(link.value)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}

function TooltipValue({
  value,
  format,
  ready,
  instant,
  children,
}: {
  value: number;
  format: (value: number) => string;
  ready: boolean;
  instant: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col">
      <span className="font-medium text-foreground">
        <CountValue value={value} format={format} ready={ready} instant={instant} />
      </span>
      {children ? <span className="truncate text-muted-foreground">{children}</span> : null}
    </div>
  );
}

export { FlowChart, type FlowChartFlow, type FlowChartNode, type FlowChartProps };
