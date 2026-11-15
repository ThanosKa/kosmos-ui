'use client';

import { IntegrationBeam } from './beam';
import { assistantMessageCard, planChecklistCard, promptComposerCard, reasoningCard, runTimelineCard, toolApprovalCard, toolCallCard, usageMeterCard } from './cards/ai';
import { authCodeCard, projectsTableCard, detailDrawerCard, inviteTeammatesCard, kanbanBoardCard, settingsPanelCard } from './cards/blocks';
import { dropdownMenuCard, numberTickerCard, toastCard } from './cards/components';
import { overviewCard, projectsCard, roadmapCard } from './cards/screens';
import { Gallery, type GalleryItem, type GalleryTab } from './gallery';
import { Stage } from './stage';

const stackCard: GalleryItem = {
  id: 'stack',
  title: 'Built on your stack',
  description: 'Base UI, Tailwind and React underneath. The shadcn CLI copies every part into your app.',
  href: '/docs/installation',
  stage: (
    <Stage base={400} interval={60_000} staticTick={0}>
      {() => (
        <div className="flex h-full w-full items-center px-2">
          <IntegrationBeam />
        </div>
      )}
    </Stage>
  ),
};

const tabs: GalleryTab[] = [
  { id: 'components', label: 'Components', items: [stackCard, promptComposerCard, toastCard, toolApprovalCard, dropdownMenuCard, numberTickerCard], href: '/docs/components' },
  { id: 'ai', label: 'AI', items: [assistantMessageCard, reasoningCard, toolCallCard, planChecklistCard, runTimelineCard, usageMeterCard], href: '/docs/components' },
  { id: 'blocks', label: 'Blocks', items: [projectsTableCard, kanbanBoardCard, detailDrawerCard, inviteTeammatesCard, authCodeCard, settingsPanelCard], href: '/docs/blocks' },
  { id: 'screens', label: 'Screens', items: [projectsCard, roadmapCard, overviewCard], href: '/docs/blocks' },
];

export function LandingGallery() {
  return <Gallery tabs={tabs} />;
}
