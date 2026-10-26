'use client';

import * as React from 'react';
import { CommandMenu } from '@/registry/kosmos/blocks/command-menu/command-menu';
import { Navbar, NavbarSearch } from '@/registry/kosmos/blocks/navbar/navbar';

/** The search trigger opens the command menu, which ⌘K opens too. */
export default function NavbarSearchExample() {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="w-full overflow-hidden rounded-xl border border-transparent bg-background shadow-card">
      <Navbar
        current="/pricing"
        search={
          <NavbarSearch shortcut={['⌘', 'K']} onClick={() => setOpen(true)}>
            Search…
          </NavbarSearch>
        }
      />
      <CommandMenu open={open} onOpenChange={setOpen} trigger={null} />
      <div aria-hidden className="h-40" />
    </div>
  );
}
