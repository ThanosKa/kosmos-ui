'use client';

import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import type * as React from 'react';
import { cn } from '@/registry/kosmos/lib/cn';

/**
 * A recessed tray that holds one section of a dashboard: the header and the footer sit on the tray, the content on a
 * raised card inside it. Renders a `<div>`.
 */
function Panel({ className, render, ...props }: useRender.ComponentProps<'div'>) {
  return useRender({
    defaultTagName: 'div',
    render,
    props: mergeProps<'div'>(
      {
        className: cn(
          '@container/panel flex min-w-0 flex-col rounded-2xl border border-transparent bg-muted p-1 text-foreground shadow-inset',
          className,
        ),
      },
      props,
    ),
    state: { slot: 'panel' },
  });
}

/** The title and description, with the action beside them from a 448px panel and under them below that. */
function PanelHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="panel-header"
      className={cn('grid grid-cols-1 items-center gap-x-3 px-4 pt-2 pb-2.5 @md/panel:grid-cols-[minmax(min(8rem,100%),1fr)_auto]', className)}
      {...props}
    />
  );
}

/** Renders an `<h2>`. Pass `render={<h3 />}` for the level that fits the page. A long title truncates. */
function PanelTitle({ className, render, ...props }: useRender.ComponentProps<'h2'>) {
  return useRender({
    defaultTagName: 'h2',
    render,
    props: mergeProps<'h2'>({ className: cn('col-start-1 min-w-0 truncate text-body font-medium text-foreground', className) }, props),
    state: { slot: 'panel-title' },
  });
}

/** What the panel covers ("By visitors"), in muted text under the title. A long description truncates. */
function PanelDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot="panel-description"
      className={cn('col-start-1 min-w-0 truncate text-small text-muted-foreground', className)}
      {...props}
    />
  );
}

/** The controls for the content: a range switch, a search field, a button. They wrap when they run out of room. */
function PanelAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="panel-action"
      className={cn(
        'mt-2 flex min-w-0 flex-wrap items-center gap-1.5',
        '@md/panel:col-start-2 @md/panel:row-span-2 @md/panel:row-start-1 @md/panel:mt-0 @md/panel:justify-end',
        className,
      )}
      {...props}
    />
  );
}

/**
 * The raised card that holds the content: a table, a list or a chart. It sets no padding, so a table or a divided list
 * runs to its edges; give other content its own.
 */
function PanelContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="panel-content"
      className={cn(
        'min-w-0 flex-1 rounded-[calc(var(--radius-2xl)-4px)] border border-transparent bg-card text-card-foreground shadow-card',
        className,
      )}
      {...props}
    />
  );
}

/**
 * A row on the tray under the content, for pagination or a full-width button. A button alone in it runs edge to edge,
 * as far from the card as the card is from the tray.
 */
function PanelFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="panel-footer"
      className={cn(
        'flex min-w-0 items-center gap-2 px-4 pt-1.5 pb-0.5',
        'has-[>[data-slot=button]:only-child]:px-0 has-[>[data-slot=button]:only-child]:pt-1 has-[>[data-slot=button]:only-child]:pb-0',
        className,
      )}
      {...props}
    />
  );
}

export { Panel, PanelHeader, PanelTitle, PanelDescription, PanelAction, PanelContent, PanelFooter };
