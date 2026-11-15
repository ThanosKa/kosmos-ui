'use client';

import { Download, Link2, Pencil, Trash2 } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { Button } from '@/registry/kosmos/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/registry/kosmos/ui/dropdown-menu';
import { Skeleton } from '@/registry/kosmos/ui/skeleton';
import { StatCard, StatCardDelta, StatCardLabel, StatCardSparkline, StatCardValue } from '@/registry/kosmos/ui/stat-card';
import { ToastList, ToastPortal, ToastProvider, ToastViewport, createToastManager, useToastManager } from '@/registry/kosmos/ui/toast';
import type { GalleryItem } from '../gallery';
import { PortalHost, Stage, at, keepInStage } from '../stage';

const toastManager = createToastManager();
const events = [
  { title: 'Project created', description: 'Hollow Oak Games is ready.', type: 'success' },
  { title: 'Invite sent', description: 'ama@acme.example', type: 'info' },
  { title: 'Quota at 90%', description: 'Upgrade before it resets.', type: 'warning' },
] as const;

function ToastDriver({ tick }: { tick: number }) {
  const manager = useToastManager();
  const last = useRef(-1);
  useEffect(() => {
    const t = at(tick, 8);
    if (last.current === t) return;
    last.current = t;
    if (t === 0) manager.toasts.forEach((item) => manager.close(item.id));
    const next = events[t - 1];
    if (next && t <= 3) manager.add({ ...next, timeout: 0 });
    if (t === 6) manager.close(manager.toasts[manager.toasts.length - 1]?.id);
  }, [tick, manager]);
  return null;
}

const sparkline = [31, 36, 33, 41, 44, 39, 48, 52, 49, 58].map((value) => ({ value }));
const fmt = new Intl.NumberFormat('en-US');
const ease = (p: number) => 1 - (1 - p) ** 3;

export const toastCard: GalleryItem = {
  id: 'toast',
  title: 'Toast',
  description: 'Toasts slide up and stack, and the oldest one steps back.',
  href: '/docs/components/toast',
  stage: (
    <Stage base={300} interval={900} staticTick={3}>
      {(tick) => (
        <PortalHost>
          {(host) => (
            <ToastProvider toastManager={toastManager} limit={3}>
              <ToastDriver tick={tick} />
              <div className="flex flex-col gap-3 p-4">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-3 w-2/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              {host ? (
                <ToastPortal container={host}>
                  <ToastViewport className="absolute inset-x-4 bottom-4 sm:start-4 sm:end-4 sm:w-auto">
                    <ToastList />
                  </ToastViewport>
                </ToastPortal>
              ) : null}
            </ToastProvider>
          )}
        </PortalHost>
      )}
    </Stage>
  ),
};

export const numberTickerCard: GalleryItem = {
  id: 'ticker',
  title: 'Number ticker',
  description: 'Headline numbers count up to their value, in digits that never shift.',
  href: '/docs/components/number-ticker',
  stage: (
    <Stage base={360} interval={60} staticTick={40}>
      {(tick) => {
        const p = ease(Math.min(1, at(tick, 60) / 36));
        return (
          <div className="flex h-full flex-col justify-center p-5">
            <StatCard className="w-full max-w-none">
              <StatCardLabel>Events this month</StatCardLabel>
              <StatCardValue>{fmt.format(Math.round(2_481_900 * p))}</StatCardValue>
              <StatCardDelta value={12.4}>vs September</StatCardDelta>
              <StatCardSparkline data={sparkline} aria-label="Events, last 10 days" />
            </StatCard>
          </div>
        );
      }}
    </Stage>
  ),
};

export const dropdownMenuCard: GalleryItem = {
  id: 'menu',
  title: 'Dropdown menu',
  description: 'It grows out of its trigger, from the exact point it was pressed.',
  href: '/docs/components/dropdown-menu',
  stage: (
    <Stage base={400} interval={1400} staticTick={1}>
      {(tick) => (
        <PortalHost>
          {(host) => (
            <div className="flex justify-center pt-8">
              <DropdownMenu open={at(tick, 3) !== 0} modal={false}>
                <DropdownMenuTrigger render={<Button variant="secondary" />}>Project actions</DropdownMenuTrigger>
                {host ? (
                  <DropdownMenuContent container={host} align="center" collisionPadding={keepInStage} className="w-52">
                    <DropdownMenuItem>
                      <Pencil aria-hidden /> Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link2 aria-hidden /> Copy link
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Download aria-hidden /> Export CSV
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Trash2 aria-hidden /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                ) : null}
              </DropdownMenu>
            </div>
          )}
        </PortalHost>
      )}
    </Stage>
  ),
};


