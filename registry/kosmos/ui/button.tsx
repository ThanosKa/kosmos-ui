import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { cva, type VariantProps } from 'class-variance-authority';
import type * as React from 'react';
import { cn } from '@/registry/kosmos/lib/cn';

const buttonVariants = cva(
  [
    'inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-transparent font-medium whitespace-nowrap [-webkit-tap-highlight-color:transparent]',
    'transition-[background-color,scale]',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
    'motion-safe:enabled:not-data-disabled:active:scale-96',
    'data-disabled:opacity-50',
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ],
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground shadow-primary hover:not-data-disabled:bg-primary/90',
        secondary: 'bg-secondary text-secondary-foreground shadow-control hover:not-data-disabled:bg-muted',
        ghost: 'bg-transparent text-foreground hover:not-data-disabled:bg-accent',
        destructive: 'bg-secondary text-destructive shadow-control hover:not-data-disabled:bg-muted',
      },
      size: {
        sm: "h-6 gap-1 px-2 text-small [&_svg:not([class*='size-'])]:size-3.5",
        md: 'h-7.5 px-3 text-body has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5',
        lg: 'h-9 px-4 text-body has-data-[icon=inline-end]:pr-3.5 has-data-[icon=inline-start]:pl-3.5',
        'icon-sm': "size-6 [&_svg:not([class*='size-'])]:size-3.5",
        icon: 'size-7.5',
        'icon-lg': 'size-9',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

type ButtonVariant = NonNullable<VariantProps<typeof buttonVariants>['variant']>;
type ButtonSize = NonNullable<VariantProps<typeof buttonVariants>['size']>;

type ButtonStyleProps = {
  /** Pass it on every Button, even for the default `primary`, so each call reads on its own. */
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
};

type ButtonAsButtonProps = Omit<ButtonPrimitive.Props, 'className'> & ButtonStyleProps & { href?: undefined };

type ButtonAsLinkProps = Omit<React.ComponentProps<'a'>, 'className' | 'href'> & ButtonStyleProps & { href: string };

type ButtonProps = ButtonAsButtonProps | ButtonAsLinkProps;

function Button(props: ButtonProps) {
  if (props.href !== undefined) {
    const { className, variant = 'primary', size = 'md', ...rest } = props;
    return (
      <a
        data-slot="button"
        data-variant={variant}
        data-size={size}
        className={cn(buttonVariants({ variant, size }), className)}
        {...rest}
      />
    );
  }
  const { className, variant = 'primary', size = 'md', ...rest } = props;
  return (
    <ButtonPrimitive
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size }), className)}
      {...rest}
    />
  );
}

export { Button, buttonVariants, type ButtonProps };
