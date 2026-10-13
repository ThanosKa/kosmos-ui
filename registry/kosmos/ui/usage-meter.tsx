'use client';

import { Meter as MeterPrimitive } from '@base-ui/react/meter';
import { X } from 'lucide-react';
import type * as React from 'react';
import { cn } from '@/registry/kosmos/lib/cn';
import { Badge } from '@/registry/kosmos/ui/badge';
import { Button } from '@/registry/kosmos/ui/button';
import {
  Popover,
  PopoverClose,
  PopoverContent,
  type PopoverContentProps,
  PopoverTitle,
  PopoverTrigger,
} from '@/registry/kosmos/ui/popover';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/registry/kosmos/ui/tooltip';

type UsageBreakdownRow = { label: string; value: number };

type UsageMeterProps = {
  /** The panel title, and the name screen readers give the ring and the bar. */
  label?: string;
  /** What fills the limit, one row per category. Each row is a segment of the bar and a line of the list, in this order. */
  breakdown: UsageBreakdownRow[];
  /** The most that can be used, in tokens. */
  limit: number;
  /** `compact` is a ring that opens the panel; `inline` shows the panel in place. */
  variant?: 'compact' | 'inline';
  /** Fraction of the limit where the panel notes the usage is near the limit. */
  warnAt?: number;
  /** Fraction of the limit where the panel notes the usage is almost full. */
  criticalAt?: number;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  modal?: boolean;
  /** The element the panel renders into. Defaults to `document.body`. */
  container?: PopoverContentProps['container'];
  className?: string;
};

type UsageTone = 'normal' | 'warning' | 'critical';

// A category keeps its hue by position: the five chart series, then ink, then grey for the long tail.
const categoryFill = [
  'bg-chart-1',
  'bg-chart-2',
  'bg-chart-3',
  'bg-chart-4',
  'bg-chart-5',
  'bg-foreground',
  'bg-muted-foreground',
];

function fillFor(index: number) {
  return categoryFill[Math.min(index, categoryFill.length - 1)];
}

function noteFor(tone: UsageTone, ratio: number) {
  if (tone === 'normal') return null;
  if (tone === 'warning') return <Badge variant="warning">Near limit</Badge>;
  return <Badge variant="destructive">{ratio >= 1 ? 'Limit reached' : 'Almost full'}</Badge>;
}

const ringStroke: Record<UsageTone, string> = {
  normal: 'stroke-muted-foreground',
  warning: 'stroke-warning',
  critical: 'stroke-destructive',
};

const tokens = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 });

function toneFor(ratio: number, warnAt: number, criticalAt: number): UsageTone {
  if (ratio >= criticalAt) return 'critical';
  if (ratio >= warnAt) return 'warning';
  return 'normal';
}

function measure(breakdown: UsageBreakdownRow[], limit: number, warnAt: number, criticalAt: number) {
  const used = breakdown.reduce((sum, row) => sum + row.value, 0);
  const ratio = limit > 0 ? used / limit : 0;
  return { used, ratio, percent: Math.round(ratio * 100), tone: toneFor(ratio, warnAt, criticalAt) };
}

const RING_RADIUS = 5.5;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

function UsageRing({ ratio, tone }: { ratio: number; tone: UsageTone }) {
  return (
    <svg aria-hidden viewBox="0 0 14 14" className="size-3.5 -rotate-90 fill-none" strokeWidth={2}>
      <circle cx={7} cy={7} r={RING_RADIUS} className="stroke-muted-foreground/30 forced-colors:stroke-[GrayText]" />
      <circle
        cx={7}
        cy={7}
        r={RING_RADIUS}
        strokeDasharray={RING_LENGTH}
        strokeDashoffset={RING_LENGTH * (1 - Math.min(1, ratio))}
        className={cn(
          ringStroke[tone],
          'transition-[stroke] forced-colors:stroke-[CanvasText]',
          'motion-safe:transition-[stroke,stroke-dashoffset] motion-safe:duration-slow motion-safe:ease-smooth-in-out',
        )}
      />
    </svg>
  );
}

type PanelProps = {
  title: React.ReactNode;
  action?: React.ReactNode;
  label: string;
  breakdown: UsageBreakdownRow[];
  limit: number;
  used: number;
  ratio: number;
  percent: number;
  tone: UsageTone;
};

function UsagePanel({ title, action, label, breakdown, limit, used, ratio, percent, tone }: PanelProps) {
  return (
    <div data-slot="usage-meter-panel" className="flex min-w-0 flex-col gap-3">
      <div className="flex min-w-0 items-start gap-2">
        <div className="flex min-h-6 min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1">
          {title}
          {noteFor(tone, ratio)}
        </div>
        {action}
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 text-small tabular-nums">
          <p>{percent}% full</p>
          <p className="text-muted-foreground">
            {tokens.format(used)} / {tokens.format(limit)} tokens
          </p>
        </div>
        <MeterPrimitive.Root
          value={Math.min(used, limit)}
          max={limit}
          aria-label={label}
          getAriaValueText={() => `${percent}% full`}
        >
          <MeterPrimitive.Track className="flex h-1.5 gap-px overflow-hidden rounded-full border border-transparent bg-muted shadow-inset">
            {breakdown.map((row, index) => (
              <span
                key={index}
                style={{ '--segment': `${limit > 0 ? (row.value / limit) * 100 : 0}%` } as React.CSSProperties}
                className={cn(
                  'h-full w-(--segment) shrink-0 forced-colors:bg-[CanvasText]',
                  row.value > 0 && 'min-w-0.5',
                  'motion-safe:transition-[width] motion-safe:duration-slow motion-safe:ease-smooth-in-out',
                  fillFor(index),
                )}
              />
            ))}
          </MeterPrimitive.Track>
        </MeterPrimitive.Root>
      </div>
      {breakdown.length > 0 ? (
        <dl className="flex flex-col gap-2">
          {breakdown.map((row, index) => (
            <div key={index} className="flex min-w-0 items-start gap-2 text-small">
              <span aria-hidden className="flex h-[1.4em] shrink-0 items-center">
                <span className={cn('size-2.5 rounded-xs', fillFor(index))} />
              </span>
              <dt className="min-w-0 flex-1 break-words text-muted-foreground">{row.label}</dt>
              <dd className="shrink-0 tabular-nums">{tokens.format(row.value)}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </div>
  );
}

/** How full a token limit is and what fills it: a small ring that opens the breakdown, or the breakdown in place. */
function UsageMeter({
  label = 'Context usage',
  breakdown,
  limit,
  variant = 'compact',
  warnAt = 0.8,
  criticalAt = 0.95,
  open,
  defaultOpen,
  onOpenChange,
  modal,
  container,
  className,
}: UsageMeterProps) {
  const { used, ratio, percent, tone } = measure(breakdown, limit, warnAt, criticalAt);
  const summary = `${percent}% · ${tokens.format(used)} / ${tokens.format(limit)}`;
  const panel = { label, breakdown, limit, used, ratio, percent, tone };

  if (variant === 'inline') {
    return (
      <div data-slot="usage-meter" className={cn('w-full', className)}>
        <UsagePanel title={<p className="min-w-0 text-body font-medium">{label}</p>} {...panel} />
      </div>
    );
  }

  return (
    <Popover open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange} modal={modal}>
      <Tooltip>
        <TooltipTrigger
          render={
            <PopoverTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`${label}, ${percent}% full`}
                  className={className}
                />
              }
            />
          }
        >
          <UsageRing ratio={ratio} tone={tone} />
        </TooltipTrigger>
        <TooltipContent className="tabular-nums">{summary}</TooltipContent>
      </Tooltip>
      <PopoverContent
        align="start"
        container={container}
        initialFocus={(openType) => openType === 'keyboard'}
        className="w-72 [&_[data-slot=popover-body]]:p-3"
      >
        <UsagePanel
          title={<PopoverTitle className="min-w-0">{label}</PopoverTitle>}
          action={
            <PopoverClose
              render={<Button variant="ghost" size="icon-sm" aria-label="Close" className="-me-1 text-muted-foreground" />}
            >
              <X aria-hidden />
            </PopoverClose>
          }
          {...panel}
        />
      </PopoverContent>
    </Popover>
  );
}

export { UsageMeter, type UsageMeterProps, type UsageBreakdownRow };
