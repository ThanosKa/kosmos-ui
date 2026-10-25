'use client';

import { useState } from 'react';
import { isEmail } from '@/registry/kosmos/lib/tags';
import { Button } from '@/registry/kosmos/ui/button';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/registry/kosmos/ui/field';
import { TagsInput } from '@/registry/kosmos/ui/tags-input';

export default function TagsInputInvite() {
  const [emails, setEmails] = useState<string[]>(['kai@acme.example', 'ama@acme', 'tomas@acme.example']);
  const mistyped = emails.filter((email) => !isEmail(email));

  return (
    <form className="flex w-full max-w-md flex-col gap-4" onSubmit={(event) => event.preventDefault()}>
      <Field invalid={mistyped.length > 0}>
        <FieldLabel>Invite by email</FieldLabel>
        <TagsInput value={emails} onValueChange={setEmails} delimiters={[',', ';', ' ']} validate={isEmail} placeholder="name@acme.example" />
        {mistyped.length > 0 ? (
          <FieldError>
            {mistyped.length === 1 ? `Fix or remove ${mistyped[0]}: an address ends in a domain, such as acme.example.` : `Fix or remove the ${mistyped.length} addresses in red.`}
          </FieldError>
        ) : (
          <FieldDescription>Paste a list, or press Enter after each address.</FieldDescription>
        )}
      </Field>
      <Button type="submit" variant="primary" className="self-start">
        {emails.length > 1 ? `Send ${emails.length} invites` : 'Send invite'}
      </Button>
    </form>
  );
}
