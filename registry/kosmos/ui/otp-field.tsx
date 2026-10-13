'use client';

import { OTPField as OTPFieldPrimitive } from '@base-ui/react/otp-field';
import * as React from 'react';
import { cn } from '@/registry/kosmos/lib/cn';

type OtpFieldProps = Omit<OTPFieldPrimitive.Root.Props, 'className' | 'length'> & {
  className?: string;
  /** The number of characters in the code. */
  length?: number;
  /** Splits the boxes into groups of this many, with a dash between groups. Ignored when you pass children. */
  groupSize?: number;
};

/**
 * A one-time code entered one character per box. Typing moves to the next box, Backspace to the
 * previous one, and pasting or autofill (`autocomplete="one-time-code"`) fills every box at once.
 * Without children it renders `length` boxes. Inside a `Field` it takes its label, description
 * and error from the field; on its own it needs an `aria-labelledby`.
 */
function OtpField({ className, length = 6, groupSize, children, ...props }: OtpFieldProps) {
  return (
    <OTPFieldPrimitive.Root
      data-slot="otp-field"
      length={length}
      className={cn('flex w-fit max-w-full items-center gap-2', className)}
      {...props}
    >
      {children ??
        Array.from({ length }, (_, index) => (
          <React.Fragment key={index}>
            {groupSize && index > 0 && index % groupSize === 0 ? <OtpFieldSeparator /> : null}
            <OtpFieldInput aria-label={index === 0 ? undefined : `Character ${index + 1} of ${length}`} />
          </React.Fragment>
        ))}
    </OTPFieldPrimitive.Root>
  );
}

type OtpFieldInputProps = Omit<OTPFieldPrimitive.Input.Props, 'className'> & { className?: string };

/**
 * One box of the code. The first box is named by the field's label; name every other box with
 * an `aria-label` such as "Character 2 of 6".
 */
function OtpFieldInput({ className, ...props }: OtpFieldInputProps) {
  return (
    <OTPFieldPrimitive.Input
      data-slot="otp-field-input"
      className={cn(
        // Boxes shrink, still square, when the row runs out of room.
        'aspect-square w-10 min-w-0 shrink rounded-lg border border-transparent bg-secondary text-center text-title font-medium text-foreground tabular-nums shadow-field',
        'transition-[box-shadow]',
        // The transparent outline paints only in forced-colors mode, which drops the box-shadow focus line and halo.
        'focus-visible:outline-1 focus-visible:outline-offset-0 focus-visible:outline-transparent focus-visible:ring-offset-1 focus-visible:ring-offset-ring focus-visible:ring-3 focus-visible:ring-ring/20',
        'data-invalid:ring-1 data-invalid:ring-destructive aria-invalid:ring-1 aria-invalid:ring-destructive',
        'data-invalid:focus-visible:ring-offset-destructive data-invalid:focus-visible:ring-3 data-invalid:focus-visible:ring-destructive/20 aria-invalid:focus-visible:ring-offset-destructive aria-invalid:focus-visible:ring-3 aria-invalid:focus-visible:ring-destructive/20',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
}

type OtpFieldSeparatorProps = Omit<React.ComponentProps<typeof OTPFieldPrimitive.Separator>, 'className'> & { className?: string };

/** A short dash between two groups of boxes, such as the halves of a six-character code. */
function OtpFieldSeparator({ className, ...props }: OtpFieldSeparatorProps) {
  return (
    <OTPFieldPrimitive.Separator
      data-slot="otp-field-separator"
      className={cn('h-0.5 w-2.5 shrink-0 rounded-full bg-muted-foreground/50', className)}
      {...props}
    />
  );
}

export { OtpField, OtpFieldInput, OtpFieldSeparator, type OtpFieldInputProps, type OtpFieldProps, type OtpFieldSeparatorProps };
