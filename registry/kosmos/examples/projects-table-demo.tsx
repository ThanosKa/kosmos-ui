'use client';

import { useState } from 'react';
import { ProjectsTable, type ProjectsTableAction } from '@/registry/kosmos/blocks/projects-table/projects-table';

const actionLabels: Record<ProjectsTableAction, string> = {
  'copy-link': 'Copied the link to',
  export: 'Exported',
  pause: 'Paused',
  resume: 'Resumed',
  delete: 'Asked to delete',
};

export default function ProjectsTableDemo() {
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="w-full overflow-hidden rounded-xl border border-transparent bg-background shadow-card">
        <ProjectsTable
          onOpen={(row) => setMessage(`Opened ${row.name}.`)}
          onAction={(action, rows) =>
            setMessage(`${actionLabels[action]} ${rows.length === 1 ? rows[0].name : `${rows.length} projects`}.`)
          }
        />
      </div>
      <p aria-live="polite" className="text-small text-muted-foreground">
        {message ?? 'Search, filter, sort from a header, select rows, or open a project.'}
      </p>
    </div>
  );
}
