import type { Metadata } from 'next';
import { RootProvider } from 'fumadocs-ui/provider/next';
import { groups, itemsInGroup, readRegistryItems, type Group } from '@/lib/registry';
import { Button } from '@/registry/kosmos/ui/button';

export const metadata: Metadata = { title: 'Approve' };

/** `/approve`: the approval groups in build order, with how many items each holds. */
export default function ApproveIndexPage() {
  const items = readRegistryItems();
  return (
    <RootProvider search={{ enabled: false }} theme={{ hotKey: false }}>
      <main className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-8 sm:px-10 sm:py-12">
        <div className="flex flex-col gap-1">
          <p className="text-caption tracking-[0.05em] text-muted-foreground uppercase">Approval</p>
          <h1 className="text-heading">Groups</h1>
        </div>
        <ul className="flex flex-col divide-y divide-border">
          {(Object.keys(groups) as Group[]).map((group) => {
            const count = itemsInGroup(group, items).length;
            return (
              <li key={group} className="flex items-center justify-between gap-4 py-2">
                <Button variant="item" href={`/approve/${group}`}>
                  {groups[group]}
                </Button>
                <span className="text-small text-muted-foreground tabular-nums">
                  {count} {count === 1 ? 'item' : 'items'}
                </span>
              </li>
            );
          })}
        </ul>
      </main>
    </RootProvider>
  );
}
