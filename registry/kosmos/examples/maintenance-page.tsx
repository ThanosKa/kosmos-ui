'use client';

import { MaintenancePage } from '@/registry/kosmos/blocks/maintenance-page/maintenance-page';
import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';

const frame = 'flex min-h-[36rem] w-full flex-col overflow-hidden rounded-xl border border-transparent bg-background shadow-card';

export default function MaintenancePagePreview() {
  return (
    <PreviewStack>
      <PreviewSection title="Countdown, steps and the email field">
        <div className={frame}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <MaintenancePage media={<img src="/logos/acme.svg" alt="" className="size-10 rounded-lg" />} onNotify={() => {}} />
        </div>
      </PreviewSection>

      <PreviewSection title="Time is up">
        <div className={frame}>
          <MaintenancePage backAt={0} steps={[]} />
        </div>
      </PreviewSection>

      <PreviewSection title="Long text">
        <div className={frame}>
          <MaintenancePage
            title="Acme is moving every project of the Copperline Bank International Holdings and Partners workspace to the EU data region"
            steps={[
              { id: 'long', label: 'Copying 1,200,000,000 events from the US data region to the EU data region', status: 'running', note: '48% done' },
              { id: 'bare', label: 'API', status: 'pending' },
            ]}
            onNotify={() => {}}
          />
        </div>
      </PreviewSection>

      <PreviewSection title="Title only: no countdown, steps or links">
        <div className={frame}>
          <MaintenancePage description={null} backAt={null} steps={[]} actions={null} />
        </div>
      </PreviewSection>
    </PreviewStack>
  );
}
