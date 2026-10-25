'use client';

import { AtSign, Eye, Search, X } from 'lucide-react';
import * as React from 'react';
import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { StateMatrix } from '@/components/preview/state-matrix';
import { Field, FieldError, FieldLabel } from '@/registry/kosmos/ui/field';
import { Input } from '@/registry/kosmos/ui/input';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupText } from '@/registry/kosmos/ui/input-group';
import { Kbd, KbdGroup } from '@/registry/kosmos/ui/kbd';
import InputGroupToolbar from '@/registry/kosmos/examples/input-group-toolbar';
import InputGroupButtonExample from '@/registry/kosmos/examples/input-group-button';
import InputGroupTextExample from '@/registry/kosmos/examples/input-group-text';

const rows = ['icon start', 'text start', 'kbd end', 'button end', 'both sides'] as const;
const states = ['placeholder', 'filled', 'invalid', 'disabled'] as const;

function Addons({ row, state }: { row: (typeof rows)[number]; state: (typeof states)[number] }) {
  const disabled = state === 'disabled';
  const input = (
    <InputGroupInput
      aria-label={`Projects, ${row}, ${state}`}
      placeholder="Search"
      defaultValue={state === 'placeholder' ? undefined : 'Fernhill'}
      aria-invalid={state === 'invalid' || undefined}
      disabled={disabled}
    />
  );
  if (row === 'icon start')
    return (
      <InputGroup>
        <InputGroupAddon>
          <Search aria-hidden />
        </InputGroupAddon>
        {input}
      </InputGroup>
    );
  if (row === 'text start')
    return (
      <InputGroup>
        <InputGroupAddon>
          <InputGroupText>https://</InputGroupText>
        </InputGroupAddon>
        {input}
      </InputGroup>
    );
  if (row === 'kbd end')
    return (
      <InputGroup>
        {input}
        <InputGroupAddon align="inline-end">
          <KbdGroup>
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
          </KbdGroup>
        </InputGroupAddon>
      </InputGroup>
    );
  if (row === 'button end')
    return (
      <InputGroup>
        {input}
        <InputGroupAddon align="inline-end">
          <InputGroupButton variant="ghost" size="icon-sm" aria-label="Clear" disabled={disabled}>
            <X aria-hidden />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    );
  return (
    <InputGroup>
      <InputGroupAddon>
        <Search aria-hidden />
      </InputGroupAddon>
      {input}
      <InputGroupAddon align="inline-end">
        <InputGroupButton variant="ghost" size="icon-sm" aria-label="Clear" disabled={disabled}>
          <X aria-hidden />
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
}

/** Focuses its input once on mount, so the screenshot shows the focus line and halo; only one element can hold focus. */
function FocusedOnMount() {
  const ref = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => ref.current?.focus({ preventScroll: true }), []);
  return (
    <InputGroup>
      <InputGroupAddon>
        <AtSign aria-hidden />
      </InputGroupAddon>
      <InputGroupInput ref={ref} aria-label="Email, focused" defaultValue="lena@acme.example" />
      <InputGroupAddon align="inline-end">
        <InputGroupButton variant="ghost" size="icon-sm" aria-label="Show">
          <Eye aria-hidden />
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
}

export default function InputGroupPreview() {
  return (
    <PreviewStack>
      <PreviewSection title="Addons × states">
        <StateMatrix rows={rows} states={states} render={(row, state) => <Addons row={row} state={state} />} />
      </PreviewSection>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        <PreviewSection title="Focus (input focused on load)">
          <FocusedOnMount />
        </PreviewSection>
        <PreviewSection title="Beside a plain Input, same height and edge">
          <div className="flex flex-col gap-3">
            <Input aria-label="Plain input" defaultValue="Fernhill Books" />
            <InputGroup>
              <InputGroupAddon>
                <Search aria-hidden />
              </InputGroupAddon>
              <InputGroupInput aria-label="Grouped input" defaultValue="Fernhill Books" />
            </InputGroup>
          </div>
        </PreviewSection>
      </div>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        <PreviewSection title="Text addons in a Field">
          <InputGroupTextExample />
        </PreviewSection>
        <PreviewSection title="Buttons">
          <InputGroupButtonExample />
        </PreviewSection>
      </div>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        <PreviewSection title="Invalid in a Field">
          <Field invalid className="max-w-xs">
            <FieldLabel>Webhook URL</FieldLabel>
            <InputGroup>
              <InputGroupAddon>
                <InputGroupText>https://</InputGroupText>
              </InputGroupAddon>
              <InputGroupInput name="webhook" defaultValue="hooks.acme" />
            </InputGroup>
            <FieldError>Enter a full domain, such as hooks.acme.example.</FieldError>
          </Field>
        </PreviewSection>
        <PreviewSection title="In a toolbar, at the Button's height">
          <InputGroupToolbar />
        </PreviewSection>
      </div>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        <PreviewSection title="Long prefix and value in a narrow slot">
          <div className="w-56">
            <InputGroup>
              <InputGroupAddon>
                <InputGroupText>analytics.acme.example/projects/</InputGroupText>
              </InputGroupAddon>
              <InputGroupInput aria-label="Project slug" defaultValue="fernhill-books-quarterly-revenue-forecast" />
              <InputGroupAddon align="inline-end">
                <InputGroupButton variant="ghost" size="icon-sm" aria-label="Clear">
                  <X aria-hidden />
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </div>
        </PreviewSection>
        <PreviewSection title="Right to left">
          <div dir="rtl" className="max-w-xs">
            <InputGroup>
              <InputGroupAddon>
                <Search aria-hidden />
              </InputGroupAddon>
              <InputGroupInput aria-label="بحث" placeholder="ابحث في المشاريع" />
              <InputGroupAddon align="inline-end">
                <Kbd>/</Kbd>
              </InputGroupAddon>
            </InputGroup>
          </div>
        </PreviewSection>
      </div>
    </PreviewStack>
  );
}
