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
        // The native clear button of a search field, redrawn in the muted text color: the browser paints it in its own blue.
        "[&::-webkit-search-cancel-button]:size-3.5 [&::-webkit-search-cancel-button]:cursor-pointer [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-cancel-button]:bg-muted-foreground [&::-webkit-search-cancel-button]:mask-[url('data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%2024%2024%22%20fill=%22none%22%20stroke=%22black%22%20stroke-width=%222.5%22%20stroke-linecap=%22round%22%3E%3Cpath%20d=%22M18%206%206%2018M6%206l12%2012%22/%3E%3C/svg%3E')] [&::-webkit-search-cancel-button]:mask-contain [&::-webkit-search-cancel-button]:mask-center [&::-webkit-search-cancel-button]:mask-no-repeat",
        // The transparent outline paints only in forced-colors mode, which drops the box-shadow focus line and halo.
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
