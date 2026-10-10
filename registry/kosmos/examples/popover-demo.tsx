import { Bell } from 'lucide-react';
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

export default function PopoverDemo() {
  return (
    <Popover>
      <PopoverTrigger render={<Button variant="secondary" />}>
        <Bell data-icon="inline-start" />
        Notifications
      </PopoverTrigger>
      <PopoverContent>
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
  );
}
