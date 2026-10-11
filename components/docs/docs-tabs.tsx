import type { ReactNode } from 'react';
import { Tabs, TabsList, TabsTrigger } from 'fumadocs-ui/components/tabs';

/** The value Fumadocs gives a `<Tab value="…">`, so the triggers below match their panels. */
const toValue = (item: string) => item.toLowerCase().replace(/\s/, '-');

/**
 * Fumadocs `Tabs` as a plain tab row over open panels, with triggers that draw the focus outline inside,
 * since the tab list scrolls and clips anything outside it. Children are `<Tab value="…">` panels, one per item.
 */
export function DocsTabs({ items, children }: { items: string[]; children: ReactNode }) {
  return (
    <Tabs
      defaultValue={toValue(items[0])}
      className="not-prose min-w-0 overflow-visible rounded-none border-0 bg-transparent [&>[role=tabpanel]]:rounded-none [&>[role=tabpanel]]:bg-transparent [&>[role=tabpanel]]:px-0 [&>[role=tabpanel]]:pt-4 [&>[role=tabpanel]]:pb-0"
    >
      <TabsList className="gap-0 border-b border-border px-0">
        {items.map((item) => (
          <TabsTrigger
            key={item}
            value={toValue(item)}
            className="relative rounded-lg border-b-0 px-2 after:absolute after:inset-x-2 after:bottom-0 after:h-px data-[active]:after:bg-fd-primary focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
          >
            {item}
          </TabsTrigger>
        ))}
      </TabsList>
      {children}
    </Tabs>
  );
}
