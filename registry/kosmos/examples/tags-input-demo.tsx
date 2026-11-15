'use client';

import { isEmail } from '@/registry/kosmos/lib/tags';
import { TagsInput } from '@/registry/kosmos/ui/tags-input';

export default function TagsInputDemo() {
  return (
    <TagsInput
      aria-label="Invite by email"
      name="emails"
      defaultValue={['tomas@acme.example', 'ama@acme.example']}
      delimiters={[',', ';', ' ']}
      validate={isEmail}
      placeholder="name@acme.example"
      className="w-full max-w-md"
    />
  );
}
