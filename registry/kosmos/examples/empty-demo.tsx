import { FolderPlus, Plus } from 'lucide-react';
import { Button } from '@/registry/kosmos/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/registry/kosmos/ui/empty';

export default function EmptyDemo() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FolderPlus />
        </EmptyMedia>
        <EmptyTitle render={<h2 />}>No projects yet</EmptyTitle>
        <EmptyDescription>Create a project to group your tasks, files and people in one place.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="secondary">
          <Plus data-icon="inline-start" />
          New project
        </Button>
      </EmptyContent>
    </Empty>
  );
}
