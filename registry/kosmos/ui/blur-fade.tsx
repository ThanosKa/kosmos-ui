'use client';

import * as React from 'react';
import { cn } from '@/registry/kosmos/lib/cn';

type BlurFadeProps = React.ComponentProps<'div'> & {
  /** The wait before it comes in once it is on screen, in milliseconds. */
  delay?: number;
};

/**
 * Content that comes in the first time it scrolls into view: it rises a few pixels out of a blur while it fades in, once.
 * It is in the markup and visible without JavaScript. Once the page is live, content that is below the fold waits
 * hidden and content already on screen stays put, so nothing flashes. It reserves its space, so nothing shifts.
 * Under reduced motion it only fades.
 */
function BlurFade({ delay = 0, className, style, ...props }: BlurFadeProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [hidden, setHidden] = React.useState(false);

  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) return;
    setHidden(true);
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setHidden(false);
      observer.disconnect();
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-slot="blur-fade"
      data-hidden={hidden ? '' : undefined}
      style={{ '--fade-delay': `${delay}ms`, ...style } as React.CSSProperties}
      className={cn(
        'motion-safe:transition-[opacity,filter,translate] motion-safe:duration-slow motion-safe:ease-power3-out motion-safe:delay-(--fade-delay)',
        'motion-reduce:transition-[opacity] motion-reduce:duration-fast motion-reduce:ease-power3-out',
        'data-hidden:opacity-0 motion-safe:data-hidden:translate-y-2 motion-safe:data-hidden:blur-sm',
        className,
      )}
      {...props}
    />
  );
}

export { BlurFade, type BlurFadeProps };
