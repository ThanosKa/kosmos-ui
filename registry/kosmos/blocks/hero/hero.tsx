import type * as React from 'react';
import { cn } from '@/registry/kosmos/lib/cn';
import { Announcement } from '@/registry/kosmos/ui/announcement';
import { Button } from '@/registry/kosmos/ui/button';
import { CodeTabs } from '@/registry/kosmos/ui/code-tabs';

// Sample data: replace it with your product's news, title, line, links and install commands.
const sampleAnnouncement = (
  <Announcement badge="New" href="/changelog">
    Funnels now break down by country
  </Announcement>
);
const sampleTitle = 'Know what every user does next';
const sampleDescription =
  'Acme collects events from your web, iOS, Android and server apps and turns them into answers your whole team can read.';
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
const sampleInstall = (
  <CodeTabs
    label="Platform"
    commands={{
      macOS: 'brew install acme',
      Linux: 'curl -fsSL https://acme.example/install.sh | sh',
      Windows: 'winget install Acme.Cli',
    }}
  />
);

type HeroProps = Omit<React.ComponentProps<'section'>, 'title'> & {
  /** A line of news above the title, an `Announcement`. `null` leaves it out. */
  announcement?: React.ReactNode;
  title?: React.ReactNode;
  /** One line under the title. `null` leaves it out. */
  description?: React.ReactNode;
  /** The links under the line: one `primary` Button at most, the rest `secondary`. `null` leaves them out. */
  actions?: React.ReactNode;
  /** The install command under the links, a `CodeTabs` with one tab per package manager or platform. `null` leaves it out. */
  install?: React.ReactNode;
  /** The title is the page's `<h1>`; pass 2 when the page already has one. */
  headingLevel?: 1 | 2;
};

/**
 * The top of a marketing page: a line of news, a title, one line, the actions and the install command, centered.
 * Lays itself out by its own width: the title grows to the hero role from a 672px-wide container. It sets no padding
 * around itself, so the page that stacks it sets the space above and below.
 */
function Hero({
  announcement = sampleAnnouncement,
  title = sampleTitle,
  description = sampleDescription,
  actions = sampleActions,
  install = sampleInstall,
  headingLevel = 1,
  className,
  ...props
}: HeroProps) {
  const Heading = headingLevel === 1 ? 'h1' : 'h2';
  return (
    <section data-slot="hero" className={cn('@container', className)} {...props}>
      <div className="flex flex-col items-center text-center">
        {announcement ? (
          <div data-slot="hero-announcement" className="mb-6 flex max-w-full justify-center">
            {announcement}
          </div>
        ) : null}
        <Heading className="max-w-[14em] text-display font-semibold text-balance wrap-break-word text-foreground @2xl:text-hero">{title}</Heading>
        {description ? (
          <p data-slot="hero-description" className="mt-4 max-w-[34em] text-body text-pretty text-muted-foreground @2xl:mt-5 @2xl:text-lead">
            {description}
          </p>
        ) : null}
        {actions ? <div className="mt-8 flex max-w-full flex-wrap justify-center gap-3">{actions}</div> : null}
        {install ? (
          <div data-slot="hero-install" className="mt-10 w-full max-w-xl text-start">
            {install}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export { Hero, type HeroProps };
