'use client';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useSyncExternalStore, type ReactNode } from 'react';
import { cn } from '@/registry/kosmos/lib/cn';
import { BrowserFrame } from '@/registry/kosmos/ui/browser-frame';
import { ChecklistIllustration, LayerStackIllustration, SyncIllustration } from '@/registry/kosmos/ui/illustrations';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/registry/kosmos/ui/tabs';
import { ChartVisual, ChecklistVisual, CommandVisual, QuotaVisual, StatVisual, TableVisual } from './visuals';

const link = 'inline-flex w-fit items-center gap-1 rounded-sm text-body font-medium text-foreground transition-[color] hover:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring';

function DocsLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className={link}>
      {children}
      <ArrowRight aria-hidden className="size-3.5" />
    </Link>
  );
}

/* ---------------------------------------------------------------------------------------------------------------
 * A. Rows (no bento). One feature per row at real size, copy one side and the live part cropped by its stage the
 * other, rows alternate. A plain list of the other parts closes the section.
 * ------------------------------------------------------------------------------------------------------------- */

const rows = [
  {
    id: 'command',
    title: 'Search and run anything from the keyboard',
    description: 'A command palette with filtering, groups and shortcuts, and the checklist an agent works through while you wait.',
    href: '/docs/components/command',
    label: 'Command',
    visual: (
      <div className="grid w-full md:min-w-[34rem] grid-cols-1 md:grid-cols-[1.1fr_1fr] items-start gap-4">
        <CommandVisual />
        <ChecklistVisual />
      </div>
    ),
  },
  {
    id: 'chart',
    title: 'Numbers that read at a glance',
    description: 'Charts, stat tiles and meters share one grey ramp, a tooltip, and a table for screen readers.',
    href: '/docs/components/chart',
    label: 'Chart',
    visual: (
      <div className="relative w-full md:min-w-[34rem]">
        <ChartVisual />
        <div className="absolute -bottom-6 -start-4 hidden w-56 md:block">
          <StatVisual />
        </div>
      </div>
    ),
  },
  {
    id: 'table',
    title: 'Tables that stay tidy at any size',
    description: 'Tags, status dots and numbers that line up, with a usage meter for the limit your plan allows.',
    href: '/docs/components/table',
    label: 'Table',
    visual: (
      <div className="grid w-full md:min-w-[34rem] grid-cols-1 md:grid-cols-[1.6fr_1fr] items-start gap-4">
        <TableVisual rows={5} />
        <QuotaVisual />
      </div>
    ),
  },
];

const alsoInTheBox = ['Dialog', 'Drawer', 'Combobox', 'Date picker', 'Sidebar', 'Toast', 'Tabs', 'Tool call', 'Prompt composer', 'Calendar', 'Tags input', 'Slider'];

export function VariantRows() {
  return (
    <div className="flex flex-col gap-16 md:gap-24">
      {rows.map((row, index) => (
        <article key={row.id} className="grid gap-6 md:grid-cols-12 md:items-center md:gap-12">
          <div className={cn('flex flex-col items-start gap-3 md:col-span-4', index % 2 === 1 && 'md:order-2')}>
            <h3 className="text-heading font-semibold text-balance text-foreground md:text-display">{row.title}</h3>
            <p className="text-body text-pretty text-muted-foreground">{row.description}</p>
            <DocsLink href={row.href}>See {row.label}</DocsLink>
          </div>
          <div
            className={cn(
              'flex min-h-80 items-center overflow-hidden rounded-2xl border border-transparent bg-muted p-6 shadow-inset md:col-span-8 md:p-10',
              index % 2 === 0 ? 'justify-start' : 'justify-end',
            )}
          >
            {row.visual}
          </div>
        </article>
      ))}
      <div className="flex flex-col gap-4 border-t border-border pt-8">
        <p className="text-body font-medium text-foreground">And {alsoInTheBox.length * 4} more parts, all added the same way</p>
        <ul className="flex flex-wrap gap-x-6 gap-y-2 text-body text-muted-foreground">
          {alsoInTheBox.map((name) => (
            <li key={name}>
              <Link href={`/docs/components/${name.toLowerCase().replaceAll(' ', '-')}`} className="rounded-sm transition-[color] hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
                {name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------------------------------------------
 * B. One surface. A single card cut into cells by hairlines instead of six floating cards. Copy sits top-left in
 * every cell, the live part is pushed to the bottom corner and cropped by the cell edge. One cell is the hero.
 * ------------------------------------------------------------------------------------------------------------- */

function Cell({ title, description, href, className, children, crop = 'end' }: { title: string; description: string; href: string; className?: string; children: ReactNode; crop?: 'end' | 'center' }) {
  return (
    <div className={cn('group/cell flex min-w-0 flex-col overflow-hidden bg-card', className)}>
      <div className="flex flex-col gap-1 p-6 pb-4">
        <h3 className="text-title text-foreground">
          <Link href={href} className="rounded-sm after:absolute after:inset-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
            {title}
          </Link>
        </h3>
        <p className="max-w-[28em] text-body text-pretty text-muted-foreground">{description}</p>
      </div>
      <div
        className={cn(
          'mt-auto flex min-h-56 flex-1 items-end overflow-hidden ps-6 pt-2 transition-[translate] motion-safe:group-hover/cell:-translate-y-1',
          crop === 'center' && 'justify-center pe-6',
        )}
      >
        <div className={cn(crop === 'end' ? 'w-[calc(100%+3rem)] min-w-0 shrink-0 translate-y-6' : 'w-full pb-6')}>{children}</div>
      </div>
    </div>
  );
}

export function VariantSurface() {
  return (
    <div className="relative grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-transparent bg-border shadow-card md:grid-cols-6">
      <Cell className="relative md:col-span-4 md:row-span-1" title="See the trend" description="A chart with a range switch, a tooltip and a table for screen readers." href="/docs/components/chart-card">
        <ChartVisual />
      </Cell>
      <Cell className="relative md:col-span-2" title="One number, one glance" description="Value, change and trend in a single tile." href="/docs/components/stat-card">
        <div className="flex flex-col gap-3">
          <StatVisual />
          <QuotaVisual />
        </div>
      </Cell>
      <Cell className="relative md:col-span-2" title="Jump anywhere" description="Type to filter, arrows to move, Enter to run." href="/docs/components/command">
        <CommandVisual listHeight="max-h-40" />
      </Cell>
      <Cell className="relative md:col-span-4" title="Every project in one table" description="Plans, status and users that line up." href="/docs/components/table">
        <TableVisual rows={5} />
      </Cell>
      <Cell className="relative md:col-span-2" title="Blocks that stack" description="Sidebar, header, table and drawer share one set of tokens." href="/docs/blocks/app-sidebar" crop="center">
        <LayerStackIllustration trigger="view" className="mx-auto max-w-72" />
      </Cell>
      <Cell className="relative md:col-span-2" title="States by design" description="Loading, syncing and failed are designed." href="/docs/components/status" crop="center">
        <SyncIllustration className="mx-auto max-w-72" />
      </Cell>
      <Cell className="relative md:col-span-2" title="Follow an agent" description="From pending to done, step by step." href="/docs/components/plan-checklist" crop="center">
        <ChecklistIllustration className="mx-auto max-w-72" />
      </Cell>
    </div>
  );
}

/* ---------------------------------------------------------------------------------------------------------------
 * C. One stage. A single large live frame; you pick the part from a list beside it and the frame swaps to it. The
 * list carries all the copy, so the stage is pure product.
 * ------------------------------------------------------------------------------------------------------------- */

const stages = [
  { id: 'command', name: 'Command', blurb: 'Search and run any action from the keyboard.', href: '/docs/components/command', url: 'acme.app', visual: <div className="mx-auto w-full max-w-md"><CommandVisual listHeight="max-h-56" /></div> },
  { id: 'chart', name: 'Chart', blurb: 'A value over time, with a tooltip and a table for screen readers.', href: '/docs/components/chart', url: 'acme.app/events', visual: <ChartVisual /> },
  { id: 'table', name: 'Table', blurb: 'Tags, status dots and numbers that line up.', href: '/docs/components/table', url: 'acme.app/projects', visual: <TableVisual rows={5} /> },
  { id: 'checklist', name: 'Plan checklist', blurb: 'Follow an agent step by step, from pending to done.', href: '/docs/components/plan-checklist', url: 'acme.app/agent', visual: <div className="mx-auto w-full max-w-sm"><ChecklistVisual /></div> },
  { id: 'meter', name: 'Meter and stats', blurb: 'Usage as a bar, with the number beside it.', href: '/docs/components/meter', url: 'acme.app/usage', visual: <div className="mx-auto grid w-full max-w-lg gap-4 sm:grid-cols-2"><StatVisual /><QuotaVisual /></div> },
];

const subscribeWide = (onChange: () => void) => {
  const query = window.matchMedia('(min-width: 768px)');
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
};

export function VariantStage() {
  const wide = useSyncExternalStore(subscribeWide, () => window.matchMedia('(min-width: 768px)').matches, () => true);
  return (
    <Tabs defaultValue="command" orientation={wide ? 'vertical' : 'horizontal'} className="gap-6 md:gap-10">
      <TabsList className="md:w-72 md:shrink-0 md:gap-1 md:border-s-0">
        {stages.map((stage) => (
          <TabsTrigger
            key={stage.id}
            value={stage.id}
            className="md:h-auto! md:flex-col md:items-start md:gap-1 md:rounded-xl md:px-4 md:py-3 md:text-start md:whitespace-normal md:after:hidden md:data-active:bg-accent"
          >
            <span className="text-title md:font-medium">{stage.name}</span>
            <span className="hidden text-small font-normal text-muted-foreground md:block">{stage.blurb}</span>
          </TabsTrigger>
        ))}
      </TabsList>
      {stages.map((stage) => (
        <TabsContent key={stage.id} value={stage.id} className="flex flex-col gap-4">
          <p className="text-body text-muted-foreground md:hidden">{stage.blurb}</p>
          <div className="flex min-h-[28rem] items-center overflow-hidden rounded-2xl border border-transparent bg-muted p-4 shadow-inset sm:p-8 md:min-h-[32rem] md:p-12">
            <BrowserFrame url={stage.url} className="w-full">
              <div className="flex min-h-72 items-center bg-background p-4 sm:p-8">
                <div className="w-full">{stage.visual}</div>
              </div>
            </BrowserFrame>
          </div>
          <DocsLink href={stage.href}>See {stage.name}</DocsLink>
        </TabsContent>
      ))}
    </Tabs>
  );
}

export const prototypeVariants = [
  { key: 'A', name: 'Rows, no bento' },
  { key: 'B', name: 'One surface' },
  { key: 'C', name: 'One stage' },
];

