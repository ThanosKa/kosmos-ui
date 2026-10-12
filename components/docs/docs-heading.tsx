'use client';

import { Check, Link as LinkIcon } from 'lucide-react';
import { useId, type ComponentProps } from 'react';
import { useCopyButton } from 'fumadocs-ui/utils/use-copy-button';
import { cn } from '@/registry/kosmos/lib/cn';
import { Button } from '@/registry/kosmos/ui/button';

type DocsHeadingProps = ComponentProps<'h2'> & { as: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' };

/**
 * A docs heading that links to itself, with a button that copies that link. The button shows on hover and focus,
 * and always on touch screens, which have no hover. The heading is named by its text alone, not the button.
 */
export function DocsHeading({ as: Tag, id, className, children, ...props }: DocsHeadingProps) {
  const labelId = useId();
  const [copied, copy] = useCopyButton(() => {
    const url = new URL(window.location.href);
    url.hash = id!;
    return navigator.clipboard.writeText(url.href);
  });

  if (!id) {
    return (
      <Tag className={className} {...props}>
        {children}
      </Tag>
    );
  }

  return (
    <Tag id={id} aria-labelledby={labelId} className={cn('group/heading flex items-center gap-1.5', className)} {...props}>
      <a
        id={labelId}
        data-card=""
        href={`#${id}`}
        className="rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        {children}
      </a>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Copy link to section"
        onClick={copy}
        className={cn(
          'not-prose shrink-0 text-muted-foreground opacity-0 transition-[opacity,background-color,scale]',
          'group-hover/heading:opacity-100 focus-visible:opacity-100 pointer-coarse:opacity-100',
          copied && 'opacity-100',
        )}
      >
        {copied ? <Check /> : <LinkIcon />}
      </Button>
      <span role="status" className="sr-only">
        {copied ? 'Link copied' : ''}
      </span>
    </Tag>
  );
}
