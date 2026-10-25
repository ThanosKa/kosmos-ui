'use client';

import { Check, Copy, Eye, EyeOff } from 'lucide-react';
import * as React from 'react';
import { flushSync } from 'react-dom';
import { useCopy } from '@/registry/kosmos/hooks/use-copy';
import { maskSecret } from '@/registry/kosmos/lib/secret';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, type InputGroupInputProps } from '@/registry/kosmos/ui/input-group';

type CopyFieldProps = Omit<InputGroupInputProps, 'value' | 'defaultValue' | 'onValueChange' | 'readOnly' | 'type' | 'ref'> & {
  /** The text it shows and copies, such as an API key, a webhook URL or an ID. */
  value: string;
  /** Hides the value behind dots, all but its last four characters, with a button that shows it. Copy still copies the value. */
  secret?: boolean;
  /** Shows a secret at first, such as a key just created that people should save now. */
  defaultRevealed?: boolean;
  /** What the value is, in the names of its buttons and in what screen readers hear: "Copy API key", "API key copied". */
  label?: string;
};

/**
 * A read-only field that shows a value with a button that copies it, such as an API key or a webhook URL. As a secret
 * it hides the value until shown. Screen readers hear when the value is copied; when the browser refuses, the value is
 * shown and selected, so it can be copied by hand.
 */
function CopyField({ value, secret = false, defaultRevealed = false, label = secret ? 'secret' : 'value', disabled, className, ...props }: CopyFieldProps) {
  const [revealed, setRevealed] = React.useState(defaultRevealed);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [result, copy] = useCopy(value, {
    onFailure: () => {
      flushSync(() => setRevealed(true));
      inputRef.current?.focus();
      inputRef.current?.select();
    },
  });
  const hidden = secret && !revealed;
  const name = label.charAt(0).toUpperCase() + label.slice(1);
  return (
    <InputGroup className={className}>
      <InputGroupInput
        ref={inputRef}
        readOnly
        disabled={disabled}
        value={hidden ? maskSecret(value) : value}
        spellCheck={false}
        autoComplete="off"
        // Keys and URLs read left to right on a right-to-left page too, while the field keeps the page's direction.
        className="font-mono text-ellipsis [unicode-bidi:plaintext] rtl:text-right"
        {...props}
      />
      <InputGroupAddon align="inline-end">
        {secret ? (
          <InputGroupButton
            variant="ghost"
            size="icon-sm"
            aria-label={`Show ${label}`}
            aria-pressed={revealed}
            disabled={disabled}
            onClick={() => setRevealed((shown) => !shown)}
          >
            {revealed ? <EyeOff aria-hidden /> : <Eye aria-hidden />}
          </InputGroupButton>
        ) : null}
        <InputGroupButton variant="ghost" size="icon-sm" aria-label={`Copy ${label}`} disabled={disabled} onClick={copy}>
          {result === 'copied' ? <Check aria-hidden /> : <Copy aria-hidden />}
        </InputGroupButton>
      </InputGroupAddon>
      <span role="status" className="sr-only">
        {result === 'copied' ? `${name} copied` : result === 'failed' ? `Unable to copy. The ${label} is selected, so copy it with your keyboard.` : ''}
      </span>
    </InputGroup>
  );
}

export { CopyField, type CopyFieldProps };
