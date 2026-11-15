'use client';

import * as React from 'react';
import { cn } from '@/registry/kosmos/lib/cn';

const maxSpread = 900;

type TextRevealProps = Omit<React.ComponentProps<'span'>, 'children'> & {
  /** The text, revealed word by word. */
  children: string;
  /** `mount` plays as the page first paints, `view` waits until the text first scrolls into view, and `scroll` ties each word to the scroll position. */
  trigger?: 'mount' | 'view' | 'scroll';
  /** The wait between one word and the next, in milliseconds. A long text shortens it so the last word starts within 900ms. Not used by `scroll`. */
  stagger?: number;
  /** The wait before the first word, in milliseconds. Not used by `scroll`. */
  delay?: number;
};

/**
 * Text that comes in word by word. With `mount` and `view` each word rises a little out of a blur while it fades in,
 * once: 500ms per word, 120ms apart, so a title of seven words is in after about 1.2s. With `mount` the entrance is a CSS
 * animation that plays on the first paint; with `view`, text below the fold waits hidden
 * until it scrolls into view and text already on screen stays put. With `scroll` every word goes from faint to full
 * as the reader scrolls the text up the screen, and back again when scrolling up. It is plain text in the markup and
 * visible without JavaScript. Under reduced motion the entrances only fade in and the scroll mode shows the whole text.
 */
function TextReveal({ children, trigger = 'mount', stagger = 120, delay = 0, className, ...props }: TextRevealProps) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const [hidden, setHidden] = React.useState(false);
  const words = children.split(' ');
  const step = Math.min(stagger, maxSpread / Math.max(words.length - 1, 1));

  React.useEffect(() => {
    if (trigger !== 'view') return;
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
  }, [trigger]);

  React.useEffect(() => {
    if (trigger !== 'scroll') return;
    const element = ref.current;
    if (!element || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const { top, height } = element.getBoundingClientRect();
      const viewport = window.innerHeight;
      const progress = (viewport * 0.9 - top) / (viewport * 0.4 + height);
      element.style.setProperty('--reveal-progress', String(Math.min(Math.max(progress, 0), 1)));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [trigger]);

  return (
    <span
      ref={ref}
      data-slot="text-reveal"
      data-hidden={hidden ? '' : undefined}
      style={{ '--reveal-words': words.length } as React.CSSProperties}
      className={cn('group/reveal [--reveal-progress:1]', className)}
      {...props}
    >
      {words.map((word, index) => (
        <span key={index}>
          <span
            style={{ '--reveal-delay': `${delay + index * step}ms`, '--reveal-index': index } as React.CSSProperties}
            className={cn(
              'inline-block',
              trigger === 'scroll'
                ? 'opacity-[calc(0.2+0.8*clamp(0,var(--reveal-progress)*var(--reveal-words)-var(--reveal-index),1))] motion-reduce:opacity-100'
                : [
                    trigger === 'mount'
                      ? 'motion-safe:animate-[reveal_var(--transition-duration-reveal)_var(--ease-power3-out)_var(--reveal-delay)_both] motion-reduce:animate-reveal-fade'
                      : [
                          'motion-safe:transition-[opacity,filter,translate] motion-safe:duration-reveal motion-safe:ease-power3-out motion-safe:delay-(--reveal-delay)',
                          'motion-reduce:transition-[opacity] motion-reduce:duration-fast motion-reduce:ease-power3-out',
                          'group-data-hidden/reveal:opacity-0 motion-safe:group-data-hidden/reveal:translate-y-[0.35em] motion-safe:group-data-hidden/reveal:blur-sm',
                        ],
                  ],
            )}
          >
            {word}
          </span>
          {index < words.length - 1 ? ' ' : null}
        </span>
      ))}
    </span>
  );
}

export { TextReveal, type TextRevealProps };
