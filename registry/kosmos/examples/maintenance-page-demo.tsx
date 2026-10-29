'use client';

import { MaintenancePage } from '@/registry/kosmos/blocks/maintenance-page/maintenance-page';

export default function MaintenancePageDemo() {
  return (
    <div className="flex min-h-[40rem] w-full flex-col">
      <MaintenancePage
        // eslint-disable-next-line @next/next/no-img-element
        media={<img src="/logos/acme.svg" alt="" className="size-10 rounded-lg" />}
        onNotify={() => {}}
      />
    </div>
  );
}
