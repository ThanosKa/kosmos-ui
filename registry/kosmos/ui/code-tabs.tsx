'use client';

import type { Tabs as TabsPrimitive } from '@base-ui/react/tabs';
import { Check, Copy } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/registry/kosmos/lib/cn';
import { Button } from '@/registry/kosmos/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/registry/kosmos/ui/tabs';

/** How long the copy button shows its check mark. */
const copiedFor = 2000;

type CopyResult = 'idle' | 'copied' | 'failed';

const copyMessages: Record<CopyResult, string> = {
  idle: '',
  copied: 'Command copied',
  failed: 'Unable to copy. The command is selected, so copy it with your keyboard.',
};

/**
 * Copies a command and keeps the result for that command only, so switching tabs clears it. When the browser refuses,
 * it selects the command, so it can be copied by hand.
 */
function useCopyCommand(command: string, commandRef: React.RefObject<HTMLElement | null>) {
  const [last, setLast] = React.useState<{ command: string; result: CopyResult } | null>(null);
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined);
  React.useEffect(() => () => clearTimeout(timer.current), []);
  const copy = () => {
    clearTimeout(timer.current);
    setLast(null);
    // `navigator.clipboard` is undefined on a page served over plain http; inside `then` that throw becomes a refusal.
    Promise.resolve()
      .then(() => navigator.clipboard.writeText(command))
      .then(
        () => {
          setLast({ command, result: 'copied' });
          timer.current = setTimeout(() => setLast(null), copiedFor);
        },
        () => {
          if (commandRef.current) window.getSelection()?.selectAllChildren(commandRef.current);
          setLast({ command, result: 'failed' });
        },
      );
  };
  return [last?.command === command ? last.result : 'idle', copy] as const;
}

/** Lets a long command wrap after each `/` and `=` of a URL as well as at its spaces. */
function withBreaks(command: string) {
  return command.split(/(?<==)|(?<=\/)(?!\/)/).map((part, index) => (
    <React.Fragment key={index}>
      {index > 0 ? <wbr /> : null}
      {part}
    </React.Fragment>
  ));
}

type CodeTabsProps<Tab extends string> = Omit<TabsPrimitive.Root.Props, 'value' | 'defaultValue' | 'onValueChange' | 'orientation' | 'children'> & {
  /** One tab per key, in order: the key is the tab's label and the value the command it shows. */
  commands: Record<Tab, string>;
  /** The open tab, for a choice you keep yourself, such as the visitor's package manager. */
  value?: Tab;
  /** The tab open at first when `value` is not set. The first key by default. */
  defaultValue?: Tab;
  onValueChange?: (value: Tab) => void;
  /** The name of the tab list for screen readers. */
  label?: string;
  /** Shown under the command in every tab, such as a note or what the command prints. Not copied. */
  children?: React.ReactNode;
};

/**
 * Commands in tabs, one per package manager or platform: each tab shows its command in a well with a button that
 * copies it. Screen readers hear "Command copied" once it is on the clipboard. Long commands wrap instead of scrolling.
 */
function CodeTabs<Tab extends string>({
  commands,
  value,
  defaultValue,
  onValueChange,
  label = 'Package manager',
  className,
  children,
  ...props
}: CodeTabsProps<Tab>) {
  const tabs = Object.keys(commands) as Tab[];
  const [uncontrolled, setUncontrolled] = React.useState<Tab | undefined>(defaultValue);
  const requested = value ?? uncontrolled;
  const open = requested !== undefined && tabs.includes(requested) ? requested : tabs[0];
  const commandRef = React.useRef<HTMLSpanElement>(null);
  const [result, copy] = useCopyCommand(commands[open] ?? '', commandRef);
  if (tabs.length === 0) return null;
  return (
    <Tabs
      data-slot="code-tabs"
      value={open}
      onValueChange={(next: Tab) => {
        setUncontrolled(next);
        onValueChange?.(next);
      }}
      className={cn('min-w-0 gap-3', className)}
      {...props}
    >
      <TabsList aria-label={label}>
        {tabs.map((tab) => (
          <TabsTrigger key={tab} value={tab}>
            {tab}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        // The copy button inside is the panel's tab stop, so the panel itself takes no focus.
        <TabsContent key={tab} value={tab} tabIndex={-1} className="flex flex-col gap-2">
          <div
            data-slot="code-tabs-command"
            dir="ltr"
            className="flex min-h-9 min-w-0 items-center gap-2 rounded-lg border border-transparent bg-muted py-0.5 ps-3 pe-0.5 shadow-inset"
          >
            {/* A wrapped line starts under the command, not under the prompt, so it never reads as a second command. */}
            <code
              className="min-w-0 flex-1 py-1.5 ps-[2ch] -indent-[2ch] text-start font-mono text-small wrap-break-word text-muted-foreground"
            >
              <span aria-hidden className="select-none">
                ${' '}
              </span>
              <span ref={tab === open ? commandRef : undefined} className="text-foreground">
                {withBreaks(commands[tab])}
              </span>
            </code>
            <Button variant="ghost" size="icon" aria-label={`Copy command: ${commands[tab]}`} onClick={copy} className="rounded-md">
              {result === 'copied' ? <Check aria-hidden /> : <Copy aria-hidden />}
            </Button>
          </div>
          {children != null ? <div className="min-w-0 text-small text-muted-foreground">{children}</div> : null}
        </TabsContent>
      ))}
      <span role="status" className="sr-only">
        {copyMessages[result]}
      </span>
    </Tabs>
  );
}

export { CodeTabs, type CodeTabsProps };
