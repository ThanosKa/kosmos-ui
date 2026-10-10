'use client';

import { Field as FieldPrimitive } from '@base-ui/react/field';
import { cva } from 'class-variance-authority';
import { CircleAlert } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/registry/kosmos/lib/cn';

const fieldVariants = cva('flex min-w-0', {
  variants: {
    orientation: {
      // Label, control, description and error stacked.
      vertical: 'flex-col gap-1.5',
      // Control and FieldContent side by side: a checkbox or switch with its label, or a settings row.
      horizontal: 'flex-row items-center gap-3 has-[>[data-slot=field-content]]:items-start',
    },
  },
  defaultVariants: { orientation: 'vertical' },
});

type FieldOrientation = 'vertical' | 'horizontal';

type FieldProps = Omit<FieldPrimitive.Root.Props, 'className'> & {
  className?: string;
  /** `horizontal` puts the control beside a `FieldContent` that holds the label, description and error. */
  orientation?: FieldOrientation;
};

/**
 * Groups a label, one control, a description and an error, and connects them: the label
 * names the control, and the description and error are read with it (`aria-describedby`).
 * Works with any Base UI control: Input, Textarea, Select, Checkbox, Switch, Slider.
 */
/** Whether the app marked the Field `invalid`, so FieldError can show without a `match`. */
const FieldInvalidContext = React.createContext(false);

function Field({ className, orientation = 'vertical', invalid, children, ...props }: FieldProps) {
  return (
    <FieldPrimitive.Root
      data-slot="field"
      data-orientation={orientation}
      invalid={invalid}
      className={cn(fieldVariants({ orientation }), className)}
      {...props}
    >
      <FieldInvalidContext value={invalid === true}>{children}</FieldInvalidContext>
    </FieldPrimitive.Root>
  );
}

/** Stacks the label, description and error beside the control in a horizontal Field. */
function FieldContent({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="field-content" className={cn('flex min-w-0 flex-1 flex-col gap-0.5', className)} {...props} />;
}

type FieldLabelProps = Omit<FieldPrimitive.Label.Props, 'className'> & { className?: string };

/**
 * Names the control. Renders a `<label>`. For a control that is a button (Select), pass
 * `nativeLabel={false} render={<div />}`: the label then names it through `aria-labelledby`
 * without a native label's click and hover forwarding.
 */
function FieldLabel({ className, ...props }: FieldLabelProps) {
  return (
    <FieldPrimitive.Label
      data-slot="field-label"
      className={cn('w-fit text-body font-medium text-foreground data-disabled:opacity-50', className)}
      {...props}
    />
  );
}

type FieldDescriptionProps = Omit<FieldPrimitive.Description.Props, 'className'> & { className?: string };

/** Help text for the control, read by screen readers after the label. */
function FieldDescription({ className, ...props }: FieldDescriptionProps) {
  return (
    <FieldPrimitive.Description
      data-slot="field-description"
      className={cn('text-small text-muted-foreground data-disabled:opacity-50', className)}
      {...props}
    />
  );
}

type FieldErrorProps = Omit<FieldPrimitive.Error.Props, 'className' | 'render'> & { className?: string };

/**
 * The error message. It shows only while the field is invalid: when `invalid` is set on the
 * Field, after the control fails validation, or when a Form reports an error for its `name`.
 * Without children it shows the browser's validation message. `match` picks one validity
 * state, and `match={true}` always shows it.
 */
function FieldError({ className, match, ...props }: FieldErrorProps) {
  // Base UI shows the error for failed validation and Form errors only; a Field marked
  // `invalid` by the app (react-hook-form, a server response) shows it too.
  const invalid = React.use(FieldInvalidContext);
  return (
    <FieldPrimitive.Error
      data-slot="field-error"
      match={match ?? (invalid || undefined)}
      className={cn('flex items-start gap-1.5 text-small text-foreground', className)}
      render={(errorProps) => (
        <div {...errorProps}>
          {/* The icon carries the error meaning beside the color, so the text stays foreground. */}
          <CircleAlert aria-hidden className="mt-0.5 size-3.5 shrink-0 text-destructive" />
          <div className="min-w-0 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-0.5">{errorProps.children}</div>
        </div>
      )}
      {...props}
    />
  );
}

type FieldItemProps = Omit<FieldPrimitive.Item.Props, 'className'> & { className?: string };

/** One option in a checkbox or radio group: its control beside its own label and description. */
function FieldItem({ className, ...props }: FieldItemProps) {
  return <FieldPrimitive.Item data-slot="field-item" className={cn('flex items-start gap-2', className)} {...props} />;
}

export {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldItem,
  FieldLabel,
  fieldVariants,
  type FieldDescriptionProps,
  type FieldErrorProps,
  type FieldItemProps,
  type FieldLabelProps,
  type FieldOrientation,
  type FieldProps,
};
