'use client';

import { Copy, UserRound } from 'lucide-react';
import { DashboardAnalyticsPage } from '@/registry/kosmos/blocks/dashboard-analytics/dashboard-analytics';
import { DropdownMenuItem } from '@/registry/kosmos/ui/dropdown-menu';

export default function DashboardAnalyticsDemo() {
  return (
    <DashboardAnalyticsPage
      frame={{
        // In an app, leave the frame out: the page fills the screen.
        storageKey: false,
        className: 'h-[48rem] w-full overflow-hidden rounded-xl border border-transparent shadow-card',
      }}
      sidebar={{ onNavigate: (_id, event) => event.preventDefault() }}
      signupActions={(signup) => (
        <>
          <DropdownMenuItem>
            <UserRound />
            View profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigator.clipboard?.writeText(signup.email)}>
            <Copy />
            Copy email
          </DropdownMenuItem>
        </>
      )}
    />
  );
}
