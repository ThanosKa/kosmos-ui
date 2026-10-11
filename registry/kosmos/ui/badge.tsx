import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/registry/kosmos/lib/cn';

const neutral = 'bg-secondary text-secondary-foreground shadow-control [a&]:hover:bg-muted';
/** The status looks: the neutral pill plus a dot, drawn by `::before` (sized in the base, shown here). */
const withDot = 'ps-1.5 before:content-[""]';

const badgeVariants = cva(
  [
    'inline-flex h-5 w-fit max-w-full shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-2 text-caption font-medium whitespace-nowrap tabular-nums',
    'transition-[background-color]',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3",
    'before:size-1.5 before:shrink-0 before:rounded-full before:content-none',
  ],
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground shadow-primary [a&]:hover:bg-primary/90',
        secondary: neutral,
        success: `${neutral} ${withDot} before:bg-success`,
        warning: `${neutral} ${withDot} before:bg-warning`,
        destructive: `${neutral} ${withDot} before:bg-destructive`,
      },
    },
    defaultVariants: {
      variant: 'secondary',
    },
  },
);

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>['variant']>;

type BadgeProps = useRender.ComponentProps<'span'> & {
  /** `success`, `warning` and `destructive` add a colored dot; the label carries the meaning. */
  variant?: BadgeVariant;
};

function Badge({ className, variant = 'secondary', render, ...props }: BadgeProps) {
  return useRender({
    defaultTagName: 'span',
    render,
    props: mergeProps<'span'>({ className: cn(badgeVariants({ variant }), className) }, props),
    state: { slot: 'badge', variant },
  });
}

export { Badge, badgeVariants, type BadgeProps };
