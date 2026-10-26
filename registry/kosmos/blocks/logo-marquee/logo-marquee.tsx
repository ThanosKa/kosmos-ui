'use client';

import { Activity, BookOpen, Cloud, Coffee, Landmark, Pause, Play, Sailboat, Truck } from 'lucide-react';
import * as React from 'react';
import { useDrift } from '@/registry/kosmos/hooks/use-drift';
import { cn } from '@/registry/kosmos/lib/cn';
import { Button } from '@/registry/kosmos/ui/button';

type LogoMarqueeLogo = {
  /** The name screen readers hear, and the text shown when there is no `logo`. */
  name: string;
  /** The mark, such as an `<svg>` or an `<img alt="">`. Decorative: `name` names it. */
  logo?: React.ReactNode;
  /** The brand colour the logo turns to on hover or focus, any CSS colour. Without one it turns to the text colour. */
  color?: string;
  /** Makes the logo a link, which also brings it into the keyboard's reach. */
  href?: string;
};

/** A stand-in logo: an icon beside the name. */
function sampleLogo(name: string, Icon: React.ElementType, color: string): LogoMarqueeLogo {
  return {
    name,
    color,
    logo: (
      <span className="flex items-center gap-2">
        <Icon />
        {name}
      </span>
    ),
  };
}

// Sample data: replace it with the line and the logos of your customers or your stack.
const sampleTitle = 'Used by the teams behind';
const sampleLogos: LogoMarqueeLogo[] = [
  sampleLogo('Fernhill Books', BookOpen, 'var(--tint-blue-solid)'),
  sampleLogo('Brightloop Fitness', Activity, 'var(--tint-orange-solid)'),
  sampleLogo('Copperline Bank', Landmark, 'var(--tint-green-solid)'),
  sampleLogo('Saltmarsh Coffee', Coffee, 'var(--tint-red-solid)'),
  sampleLogo('Driftwood Travel', Sailboat, 'var(--tint-teal-solid)'),
  sampleLogo('Cirrus Weather', Cloud, 'var(--tint-blue-solid)'),
  sampleLogo('Ironbark Logistics', Truck, 'var(--tint-orange-solid)'),
];

/** How fast the logos move, in pixels per second. */
const defaultSpeed = 40;

/**
 * Until the drift takes over (it needs the page live), a CSS animation moves the track by half its width, one copy, so
 * the logos move from the first paint. The server cannot measure a copy, so its length is guessed: about 200px a logo.
 */
const guessedLogoWidth = 200;
const driftKeyframes = '@keyframes kosmos-marquee-drift{to{transform:translateX(calc(-50% * var(--drift-direction,1)))}}';

/**
 * Each logo carries half the space between logos on each side, so the seam between two copies spaces like the rest.
 * An `<svg>` or `<img>` is 20px tall at its own aspect ratio, unless it sets a height class of its own.
 */
const itemClass =
  "flex min-h-8 shrink-0 items-center px-5 text-center text-title text-balance text-muted-foreground grayscale transition-[color,filter] hover:text-(--logo-color,var(--foreground)) hover:grayscale-0 focus-within:text-(--logo-color,var(--foreground)) focus-within:grayscale-0 @2xl:px-7 [&_:is(svg,img)]:w-auto [&_:is(svg,img)]:shrink-0 [&_:is(svg,img):not([class*='h-'])]:h-5";

function LogoItems({ logos, interactive }: { logos: LogoMarqueeLogo[]; interactive: boolean }) {
  return logos.map(({ name, logo, color, href }, index) => {
    const label = logo ? (
      <>
        <span aria-hidden className="flex items-center">
          {logo}
        </span>
        <span className="sr-only">{name}</span>
      </>
    ) : (
      name
    );
    return (
      <li key={index} style={color ? ({ '--logo-color': color } as React.CSSProperties) : undefined} className={itemClass}>
        {href && interactive ? (
          <a
            href={href}
            className="flex items-center rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {label}
          </a>
        ) : (
          label
        )}
      </li>
    );
  });
}

type LogoMarqueeProps = Omit<React.ComponentProps<'section'>, 'title'> & {
  /** The line above the logos, which also names their list. `null` leaves it out. */
  title?: React.ReactNode;
  /** The logos in order. */
  logos?: LogoMarqueeLogo[];
  /** `marquee` moves the logos in one row that fades out at both edges; `static` sets them in centered rows. */
  variant?: 'marquee' | 'static';
  /** How fast the marquee moves, in pixels per second. */
  speed?: number;
};

/**
 * A row of logos in grey that turn to their own colours on hover or focus: still in centered rows, or as a marquee that moves toward the start, fades out at both
 * edges, eases to a stop while a pointer or keyboard focus is on it and has a button that pauses it. Under reduced
 * motion the marquee stands still in centered rows. Lays itself out by its own width, and sets no padding around itself.
 */
function LogoMarquee({
  title = sampleTitle,
  logos = sampleLogos,
  variant = 'marquee',
  speed = defaultSpeed,
  className,
  ...props
}: LogoMarqueeProps) {
  const titleId = React.useId();
  const [stopped, setStopped] = React.useState(false);
  const marquee = variant === 'marquee';
  const { view, track, hold } = useDrift({ axis: 'x', speed, held: stopped, enabled: marquee && logos.length > 0, handoff: true });

  if (logos.length === 0) return null;

  const labelledBy = title ? titleId : undefined;

  return (
    <section
      data-slot="logo-marquee"
      data-variant={variant}
      className={cn('@container flex flex-col items-center gap-6', className)}
      {...props}
    >
      {title ? (
        <p id={titleId} className="px-4 text-center text-body text-pretty text-muted-foreground">
          {title}
        </p>
      ) : null}
      {marquee ? (
        <div className="relative w-full">
          {/* Logos fade out before the last 2.5rem of each edge, so the pause button sits on a clear strip. */}
          <div
            ref={view}
            data-slot="logo-marquee-viewport"
            {...hold}
            className="@container w-full overflow-hidden mask-x-from-[calc(100%-min(7rem,30%))] mask-x-to-[calc(100%-2.5rem)] motion-reduce:mask-none motion-reduce:px-4"
          >
            <style href="kosmos-marquee-drift" precedence="default">
              {driftKeyframes}
            </style>
            <div
              ref={track}
              data-slot="logo-marquee-track"
              style={{ '--drift-duration': `${(logos.length * guessedLogoWidth) / speed}s` } as React.CSSProperties}
              className="flex w-max motion-safe:animate-[kosmos-marquee-drift_var(--drift-duration)_linear_infinite] motion-safe:will-change-transform rtl:[--drift-direction:-1] motion-reduce:w-auto"
            >
              <ul
                aria-labelledby={labelledBy}
                className="flex min-w-[100cqw] justify-around motion-safe:*:whitespace-nowrap motion-reduce:w-full motion-reduce:min-w-0 motion-reduce:flex-wrap motion-reduce:*:max-w-full motion-reduce:justify-center motion-reduce:gap-y-4 motion-reduce:@2xl:gap-y-6"
              >
                <LogoItems logos={logos} interactive />
              </ul>
              <ul aria-hidden inert className="flex min-w-[100cqw] justify-around *:whitespace-nowrap motion-reduce:hidden">
                <LogoItems logos={logos} interactive={false} />
              </ul>
            </div>
          </div>
          <Button
            variant="secondary"
            size="icon-sm"
            aria-label={stopped ? 'Play logos' : 'Pause logos'}
            onClick={() => {
              setStopped((value) => !value);
              hold.onPointerLeave();
            }}
            onPointerEnter={hold.onPointerEnter}
            onPointerLeave={hold.onPointerLeave}
            className="absolute inset-y-0 end-2 my-auto motion-reduce:hidden"
          >
            {stopped ? <Play aria-hidden /> : <Pause aria-hidden />}
          </Button>
        </div>
      ) : (
        <ul aria-labelledby={labelledBy} className="flex w-full flex-wrap justify-center gap-y-4 px-4 *:max-w-full @2xl:gap-y-6">
          <LogoItems logos={logos} interactive />
        </ul>
      )}
    </section>
  );
}

export { LogoMarquee, type LogoMarqueeLogo, type LogoMarqueeProps };
