'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/registry/kosmos/ui/select';

const statuses = [
  { value: 'backlog', label: 'Backlog' },
  { value: 'todo', label: 'To do' },
  { value: 'in-progress', label: 'In progress' },
  { value: 'done', label: 'Done' },
];

/** The components index thumbnail: a select with its list open. */
export default function SelectThumb() {
  return (
    <div className="flex h-56 w-full max-w-md justify-center">
      <Select open modal={false} items={statuses} defaultValue="in-progress">
        <SelectTrigger aria-label="Status" className="w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false}>
          {statuses.map((status) => (
            <SelectItem key={status.value} value={status.value}>
              {status.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
