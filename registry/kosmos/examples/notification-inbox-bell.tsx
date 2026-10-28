'use client';

import * as React from 'react';
import { Button } from '@/registry/kosmos/ui/button';
import { NotificationBell } from '@/registry/kosmos/ui/notification-inbox';

export default function NotificationInboxBell() {
  const [count, setCount] = React.useState(3);
  return (
    <div className="flex items-center gap-4">
      <NotificationBell count={count} />
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" onClick={() => setCount((value) => value + 1)}>
          New notification
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setCount(0)}>
          Clear
        </Button>
      </div>
    </div>
  );
}
