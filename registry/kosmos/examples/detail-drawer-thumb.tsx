'use client';

import { ThumbStage } from '@/components/preview/overlay-stage';
import { DetailDrawer } from '@/registry/kosmos/blocks/detail-drawer/detail-drawer';

/** The blocks index thumbnail: the drawer open on a full record. */
export default function DetailDrawerThumb() {
  return (
    <ThumbStage className="h-[34rem] max-w-3xl">
      {(container) => (
        <DetailDrawer open modal={false} container={container} initialFocus={false} trigger={null} onAction={() => {}} />
      )}
    </ThumbStage>
  );
}
