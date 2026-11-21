'use client';

import { Eye, EyeOff } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/registry/kosmos/lib/cn';
import { Button } from '@/registry/kosmos/ui/button';
import { Input } from '@/registry/kosmos/ui/input';

// Icon swaps cross-fade; with motion allowed they also scale and blur, as Copy field's eye does.
const iconSwap = cn(
  'opacity-0 transition-[opacity,scale,filter] duration-fast data-visible:opacity-100 data-visible:duration-slow',
  'motion-safe:scale-25 motion-safe:blur-xs motion-safe:data-visible:scale-100 motion-safe:data-visible:blur-none',
);

type PasswordInputProps = Omit<React.ComponentProps<typeof Input>, 'type'> & {
  /** The accessible name of the button that shows the password. It stays the same while pressed; `aria-pressed` says the state. */
  toggleLabel?: string;
};

/** A password input with a button inside its end that shows what was typed and hides it again. */
function PasswordInput({ className, disabled, toggleLabel = 'Show password', ...props }: PasswordInputProps) {
  const [visible, setVisible] = React.useState(false);
  return (
    <div data-slot="password-input" className="relative w-full">
      <Input type={visible ? 'text' : 'password'} disabled={disabled} className={cn('pe-10', className)} {...props} />
      <div className="absolute inset-y-0 end-1.5 flex items-center">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          data-slot="password-input-toggle"
          aria-label={toggleLabel}
          aria-pressed={visible}
          disabled={disabled}
          onClick={() => setVisible(!visible)}
          className="aria-pressed:bg-accent"
        >
          <span aria-hidden className="grid *:col-start-1 *:row-start-1">
            <EyeOff data-visible={visible || undefined} className={iconSwap} />
            <Eye data-visible={!visible || undefined} className={iconSwap} />
          </span>
        </Button>
      </div>
    </div>
  );
}

export { PasswordInput, type PasswordInputProps };
