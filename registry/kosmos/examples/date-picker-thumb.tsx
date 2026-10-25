'use client';

import * as React from 'react';
import { ThumbStage } from '@/components/preview/overlay-stage';
import { DatePicker } from '@/registry/kosmos/ui/date-picker';

const today = new Date(2026, 9, 14);

/** The components index thumbnail: the docs demo with its calendar open. */
export default function DatePickerThumb() {
  // The open calendar moves the focus to the picked day; a thumbnail shows it at rest.
  React.useEffect(() => {
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => (document.activeElement as HTMLElement | null)?.blur());
    });
    return () => cancelAnimationFrame(frame);
  }, []);
  return (
    <ThumbStage className="h-96 max-w-md">
      {(container) => <DatePicker open aria-label="Due date" defaultValue={today} container={container} />}
    </ThumbStage>
  );
}
