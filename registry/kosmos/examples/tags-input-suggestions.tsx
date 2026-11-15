'use client';

import { TagsInput } from '@/registry/kosmos/ui/tags-input';

const team = ['lena@acme.example', 'tomas@acme.example', 'ama@acme.example', 'kai@acme.example'];

export default function TagsInputSuggestions() {
  return <TagsInput aria-label="Send the weekly summary to" suggestions={team} placeholder="name@acme.example" className="w-full max-w-md" />;
}
