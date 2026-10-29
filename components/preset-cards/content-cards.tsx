'use client';

import { AtSign, Download, Link2, MessageSquare } from 'lucide-react';
import { PresetCard } from '@/components/preset-cards/preset-card';
import { activity } from '@/components/preset-cards/data';
import { Asset, AssetImage } from '@/registry/kosmos/ui/asset';
import { Avatar, AvatarFallback, AvatarImage } from '@/registry/kosmos/ui/avatar';
import { Badge } from '@/registry/kosmos/ui/badge';
import { Button } from '@/registry/kosmos/ui/button';
import { Kbd, KbdGroup } from '@/registry/kosmos/ui/kbd';
import { ScrollArea } from '@/registry/kosmos/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/registry/kosmos/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/registry/kosmos/ui/tooltip';

/** Asset, Badge, Tooltip pinned open on an icon button. */
export function ReleaseCard() {
  return (
    <PresetCard title="What’s new" description="Release notes for October." bodyClassName="gap-3">
      <Asset ratio={16 / 9} className="rounded-xl">
        {/* Eager, so a full-page screenshot never catches the placeholder. */}
        <AssetImage src="/media/landscape.webp" alt="Abstract gradient cover for the release notes" loading="eager" />
      </Asset>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary">v2.14</Badge>
        <span className="text-caption text-muted-foreground">October 9, 2026</span>
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-body font-medium">Saved views and faster search</p>
        <p className="text-small text-pretty text-muted-foreground">
          Save any filter as a view, pin it to the sidebar and share it with your team. Search now answers in under
          100 ms on projects with a million events.
        </p>
      </div>
      <TooltipProvider>
        <div className="flex items-center justify-between gap-2 pt-1">
          <Button variant="secondary" href="/docs">
            Read the changelog
          </Button>
          <div className="flex items-center gap-2">
            <Tooltip open>
              <TooltipTrigger render={<Button variant="secondary" size="icon" aria-label="Copy link" />}>
                <Link2 />
              </TooltipTrigger>
              <TooltipContent side="bottom" className="flex items-center gap-2 pe-1">
                Copy link
                <KbdGroup>
                  <Kbd>⌘</Kbd>
                  <Kbd>L</Kbd>
                </KbdGroup>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger render={<Button variant="secondary" size="icon" aria-label="Download PDF" />}>
                <Download />
              </TooltipTrigger>
              <TooltipContent>Download PDF</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </TooltipProvider>
    </PresetCard>
  );
}

function ActivityList({ kind }: { kind?: (typeof activity)[number]['kind'] }) {
  const items = kind ? activity.filter((item) => item.kind === kind) : activity;
  return (
    <ScrollArea className="h-64">
      <ul className="flex flex-col divide-y divide-border pe-2">
        {items.map((item) => (
          <li key={item.id} className="flex items-start gap-3 py-2.5 first:pt-0">
            <Avatar size="sm" className="mt-0.5">
              {'avatar' in item.person ? <AvatarImage src={item.person.avatar} alt="" /> : null}
              <AvatarFallback>{item.person.initials}</AvatarFallback>
            </Avatar>
            <p className="min-w-0 flex-1 text-body text-pretty">
              <span className="font-medium">{item.person.name}</span>{' '}
              <span className="text-muted-foreground">{item.text}</span>
            </p>
            <span className="shrink-0 text-caption text-muted-foreground tabular-nums">{item.time}</span>
          </li>
        ))}
      </ul>
    </ScrollArea>
  );
}

/** Tabs with icons and counts, a ScrollArea feed under them. */
export function ActivityCard() {
  const mentions = activity.filter((item) => item.kind === 'mention').length;
  const comments = activity.filter((item) => item.kind === 'comment').length;
  return (
    <PresetCard title="Activity" description="What changed in your workspace today." bodyClassName="pt-2">
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="mentions">
            <AtSign data-icon="inline-start" />
            Mentions
            <span className="text-caption text-muted-foreground tabular-nums">{mentions}</span>
          </TabsTrigger>
          <TabsTrigger value="comments">
            <MessageSquare data-icon="inline-start" />
            Comments
            <span className="text-caption text-muted-foreground tabular-nums">{comments}</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <ActivityList />
        </TabsContent>
        <TabsContent value="mentions">
          <ActivityList kind="mention" />
        </TabsContent>
        <TabsContent value="comments">
          <ActivityList kind="comment" />
        </TabsContent>
      </Tabs>
    </PresetCard>
  );
}
