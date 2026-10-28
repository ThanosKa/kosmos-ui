'use client';

import { Copy, UserRound } from 'lucide-react';
import { DashboardAnalytics } from '@/registry/kosmos/blocks/dashboard-analytics/dashboard-analytics';
import { DropdownMenuItem } from '@/registry/kosmos/ui/dropdown-menu';

export default function DashboardAnalyticsDemo() {
  return (
    <DashboardAnalytics
      className="w-full"
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
