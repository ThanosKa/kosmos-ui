'use client';

import { OverlayStage, OverlayStageGrid } from '@/components/preview/overlay-stage';
import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { DetailDrawer, type DetailProject } from '@/registry/kosmos/blocks/detail-drawer/detail-drawer';

const longProject: DetailProject = {
  id: 'long',
  name: 'Fernhill Books Marketplace for Independent Booksellers and Publishers',
  domain: 'marketplace.independent-booksellers.fernhill.example',
  platform: 'server',
  plan: 'scale',
  status: 'live',
  users: 1284300,
  events: 912480600,
  mrr: 124800,
  lastEventAt: '2026-10-11',
  meta: 'Added on September 28, 2026 · moved from Pro to Scale on October 9 while their engineers move every storefront to the server SDK',
  trend: [
    { date: '2026-10-09', events: 0 },
    { date: '2026-10-10', events: 412800300 },
    { date: '2026-10-11', events: 499680300 },
  ],
  notes:
    'They want every storefront in one project. Supercalifragilisticexpialidocious-storefront-identifier decides which shop an event belongs to.',
  activity: [
    {
      id: 'a1',
      author: { name: 'Tomás Ortega', initials: 'TO' },
      action: 'changed the plan to Scale and raised the event rate limit for the import of three years of order history',
      time: 'Oct 11',
    },
  ],
};

const emptyProject: DetailProject = { id: 'new', name: 'Untitled project', status: 'trial' };

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
              <DetailDrawer project={longProject} open modal={false} container={container} initialFocus={false} trigger={null} onAction={noop} />
            )}
          </OverlayStage>
          <OverlayStage label="no details yet" className={stage}>
            {(container) => (
              <DetailDrawer project={emptyProject} open modal={false} container={container} initialFocus={false} trigger={null} />
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
