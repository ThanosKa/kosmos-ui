'use client';

import { Menu } from 'lucide-react';
import { OverlayStage } from '@/components/preview/overlay-stage';
import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { Navbar, NavbarBanner, NavbarSearch, type NavbarItem } from '@/registry/kosmos/blocks/navbar/navbar';
import { megaItems } from './navbar-mega';
import { Button } from '@/registry/kosmos/ui/button';

const frame = 'w-full overflow-hidden rounded-xl border border-transparent bg-background shadow-card';
/** Stands in for the page under the bar, so the bar's bottom edge has something to sit on. */
const page = <div aria-hidden className="h-16" />;

const search = <NavbarSearch shortcut={['⌘', 'K']}>Search…</NavbarSearch>;
const banner = (
  <NavbarBanner href="/changelog" linkLabel="Read more">
    Annual billing is live, with two months free.
  </NavbarBanner>
);

const longItems: NavbarItem[] = [
  {
    label: 'Product analytics',
    links: [
      {
        label: 'Retention cohorts by plan and platform',
        href: '/features/retention',
        description: 'Cohorts of users who come back, week after week, split by plan, platform and the first event they sent.',
      },
      { label: 'Funnels', href: '/features/funnels' },
    ],
  },
  { label: 'Server-side SDK guides', href: '/docs/server' },
  { label: 'Pricing', href: '/pricing' },
];

export default function NavbarPreview() {
  return (
    <PreviewStack>
      <PreviewSection title="Default, current page Pricing">
        <div className={frame}>
          <Navbar current="/pricing" />
          {page}
        </div>
      </PreviewSection>

      <PreviewSection title="Scrolled, current page inside Product">
        <div className={frame}>
          <Navbar current="/features/funnels" data-scrolled="" />
          {page}
        </div>
      </PreviewSection>

      <PreviewSection title="Dropdown open">
        <OverlayStage label="Product open" className="h-[26rem] p-0">
          {(container) => (
            <Navbar current="/features/funnels" container={container} dropdownProps={{ value: 'Product' }} />
          )}
        </OverlayStage>
      </PreviewSection>

      <PreviewSection title="Mega menu open">
        <OverlayStage label="Product open" className="h-[28rem] p-0">
          {(container) => (
            <Navbar items={megaItems} current="/features/funnels" container={container} dropdownProps={{ value: 'Product' }} />
          )}
        </OverlayStage>
      </PreviewSection>

      <PreviewSection title="Mega menu in the sheet">
        <OverlayStage label="Sheet open" className="h-[40rem] max-w-96 p-0">
          {(container) => (
            <Navbar
              items={megaItems}
              search={search}
              current="/features/funnels"
              container={container}
              sheetProps={{ open: true, modal: false, initialFocus: false }}
            />
          )}
        </OverlayStage>
      </PreviewSection>

      <PreviewSection title="Centered links">
        <div className={frame}>
          <Navbar layout="center" current="/pricing" data-scrolled="" />
          {page}
        </div>
      </PreviewSection>

      <PreviewSection title="Centered links with search, 640px">
        <div className={`${frame} max-w-160`}>
          <Navbar layout="center" search={search} current="/pricing" data-scrolled="" />
          {page}
        </div>
      </PreviewSection>

      <PreviewSection title="Search slot">
        <div className={frame}>
          <Navbar search={search} current="/pricing" data-scrolled="" />
          {page}
        </div>
      </PreviewSection>

      <PreviewSection title="Banner">
        <div className={frame}>
          <Navbar banner={banner} current="/pricing" data-scrolled="" />
          {page}
        </div>
      </PreviewSection>

      <PreviewSection title="Banner, long line, 320px">
        <div className={`${frame} max-w-80`}>
          <Navbar
            banner={<NavbarBanner href="/changelog" linkLabel="Read more">Annual billing is live for every plan, with two months free until the end of the year.</NavbarBanner>}
            current="/pricing"
            data-scrolled=""
          />
          {page}
        </div>
      </PreviewSection>

      <PreviewSection title="Narrow container, 320px">
        <div className={`${frame} max-w-80`}>
          <Navbar current="/pricing" data-scrolled="" />
          {page}
        </div>
      </PreviewSection>

      <PreviewSection title="Sheet open">
        <OverlayStage label="Sheet open" className="h-[34rem] max-w-96 p-0">
          {(container) => (
            <Navbar
              current="/features/funnels"
              container={container}
              sheetProps={{ open: true, modal: false, initialFocus: false }}
            />
          )}
        </OverlayStage>
      </PreviewSection>

      <PreviewSection title="Long text">
        <div className={frame}>
          <Navbar name="Acme Product Analytics" items={longItems} current="/pricing" data-scrolled="" />
          {page}
        </div>
      </PreviewSection>

      <PreviewSection title="Your own menu button, no actions">
        <div className={`${frame} max-w-160`}>
          <Navbar
            actions={null}
            menu={
              <Button variant="secondary" size="icon" aria-label="Docs menu">
                <Menu aria-hidden />
              </Button>
            }
            data-scrolled=""
          />
          {page}
        </div>
      </PreviewSection>

      <PreviewSection title="Name and actions only">
        <div className={frame}>
          <Navbar items={[]} sheetActions={null} data-scrolled="" />
          {page}
        </div>
      </PreviewSection>
    </PreviewStack>
  );
}
