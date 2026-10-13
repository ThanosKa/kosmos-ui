'use client';

import { Check, Copy } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/registry/kosmos/lib/cn';
import { Button } from '@/registry/kosmos/ui/button';

// Sample data: replace it with your product's title, line, links and command.
const sampleTitle = 'Know what every user does next';
const sampleDescription =
  'Acme collects events from your web, iOS, Android and server apps and turns them into answers your whole team can read.';
const sampleCommand = 'curl -fsSL https://acme.example/install.sh | sh';
const sampleActions = (
  <>
    <Button variant="primary" size="lg" href="/signup">
      Start for free
    </Button>
    <Button variant="secondary" size="lg" href="/demo">
      Book a demo
    </Button>
  </>
);

/** How long the copy button shows its check mark. */
const copiedFor = 2000;

function useCopy(text: string) {
  const [copied, setCopied] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined);
  React.useEffect(() => () => clearTimeout(timer.current), []);
  const copy = React.useCallback(() => {
    navigator.clipboard.writeText(text).then(
      () => {
        setCopied(true);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setCopied(false), copiedFor);
      },
      () => setCopied(false),
    );
  }, [text]);
  return [copied, copy] as const;
}

/** Lets a long command wrap after each `/` and `=` of a URL as well as at its spaces. */
function withBreaks(command: string) {
  return command.split(/(?<=[/=])/).map((part, index) => (
    <React.Fragment key={index}>
      {index > 0 ? <wbr /> : null}
      {part}
    </React.Fragment>
  ));
}

/** The install command in a well, with a button that copies it. */
function HeroCommand({ command }: { command: string }) {
  const [copied, copy] = useCopy(command);
  return (
    <div
      data-slot="hero-command"
      className="flex min-h-9 max-w-full min-w-0 items-center gap-2 rounded-lg border border-transparent bg-muted py-0.5 ps-3 pe-0.5 shadow-inset"
    >
      {/* A command too long for the well wraps instead of cutting off, so all of it stays readable. */}
      <code className="min-w-0 py-1.5 text-start font-mono text-small wrap-break-word text-muted-foreground">
        <span aria-hidden className="select-none">
          ${' '}
        </span>
        <span className="text-foreground">{withBreaks(command)}</span>
      </code>
      <Button variant="ghost" size="icon" aria-label={`Copy install command: ${command}`} onClick={copy} className="rounded-md">
        {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
      </Button>
      <span role="status" className="sr-only">
        {copied ? 'Install command copied' : ''}
      </span>
    </div>
  );
}

type HeroProps = Omit<React.ComponentProps<'section'>, 'title'> & {
  title?: React.ReactNode;
  /** One line under the title. */
  description?: React.ReactNode;
  /** The links under the line: one `primary` Button at most, the rest `secondary`. `null` leaves them out. */
  actions?: React.ReactNode;
  /** A command to copy, such as the install line. `null` leaves it out. */
  command?: string | null;
  /** The title is the page's `<h1>`; pass 2 when the page already has one. */
  headingLevel?: 1 | 2;
};

/**
 * The top of a marketing page: a title, one line, the actions and a command to copy, centered. Lays itself out by
 * its own width: the title grows to the hero role from a 672px-wide container.
 */
function Hero({
  title = sampleTitle,
  description = sampleDescription,
  actions = sampleActions,
  command = sampleCommand,
  headingLevel = 1,
  className,
  ...props
}: HeroProps) {
  const Heading = headingLevel === 1 ? 'h1' : 'h2';
  return (
    <section
      data-slot="hero"
      className={cn('@container flex flex-col items-center px-4 py-14 text-center @2xl:px-6 @2xl:py-24', className)}
      {...props}
    >
      <Heading className="max-w-[14em] text-display font-semibold text-balance text-foreground @2xl:text-hero">{title}</Heading>
      {description ? (
        <p data-slot="hero-description" className="mt-4 max-w-[34em] text-lead text-pretty text-muted-foreground @2xl:mt-5">
          {description}
        </p>
      ) : null}
      {actions ? <div className="mt-8 flex flex-wrap justify-center gap-3">{actions}</div> : null}
      {command ? (
        <div className="mt-6 flex max-w-full justify-center">
          <HeroCommand command={command} />
        </div>
      ) : null}
    </section>
  );
}

export { Hero, type HeroProps };
