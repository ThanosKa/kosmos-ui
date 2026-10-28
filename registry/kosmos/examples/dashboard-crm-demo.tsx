'use client';

import { ExternalLink, Trophy } from 'lucide-react';
import { DashboardCrm } from '@/registry/kosmos/blocks/dashboard-crm/dashboard-crm';
import { DropdownMenuItem } from '@/registry/kosmos/ui/dropdown-menu';

export default function DashboardCrmDemo() {
  return (
    <DashboardCrm
      className="w-full"
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
