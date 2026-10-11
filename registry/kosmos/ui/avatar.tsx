import { Avatar as AvatarPrimitive } from '@base-ui/react/avatar';
import { cva, type VariantProps } from 'class-variance-authority';
import type * as React from 'react';
import { cn } from '@/registry/kosmos/lib/cn';

const avatarVariants = cva(
  [
    'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted align-middle select-none',
  ],
  {
    variants: {
      size: {
        sm: "size-6 text-caption [&_svg:not([class*='size-'])]:size-3.5",
        md: "size-8 text-caption [&_svg:not([class*='size-'])]:size-4",
        lg: "size-10 text-body [&_svg:not([class*='size-'])]:size-5",
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
);

type AvatarSize = NonNullable<VariantProps<typeof avatarVariants>['size']>;

type AvatarProps = AvatarPrimitive.Root.Props & {
  size?: AvatarSize;
};

function Avatar({ className, size = 'md', ...props }: AvatarProps) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      data-size={size}
      className={cn(avatarVariants({ size }), className)}
      {...props}
    />
  );
}

function AvatarImage({ className, ...props }: AvatarPrimitive.Image.Props) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn(
        'size-full rounded-full object-cover outline outline-1 -outline-offset-1 outline-black/10 transition-[opacity] data-starting-style:opacity-0 dark:outline-white/10',
        className,
      )}
      {...props}
    />
  );
}

function AvatarFallback({ className, ...props }: AvatarPrimitive.Fallback.Props) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn('flex size-full items-center justify-center font-medium text-muted-foreground uppercase', className)}
      {...props}
    />
  );
}

/** Overlapping avatars. Each one gets a ring in the page color, so the edges stay apart. */
function AvatarGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="avatar-group"
      className={cn(
        'flex items-center -space-x-1.5 *:ring-2 *:ring-background has-data-[size=lg]:-space-x-2 has-data-[size=sm]:-space-x-1',
        className,
      )}
      {...props}
    />
  );
}

/** The "+3" at the end of an AvatarGroup, sized like the avatars beside it. */
function AvatarGroupCount({ className, size = 'md', ...props }: React.ComponentProps<'span'> & { size?: AvatarSize }) {
  return (
    <span
      data-slot="avatar-group-count"
      data-size={size}
      className={cn(avatarVariants({ size }), 'font-medium text-muted-foreground tabular-nums', className)}
      {...props}
    />
  );
}

export { Avatar, AvatarImage, AvatarFallback, AvatarGroup, AvatarGroupCount, avatarVariants, type AvatarProps };
