'use client';

import { Menu } from 'lucide-react';
import { Button } from '@/registry/kosmos/ui/button';
import { useSidebar } from '@/registry/kosmos/ui/sidebar';

/** The header button that opens the docs sidebar as a drawer below the `md` breakpoint. */
export function DocsMenuButton({ className }: { className?: string }) {
  const { openMobile, setOpenMobile, sidebarId } = useSidebar();
  return (
    <Button
      variant="secondary"
      size="icon"
      aria-label="Docs menu"
      aria-expanded={openMobile}
      aria-controls={openMobile ? sidebarId : undefined}
      onClick={() => setOpenMobile(!openMobile)}
      className={className}
    >
      <Menu aria-hidden />
    </Button>
  );
}
