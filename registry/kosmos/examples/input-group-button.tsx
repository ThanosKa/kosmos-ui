'use client';

import { X } from 'lucide-react';
import * as React from 'react';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/registry/kosmos/ui/input-group';

export default function InputGroupButtonExample() {
  const [email, setEmail] = React.useState('tomas@acme.example');
  const inputRef = React.useRef<HTMLInputElement>(null);
  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <InputGroup>
        <InputGroupInput ref={inputRef} type="email" aria-label="Invite by email" value={email} onValueChange={setEmail} placeholder="name@acme.example" />
        {email ? (
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              variant="ghost"
              size="icon-sm"
              aria-label="Clear email"
              onClick={() => {
                setEmail('');
                inputRef.current?.focus();
              }}
            >
              <X aria-hidden />
            </InputGroupButton>
          </InputGroupAddon>
        ) : null}
      </InputGroup>
      <InputGroup>
        <InputGroupInput aria-label="Invite code" defaultValue="ACME-7Q2K" className="font-mono" />
        <InputGroupAddon align="inline-end">
          <InputGroupButton variant="secondary" size="sm">
            Apply
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}
