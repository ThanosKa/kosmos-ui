'use client';

import { Button } from '@/registry/kosmos/ui/button';
import { Toaster, toast } from '@/registry/kosmos/ui/toast';

function exportRows() {
  return new Promise<number>((resolve) => setTimeout(() => resolve(1240), 2000));
}

export default function ToastPromise() {
  return (
    <>
      <Button
        variant="secondary"
        onClick={() =>
          toast.promise(exportRows(), {
            loading: { title: 'Exporting rows…' },
            success: (rows) => ({ title: 'Export ready', description: `${new Intl.NumberFormat().format(rows)} rows in report.csv` }),
            error: { title: 'Unable to export', description: 'Try again in a minute.' },
          })
        }
      >
        Export CSV
      </Button>
      <Toaster />
    </>
  );
}
