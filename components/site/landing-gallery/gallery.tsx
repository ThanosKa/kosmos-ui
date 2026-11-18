'use client';

import { Pause, Play } from 'lucide-react';
import Link from 'next/link';
import { useState, type ReactNode } from 'react';
import { Button } from '@/registry/kosmos/ui/button';
import { StageStopped } from './stage';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/registry/kosmos/ui/tabs';

export type GalleryItem = { id: string; title: string; description: string; href: string; stage: ReactNode };
export type GalleryTab = { id: string; label: string; items: GalleryItem[]; href: string; linkLabel: string };

/** A card whose preview stops while a pointer is on it or focus is inside it, and while the gallery is paused. */
function GalleryCard({ item, paused }: { item: GalleryItem; paused: boolean }) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  return (
    <div
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      className="group relative flex w-full min-w-0 flex-col gap-3 rounded-2xl border border-transparent bg-card p-1 pb-3.5 text-card-foreground shadow-card">
      <StageStopped value={paused || hovered || focused}>{item.stage}</StageStopped>
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

/**
 * The landing's gallery: a tab per kind of part, each a grid of cards whose previews play while on screen. The pause
 * button stops every preview (WCAG 2.2.2); under reduced motion nothing plays, so it is hidden.
 */
export function Gallery({ tabs }: { tabs: GalleryTab[] }) {
  const [paused, setPaused] = useState(false);
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
                <GalleryCard item={item} paused={paused} />
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-2">
            <Button variant="secondary" href={tab.href}>
              {tab.linkLabel}
            </Button>
            <Button
              variant="secondary"
              size="icon"
              aria-label={paused ? 'Play the previews' : 'Pause the previews'}
              onClick={() => setPaused((value) => !value)}
              className="motion-reduce:hidden"
            >
              {paused ? <Play aria-hidden /> : <Pause aria-hidden />}
            </Button>
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}
