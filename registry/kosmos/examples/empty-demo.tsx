import { FolderPlus } from 'lucide-react';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/registry/kosmos/ui/empty';

export default function EmptyDemo() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FolderPlus />
        </EmptyMedia>
        <EmptyTitle render={<h2 />}>No projects yet</EmptyTitle>
        <EmptyDescription>
          Projects group your tasks, files and people in one place. <a href="#new-project">Create a project</a>
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
