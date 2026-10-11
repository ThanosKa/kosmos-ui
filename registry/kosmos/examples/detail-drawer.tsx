'use client';

import { OverlayStage, OverlayStageGrid } from '@/components/preview/overlay-stage';
import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { DetailDrawer, type DetailTask } from '@/registry/kosmos/blocks/detail-drawer/components/detail-drawer';

const longTask: DetailTask = {
  id: 'KOS-201',
  title:
    'Investigate why the weekly digest email is sent twice to workspace owners who belong to more than one organization and also manage billing',
  meta: 'Notifications and email delivery · created by Alexandria Montgomery-Fitzgerald on Sep 18',
  status: 'backlog',
  priority: 'urgent',
  assignee: { name: 'Alexandria Montgomery-Fitzgerald', initials: 'AM' },
  due: 'Nov 30',
  labels: ['Bug', 'Email', 'Billing', 'Needs triage', 'Customer reported'],
  description:
    'Owners of two or more organizations get one digest per organization, and a second copy when they also manage billing. Supercalifragilisticexpialidocious-configuration-flag decides which list they land on.',
  activity: [
    {
      id: 'a1',
      author: { name: 'Alexandria Montgomery-Fitzgerald', initials: 'AM' },
      action: 'created the task and asked the email team to look at the delivery logs for the last two weeks',
      time: 'Sep 18',
    },
  ],
};

const emptyTask: DetailTask = {
  id: 'KOS-150',
  title: 'Untitled task',
  status: 'todo',
  priority: 'low',
};

const stage = 'h-[40rem]';

export default function DetailDrawerPreview() {
  return (
    <PreviewStack>
      <PreviewSection title="Live (opens from its trigger)">
        <div>
          <DetailDrawer />
        </div>
      </PreviewSection>

      <PreviewSection title="Open">
        <OverlayStageGrid>
          <OverlayStage label="full task" className={stage}>
            {(container) => <DetailDrawer open modal={false} container={container} initialFocus={false} trigger={null} />}
          </OverlayStage>
          <OverlayStage label="long text" className={stage}>
            {(container) => (
              <DetailDrawer task={longTask} open modal={false} container={container} initialFocus={false} trigger={null} />
            )}
          </OverlayStage>
          <OverlayStage label="no details yet" className={stage}>
            {(container) => (
              <DetailDrawer task={emptyTask} open modal={false} container={container} initialFocus={false} trigger={null} />
            )}
          </OverlayStage>
          <OverlayStage label="loading" className={stage}>
            {(container) => <DetailDrawer loading open modal={false} container={container} initialFocus={false} trigger={null} />}
          </OverlayStage>
        </OverlayStageGrid>
      </PreviewSection>
    </PreviewStack>
  );
}
