'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/registry/kosmos/ui/button';
import { EmptyState } from '@/registry/kosmos/ui/empty';

const card = 'flex rounded-2xl border border-transparent bg-card shadow-card';

export default function EmptyStates() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className={card}>
        <EmptyState
          variant="first-use"
          noun="projects"
          description="Add a project, and it shows up here once it sends its first event."
          action={
            <Button variant="primary">
              <Plus data-icon="inline-start" />
              New project
            </Button>
          }
        />
      </div>
      <div className={card}>
        <EmptyState variant="no-results" noun="projects" query="fernhil" onClear={() => {}} />
      </div>
      <div className={card}>
        <EmptyState variant="filtered" noun="projects" onClear={() => {}} />
      </div>
      <div className={card}>
        <EmptyState variant="error" noun="projects" onRetry={() => {}} />
      </div>
      <div className={card}>
        <EmptyState
          variant="no-permission"
          noun="billing"
          action={<Button variant="secondary">Request access</Button>}
        />
      </div>
      <div className={card}>
        <EmptyState compact variant="first-use" title="No items" description="Drag a card here to plan it." />
      </div>
    </div>
  );
}
