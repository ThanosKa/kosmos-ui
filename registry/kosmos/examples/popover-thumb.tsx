'use client';

import { Bell } from 'lucide-react';
import { ThumbStage } from '@/components/preview/overlay-stage';
import { Button } from '@/registry/kosmos/ui/button';
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/registry/kosmos/ui/popover';

/** The components index thumbnail: the docs demo with its popover open. */
export default function PopoverThumb() {
  return (
    <ThumbStage className="flex h-56 max-w-md justify-center">
      {(container) => (
        <Popover open modal={false}>
          <PopoverTrigger render={<Button variant="secondary" />}>
            <Bell data-icon="inline-start" />
            Notifications
          </PopoverTrigger>
          <PopoverContent container={container} initialFocus={false}>
            <PopoverHeader>
              <PopoverTitle>Turn on notifications?</PopoverTitle>
              <PopoverDescription>Get an email when someone assigns you a task or mentions you.</PopoverDescription>
            </PopoverHeader>
            <div className="flex justify-end gap-2">
              <PopoverClose render={<Button variant="secondary" size="sm" />}>Not now</PopoverClose>
              <PopoverClose render={<Button variant="primary" size="sm" />}>Turn on</PopoverClose>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </ThumbStage>
  );
}
