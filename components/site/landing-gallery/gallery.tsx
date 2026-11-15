'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { Button } from '@/registry/kosmos/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/registry/kosmos/ui/tabs';

export type GalleryItem = { id: string; title: string; description: string; href: string; stage: ReactNode };
export type GalleryTab = { id: string; label: string; items: GalleryItem[]; href: string };

function GalleryCard({ item }: { item: GalleryItem }) {
  return (
    <div className="group relative flex w-full min-w-0 flex-col gap-3 rounded-2xl border border-transparent bg-card p-1 pb-3.5 text-card-foreground shadow-card">
      {item.stage}
      <div className="flex min-w-0 flex-col gap-0.5 px-3">
        <Link
          href={item.href}
          className="truncate text-title after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          {item.title}
        </Link>
        <span className="line-clamp-2 text-small text-pretty text-muted-foreground">{item.description}</span>
      </div>
      <span aria-hidden className="pointer-events-none absolute inset-0 rounded-2xl bg-accent opacity-0 transition-[opacity] group-hover:opacity-100" />
    </div>
  );
}

export function Gallery({ tabs }: { tabs: GalleryTab[] }) {
  return (
    <Tabs defaultValue={tabs[0].id} className="items-center gap-8">
      <TabsList>
        {tabs.map((tab) => (
          <TabsTrigger key={tab.id} value={tab.id}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab.id} value={tab.id} className="flex w-full flex-col items-center gap-8">
          <ul className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tab.items.map((item) => (
              <li key={item.id} className="flex min-w-0">
                <GalleryCard item={item} />
              </li>
            ))}
          </ul>
          <Button variant="secondary" href={tab.href}>
            Explore all {tab.label.toLowerCase()}
          </Button>
        </TabsContent>
      ))}
    </Tabs>
  );
}
