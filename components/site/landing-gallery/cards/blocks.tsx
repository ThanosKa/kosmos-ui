'use client';

import { Circle, CircleDot } from 'lucide-react';
import { useEffect } from 'react';
import { ProjectsTable, sampleProjects, type Project } from '@/registry/kosmos/blocks/projects-table/projects-table';
import { DetailDrawer, sampleProject, type DetailStatus } from '@/registry/kosmos/blocks/detail-drawer/detail-drawer';
import { EmailCodeForm } from '@/registry/kosmos/blocks/auth-forms/auth-forms';
import { KanbanBoard, sampleRoadmapItems, type KanbanColumn } from '@/registry/kosmos/blocks/kanban-board/kanban-board';
import { SettingsPanel } from '@/registry/kosmos/blocks/settings/settings';
import { isEmail } from '@/registry/kosmos/lib/tags';
import { Avatar, AvatarFallback, AvatarGroup, AvatarImage } from '@/registry/kosmos/ui/avatar';
import { Button } from '@/registry/kosmos/ui/button';
import { Switch } from '@/registry/kosmos/ui/switch';
import { TagsInput } from '@/registry/kosmos/ui/tags-input';
import type { GalleryItem } from '../gallery';
import { PortalHost, Stage, at, typed } from '../stage';

/** The two lanes the gallery shows, wide enough that every card reads at the stage's scale. */
export const boardColumns: KanbanColumn[] = [
  { id: 'planned', title: 'Planned', icon: Circle, tone: 'muted' },
  { id: 'in-progress', title: 'In progress', icon: CircleDot, tone: 'warning' },
];

const boardItems = sampleRoadmapItems.filter((item) => ['retention-cohorts', 'saml-sso', 'funnel-comparisons', 'server-batching'].includes(item.id));

/** Two cards swap lanes, so each lane keeps two cards and the board never grows past the stage. */
const swaps: Record<string, string> = { 'saml-sso': 'in-progress', 'server-batching': 'planned' };

export function boardAt(tick: number) {
  const swapped = at(tick, 4) >= 2;
  return boardItems.map((item) => (swapped && swaps[item.id] ? { ...item, column: swaps[item.id] } : item));
}

const invitees = ['ama@acme.example', 'tomas@acme.example', 'ines@acme.example', 'keiko@acme.example'];
const notifications = ['Weekly summary', 'Signup alerts', 'Quota warnings', 'Product updates'];

export const kanbanBoardCard: GalleryItem = {
  id: 'kanban',
  title: 'Kanban board',
  description: 'Cards move across the lanes as work ships.',
  href: '/docs/blocks/kanban-board',
  stage: (
    <Stage base={608} interval={1500} staticTick={1}>
      {(tick) => (
        <div className="flex h-full p-3">
          <KanbanBoard columns={boardColumns} items={boardAt(tick)} onItemsChange={() => {}} />
        </div>
      )}
    </Stage>
  ),
};

const drawerStatuses: DetailStatus[] = ['live', 'paused', 'trial'];
const drawerSteps = 8;
/** Where the body rests at each step of the loop: the top, a section heading (by index), or the end. */
const drawerStops: Array<'top' | 'end' | number> = ['top', 'top', 0, 1, 2, 'end', 'end', 'top'];

/** The open drawer, readable from the first frame: its loop scrolls through the record, then a new note lands and the status changes at the top. */
function DetailDrawerLoop({ tick, host }: { tick: number; host: HTMLElement }) {
  const step = at(tick, drawerSteps);
  const loop = Math.floor(tick / drawerSteps);
  const project = {
    ...sampleProject,
    status: drawerStatuses[loop % drawerStatuses.length],
    activity: sampleProject.activity?.slice(0, step >= 5 ? 3 : 2),
  };

  useEffect(() => {
    const viewport = host.querySelector('[data-slot="scroll-area-viewport"]');
    if (!viewport) return;
    const stop = drawerStops[step];
    const max = viewport.scrollHeight - viewport.clientHeight;
    const heading = typeof stop === 'number' ? viewport.querySelectorAll('h3')[stop] : undefined;
    // The stage scales the drawer, so measured distances are divided back to layout pixels.
    const scale = viewport.getBoundingClientRect().height / viewport.clientHeight;
    const target = heading
      ? viewport.scrollTop + (heading.getBoundingClientRect().top - viewport.getBoundingClientRect().top) / scale - 12
      : stop === 'end'
        ? max
        : 0;
    viewport.scrollTo({ top: Math.max(0, Math.min(max, target)), behavior: 'smooth' });
  }, [host, step]);

  return <DetailDrawer trigger={null} open modal={false} container={host} initialFocus={false} project={project} />;
}

/** What the server renders and the first client frame shows, since the drawer itself mounts in a portal that needs the browser: the same panel at rest. */
function DetailDrawerSketch() {
  return (
    <div className="absolute inset-2 flex flex-col rounded-xl border border-transparent bg-popover text-body text-popover-foreground shadow-modal">
      <div className="flex h-12 shrink-0 items-center justify-between ps-5 pe-4 text-caption text-muted-foreground">
        <span>{sampleProject.domain}</span>
        <span aria-hidden>×</span>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-hidden px-5">
        <p className="text-title">{sampleProject.name}</p>
        <p className="text-small text-muted-foreground">{sampleProject.meta}</p>
        <dl className="grid grid-cols-[6.5rem_1fr] gap-x-4 gap-y-1.5 pt-5">
          <dt className="flex h-7.5 items-center text-muted-foreground">Status</dt>
          <dd className="flex h-7.5 items-center gap-2">
            <span aria-hidden className="size-2 rounded-full bg-success" />
            Live
          </dd>
          <dt className="flex h-7.5 items-center text-muted-foreground">Plan</dt>
          <dd className="flex h-7.5 items-center">
            Pro
          </dd>
          <dt className="flex h-7.5 items-center text-muted-foreground">Platform</dt>
          <dd className="flex h-7.5 items-center">iOS</dd>
        </dl>
      </div>
      <div className="flex shrink-0 items-end gap-2 border-t border-border px-5 py-4">
        <div className="min-h-7.5 flex-1 rounded-lg bg-secondary px-3 py-1 text-muted-foreground shadow-field">Add a note…</div>
        <Button variant="primary">Add note</Button>
      </div>
    </div>
  );
}

export const detailDrawerCard: GalleryItem = {
  id: 'drawer',
  title: 'Detail drawer',
  description: 'A record slides in from the edge, with its status, plan and activity.',
  href: '/docs/blocks/detail-drawer',
  stage: (
    <Stage base={500} interval={2200} staticTick={0}>
      {(tick) => (
        <PortalHost className="overflow-hidden [&_[data-slot=drawer-popup]]:max-w-none! [&_[data-slot=drawer-popup]]:transition-none">
          {(host) => (host ? <DetailDrawerLoop tick={tick} host={host} /> : <DetailDrawerSketch />)}
        </PortalHost>
      )}
    </Stage>
  ),
};

export const inviteTeammatesCard: GalleryItem = {
  id: 'invite',
  title: 'Invite teammates',
  description: 'Paste emails and they become tags. A bad address turns red.',
  href: '/docs/components/tags-input',
  stage: (
    <Stage base={400} interval={900} staticTick={3}>
      {(tick) => {
        const count = 1 + at(tick, 7);
        const tags = count <= 4 ? invitees.slice(0, count) : [...invitees.slice(0, 2), 'ines@acme'];
        return (
          <div className="flex h-full flex-col justify-center p-5">
            <div className="rounded-xl border border-transparent bg-card p-4 shadow-card">
              <p className="mb-3 text-body font-medium text-foreground">Invite to Acme</p>
              <TagsInput value={tags} onValueChange={() => {}} validate={isEmail} placeholder="name@acme.example" aria-label="Invite by email" />
              <div className="mt-4 flex items-center justify-between">
                <AvatarGroup>
                  {tags.map((tag) => (
                    <Avatar key={tag}>
                      <AvatarImage src={`/avatars/${tag.split('@')[0]}.jpg`} alt="" />
                      <AvatarFallback>{tag.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  ))}
                </AvatarGroup>
                <Button variant="primary">Send {tags.length} {tags.length === 1 ? 'invite' : 'invites'}</Button>
              </div>
            </div>
          </div>
        );
      }}
    </Stage>
  ),
};

export const authCodeCard: GalleryItem = {
  id: 'code',
  title: 'Auth code entry',
  description: 'One character a box, and it verifies itself when the last box fills.',
  href: '/docs/blocks/auth-forms',
  stage: (
    <Stage base={720} interval={420} staticTick={4}>
      {(tick) => {
        const t = at(tick, 18);
        const loop = Math.floor(tick / 18);
        return (
          <div className="flex h-full items-center justify-center p-5">
            <EmailCodeForm key={loop} email="lena@acme.example" code={typed('482913', t)} onCodeChange={() => {}} onVerify={() => {}} className="w-full" />
          </div>
        );
      }}
    </Stage>
  ),
};

export const settingsPanelCard: GalleryItem = {
  id: 'settings',
  title: 'Settings panel',
  description: 'Switches flip and the page saves as you go.',
  href: '/docs/blocks/settings',
  stage: (
    <Stage base={460} interval={900} staticTick={3}>
      {(tick) => {
        const t = at(tick, 9);
        return (
          <div className="flex h-full items-center p-5">
            <SettingsPanel title="Notifications" description="What Acme emails you about." className="w-full">
              <ul className="flex flex-col divide-y divide-border">
                {notifications.map((label, index) => (
                  <li key={label} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                    <span className="text-body font-medium">{label}</span>
                    <Switch checked={(t + index * 2) % 8 < 4} aria-label={label} />
                  </li>
                ))}
              </ul>
            </SettingsPanel>
          </div>
        );
      }}
    </Stage>
  ),
};

const arrivingProject: Project = {
  id: 'lumenfield',
  name: 'Lumenfield Health',
  domain: 'lumenfield.example',
  platform: 'web',
  plan: 'pro',
  status: 'trial',
  users: 640,
  events: 18200,
  mrr: 0,
  lastEventAt: '2026-10-11',
};

const tableRows = 4;
const tableSteps = 10;

/** The same five rows all loop long: a trial arrives at the top, then converts to live, then the next one signs up. */
function projectsAt(tick: number): Project[] {
  const step = at(tick, tableSteps);
  const base = sampleProjects.slice(0, tableRows);
  if (step < 2) return base;
  const arrived: Project = step < 6 ? arrivingProject : { ...arrivingProject, status: 'live', mrr: 149 };
  return [arrived, ...base.slice(0, tableRows - 1)];
}

export const projectsTableCard: GalleryItem = {
  id: 'projects-table',
  title: 'Projects table',
  description: 'Sort, filter and page through projects. New ones arrive and trials convert.',
  href: '/docs/blocks/projects-table',
  stage: (
    <Stage base={600} interval={1400} staticTick={7}>
      {(tick) => (
        <div className="flex h-full items-center p-3">
          <div className="w-full overflow-hidden rounded-2xl border border-transparent bg-card shadow-card">
            <ProjectsTable rows={projectsAt(tick)} />
          </div>
        </div>
      )}
    </Stage>
  ),
};
