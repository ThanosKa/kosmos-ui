'use client';

import * as React from 'react';
import { cn } from '@/registry/kosmos/lib/cn';

type NumberTickerProps = Omit<React.ComponentProps<'span'>, 'children'> & {
  /** The number it counts up to. */
  value: number;
  /** How long the count takes, in milliseconds. */
  duration?: number;
  /** The locale the digits are grouped for. */
  locale?: string;
};

/**
 * A number that counts up from 0 to `value` the first time it scrolls into view. The final number is in the markup, so
 * it reads and shows without JavaScript, and its width is reserved by that number, so counting shifts nothing. Digits
 * keep one width (`tabular-nums`). Screen readers hear the final number once. Under reduced motion it never counts.
 */
function NumberTicker({ value, duration = 1200, locale = 'en-US', className, ...props }: NumberTickerProps) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const counter = React.useRef<HTMLSpanElement>(null);
  const text = React.useMemo(() => new Intl.NumberFormat(locale), [locale]);
  const final = text.format(value);

  React.useEffect(() => {
    const element = ref.current;
    const shown = counter.current;
    if (!element || !shown || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = element.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) return;

    let frame = 0;
    shown.textContent = text.format(0);
    let begin = 0;
    const count = (now: number) => {
      begin ||= now;
      const progress = Math.min((now - begin) / duration, 1);
      shown.textContent = text.format(Math.round(value * (1 - (1 - progress) ** 3)));
      if (progress < 1) frame = requestAnimationFrame(count);
    };
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      frame = requestAnimationFrame(count);
    });
    observer.observe(element);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      shown.textContent = final;
    };
  }, [value, duration, text, final]);

  return (
    <span ref={ref} data-slot="number-ticker" className={cn('inline-grid tabular-nums *:col-start-1 *:row-start-1', className)} {...props}>
      <span className="sr-only">{final}</span>
      <span aria-hidden className="invisible">
        {final}
      </span>
      <span ref={counter} aria-hidden className="text-end">
        {final}
      </span>
    </span>
  );
}

export { NumberTicker, type NumberTickerProps };
