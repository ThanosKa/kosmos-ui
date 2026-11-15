'use client';

import { useEffect, useState } from 'react';
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
  CommandLoading,
} from '@/registry/kosmos/ui/command';

const people = [
  { value: 'lena', label: 'Lena Park' },
  { value: 'tomas', label: 'Tomás Ortega' },
  { value: 'ama', label: 'Ama Mensah' },
  { value: 'kai', label: 'Kai Nakamura' },
];

/** Stands in for a server search: the list gives way to a loading row for a moment after each keystroke. */
export default function CommandLoadingExample({ forceLoading = false }: { forceLoading?: boolean }) {
  const [query, setQuery] = useState('');
  const [settled, setSettled] = useState(true);

  useEffect(() => {
    if (!query) return;
    const timer = setTimeout(() => setSettled(true), 600);
    return () => clearTimeout(timer);
  }, [query]);

  const loading = forceLoading || !settled;

  return (
    <Command
      items={people}
      value={query}
      onValueChange={(value) => {
        setQuery(value);
        setSettled(!value);
      }}
      className="max-w-md"
    >
      <CommandInput placeholder="Search people…" aria-label="Search people" />
      {loading ? <CommandLoading>Searching people…</CommandLoading> : <CommandEmpty>No people found.</CommandEmpty>}
      <CommandList className={loading ? 'hidden' : undefined}>
        {(person: (typeof people)[number]) => (
          <CommandItem key={person.value} value={person}>
            {person.label}
          </CommandItem>
        )}
      </CommandList>
    </Command>
  );
}
