'use client';

import { Activity, BookOpen, Cloud, Coffee, Landmark, Pause, Play, Sailboat, Truck } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/registry/kosmos/lib/cn';
import { Button } from '@/registry/kosmos/ui/button';

type LogoMarqueeLogo = {
  /** The name screen readers hear, and the text shown when there is no `logo`. */
  name: string;
  /** The mark, such as an `<svg>` or an `<img alt="">`. Decorative: `name` names it. */
  logo?: React.ReactNode;
};

/** A stand-in logo: an icon beside the name. */
function sampleLogo(name: string, Icon: React.ElementType): LogoMarqueeLogo {
  return {
    name,
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
  sampleLogo('Fernhill Books', BookOpen),
  sampleLogo('Brightloop Fitness', Activity),
  sampleLogo('Copperline Bank', Landmark),
  sampleLogo('Saltmarsh Coffee', Coffee),
  sampleLogo('Driftwood Travel', Sailboat),
  sampleLogo('Cirrus Weather', Cloud),
  sampleLogo('Ironbark Logistics', Truck),
];

/** How fast the logos move, in pixels per second. */
const defaultSpeed = 40;

/**
 * Each logo carries half the space between logos on each side, so the seam between two copies spaces like the rest.
 * An `<svg>` or `<img>` is 20px tall at its own aspect ratio, unless it sets a height class of its own.
 */
const itemClass =
  "flex min-h-8 shrink-0 items-center px-5 text-center text-title text-balance text-muted-foreground grayscale @2xl:px-7 [&_:is(svg,img)]:w-auto [&_:is(svg,img)]:shrink-0 [&_:is(svg,img):not([class*='h-'])]:h-5";

function LogoItems({ logos }: { logos: LogoMarqueeLogo[] }) {
  return logos.map(({ name, logo }, index) => (
    <li key={index} className={itemClass}>
      {logo ? (
        <>
          <span aria-hidden className="flex items-center">
            {logo}
          </span>
          <span className="sr-only">{name}</span>
        </>
      ) : (
        name
      )}
    </li>
  ));
}

/**
 * Moves `track` by the width of one of its two copies, over and over, at `speed` pixels per second. Keeps its place
 * when the width or the speed changes, holds still while `paused`, and stops when the visitor asks for reduced motion.
 */
function useMarquee(track: React.RefObject<HTMLDivElement | null>, { speed, paused, enabled }: { speed: number; paused: boolean; enabled: boolean }) {
  const animation = React.useRef<Animation>(undefined);
  const pausedRef = React.useRef(paused);
  const speedRef = React.useRef(speed);
  const retime = React.useRef<() => void>(undefined);

  React.useEffect(() => {
    pausedRef.current = paused;
    if (paused) animation.current?.pause();
    else animation.current?.play();
  }, [paused]);

  React.useEffect(() => {
    speedRef.current = speed;
    retime.current?.();
  }, [speed]);

  React.useEffect(() => {
    const element = track.current;
    const copy = element?.firstElementChild;
    if (!enabled || !element || !(copy instanceof HTMLElement)) return;
    const motion = window.matchMedia('(prefers-reduced-motion: no-preference)');
    const duration = () => (copy.offsetWidth / Math.max(speedRef.current, 1)) * 1000;

    const start = () => {
      animation.current?.cancel();
      animation.current = undefined;
      if (!motion.matches) return;
      const distance = getComputedStyle(element).direction === 'rtl' ? '50%' : '-50%';
      animation.current = element.animate([{ transform: 'translateX(0)' }, { transform: `translateX(${distance})` }], {
        duration: duration(),
        iterations: Infinity,
      });
      if (pausedRef.current) animation.current.pause();
    };

    retime.current = () => {
      const running = animation.current;
      if (!running?.effect) return;
      const progress = running.effect.getComputedTiming().progress ?? 0;
      const next = duration();
      running.effect.updateTiming({ duration: next });
      running.currentTime = progress * next;
    };
    const resize = new ResizeObserver(() => retime.current?.());

    start();
    resize.observe(copy);
    motion.addEventListener('change', start);
    return () => {
      resize.disconnect();
      motion.removeEventListener('change', start);
      retime.current = undefined;
      animation.current?.cancel();
      animation.current = undefined;
    };
  }, [track, enabled]);
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
 * A row of logos in grey: still in centered rows, or as a marquee that moves toward the start, fades out at both
 * edges, stops while the pointer is on it and has a button that pauses it. Under reduced motion the marquee stands
 * still in centered rows. Lays itself out by its own width, and sets no padding around itself.
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
  const track = React.useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = React.useState(false);
  const [stopped, setStopped] = React.useState(false);
  const marquee = variant === 'marquee';
  useMarquee(track, { speed, paused: hovered || stopped, enabled: marquee && logos.length > 0 });

  if (logos.length === 0) return null;

  const hover = (value: boolean) => (event: React.PointerEvent) => {
    if (event.pointerType !== 'touch') setHovered(value);
  };
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
        <div onPointerEnter={hover(true)} onPointerLeave={hover(false)} className="relative w-full">
          {/* Logos fade out before the last 2.5rem of each edge, so the pause button sits on a clear strip. */}
          <div
            data-slot="logo-marquee-viewport"
            className="@container w-full overflow-hidden mask-x-from-[calc(100%-min(7rem,30%))] mask-x-to-[calc(100%-2.5rem)] motion-reduce:mask-none motion-reduce:px-4"
          >
            <div ref={track} data-slot="logo-marquee-track" className="flex w-max motion-reduce:w-auto">
              <ul
                aria-labelledby={labelledBy}
                className="flex min-w-[100cqw] justify-around motion-safe:*:whitespace-nowrap motion-reduce:w-full motion-reduce:min-w-0 motion-reduce:flex-wrap motion-reduce:*:max-w-full motion-reduce:justify-center motion-reduce:gap-y-4 motion-reduce:@2xl:gap-y-6"
              >
                <LogoItems logos={logos} />
              </ul>
              <ul aria-hidden inert className="flex min-w-[100cqw] justify-around *:whitespace-nowrap motion-reduce:hidden">
                <LogoItems logos={logos} />
              </ul>
            </div>
          </div>
          <Button
            variant="secondary"
            size="icon-sm"
            aria-label={stopped ? 'Play logos' : 'Pause logos'}
            onClick={() => setStopped((value) => !value)}
            className="absolute inset-y-0 end-2 my-auto motion-reduce:hidden"
          >
            {stopped ? <Play aria-hidden /> : <Pause aria-hidden />}
          </Button>
        </div>
      ) : (
        <ul aria-labelledby={labelledBy} className="flex w-full flex-wrap justify-center gap-y-4 px-4 *:max-w-full @2xl:gap-y-6">
          <LogoItems logos={logos} />
        </ul>
      )}
    </section>
  );
}

export { LogoMarquee, type LogoMarqueeLogo, type LogoMarqueeProps };
