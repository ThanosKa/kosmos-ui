'use client';

import { ExternalLink, Trophy } from 'lucide-react';
import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { DashboardCrm, DashboardCrmPage, type Deal } from '@/registry/kosmos/blocks/dashboard-crm/dashboard-crm';
import { DropdownMenuItem } from '@/registry/kosmos/ui/dropdown-menu';

const frame = 'w-full rounded-xl border border-transparent bg-background p-4 shadow-card';

const longDeals: Deal[] = [
  {
    id: 'long',
    name: 'Scale with the EU data region and a nightly export to their own storage',
    customer: 'Copperline Bank International Holdings and Partners',
    rep: 'Guadalupe Fernández-Villaverde',
    stage: 'negotiation',
    winChance: 99,
    value: 12_840_000,
    detail: '1,200,000,000 events a month',
    closeDate: 'Dec 31, 2026',
    closeNote: 'in 81 days, after the board review',
  },
  { id: 'zero', name: 'Pro', customer: 'Kiln Studio', rep: 'Al', stage: 'lead', winChance: 0, value: 0, closeDate: 'Oct 12' },
];

function actions(deal: Deal) {
  return (
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
  );
}

export default function DashboardCrmPreview() {
  return (
    <PreviewStack>
      <PreviewSection title="As a page, beside the App sidebar">
        <DashboardCrmPage
          frame={{ storageKey: false, className: 'h-[48rem] w-full overflow-hidden rounded-xl border border-transparent shadow-card' }}
          sidebar={{ onNavigate: (_id, event) => event.preventDefault() }}
          onNewDeal={() => {}} dealActions={actions} tasksHref="#"
        />
      </PreviewSection>
      <PreviewSection title="Full, with a Deal button, row actions and View all tasks">
        <div className={frame}>
          <DashboardCrm onNewDeal={() => {}} dealActions={actions} tasksHref="#" />
        </div>
      </PreviewSection>

      <PreviewSection title="Defaults: no actions passed">
        <div className={frame}>
          <DashboardCrm />
        </div>
      </PreviewSection>

      <PreviewSection title="No data yet">
        <div className={frame}>
          <DashboardCrm deals={[]} stageTotals={[]} stageStats={[]} tasks={[]} quota={[]} activity={[]} />
        </div>
      </PreviewSection>

      <PreviewSection title="Long text and extreme values">
        <div className={frame}>
          <DashboardCrm
            deals={longDeals}
            dealActions={actions}
            stageTotals={[
              { stage: 'negotiation', value: 12_840_000, deals: 1_284 },
              { stage: 'won', value: 0, deals: 0 },
            ]}
            stageStats={[
              { label: 'Lead to won across every plan', value: '100%' },
              { label: 'Average deal', value: '$12.8M' },
            ]}
            tasks={[
              {
                id: 'long',
                icon: Trophy,
                title: 'Send the signed order form for the EU data region to Copperline Bank International',
                detail: 'Waiting on their legal team since September 18, 2026',
                action: 'Send',
              },
            ]}
            quota={[{ id: 'long', name: 'Guadalupe Fernández-Villaverde de la Concepción', team: 'Scale plans, Europe and Middle East', won: 1_284_000, target: 16000 }]}
            activity={[
              {
                id: 'long',
                who: 'Guadalupe Fernández-Villaverde',
                what: 'moved Scale with the EU data region and a nightly export to their own storage to Negotiation',
                when: '59m',
              },
            ]}
          />
        </div>
      </PreviewSection>

      <PreviewSection title="In a narrow container">
        <div className={`${frame} max-w-sm`}>
          <DashboardCrm onNewDeal={() => {}} tasksHref="#" />
        </div>
      </PreviewSection>
    </PreviewStack>
  );
}
