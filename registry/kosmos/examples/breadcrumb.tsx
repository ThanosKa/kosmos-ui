'use client';

import { Slash } from 'lucide-react';
import { OverlayStage, OverlayStageGrid } from '@/components/preview/overlay-stage';
import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { StateMatrix, previewState } from '@/components/preview/state-matrix';
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbTrail,
  type BreadcrumbCrumb,
} from '@/registry/kosmos/ui/breadcrumb';

const trail: BreadcrumbCrumb[] = [
  { label: 'Acme', href: '/' },
  { label: 'Projects', href: '/projects' },
  { label: 'Fernhill Books', href: '/projects/fernhill' },
  { label: 'Settings', href: '/projects/fernhill/settings' },
  { label: 'API keys' },
];

const longTrail: BreadcrumbCrumb[] = [
  { label: 'Acme', href: '/' },
  { label: 'Projects', href: '/projects' },
  { label: 'Brightloop Fitness for iOS and watchOS, production', href: '/projects/brightloop' },
  { label: 'Funnels', href: '/projects/brightloop/funnels' },
  { label: 'Trial started to first workout logged within seven days of install' },
];

const nonLatinTrail: BreadcrumbCrumb[] = [
  { label: 'Acme', href: '/' },
  { label: 'Έργα', href: '/projects' },
  { label: 'カフェ・ソルトマーシュ', href: '/projects/saltmarsh' },
  { label: 'Ρυθμίσεις' },
];

const widths = [
  { label: 'fills 100%', className: 'w-full' },
  { label: '400px: hides 1', className: 'w-full max-w-[400px]' },
  { label: '300px: hides 2', className: 'w-full max-w-[300px]' },
  { label: '220px: hides 3', className: 'w-full max-w-[220px]' },
  { label: '150px: the first folds in too', className: 'w-full max-w-[150px]' },
  { label: '110px: the page truncates', className: 'w-full max-w-[110px]' },
];

const deepTrail: BreadcrumbCrumb[] = [
  ...trail.slice(0, 3),
  ...['Events', 'Checkout', 'Payment', 'Card', 'Retries', 'Week 41', 'EU', 'Mobile web'].map((label, index) => ({
    label,
    href: `/projects/fernhill/events/${index}`,
  })),
  { label: 'Declined cards' },
];

const linkStates = ['default', 'hover', 'focus'] as const;

function Frame({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <figure className="flex min-w-0 flex-col gap-2">
      <figcaption className="font-mono text-caption text-muted-foreground">{label}</figcaption>
      <div className={className}>
        <div className="rounded-2xl border border-transparent bg-card px-3 py-2 shadow-card">{children}</div>
      </div>
    </figure>
  );
}

export default function BreadcrumbPreview() {
  return (
    <PreviewStack>
      <PreviewSection title="Parts × states">
        <StateMatrix
          rows={['link', 'ellipsis'] as const}
          states={linkStates}
          render={(row, state) => (
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  {row === 'link' ? (
                    <BreadcrumbLink href="/projects" {...previewState(state)}>
                      Projects
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbEllipsis items={trail.slice(1, 3)} {...previewState(state)} />
                  )}
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>API keys</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          )}
        />
      </PreviewSection>

      <PreviewSection title="Collapses by its width">
        <div className="flex flex-col gap-4">
          {widths.map((width) => (
            <Frame key={width.label} label={width.label} className={width.className}>
              <BreadcrumbTrail items={trail} />
            </Frame>
          ))}
          <Frame label="twelve levels deep, 100%" className="w-full">
            <BreadcrumbTrail items={deepTrail} />
          </Frame>
        </div>
      </PreviewSection>

      <PreviewSection title="Ellipsis menu open">
        <OverlayStageGrid>
          <OverlayStage label="hidden pages, in order" className="h-56">
            {(container) => (
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/">Acme</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbEllipsis items={trail.slice(1, 4)} open modal={false} container={container} />
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>API keys</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            )}
          </OverlayStage>
          <OverlayStage label="a long hidden name wraps" className="h-56">
            {(container) => (
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/">Acme</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbEllipsis items={longTrail.slice(1, 4)} open modal={false} container={container} />
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Trial to first workout</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            )}
          </OverlayStage>
        </OverlayStageGrid>
      </PreviewSection>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        <PreviewSection title="Long and non-Latin names">
          <div className="flex flex-col gap-4">
            <Frame label="long names, 100%" className="w-full">
              <BreadcrumbTrail items={longTrail} />
            </Frame>
            <Frame label="long names, 280px" className="w-full max-w-[280px]">
              <BreadcrumbTrail items={longTrail} />
            </Frame>
            <Frame label="Greek and Japanese" className="w-full">
              <BreadcrumbTrail items={nonLatinTrail} />
            </Frame>
          </div>
        </PreviewSection>

        <PreviewSection title="Short trails, own separator">
          <div className="flex flex-col gap-4">
            <Frame label="one crumb" className="w-full">
              <BreadcrumbTrail items={[{ label: 'Projects' }]} />
            </Frame>
            <Frame label="two crumbs, 120px" className="w-full max-w-[120px]">
              <BreadcrumbTrail items={trail.slice(2, 4).map((crumb, index) => (index === 1 ? { label: crumb.label } : crumb))} />
            </Frame>
            <Frame label="slash separator" className="w-full">
              <BreadcrumbTrail items={trail} separator={<Slash className="-rotate-12" />} />
            </Frame>
            <Frame label="no crumbs" className="w-full">
              <BreadcrumbTrail items={[]} />
            </Frame>
          </div>
        </PreviewSection>
      </div>

      <PreviewSection title="Above a page title">
        <div className="flex flex-col gap-1">
          <BreadcrumbTrail items={trail.slice(0, 4)} />
          <h1 className="text-title font-medium">Settings</h1>
        </div>
      </PreviewSection>
    </PreviewStack>
  );
}
