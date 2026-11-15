'use client';

import { ExternalLink, Trophy } from 'lucide-react';
import { DashboardCrmPage } from '@/registry/kosmos/blocks/dashboard-crm/dashboard-crm';
import { DropdownMenuItem } from '@/registry/kosmos/ui/dropdown-menu';

export default function DashboardCrmDemo() {
  return (
    <DashboardCrmPage
      frame={{
        // In an app, leave the frame out: the page fills the screen.
        storageKey: false,
        className: 'h-[48rem] w-full overflow-hidden rounded-xl border border-transparent shadow-card',
      }}
      sidebar={{ onNavigate: (_id, event) => event.preventDefault() }}
      onNewDeal={() => {}}
      tasksHref="#"
      dealActions={(deal) => (
        <>
          <DropdownMenuItem>
            <ExternalLink />
            Open deal
          </DropdownMenuItem>
          {deal.stage === 'won' ? null : (
            <DropdownMenuItem>
              <Trophy />
              Mark as won
            </DropdownMenuItem>
          )}
        </>
      )}
    />
  );
}
