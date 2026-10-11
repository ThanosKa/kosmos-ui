'use client';

import { DetailDrawer } from '@/registry/kosmos/blocks/detail-drawer/detail-drawer';

export default function DetailDrawerDemo() {
  return <DetailDrawer onAction={(action, account) => console.info(action, account.name)} />;
}
