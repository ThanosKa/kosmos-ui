import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import { cva } from 'class-variance-authority';
import { CircleAlert, CircleCheck, Info, TriangleAlert } from 'lucide-react';
import type * as React from 'react';
import { cn } from '@/registry/kosmos/lib/cn';

type AlertVariant = 'neutral' | 'info' | 'success' | 'warning' | 'destructive';

const alertVariants = cva(
  [
    '@container/alert flex w-full min-w-0 gap-2.5 rounded-xl border p-3 text-body wrap-break-word',
    '[&_a]:rounded-sm [&_a]:font-medium [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:decoration-2',
    '[&_a]:focus-visible:outline-2 [&_a]:focus-visible:outline-offset-2 [&_a]:focus-visible:outline-ring',
  ],
  {
    variants: {
      variant: {
        neutral:
          'border-transparent bg-card text-card-foreground shadow-card [&_[data-slot=alert-description]]:text-muted-foreground [&_a]:text-foreground',
        info: 'border-tint-blue-border bg-tint-blue text-tint-blue-foreground [&_a]:text-tint-blue-link',
        success: 'border-tint-green-border bg-tint-green text-tint-green-foreground [&_a]:text-tint-green-link',
        warning: 'border-tint-orange-border bg-tint-orange text-tint-orange-foreground [&_a]:text-tint-orange-link',
        destructive: 'border-tint-red-border bg-tint-red text-tint-red-foreground [&_a]:text-tint-red-link',
      },
    },
    defaultVariants: { variant: 'neutral' },
  },
);

const alertIcons: Record<AlertVariant, React.ReactNode> = {
  neutral: <Info className="text-muted-foreground" />,
  info: <Info />,
  success: <CircleCheck />,
  warning: <TriangleAlert />,
  destructive: <CircleAlert />,
};

type AlertProps = React.ComponentProps<'div'> & {
  /** `neutral` is a card. The others take the status tint of their hue: info blue, success green, warning orange, destructive red. */
  variant?: AlertVariant;
  /** Replaces the icon of the variant. Pass `null` for an alert without one. */
  icon?: React.ReactNode;
};

/**
 * A message that stays on the page: a note, a result, a risk or an error, with its icon. Renders a plain
 * `<div>`; give it `role="alert"` when it appears because something just failed, so screen readers say it.
 */
function Alert({ className, variant = 'neutral', icon, children, ...props }: AlertProps) {
  const mark = icon === undefined ? alertIcons[variant] : icon;
  return (
    <div data-slot="alert" data-variant={variant} className={cn(alertVariants({ variant }), className)} {...props}>
      {mark ? (
        <span
          data-slot="alert-icon"
          aria-hidden
          className="flex h-5 shrink-0 items-center [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
        >
          {mark}
        </span>
      ) : null}
      <div className="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)] content-start gap-y-0.5 @md/alert:has-[>[data-slot=alert-action]]:grid-cols-[minmax(0,1fr)_auto]">
        {children}
      </div>
    </div>
  );
}

/** Renders a `<div>`. Pass `render={<h2 />}` (the level that fits the page) when the alert heads a section. */
function AlertTitle({ className, render, ...props }: useRender.ComponentProps<'div'>) {
  return useRender({
    defaultTagName: 'div',
    render,
    props: mergeProps<'div'>({ className: cn('col-start-1 font-medium text-pretty', className) }, props),
    state: { slot: 'alert-title' },
  });
}

/** The text under the title. Links in it take the alert's link color and an underline. */
function AlertDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        'col-start-1 text-small text-pretty [&_p]:not-last:mb-2',
        className,
      )}
      {...props}
    />
  );
}

/** Buttons for the alert: under the text in a narrow alert, beside it from 448px. */
function AlertAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-action"
      className={cn(
        'col-start-1 mt-2 flex flex-wrap items-center gap-2',
        '@md/alert:col-start-2 @md/alert:row-span-2 @md/alert:row-start-1 @md/alert:mt-0 @md/alert:ms-4 @md/alert:self-center',
        className,
      )}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription, AlertAction, type AlertProps, type AlertVariant };
