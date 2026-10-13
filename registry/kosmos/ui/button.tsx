import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { cva, type VariantProps } from 'class-variance-authority';
import type * as React from 'react';
import { cn } from '@/registry/kosmos/lib/cn';

/** Standalone buttons scale to 0.96 while pressed. The `item` variant, repeated in dense rows, changes background only. */
const pressScale = 'motion-safe:not-disabled:not-data-disabled:active:scale-96';

const quietIcon = "[&_svg:not([class*='text-'])]:text-muted-foreground";

const variants = {
  primary: [pressScale, 'bg-primary text-primary-foreground shadow-primary hover:not-data-disabled:bg-primary/90'],
  secondary: [pressScale, quietIcon, 'bg-secondary text-secondary-foreground shadow-control hover:not-data-disabled:bg-muted'],
  ghost: [pressScale, quietIcon, 'bg-transparent text-foreground hover:not-data-disabled:bg-accent'],
  destructive: [pressScale, 'bg-secondary text-destructive shadow-control hover:not-data-disabled:bg-muted'],
  // The ghost look without the press scale, for buttons repeated in dense rows: nav and menu items, table row actions, sortable headers.
  item: 'bg-transparent text-foreground hover:not-data-disabled:bg-accent',
};

const sizes = {
  sm: "h-6 gap-1 px-2 text-small has-data-[icon=inline-end]:pe-1.5 has-data-[icon=inline-start]:ps-1.5 [&_svg:not([class*='size-'])]:size-3",
  md: 'h-7.5 px-2.5 text-body has-data-[icon=inline-end]:pe-2 has-data-[icon=inline-start]:ps-2',
  lg: "h-9 px-3.5 text-body has-data-[icon=inline-end]:pe-3 has-data-[icon=inline-start]:ps-3 [&_svg:not([class*='size-'])]:size-4",
  'icon-sm': "size-6 [&_svg:not([class*='size-'])]:size-3",
  icon: 'size-7.5',
  'icon-lg': "size-9 [&_svg:not([class*='size-'])]:size-4",
};

/** shadcn's names, so shadcn components keep working after `shadcn add -o` swaps in this Button. Kosmos code uses the Kosmos names. */
const variantAliases: Record<string, keyof typeof variants> = { default: 'primary', outline: 'secondary' };
const sizeAliases: Record<string, keyof typeof sizes> = { default: 'md', xs: 'sm', 'icon-xs': 'icon-sm' };

const buttonVariants = cva(
  [
    'inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-transparent font-medium whitespace-nowrap [-webkit-tap-highlight-color:transparent]',
    'transition-[background-color,scale]',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
    'data-disabled:opacity-50',
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
  ],
  {
    variants: {
      variant: {
        ...variants,
        default: variants[variantAliases.default],
        outline: variants[variantAliases.outline],
        // shadcn's text link: ink text underlined on hover, with no press scale because it sits inline with content.
        link: 'bg-transparent text-foreground underline-offset-4 hover:not-data-disabled:underline',
      },
      size: {
        ...sizes,
        default: sizes[sizeAliases.default],
        xs: sizes[sizeAliases.xs],
        'icon-xs': sizes[sizeAliases['icon-xs']],
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

function buttonProps({ variant = 'primary', size = 'md', className }: ButtonStyleProps) {
  return {
    'data-slot': 'button',
    'data-variant': variantAliases[variant] ?? variant,
    'data-size': sizeAliases[size] ?? size,
    className: cn(buttonVariants({ variant, size }), className),
  };
}

function Button(props: ButtonProps) {
  if (props.href !== undefined) {
    const { className, variant, size, ...rest } = props;
    return <a {...buttonProps({ variant, size, className })} {...rest} />;
  }
  const { className, variant, size, ...rest } = props;
  return <ButtonPrimitive {...buttonProps({ variant, size, className })} {...rest} />;
}

export { Button, buttonVariants, type ButtonProps };
