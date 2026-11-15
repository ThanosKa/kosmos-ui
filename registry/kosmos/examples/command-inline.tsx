'use client';

import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from '@/registry/kosmos/ui/command';

const members = [
  { value: 'lena', label: 'Lena Park' },
  { value: 'tomas', label: 'Tomás Ortega' },
  { value: 'ama', label: 'Ama Mensah' },
  { value: 'kai', label: 'Kai Nakamura' },
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
