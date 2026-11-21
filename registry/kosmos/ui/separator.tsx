import { Separator as SeparatorPrimitive } from '@base-ui/react/separator';
import type * as React from 'react';
import { cn } from '@/registry/kosmos/lib/cn';

type SeparatorProps = SeparatorPrimitive.Props & {
  /** A short label in the middle of a horizontal line, such as "or". The line then splits around it. */
  children?: React.ReactNode;
};

/** A 1px line between groups of content. A vertical one stretches to the height of its flex row. */
function Separator({ className, orientation = 'horizontal', children, render, style, ...props }: SeparatorProps) {
  if (children != null && orientation === 'horizontal') {
    return (
      <div
        {...props}
        style={typeof style === 'function' ? undefined : style}
        data-slot="separator"
        data-orientation="horizontal"
        className={cn('flex w-full items-center gap-3 text-caption text-muted-foreground', typeof className === 'string' ? className : undefined)}
      >
        <span aria-hidden className="flex-1 border-t border-border" />
        <span data-slot="separator-label">{children}</span>
        <span aria-hidden className="flex-1 border-t border-border" />
      </div>
    );
  }
  return (
    <SeparatorPrimitive
      data-slot="separator"
      orientation={orientation}
      render={render}
      style={style}
      className={cn(
        'shrink-0 border-border',
        'data-[orientation=horizontal]:w-full data-[orientation=horizontal]:border-t',
        'data-[orientation=vertical]:self-stretch data-[orientation=vertical]:border-s',
        className,
      )}
      {...props}
    />
  );
}

export { Separator, type SeparatorProps };
