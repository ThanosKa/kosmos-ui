'use client';

import { Pause, Play } from 'lucide-react';
import * as React from 'react';
import { useDrift } from '@/registry/kosmos/hooks/use-drift';
import { cn } from '@/registry/kosmos/lib/cn';
import { holdHandlers } from '@/registry/kosmos/lib/drift';
import { Avatar, AvatarFallback, AvatarImage } from '@/registry/kosmos/ui/avatar';
import { Button } from '@/registry/kosmos/ui/button';

type Testimonial = {
  /** What they said, without quotation marks. */
  quote: React.ReactNode;
  /** Who said it. Their initials stand in when there is no `avatar`. */
  name: string;
  /** Their role and where they work, such as "Head of growth, Fernhill Books". */
  role?: React.ReactNode;
  /** The URL of their photo. */
  avatar?: string;
};

// Sample data: replace it with what your customers said.
const sampleTitle = 'Teams that know what happens next';
const sampleDescription = 'Product, engineering and growth teams on what changed once their events landed in Acme.';
const sampleFeatured: Testimonial = {
  quote:
    'Acme is the one place where product, design and engineering read the same numbers. When a storm doubled our traffic for three days, the dashboards kept up and so did we.',
  name: 'Grace Whitfield',
  role: 'VP of product, Cirrus Weather',
};
const sampleTestimonials: Testimonial[] = [
  {
    quote: 'We used to wait a week for a funnel report. Now the whole team opens the same dashboard on Monday and argues about the numbers, not about where they came from.',
    name: 'Ines Duarte',
    role: 'Head of growth, Fernhill Books',
  },
  {
    quote: 'The iOS SDK took an afternoon. The first workout events showed up before the build finished uploading.',
    name: 'Marcus Bell',
    role: 'iOS lead, Brightloop Fitness',
  },
  {
    quote: 'We send close to nine million server events a month. Acme told us we had passed our quota before finance did.',
    name: 'Ruth Adeyemi',
    role: 'Data engineer, Copperline Bank',
  },
  {
    quote: 'I am not an analyst. I can still see which page sells the most beans, and that is all I wanted.',
    name: 'Owen Fitzgerald',
    role: 'Founder, Saltmarsh Coffee',
  },
  {
    quote: 'A funnel showed us that half our Android users stopped at the date picker. We fixed it in a week and bookings went up the week after.',
    name: 'Sofia Lindqvist',
    role: 'Product manager, Driftwood Travel',
  },
  {
    quote: 'Our events have names anyone can read, so nobody on the team has to ask what a chart is counting.',
    name: 'Daniel Okafor',
    role: 'Mobile engineer, Cirrus Weather',
  },
  {
    quote: 'We started on the free plan with one small site. The dashboards we built then are the ones we still read.',
    name: 'Noor Rahman',
    role: 'Developer, Pebble & Pine',
  },
  {
    quote: 'Two weeks into the trial we knew which recipes people saved and never cooked.',
    name: 'Tessa Morgan',
    role: 'Editor, Marigold Recipes',
  },
  {
    quote: 'Every scan in the warehouse lands as an event. The weekly summary is the first email I open on Monday.',
    name: 'Leila Haddad',
    role: 'Operations lead, Ironbark Logistics',
  },
];

/** How fast the wall moves, in pixels per second. */
const defaultSpeed = 28;
/** Each column's speed against `speed` (the middle one moves the other way) and where it starts, as a share of its loop. */
const columnMotion = [
  { pace: 1, start: 0 },
  { pace: -0.85, start: 0.5 },
  { pace: 1.15, start: 0.25 },
];
/** A moving column repeats its cards until it holds at least this many, so even a short one fills the wall's height. */
const leastCardsInColumn = 6;

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => Array.from(word)[0])
    .join('');
}

function Person({ testimonial, featured = false }: { testimonial: Testimonial; featured?: boolean }) {
  return (
    <div className={cn('flex min-w-0 items-center gap-3', featured && 'justify-center')}>
      <Avatar size={featured ? 'lg' : 'md'}>
        {testimonial.avatar ? <AvatarImage src={testimonial.avatar} alt="" /> : null}
        <AvatarFallback>{initials(testimonial.name)}</AvatarFallback>
      </Avatar>
      <div className="flex min-w-0 flex-col text-start wrap-break-word">
        <span className="text-body font-medium text-foreground">{testimonial.name}</span>
        {testimonial.role ? <span className="text-small text-pretty text-muted-foreground">{testimonial.role}</span> : null}
      </div>
    </div>
  );
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <figure data-slot="testimonial" className="flex flex-col gap-4 rounded-2xl border border-transparent bg-card p-5 shadow-card">
      <blockquote className="text-body text-pretty wrap-break-word text-foreground">{testimonial.quote}</blockquote>
      <figcaption>
        <Person testimonial={testimonial} />
      </figcaption>
    </figure>
  );
}

/** Deals the testimonials into `count` columns in turn, so each column reads down in the original order. */
function deal(testimonials: Testimonial[], count: number) {
  return Array.from({ length: count }, (_, column) => testimonials.filter((_, index) => index % count === column));
}

function WallColumn({ testimonials, index, speed, held, moving }: { testimonials: Testimonial[]; index: number; speed: number; held: boolean; moving: boolean }) {
  const { pace, start } = columnMotion[index % columnMotion.length];
  const { view, track, hold } = useDrift({ axis: 'y', speed: speed * pace, held, start, enabled: moving });
  const copies = moving ? Math.ceil(leastCardsInColumn / testimonials.length) : 0;
  const cards = testimonials.map((testimonial, card) => <TestimonialCard key={card} testimonial={testimonial} />);

  return (
    <div ref={view} data-slot="testimonials-column" className="min-w-0 flex-1" {...(moving ? hold : {})}>
      <div ref={track} className={cn('flex flex-col', moving && 'motion-safe:will-change-transform')}>
        {/* Each copy ends in the gap between cards, so its height is exactly one loop. */}
        <div className={cn('flex flex-col gap-4', moving && 'pb-4 motion-reduce:pb-0')}>{cards}</div>
        {Array.from({ length: copies }, (_, copy) => (
          <div key={copy} aria-hidden inert className="flex flex-col gap-4 pb-4 motion-reduce:hidden">
            {cards}
          </div>
        ))}
      </div>
    </div>
  );
}

const columnsShown: Record<number, string> = {
  1: 'flex @xl:has-[+[data-columns]]:hidden',
  2: 'hidden @xl:flex @3xl:has-[+[data-columns]]:hidden',
  3: 'hidden @3xl:flex',
};

type TestimonialsProps = Omit<React.ComponentProps<'section'>, 'title'> & {
  /** The section's heading. `null` leaves it out; then give the page a heading above the quotes. */
  title?: React.ReactNode;
  /** One line under the title. `null` leaves it out. */
  description?: React.ReactNode;
  /** One quote set large above the others. `null` leaves it out. */
  featured?: Testimonial | null;
  /** The quotes in the wall, in reading order. An empty array leaves the wall out. */
  testimonials?: Testimonial[];
  /** `wall` moves the quotes in columns that fade out at the top and bottom; `static` stands them still. */
  variant?: 'wall' | 'static';
  /** How fast the wall moves, in pixels per second. */
  speed?: number;
  /** The title is an `<h2>`; pass 3 for a section nested one level deeper. */
  headingLevel?: 2 | 3;
};

/**
 * What customers said: an optional quote set large, then the rest as cards in columns, three from 768px, two from
 * 576px and one below. As a wall the columns move up and down at slightly different paces, fade out at the top and
 * bottom, ease to a stop while a pointer or keyboard focus is on one, and pause with a button; under reduced motion,
 * or as `static`, they stand still at full height. Lays itself out by its own width.
 */
function Testimonials({
  title = sampleTitle,
  description = sampleDescription,
  featured = sampleFeatured,
  testimonials = sampleTestimonials,
  variant = 'wall',
  speed = defaultSpeed,
  headingLevel = 2,
  className,
  ...props
}: TestimonialsProps) {
  const [stopped, setStopped] = React.useState(false);
  const [onButton, setOnButton] = React.useState(false);
  const [buttonHold] = React.useState(() => holdHandlers(setOnButton));
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  const moving = variant === 'wall';
  const layouts = [1, 2, 3].filter((count) => count <= testimonials.length);

  if (!featured && layouts.length === 0) return null;

  return (
    <section data-slot="testimonials" data-variant={variant} className={cn('@container', className)} {...props}>
      <div className="flex flex-col gap-8 @2xl:gap-10">
        {title || description ? (
          <header className="flex flex-col items-center text-center">
            {title ? <Heading className="max-w-[20em] text-heading font-semibold text-balance text-foreground @2xl:text-display">{title}</Heading> : null}
            {description ? (
              <p className="mt-3 max-w-[38em] text-body text-pretty text-muted-foreground @2xl:text-lead">{description}</p>
            ) : null}
          </header>
        ) : null}
        {featured ? (
          <figure data-slot="testimonials-featured" className="mx-auto flex w-full max-w-[36em] flex-col items-center gap-6 text-center">
            <blockquote className="w-full text-lead text-balance wrap-break-word text-foreground">{featured.quote}</blockquote>
            <figcaption className="max-w-full">
              <Person testimonial={featured} featured />
            </figcaption>
          </figure>
        ) : null}
        {layouts.length > 0 ? (
          <div data-slot="testimonials-wall" className="relative">
            {/* Cards fade out at the top, and before the last 2.5rem at the bottom, so the pause button sits on a clear strip. */}
            <div
              className={cn(
                moving &&
                  'motion-safe:-mx-2 motion-safe:h-120 motion-safe:overflow-hidden motion-safe:px-2 motion-safe:mask-t-from-[calc(100%-6rem)] motion-safe:mask-b-from-[calc(100%-8.5rem)] motion-safe:mask-b-to-[calc(100%-2.5rem)] motion-safe:@2xl:h-150',
              )}
            >
              {layouts.map((count) => (
                <div key={count} data-columns={count} className={cn('items-start gap-4', columnsShown[count])}>
                  {deal(testimonials, count).map((column, index) => (
                    <WallColumn key={index} testimonials={column} index={index} speed={speed} held={stopped || onButton} moving={moving} />
                  ))}
                </div>
              ))}
            </div>
            {moving ? (
              <Button
                variant="secondary"
                size="icon-sm"
                aria-label={stopped ? 'Play testimonials' : 'Pause testimonials'}
                onClick={() => {
                  setStopped((value) => !value);
                  buttonHold.onPointerLeave();
                }}
                onPointerEnter={buttonHold.onPointerEnter}
                onPointerLeave={buttonHold.onPointerLeave}
                className="absolute end-2 bottom-2 motion-reduce:hidden"
              >
                {stopped ? <Play aria-hidden /> : <Pause aria-hidden />}
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export { Testimonials, type Testimonial, type TestimonialsProps };
