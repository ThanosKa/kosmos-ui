'use client';

import { useState } from 'react';
import { DataTable, type DataTableAction } from '@/registry/kosmos/blocks/data-table/data-table';

const actionLabels: Record<DataTableAction, string> = {
  'copy-link': 'Copied the link to',
  export: 'Exported',
  pause: 'Paused',
  resume: 'Resumed',
  delete: 'Asked to delete',
};

export default function DataTableDemo() {
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="w-full overflow-hidden rounded-xl border border-transparent bg-background shadow-card">
        <DataTable
          onOpen={(row) => setMessage(`Opened ${row.name}.`)}
          onAction={(action, rows) =>
            setMessage(`${actionLabels[action]} ${rows.length === 1 ? rows[0].name : `${rows.length} projects`}.`)
          }
        />
      </div>
      <p aria-live="polite" className="text-small text-muted-foreground">
        {message ?? 'Select rows, sort a column, or open a project.'}
      </p>
    </div>
  );
}
