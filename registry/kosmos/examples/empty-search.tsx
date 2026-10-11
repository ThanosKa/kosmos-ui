import { SearchX } from 'lucide-react';
import { Button } from '@/registry/kosmos/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/registry/kosmos/ui/empty';

export default function EmptySearch() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <SearchX />
        </EmptyMedia>
        <EmptyTitle render={<h2 />}>No companies match “northwnd”</EmptyTitle>
        <EmptyDescription>Check the spelling or clear the filters to see every company.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="secondary">Clear filters</Button>
      </EmptyContent>
    </Empty>
  );
}
