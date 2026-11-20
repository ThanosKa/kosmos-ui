// Usage: node --test lib/code-checks.test.mts
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ESLint } from 'eslint';

/**
 * Each code check is a lint rule with two snippets: one it must flag with its message, one it must allow.
 * `file` is where the snippet pretends to live, since each part of the repo takes its own rules.
 */
type CodeCheck = {
  name: string;
  file: string;
  flagged: string;
  message: string;
  allowed: string;
};

const codeChecks: CodeCheck[] = [
  {
    name: 'a scroll area in an overlay scrolls in its body',
    file: 'registry/kosmos/blocks/example/example.tsx',
    flagged: `
import { DrawerContent } from '@/registry/kosmos/ui/drawer';
import { ScrollArea } from '@/registry/kosmos/ui/scroll-area';

export function Panel() {
  return (
    <DrawerContent>
      <ScrollArea className="min-h-0 flex-1">
        <p>Fernhill Books</p>
      </ScrollArea>
    </DrawerContent>
  );
}
`,
    message:
      'A scroll area in an overlay goes in `DialogBody` or `DrawerBody`, which keep its focus ring inside, clear of the overlay\'s edge (kosmos-style, Focus).',
    allowed: `
import { DrawerBody, DrawerContent } from '@/registry/kosmos/ui/drawer';
import { ScrollArea } from '@/registry/kosmos/ui/scroll-area';

export function Panel() {
  return (
    <DrawerContent>
      <DrawerBody>
        <ScrollArea className="max-h-64">
          <p>Fernhill Books</p>
        </ScrollArea>
      </DrawerBody>
    </DrawerContent>
  );
}
`,
  },
  {
    name: 'sticky chrome has an opaque fill',
    file: 'registry/kosmos/blocks/example/example.tsx',
    flagged: `
export function Bar() {
  return <header className="sticky top-0 z-40 bg-background/80 border-b">Fernhill Books</header>;
}
`,
    message: 'Sticky chrome sits on an opaque fill (`bg-background`), not a translucent `bg-*/NN` (kosmos-style, Surfaces).',
    allowed: `
export function Bar() {
  return <header className="sticky top-0 z-40 border-b bg-background">Fernhill Books</header>;
}
`,
  },
  {
    name: 'a link styled as a button renders through Button',
    file: 'components/site/example.tsx',
    flagged: `
import Link from 'next/link';
import { buttonVariants } from '@/registry/kosmos/ui/button';

export function Cta() {
  return (
    <Link href="/docs" className={buttonVariants({ variant: 'primary', size: 'lg' })}>
      Get started
    </Link>
  );
}
`,
    message:
      'Render a link as a button through `Button` (`<Button variant="primary" nativeButton={false} render={<Link href=… />}>`), so presets treat it as a Button (kosmos-style, Buttons).',
    allowed: `
import Link from 'next/link';
import { Button } from '@/registry/kosmos/ui/button';

export function Cta() {
  return (
    <Button variant="primary" size="lg" nativeButton={false} render={<Link href="/docs" />}>
      Get started
    </Button>
  );
}
`,
  },
  {
    name: 'an icon-only button has an accessible name',
    file: 'registry/kosmos/blocks/example/example.tsx',
    flagged: `
import { X } from 'lucide-react';
import { Button } from '@/registry/kosmos/ui/button';

export function Close() {
  return (
    <Button variant="ghost" size="icon">
      <X />
    </Button>
  );
}
`,
    message: 'An icon-only `Button` needs `aria-label` (or a `sr-only` label) naming its action (kosmos-style, Buttons).',
    allowed: `
import { X } from 'lucide-react';
import { Button } from '@/registry/kosmos/ui/button';

export function Close() {
  return (
    <Button variant="ghost" size="icon" aria-label="Close">
      <X />
    </Button>
  );
}
`,
  },
  {
    name: 'a component sizes in spacing units',
    file: 'registry/kosmos/ui/example.tsx',
    flagged: `
export function Row() {
  return <div className="h-[30px] px-2.5">Fernhill Books</div>;
}
`,
    message: 'Size in spacing units (`h-7.5`, `py-1.25`), not arbitrary pixels, so the density setting reaches it (kosmos-style, Presets with a style).',
    allowed: `
export function Row() {
  return <div className="h-7.5 px-2.5 tracking-[0.05em]">Fernhill Books</div>;
}
`,
  },
  {
    name: 'demo data holds no key-like string',
    file: 'registry/kosmos/blocks/example/example.tsx',
    flagged: `
export const secretKey = 'sk_live_51HxQ2eLkd93Jf8aZpR7vNc';
`,
    message: 'Demo keys start with `acme_` and never contain `sk_`, `pk_` or `whsec_`, which push protection reads as real keys (kosmos-style, Demo world).',
    allowed: `
export const secretKey = 'acme_secret_demo_7Q2Kf9r3Vx';
`,
  },
  {
    name: 'a logo takes its brand color on the mark only',
    file: 'registry/kosmos/blocks/example/example.tsx',
    flagged: `
export function Brand() {
  return <li className="text-muted-foreground hover:text-(--logo-color,var(--foreground))">Fernhill Books</li>;
}
`,
    message:
      'A logo takes `--logo-color` on its mark only (`[&_:is(svg,img)]:text-(--logo-color)`); the name stays `text-foreground`, since a brand color can fall below 4.5:1 (kosmos-style, Contrast).',
    allowed: `
export function Brand() {
  return <li className="text-muted-foreground hover:text-foreground hover:[&_:is(svg,img)]:text-(--logo-color,var(--foreground))">Fernhill Books</li>;
}
`,
  },
  {
    name: 'a scale in a transition runs only when motion is allowed',
    file: 'registry/kosmos/ui/example.tsx',
    flagged: `
export function Dot({ unread }: { unread: boolean }) {
  return <span className={unread ? 'transition-[opacity,scale]' : 'transition-[opacity,scale] scale-50 opacity-0'} />;
}
`,
    message: 'A `scale-*` in a class list that transitions `scale` takes `motion-safe:`, so reduced motion fades without scaling (kosmos-style, Reduced motion).',
    allowed: `
export function Dot({ unread }: { unread: boolean }) {
  return <span className={unread ? 'transition-[opacity,scale]' : 'transition-[opacity,scale] motion-safe:scale-50 opacity-0'} />;
}
`,
  },
  {
    name: 'reduced motion fades instead of switching a transition off',
    file: 'components/docs/example.tsx',
    flagged: `
export function Stage() {
  return <div className="transition-[width] motion-reduce:transition-none" />;
}
`,
    message: 'Under reduced motion, fade opacity (`motion-reduce:transition-[opacity]`) instead of `motion-reduce:transition-none`, so a change never jumps (kosmos-style, Reduced motion).',
    allowed: `
export function Stage() {
  return <div className="transition-[width] motion-reduce:transition-[opacity]" />;
}
`,
  },
  {
    name: 'a toast with an action stays until it is used',
    file: 'registry/kosmos/examples/example.tsx',
    flagged: `
import { toast } from 'sonner';

export function Save() {
  return toast('Item created', { action: { label: 'Undo', onClick: () => {} } });
}
`,
    message: 'A toast with an action sets `duration: Infinity` (Sonner) or `timeout: 0` (Base UI), so it cannot close before it can be used (kosmos-style, Timing; WCAG 2.2.1).',
    allowed: `
import { toast } from 'sonner';

export function Save() {
  return toast('Item created', { duration: Infinity, action: { label: 'Undo', onClick: () => {} } });
}
`,
  },
  {
    name: 'a Base UI toast with an action stays until it is used',
    file: 'registry/kosmos/examples/example.tsx',
    flagged: `
export function Save(toastManager: { add: (options: object) => void }) {
  return toastManager.add({ title: 'Item created', actionProps: { children: 'Undo' } });
}
`,
    message: 'A toast with an action sets `duration: Infinity` (Sonner) or `timeout: 0` (Base UI), so it cannot close before it can be used (kosmos-style, Timing; WCAG 2.2.1).',
    allowed: `
export function Save(toastManager: { add: (options: object) => void }) {
  return toastManager.add({ title: 'Item created', timeout: 0, actionProps: { children: 'Undo' } });
}
`,
  },
  {
    name: 'a conditional inline style sets custom properties only',
    file: 'components/docs/example.tsx',
    flagged: `
export function Stage({ height }: { height?: number }) {
  return <div style={height ? { height } : undefined}>Fernhill Books</div>;
}
`,
    message: 'An inline `style` may only set CSS custom properties (`--name`); use a class for the rest (kosmos-style).',
    allowed: `
export function Stage({ height }: { height?: number }) {
  return <div style={height ? { '--stage-height': \`\${height}px\` } as React.CSSProperties : undefined}>Fernhill Books</div>;
}
`,
  },
  {
    name: 'a live region exists before its text arrives',
    file: 'registry/kosmos/blocks/example/example.tsx',
    flagged: `
export function Count({ count }: { count: number }) {
  return <div>{count > 0 && <p role="status">{count} new</p>}</div>;
}
`,
    message:
      'A `role="status"` or `role="alert"` renders before its text does, and never behind a condition or with `empty:hidden`, since a screen reader announces changes to a region that already exists (kosmos-style, Announcements; WCAG 4.1.3).',
    allowed: `
export function Count({ count }: { count: number }) {
  return (
    <div>
      <p role="status" className="sr-only">
        {count > 0 ? \`\${count} new\` : ''}
      </p>
    </div>
  );
}
`,
  },
  {
    name: 'docs content scrolls in a scroll area',
    file: 'components/docs/example.tsx',
    flagged: `
export function Contents() {
  return <div className="min-h-0 overflow-y-auto p-1">Fernhill Books</div>;
}
`,
    message: 'Content in the docs, the site and the blocks scrolls in a `ScrollArea`, which keeps the scrollbar, edge fade and focus ring on the Kosmos style (kosmos-style, Overflow). The docs code block viewport is the one exception.',
    allowed: `
import { ScrollArea } from '@/registry/kosmos/ui/scroll-area';

export function Contents() {
  return <ScrollArea className="min-h-0">Fernhill Books</ScrollArea>;
}
`,
  },
  {
    name: 'block content scrolls in a scroll area',
    file: 'registry/kosmos/blocks/example/example.tsx',
    flagged: `
export function Contents() {
  return <div className="min-h-0 overflow-y-auto p-1">Fernhill Books</div>;
}
`,
    message: 'Content in the docs, the site and the blocks scrolls in a `ScrollArea`, which keeps the scrollbar, edge fade and focus ring on the Kosmos style (kosmos-style, Overflow). The docs code block viewport is the one exception.',
    allowed: `
import { ScrollArea } from '@/registry/kosmos/ui/scroll-area';

export function Contents() {
  return <ScrollArea className="min-h-0">Fernhill Books</ScrollArea>;
}
`,
  },
  {
    name: 'site content scrolls in a scroll area',
    file: 'components/site/example.tsx',
    flagged: `
export function Contents() {
  return <div className="min-h-0 overflow-y-auto p-1">Fernhill Books</div>;
}
`,
    message: 'Content in the docs, the site and the blocks scrolls in a `ScrollArea`, which keeps the scrollbar, edge fade and focus ring on the Kosmos style (kosmos-style, Overflow). The docs code block viewport is the one exception.',
    allowed: `
import { ScrollArea } from '@/registry/kosmos/ui/scroll-area';

export function Contents() {
  return <ScrollArea className="min-h-0">Fernhill Books</ScrollArea>;
}
`,
  },
  {
    name: 'a live region is not hidden while it is empty',
    file: 'registry/kosmos/blocks/example/example.tsx',
    flagged: `
export function Notice({ message }: { message: string }) {
  return (
    <p role="alert" className="empty:hidden">
      {message}
    </p>
  );
}
`,
    message:
      'A `role="status"` or `role="alert"` renders before its text does, and never behind a condition or with `empty:hidden`, since a screen reader announces changes to a region that already exists (kosmos-style, Announcements; WCAG 4.1.3).',
    allowed: `
export function Notice({ message }: { message: string }) {
  return (
    <p role="alert" className="empty:sr-only">
      {message}
    </p>
  );
}
`,
  },
  {
    name: 'docs copy buttons go through the docs copy hook',
    file: 'components/docs/example.tsx',
    flagged: `
import { useCopyButton } from 'fumadocs-ui/utils/use-copy-button';

export function Copy({ text }: { text: string }) {
  const [copied, copy] = useCopyButton(() => navigator.clipboard.writeText(text));
  return <button onClick={copy}>{copied ? 'Copied' : 'Copy'}</button>;
}
`,
    message: 'Copy through `useDocsCopy` (`components/docs/use-docs-copy.ts`), which reports a failed copy; no `navigator.clipboard` or `useCopyButton` in components.',
    allowed: `
import { useDocsCopy } from '@/components/docs/use-docs-copy';

export function Copy({ text }: { text: string }) {
  const { status, copy } = useDocsCopy();
  return <span onClick={() => copy(() => text)}>{status}</span>;
}
`,
  },
  {
    name: 'a tooltip trigger can take focus',
    file: 'registry/kosmos/blocks/example/example.tsx',
    flagged: `
import { Tooltip, TooltipContent, TooltipTrigger } from '@/registry/kosmos/ui/tooltip';

export function Clock() {
  return (
    <Tooltip>
      <TooltipTrigger render={<time dateTime="2026-01-01" />}>9:41</TooltipTrigger>
      <TooltipContent>Started at 9:41</TooltipContent>
    </Tooltip>
  );
}
`,
    message: 'A `TooltipTrigger` renders a `Button` or a link, which a keyboard reaches; a `<time>` or `<span>` is mouse-only unless it takes `tabIndex` (kosmos-style, Tooltips; WCAG 2.1.1).',
    allowed: `
import { Tooltip, TooltipContent, TooltipTrigger } from '@/registry/kosmos/ui/tooltip';

export function Clock() {
  return (
    <Tooltip>
      <TooltipTrigger render={<time dateTime="2026-01-01" tabIndex={0} />}>9:41</TooltipTrigger>
      <TooltipContent>Started at 9:41</TooltipContent>
    </Tooltip>
  );
}
`,
  },
  {
    name: 'a number never truncates',
    file: 'registry/kosmos/ui/example.tsx',
    flagged: `
export function Value() {
  return <span className="block truncate text-display tabular-nums">$14,620</span>;
}
`,
    message: 'A number, amount or date never truncates; it takes `shrink-0`, and the text beside it takes `min-w-0` (kosmos-style, Phones).',
    allowed: `
export function Value() {
  return <span className="block shrink-0 text-display tabular-nums">$14,620</span>;
}
`,
  },
  {
    name: 'truncated text stays readable in full',
    file: 'registry/kosmos/ui/example.tsx',
    flagged: `
export function Name({ name }: { name: string }) {
  return <span className="min-w-0 truncate">{name}</span>;
}
`,
    message: 'Truncated text stays readable in full: give `truncate` or `line-clamp-*` a `title` (a string child), or list the file in `fullTextElsewhere` in the lint config with its reason (kosmos-style, Phones).',
    allowed: `
export function Name({ name }: { name: string }) {
  return <span title={name} className="min-w-0 truncate">{name}</span>;
}
`,
  },
  {
    name: 'a number in a block never truncates',
    file: 'registry/kosmos/blocks/example/example.tsx',
    flagged: `
export function Total() {
  return <span className="truncate text-title tabular-nums">$14,620</span>;
}
`,
    message: 'A number, amount or date never truncates; it takes `shrink-0`, and the text beside it takes `min-w-0` (kosmos-style, Phones).',
    allowed: `
export function Total() {
  return <span className="shrink-0 text-title tabular-nums">$14,620</span>;
}
`,
  },
  {
    name: 'truncated text in a block stays readable in full',
    file: 'registry/kosmos/blocks/example/example.tsx',
    flagged: `
export function Name({ name }: { name: string }) {
  return <span className="min-w-0 truncate">{name}</span>;
}
`,
    message: 'Truncated text stays readable in full: give `truncate` or `line-clamp-*` a `title` (a string child), or list the file in `fullTextElsewhere` in the lint config with its reason (kosmos-style, Phones).',
    allowed: `
export function Name({ name }: { name: string }) {
  return <span title={name} className="min-w-0 truncate">{name}</span>;
}
`,
  },
  {
    name: 'a block places an item with a grid column, not order',
    file: 'registry/kosmos/blocks/example/example.tsx',
    flagged: `
export function Row({ flipped }: { flipped: boolean }) {
  return <div className={flipped ? '@3xl:order-2' : undefined}>Fernhill Books</div>;
}
`,
    message: 'Place an item with `col-start-*` and `row-start-*`, not `order-*`: the visual order must match the DOM order (kosmos-style, Phones).',
    allowed: `
export function Row({ flipped }: { flipped: boolean }) {
  return <div className={flipped ? '@3xl:col-start-2' : undefined}>Fernhill Books</div>;
}
`,
  },
  {
    name: 'a chart in a block morphs on a range change',
    file: 'registry/kosmos/blocks/example/example.tsx',
    flagged: `
import { GrowthChart } from '@/registry/kosmos/ui/chart';

export function Trend({ range, data }: { range: string; data: Array<{ day: string; users: number }> }) {
  return <GrowthChart key={range} title="Users" data={data} xKey="day" />;
}
`,
    message: 'A chart morphs to a new range, it does not remount: no `key={range}` on a chart (kosmos-style, Charts: Morph, don\'t remount).',
    allowed: `
import { GrowthChart } from '@/registry/kosmos/ui/chart';

export function Trend({ data }: { data: Array<{ day: string; users: number }> }) {
  return <GrowthChart title="Users" data={data} xKey="day" />;
}
`,
  },
  {
    name: 'a change in a block is not a hue Badge',
    file: 'registry/kosmos/blocks/example/example.tsx',
    flagged: `
import { Badge } from '@/registry/kosmos/ui/badge';

export function Change({ change }: { change: number }) {
  return <Badge variant={change < 0 ? 'red' : 'green'}>{change}%</Badge>;
}
`,
    message: 'A change is a green or red triangle with the signed number (`StatCardDelta`), not a hue Badge, which marks a category (kosmos-style, Stat change).',
    allowed: `
import { StatCardDelta } from '@/registry/kosmos/ui/stat-card';

export function Change({ change }: { change: number }) {
  return <StatCardDelta value={change}>vs. last period</StatCardDelta>;
}
`,
  },
  {
    name: 'a status dot in a block is a StatusDot',
    file: 'registry/kosmos/blocks/example/example.tsx',
    flagged: `
export function Live() {
  return <span aria-hidden className="size-2 shrink-0 rounded-full bg-success" />;
}
`,
    message: 'A status is a `StatusDot` with its word (`done`, `pending`, `waiting`), not a hand-made dot (kosmos-style, Status).',
    allowed: `
import { StatusDot } from '@/registry/kosmos/ui/status';

export function Live() {
  return <StatusDot status="done">Live</StatusDot>;
}
`,
  },
  {
    name: 'a status dot in an example is a StatusDot',
    file: 'registry/kosmos/examples/example.tsx',
    flagged: `
export function Live() {
  return <span aria-hidden className="size-1.5 rounded-full bg-warning" />;
}
`,
    message: 'A status is a `StatusDot` with its word (`done`, `pending`, `waiting`), not a hand-made dot (kosmos-style, Status).',
    allowed: `
import { StatusDot } from '@/registry/kosmos/ui/status';

export function Live() {
  return <StatusDot status="waiting">Paused</StatusDot>;
}
`,
  },
  {
    name: 'a block button does something',
    file: 'registry/kosmos/blocks/example/example.tsx',
    flagged: `
import { Button } from '@/registry/kosmos/ui/button';

export function Retry() {
  return (
    <Button variant="primary" onClick={() => {}}>
      Try again
    </Button>
  );
}
`,
    message: 'A control that does nothing is not rendered: render it only when its handler or `href` is passed (kosmos-style, Buttons).',
    allowed: `
import { Button } from '@/registry/kosmos/ui/button';

export function Retry() {
  return (
    <Button variant="primary" onClick={() => location.reload()}>
      Try again
    </Button>
  );
}
`,
  },
  {
    name: 'an example button does something',
    file: 'registry/kosmos/examples/example.tsx',
    flagged: `
import { Button } from '@/registry/kosmos/ui/button';

export function Retry() {
  return (
    <Button variant="primary" onClick={() => {}}>
      Try again
    </Button>
  );
}
`,
    message: 'A control that does nothing is not rendered: render it only when its handler or `href` is passed (kosmos-style, Buttons).',
    allowed: `
import { Button } from '@/registry/kosmos/ui/button';

export function Retry() {
  return (
    <Button variant="primary" onClick={() => location.reload()}>
      Try again
    </Button>
  );
}
`,
  },
  {
    name: 'a number field in a block sets its locale',
    file: 'registry/kosmos/blocks/example/example.tsx',
    flagged: `
import { NumberField } from '@/registry/kosmos/ui/number-field';

export function Seats() {
  return <NumberField defaultValue={250} aria-label="Seats" />;
}
`,
    message: 'A `NumberField` sets `locale="en-US"`, so the server and the browser format the same number (kosmos-style, Fields).',
    allowed: `
import { NumberField } from '@/registry/kosmos/ui/number-field';

export function Seats() {
  return <NumberField defaultValue={250} aria-label="Seats" locale="en-US" />;
}
`,
  },
  {
    name: 'a number field in an example sets its locale',
    file: 'registry/kosmos/examples/example.tsx',
    flagged: `
import { NumberField } from '@/registry/kosmos/ui/number-field';

export function Seats() {
  return <NumberField defaultValue={250} aria-label="Seats" />;
}
`,
    message: 'A `NumberField` sets `locale="en-US"`, so the server and the browser format the same number (kosmos-style, Fields).',
    allowed: `
import { NumberField } from '@/registry/kosmos/ui/number-field';

export function Seats() {
  return <NumberField defaultValue={250} aria-label="Seats" locale="en-US" />;
}
`,
  },
];

const eslint = new ESLint({ cwd: process.cwd() });

async function lint(code: string, file: string) {
  const [result] = await eslint.lintText(code, { filePath: file });
  return result.messages.map((message) => message.message);
}

for (const check of codeChecks) {
  test(`${check.name}: flags the snippet that breaks it`, async () => {
    const messages = await lint(check.flagged, check.file);
    assert.ok(messages.includes(check.message), `Got:\n${messages.join('\n')}`);
  });

  test(`${check.name}: allows the snippet that follows it`, async () => {
    assert.deepEqual(await lint(check.allowed, check.file), []);
  });
}
