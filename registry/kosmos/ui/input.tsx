import { Input as InputPrimitive } from '@base-ui/react/input';
import { cn } from '@/registry/kosmos/lib/cn';

type InputProps = Omit<InputPrimitive.Props, 'className'> & { className?: string };

/**
 * A single-line text input. Inside a `Field` it takes its label, description and error
 * from the field; on its own it needs an `aria-label`.
 */
function Input({ className, type = 'text', ...props }: InputProps) {
  return (
    <InputPrimitive
      data-slot="input"
      type={type}
      className={cn(
        // Same surface as Textarea: keep the two in step.
        'h-7.5 w-full min-w-0 rounded-lg border border-transparent bg-secondary px-2.5 text-base text-foreground shadow-control sm:text-body',
        // Native parts (date picker icon, spin buttons) follow the theme.
        'dark:scheme-dark',
        'transition-[box-shadow]',
        'placeholder:text-muted-foreground',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
        // Invalid adds a destructive ring over the control ring. `aria-invalid` covers forms that set validity without a Field.
        'data-invalid:ring-1 data-invalid:ring-destructive aria-invalid:ring-1 aria-invalid:ring-destructive',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'file:me-2 file:h-full file:border-0 file:bg-transparent file:font-medium file:text-foreground',
        className,
      )}
      {...props}
    />
  );
}

export { Input, type InputProps };
