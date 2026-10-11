'use client';

import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from '@/registry/kosmos/ui/command';

const members = [
  { value: 'ana', label: 'Ana Lopez' },
  { value: 'ben', label: 'Ben Carter' },
  { value: 'chen', label: 'Chen Wei' },
  { value: 'dara', label: 'Dara Okafor' },
  { value: 'elif', label: 'Elif Demir' },
];

export default function CommandInline() {
  return (
    <Command items={members} className="max-w-xs">
      <CommandInput placeholder="Search members…" aria-label="Search members" />
      <CommandEmpty>No members found.</CommandEmpty>
      <CommandList>
        {(member: (typeof members)[number]) => (
          <CommandItem key={member.value} value={member}>
            {member.label}
          </CommandItem>
        )}
      </CommandList>
    </Command>
  );
}
