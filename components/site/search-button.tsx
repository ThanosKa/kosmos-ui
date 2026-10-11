'use client';

import { useSearchContext } from 'fumadocs-ui/contexts/search';
import { Search } from 'lucide-react';
import { Button } from '@/registry/kosmos/ui/button';
import { Kbd, KbdGroup } from '@/registry/kosmos/ui/kbd';

/** Opens the docs search, which ⌘K (Ctrl K on Windows and Linux) also opens from anywhere on the site. */
export function SearchButton() {
  const { enabled, hotKey, setOpenSearch } = useSearchContext();
  if (!enabled) return null;

  return (
    <>
      <Button
        variant="secondary"
        aria-keyshortcuts="Meta+K Control+K"
        onClick={() => setOpenSearch(true)}
        className="w-56 justify-start ps-2.5 pe-1.5 font-normal text-muted-foreground max-lg:hidden"
      >
        <Search aria-hidden />
        <span className="flex-1 text-start">Search docs…</span>
        <KbdGroup aria-hidden>
          {hotKey.map((key, index) => (
            <Kbd key={index}>{key.display}</Kbd>
          ))}
        </KbdGroup>
      </Button>
      <Button
        variant="secondary"
        size="icon"
        aria-label="Search docs"
        aria-keyshortcuts="Meta+K Control+K"
        onClick={() => setOpenSearch(true)}
        className="lg:hidden"
      >
        <Search aria-hidden />
      </Button>
    </>
  );
}
