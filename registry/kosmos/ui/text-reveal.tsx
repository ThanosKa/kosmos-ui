'use client';

import * as React from 'react';
import { cn } from '@/registry/kosmos/lib/cn';

const maxSpread = 1000;

type TextRevealProps = Omit<React.ComponentProps<'span'>, 'children'> & {
  /** The text, revealed word by word. */
  children: string;
  /** `mount` plays as the page first paints; `view` waits until the text first scrolls into view. */
  trigger?: 'mount' | 'view';
  /** The wait between one word and the next, in milliseconds. A long text shortens it so the last word lands within a second. */
  stagger?: number;
  /** The wait before the first word, in milliseconds. */
  delay?: number;
};

/**
 * Text that comes in word by word, once: each word rises a little out of a blur while it fades in, staggered.
 * It is plain text in the markup and visible without JavaScript. With `trigger="mount"` the entrance is a CSS transition
 * from the `starting` style and plays on the first paint. With `trigger="view"`, text below the fold waits hidden
 * until it scrolls into view and text already on screen stays put. Under reduced motion the words only fade in, together.
 */
function TextReveal({ children, trigger = 'mount', stagger = 40, delay = 0, className, ...props }: TextRevealProps) {
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

  return (
    <span
      ref={ref}
      data-slot="text-reveal"
      data-hidden={hidden ? '' : undefined}
      className={cn('group/reveal', className)}
      {...props}
    >
      {words.map((word, index) => (
        <span key={index}>
          <span
            style={{ '--reveal-delay': `${delay + index * step}ms` } as React.CSSProperties}
            className={cn(
              'inline-block',
              'motion-safe:transition-[opacity,filter,translate] motion-safe:duration-slow motion-safe:ease-power3-out motion-safe:delay-(--reveal-delay)',
              'motion-reduce:transition-[opacity] motion-reduce:duration-fast motion-reduce:ease-power3-out',
              'group-data-hidden/reveal:opacity-0 motion-safe:group-data-hidden/reveal:translate-y-[0.35em] motion-safe:group-data-hidden/reveal:blur-sm',
              trigger === 'mount' &&
                'starting:opacity-0 motion-safe:starting:translate-y-[0.35em] motion-safe:starting:blur-sm',
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
