import { Field as FieldPrimitive } from '@base-ui/react/field';
import type * as React from 'react';
import { cn } from '@/registry/kosmos/lib/cn';

type TextareaProps = Omit<React.ComponentProps<'textarea'>, 'className'> & {
  className?: string;
  /** Called with the new text on every change. */
  onValueChange?: FieldPrimitive.Control.Props['onValueChange'];
};

/**
 * A multi-line text input that grows with its content. It is a Base UI `Field.Control`
 * rendered as a `<textarea>`, so inside a `Field` it takes its label, description and
 * error from the field; on its own it needs an `aria-label`.
 */
function Textarea({ className, value, defaultValue, disabled, name, id, onValueChange, ...props }: TextareaProps) {
  return (
    <FieldPrimitive.Control
      data-slot="textarea"
      // The props the field tracks (filled, dirty, disabled) stay on the control; the rest go to the <textarea>.
      value={value}
      defaultValue={defaultValue}
      disabled={disabled}
      name={name}
      id={id}
      onValueChange={onValueChange}
      className={cn(
        // Same surface as Input: keep the two in step.
        'field-sizing-content min-h-20 w-full min-w-0 rounded-lg border border-transparent bg-secondary px-3 py-2 text-base text-foreground shadow-field sm:text-body',
        // Native parts (resize handle, scrollbar) follow the theme.
        'dark:scheme-dark',
        'transition-[box-shadow]',
        'placeholder:text-muted-foreground',
        'focus-visible:outline-1 focus-visible:outline-offset-0 focus-visible:outline-ring focus-visible:ring-4 focus-visible:ring-ring/20',
        'data-invalid:ring-1 data-invalid:ring-destructive aria-invalid:ring-1 aria-invalid:ring-destructive',
        'data-invalid:focus-visible:outline-destructive data-invalid:focus-visible:ring-4 data-invalid:focus-visible:ring-destructive/20 aria-invalid:focus-visible:outline-destructive aria-invalid:focus-visible:ring-4 aria-invalid:focus-visible:ring-destructive/20',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      render={<textarea {...props} />}
    />
  );
}

export { Textarea, type TextareaProps };
