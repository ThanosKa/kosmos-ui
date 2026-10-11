'use client';

import { OverlayStage, OverlayStageGrid } from '@/components/preview/overlay-stage';
import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { DetailDrawer, type DetailAccount } from '@/registry/kosmos/blocks/detail-drawer/detail-drawer';

const longAccount: DetailAccount = {
  id: 'long',
  name: 'International Association of Independent Freight Forwarders and Customs Brokers',
  domain: 'association-of-independent-freight-forwarders.example',
  status: 'trial',
  owner: { name: 'Alexandria Montgomery-Fitzgerald', initials: 'AM' },
  arr: 1250000,
  health: 100,
  lastActivity: '2026-10-11',
  meta: 'Enterprise plan with the compliance add-on · trial since September 2026, extended twice',
  labels: ['Enterprise', 'Compliance add-on', 'Procurement review', 'EU data residency', 'Renewal in Q1'],
  notes:
    'Their procurement team wants a data processing agreement before the trial ends. Supercalifragilisticexpialidocious-configuration-flag decides which region their data lands in.',
  activity: [
    {
      id: 'a1',
      author: { name: 'Alexandria Montgomery-Fitzgerald', initials: 'AM' },
      action: 'extended the trial by 30 days and asked legal to review the data processing agreement',
      time: 'Oct 11',
    },
  ],
};

const emptyAccount: DetailAccount = { id: 'new', name: 'Untitled account', status: 'trial' };

const stage = 'h-[40rem]';
const noop = () => {};

export default function DetailDrawerPreview() {
  return (
    <PreviewStack>
      <PreviewSection title="Open, more menu pinned open">
        <OverlayStageGrid>
          <OverlayStage label="full record, more menu open" className={stage}>
            {(container) => (
              <DetailDrawer
                open
                modal={false}
                container={container}
                initialFocus={false}
                trigger={null}
                onAction={noop}
                actionsMenu={{ open: true, modal: false }}
              />
            )}
          </OverlayStage>
          <OverlayStage label="long text" className={stage}>
            {(container) => (
              <DetailDrawer account={longAccount} open modal={false} container={container} initialFocus={false} trigger={null} onAction={noop} />
            )}
          </OverlayStage>
          <OverlayStage label="no details yet" className={stage}>
            {(container) => (
              <DetailDrawer account={emptyAccount} open modal={false} container={container} initialFocus={false} trigger={null} />
            )}
          </OverlayStage>
          <OverlayStage label="loading" className={stage}>
            {(container) => <DetailDrawer loading open modal={false} container={container} initialFocus={false} trigger={null} />}
          </OverlayStage>
        </OverlayStageGrid>
      </PreviewSection>

      <PreviewSection title="Live (opens from its trigger)">
        <div>
          <DetailDrawer onAction={noop} />
        </div>
      </PreviewSection>
    </PreviewStack>
  );
}
