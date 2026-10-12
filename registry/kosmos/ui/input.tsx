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
        'h-8.5 w-full min-w-0 rounded-lg border border-transparent bg-secondary px-3 text-base text-foreground shadow-field sm:text-body',
        // Native parts (date picker icon, spin buttons) follow the theme.
        'dark:scheme-dark',
        'transition-[box-shadow]',
        'placeholder:text-muted-foreground',
        // The focus line is a 1px ring offset and the halo a ring, so both fade on the box-shadow transition.
        // The transparent outline paints only in forced-colors mode, which drops box-shadow.
        'focus-visible:outline-1 focus-visible:outline-offset-0 focus-visible:outline-transparent focus-visible:ring-offset-1 focus-visible:ring-offset-ring focus-visible:ring-3 focus-visible:ring-ring/20',
        // Invalid adds a destructive ring over the control ring. `aria-invalid` covers forms that set validity without a Field.
        'data-invalid:ring-1 data-invalid:ring-destructive aria-invalid:ring-1 aria-invalid:ring-destructive',
        'data-invalid:focus-visible:ring-offset-destructive data-invalid:focus-visible:ring-3 data-invalid:focus-visible:ring-destructive/20 aria-invalid:focus-visible:ring-offset-destructive aria-invalid:focus-visible:ring-3 aria-invalid:focus-visible:ring-destructive/20',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'file:me-2 file:h-full file:border-0 file:bg-transparent file:font-medium file:text-foreground',
        className,
      )}
      {...props}
    />
  );
}

export { Input, type InputProps };
