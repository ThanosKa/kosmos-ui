'use client';

import { useState } from 'react';
import { DataTable, type Account } from '@/registry/kosmos/blocks/data-table/data-table';

export default function DataTableDemo() {
  const [opened, setOpened] = useState<Account | null>(null);

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="w-full overflow-hidden rounded-xl border border-transparent bg-background shadow-card">
        <DataTable onOpen={setOpened} />
      </div>
      <p aria-live="polite" className="text-small text-muted-foreground">
        {opened ? `Opened ${opened.name}.` : 'Select rows, sort a column, or open an account.'}
      </p>
    </div>
  );
}
