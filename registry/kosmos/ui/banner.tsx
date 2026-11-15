import { cva } from 'class-variance-authority';
import { CircleAlert, CircleCheck, Info, TriangleAlert } from 'lucide-react';
import type * as React from 'react';
import { cn } from '@/registry/kosmos/lib/cn';
import { Button, type ButtonProps } from '@/registry/kosmos/ui/button';

type BannerVariant = 'neutral' | 'info' | 'success' | 'warning' | 'destructive';

const bannerVariants = cva(
  [
    '@container/banner flex min-h-9 flex-wrap w-full min-w-0 items-center justify-center gap-x-2 gap-y-1 px-4 py-1.5 text-center text-small wrap-break-word',
    '[&_a:not([data-slot=banner-action])]:rounded-sm [&_a:not([data-slot=banner-action])]:font-medium [&_a:not([data-slot=banner-action])]:text-foreground [&_a:not([data-slot=banner-action])]:underline [&_a:not([data-slot=banner-action])]:decoration-foreground/40 [&_a:not([data-slot=banner-action])]:underline-offset-4 [&_a:not([data-slot=banner-action])]:hover:decoration-foreground',
    '[&_a]:focus-visible:outline-2 [&_a]:focus-visible:outline-offset-2 [&_a]:focus-visible:outline-ring',
  ],
  {
    variants: {
      variant: {
        neutral: 'border-b border-border bg-card text-card-foreground',
        info: 'bg-tint-blue text-tint-blue-foreground',
        success: 'bg-tint-green text-tint-green-foreground',
        warning: 'bg-tint-amber text-tint-amber-foreground',
        destructive: 'bg-tint-red text-tint-red-foreground',
      },
    },
    defaultVariants: { variant: 'neutral' },
  },
);

const bannerIcons: Record<BannerVariant, React.ReactNode> = {
  neutral: <Info className="text-muted-foreground" />,
  info: <Info />,
  success: <CircleCheck />,
  warning: <TriangleAlert />,
  destructive: <CircleAlert />,
};

type BannerProps = React.ComponentProps<'div'> & {
  /** `neutral` is a card. The others take the status tint of their hue: info blue, success green, warning amber, destructive red. */
  variant?: BannerVariant;
  /** Replaces the icon of the variant. Pass `null` for a banner without one. */
  icon?: React.ReactNode;
};

/**
 * A strip across the top of an app page for a state of the whole project or account that someone has to resolve: an
 * overdue invoice, a paused project, a rollback. It has a status icon, one sentence and, in `BannerAction`, the way out.
 * It cannot be dismissed, so show one at a time and leave the message to go when the state does. For a message inside the
 * content, use an Alert. Renders a plain `<div>`.
 */
function Banner({ className, variant = 'neutral', icon, children, ...props }: BannerProps) {
  const mark = icon === undefined ? bannerIcons[variant] : icon;
  return (
    <div data-slot="banner" data-variant={variant} className={cn(bannerVariants({ variant }), className)} {...props}>
      {mark ? (
        <span
          data-slot="banner-icon"
          aria-hidden
          className="flex h-5 shrink-0 items-center [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
        >
          {mark}
        </span>
      ) : null}
      {children}
    </div>
  );
}

/** The sentence. Say what is wrong and what it affects; the variant carries the severity. */
function BannerText({ className, ...props }: React.ComponentProps<'p'>) {
  return <p data-slot="banner-text" className={cn('max-w-full min-w-0 text-pretty', className)} {...props} />;
}

/** The way out: a ghost button, or a link when you pass `href`. Name it with a verb and a noun, such as "Update card". */
function BannerAction({ className, variant = 'ghost', size = 'sm', ...props }: ButtonProps) {
  return <Button data-slot="banner-action" variant={variant} size={size} className={cn('-my-0.5 text-inherit', className)} {...props} />;
}

export { Banner, BannerText, BannerAction, type BannerProps, type BannerVariant };
