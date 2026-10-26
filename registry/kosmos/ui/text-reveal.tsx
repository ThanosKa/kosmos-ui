import type * as React from 'react';
import { cn } from '@/registry/kosmos/lib/cn';

type TextRevealProps = Omit<React.ComponentProps<'span'>, 'children'> & {
  /** The text, revealed word by word. */
  children: string;
  /** The wait between one word and the next, in milliseconds. */
  stagger?: number;
  /** The wait before the first word, in milliseconds. */
  delay?: number;
};

/**
 * Text that comes in word by word as the page first paints: each word rises a few pixels out of a blur while it fades
 * in. It is plain text in the markup, so it reads and shows without JavaScript, and it needs none: the entrance is a
 * CSS transition from the `starting` style. Under reduced motion the words only fade in, together.
 */
function TextReveal({ children, stagger = 40, delay = 0, className, ...props }: TextRevealProps) {
  const words = children.split(' ');
  return (
    <span data-slot="text-reveal" className={className} {...props}>
      {words.map((word, index) => (
        <span key={index}>
          <span
            style={{ '--reveal-delay': `${delay + index * stagger}ms` } as React.CSSProperties}
            className={cn(
              'inline-block',
              'motion-safe:transition-[opacity,filter,translate] motion-safe:duration-slow motion-safe:ease-power3-out motion-safe:delay-(--reveal-delay)',
              'motion-reduce:transition-[opacity] motion-reduce:duration-fast motion-reduce:ease-power3-out',
              'starting:opacity-0 motion-safe:starting:translate-y-1.5 motion-safe:starting:blur-sm',
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
