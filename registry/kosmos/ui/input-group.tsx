'use client';

import { Input as InputPrimitive } from '@base-ui/react/input';
import * as React from 'react';
import { cn } from '@/registry/kosmos/lib/cn';
import { Button, type ButtonProps } from '@/registry/kosmos/ui/button';

/**
 * One text field with addons before and after its input: icons, units, a prefix, keyboard hints or buttons. The
 * group draws the field's surface, and lights its edge while the input has focus, not while a button in it does.
 */
function InputGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="input-group"
      className={cn(
        // Same surface as Input: keep the two in step.
        'flex h-8.5 w-full min-w-0 items-center rounded-lg border border-transparent bg-secondary shadow-field',
        'transition-[box-shadow]',
        // The transparent outline paints only in forced-colors mode, which drops the box-shadow focus line and halo.
        // Only the input lights the edge; a focused button inside shows its own outline. The input is the group's only `<input>`.
        'has-[input:focus-visible]:outline-1 has-[input:focus-visible]:outline-offset-0 has-[input:focus-visible]:outline-transparent has-[input:focus-visible]:ring-offset-1 has-[input:focus-visible]:ring-offset-ring has-[input:focus-visible]:ring-3 has-[input:focus-visible]:ring-ring/20',
        // Invalid adds a destructive ring over the control ring, set by a Field (`data-invalid`) or by hand (`aria-invalid`).
        'has-[input[data-invalid]]:ring-1 has-[input[data-invalid]]:ring-destructive has-[input[aria-invalid=true]]:ring-1 has-[input[aria-invalid=true]]:ring-destructive',
        'has-[input[data-invalid]:focus-visible]:ring-offset-destructive has-[input[data-invalid]:focus-visible]:ring-3 has-[input[data-invalid]:focus-visible]:ring-destructive/20',
        'has-[input[aria-invalid=true]:focus-visible]:ring-offset-destructive has-[input[aria-invalid=true]:focus-visible]:ring-3 has-[input[aria-invalid=true]:focus-visible]:ring-destructive/20',
        // A disabled input dims the whole field once, so a disabled button inside does not dim again.
        'has-[input:disabled]:opacity-50 has-[input:disabled]:**:data-disabled:opacity-100',
        'has-[>[data-align=inline-start]]:*:data-[slot=input-group-control]:ps-2 has-[>[data-align=inline-end]]:*:data-[slot=input-group-control]:pe-2',
        className,
      )}
      {...props}
    />
  );
}

type InputGroupAddonProps = React.ComponentProps<'div'> & {
  /** The side of the input it sits on. `inline-start` is the left in a left-to-right page. */
  align?: 'inline-start' | 'inline-end';
};

/**
 * Holds what sits beside the input: an icon, an InputGroupText, a Kbd or InputGroupButtons. A click on it outside a
 * button moves focus to the input, so the addon reads as part of the field.
 */
function InputGroupAddon({ className, align = 'inline-start', onMouseDown, ...props }: InputGroupAddonProps) {
  return (
    <div
      data-slot="input-group-addon"
      data-align={align}
      onMouseDown={(event) => {
        onMouseDown?.(event);
        if (event.defaultPrevented || (event.target as HTMLElement).closest('button, a, input')) return;
        const input = event.currentTarget.parentElement?.querySelector<HTMLInputElement>('[data-slot=input-group-control]');
        if (!input || input.disabled) return;
        // Keeps focus off the addon, then puts it in the input with the caret where it was.
        event.preventDefault();
        input.focus();
      }}
      className={cn(
        'flex h-full min-w-0 cursor-text items-center gap-2 text-body text-muted-foreground select-none',
        "[&>svg]:pointer-events-none [&>svg]:shrink-0 [&>svg:not([class*='size-'])]:size-3.5",
        align === 'inline-start' ? 'order-first ps-3 has-[>button]:ps-1 has-[>kbd]:ps-1.5' : 'order-last pe-3 has-[>button]:pe-1 has-[>kbd]:pe-1.5',
        'has-[>button]:gap-0.5',
        className,
      )}
      {...props}
    />
  );
}

/** Text beside the input, such as a unit, a currency or the start of a URL. */
function InputGroupText({ className, ...props }: React.ComponentProps<'span'>) {
  return <span data-slot="input-group-text" className={cn('truncate', className)} {...props} />;
}

type InputGroupInputProps = Omit<InputPrimitive.Props, 'className'> & { className?: string };

/** The input of the group. Inside a `Field` it takes its label, description and error from the field. */
function InputGroupInput({ className, type = 'text', ...props }: InputGroupInputProps) {
  return (
    <InputPrimitive
      data-slot="input-group-control"
      type={type}
      className={cn(
        'h-full w-full min-w-16 flex-1 rounded-[inherit] bg-transparent px-3 text-base text-foreground sm:text-body',
        'dark:scheme-dark',
        'placeholder:text-muted-foreground',
        // The native clear button of a search field, redrawn in the muted text color: the browser paints it in its own blue.
        "[&::-webkit-search-cancel-button]:size-3.5 [&::-webkit-search-cancel-button]:cursor-pointer [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-cancel-button]:bg-muted-foreground [&::-webkit-search-cancel-button]:mask-[url('data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%2024%2024%22%20fill=%22none%22%20stroke=%22black%22%20stroke-width=%222.5%22%20stroke-linecap=%22round%22%3E%3Cpath%20d=%22M18%206%206%2018M6%206l12%2012%22/%3E%3C/svg%3E')] [&::-webkit-search-cancel-button]:mask-contain [&::-webkit-search-cancel-button]:mask-center [&::-webkit-search-cancel-button]:mask-no-repeat",
        // The group draws the focus line and halo around the whole field.
        'outline-none disabled:cursor-not-allowed',
        className,
      )}
      {...props}
    />
  );
}

/**
 * A button inside the field, such as copy, show or clear. A ghost icon button by default, 24px so it fits the field
 * with an even gap; give icon-only buttons an `aria-label`.
 */
function InputGroupButton({ variant = 'ghost', size = 'icon-sm', className, ...props }: ButtonProps) {
  return <Button variant={variant} size={size} className={cn('rounded-sm', className)} {...(props as ButtonProps)} />;
}

export { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupText, type InputGroupAddonProps, type InputGroupInputProps };
