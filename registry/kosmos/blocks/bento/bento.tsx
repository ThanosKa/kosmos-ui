import { Globe, Server, Smartphone } from 'lucide-react';
import type * as React from 'react';
import { cn } from '@/registry/kosmos/lib/cn';
import { Field, FieldContent, FieldDescription, FieldLabel } from '@/registry/kosmos/ui/field';
import { Meter, MeterBar, MeterLabel, MeterValue } from '@/registry/kosmos/ui/meter';
import { Switch } from '@/registry/kosmos/ui/switch';

type BentoItem = {
  /** A stable key for the tile. */
  id: string;
  /** The tile's name, an `<h3>` under the section title. */
  title: React.ReactNode;
  /** One line under the title. */
  description: React.ReactNode;
  /** What the tile shows above its caption: a piece of your product, live. */
  visual: React.ReactNode;
  /** `wide` takes two of the three columns. */
  size?: 'default' | 'wide';
};

// Sample data: replace it with your product's title, line and tiles.
const sampleTitle = 'From the first event to the answer';
const sampleDescription = 'Acme collects your events, joins them to your users and keeps the numbers your team asks about ready to read.';

const fragment = 'w-full max-w-sm rounded-xl border border-transparent bg-card shadow-card';

const sampleEvents = [
  { name: 'signup_completed', project: 'Fernhill Books', time: 'now' },
  { name: 'checkout_started', project: 'Brightloop Fitness', time: '2s ago' },
  { name: 'trial_converted', project: 'Copperline Bank', time: '5s ago' },
  { name: 'page_viewed', project: 'Cirrus Weather', time: '9s ago' },
];

const sampleFunnel = [
  { step: 'Viewed pricing', value: 100 },
  { step: 'Started a trial', value: 38 },
  { step: 'Paid', value: 12 },
];

const samplePlatforms = [
  { name: 'Web', icon: Globe, detail: 'Script tag or npm' },
  { name: 'iOS', icon: Smartphone, detail: 'Swift package' },
  { name: 'Android', icon: Smartphone, detail: 'Gradle' },
  { name: 'Server', icon: Server, detail: 'Node, Go, Python' },
];

const sampleAlerts = [
  { id: 'signups', label: 'Signups drop below 40 a day', description: 'Checked every hour', on: true },
  { id: 'errors', label: 'Error events pass 2%', description: 'Checked every 5 minutes', on: true },
  { id: 'summary', label: 'Weekly summary', description: 'Sent to the team every Monday', on: false },
];

const sampleItems: BentoItem[] = [
  {
    id: 'events',
    title: 'Live events',
    description: 'Every event from every project, a second after it happens.',
    size: 'wide',
    visual: (
      <ul className={cn(fragment, '@container max-w-md divide-y divide-border')}>
        {sampleEvents.map((event) => (
          <li key={event.name} className="flex min-w-0 items-center gap-3 px-4 py-2.5 text-small">
            <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-success" />
            <span className="min-w-0 truncate font-mono text-foreground">{event.name}</span>
            {/* The project gives way first and steps aside in a narrow tile, so the event name keeps its room. */}
            <span className="ms-auto hidden min-w-0 shrink-4 truncate text-muted-foreground @xs:inline">{event.project}</span>
            <span className="w-12 shrink-0 text-end text-muted-foreground tabular-nums">{event.time}</span>
          </li>
        ))}
      </ul>
    ),
  },
  {
    id: 'funnels',
    title: 'Funnels',
    description: 'See the step where people leave.',
    visual: (
      <div className={cn(fragment, 'flex flex-col gap-4 p-4')}>
        {sampleFunnel.map((step) => (
          <Meter key={step.step} value={step.value}>
            <MeterLabel>{step.step}</MeterLabel>
            <MeterValue />
            <MeterBar />
          </Meter>
        ))}
      </div>
    ),
  },
  {
    id: 'platforms',
    title: 'Every platform',
    description: 'One SDK each for web, iOS, Android and your servers.',
    visual: (
      <ul className={cn(fragment, 'divide-y divide-border')}>
        {samplePlatforms.map((platform) => (
          <li key={platform.name} className="flex items-center gap-2.5 px-4 py-2.5 text-body">
            <platform.icon aria-hidden className="size-4 shrink-0 text-muted-foreground" />
            <span className="font-medium text-foreground">{platform.name}</span>
            <span className="ms-auto truncate text-small text-muted-foreground">{platform.detail}</span>
          </li>
        ))}
      </ul>
    ),
  },
  {
    id: 'alerts',
    title: 'Alerts',
    description: 'Hear about a number when it moves, not when someone checks.',
    size: 'wide',
    visual: (
      <div className={cn(fragment, 'max-w-md divide-y divide-border px-4')}>
        {sampleAlerts.map((alert) => (
          <Field key={alert.id} name={alert.id} orientation="horizontal" className="py-3">
            <FieldContent>
              <FieldLabel>{alert.label}</FieldLabel>
              <FieldDescription>{alert.description}</FieldDescription>
            </FieldContent>
            <Switch defaultChecked={alert.on} />
          </Field>
        ))}
      </div>
    ),
  },
];

type BentoProps = Omit<React.ComponentProps<'section'>, 'title'> & {
  /** The section's heading. `null` leaves it out; then give the page a heading above the tiles. */
  title?: React.ReactNode;
  /** One line under the title. `null` leaves it out. */
  description?: React.ReactNode;
  /** The tiles, in reading order. */
  items?: BentoItem[];
  /** The title is an `<h2>` and the tile titles `<h3>`; pass 3 for a section nested one level deeper. */
  headingLevel?: 2 | 3;
};

/**
 * A grid of tiles, each a live piece of your product above one line of caption. Lays itself out by its own width:
 * one column, two from 576px, three from 896px, where a `wide` tile takes two. With two columns a lone last tile takes
 * the whole row, so no gap is left.
 */
function Bento({ title = sampleTitle, description = sampleDescription, items = sampleItems, headingLevel = 2, className, ...props }: BentoProps) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  const TileHeading = headingLevel === 2 ? 'h3' : 'h4';
  return (
    <section data-slot="bento" className={cn('@container flex flex-col gap-8 @2xl:gap-10', className)} {...props}>
      {title || description ? (
        <header className="flex flex-col items-center text-center">
          {title ? <Heading className="max-w-[20em] text-heading font-semibold text-balance text-foreground @2xl:text-display">{title}</Heading> : null}
          {description ? (
            <p data-slot="bento-description" className="mt-3 max-w-[38em] text-body text-pretty text-muted-foreground @2xl:text-lead">
              {description}
            </p>
          ) : null}
        </header>
      ) : null}
      <ul role="list" className="grid grid-cols-1 gap-4 @xl:grid-cols-2 @4xl:grid-cols-3">
        {items.map((item) => (
          <li
            key={item.id}
            data-slot="bento-item"
            data-size={item.size ?? 'default'}
            className={cn(
              'flex min-w-0 flex-col rounded-2xl border border-transparent bg-card p-2 shadow-card',
              '@xl:@max-4xl:last:odd:col-span-2',
              item.size === 'wide' && '@4xl:col-span-2',
            )}
          >
            <div
              data-slot="bento-item-visual"
              className="flex min-h-40 flex-1 items-center justify-center overflow-hidden rounded-md border border-transparent bg-muted p-4 shadow-inset @xl:min-h-56 @xl:p-6"
            >
              {item.visual}
            </div>
            <div className="flex flex-col gap-1 px-3 pt-4 pb-3">
              <TileHeading className="text-title text-foreground">{item.title}</TileHeading>
              <p data-slot="bento-item-description" className="text-body text-pretty text-muted-foreground">
                {item.description}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export { Bento, type BentoItem, type BentoProps };
