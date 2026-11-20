'use client';

import { DataSetPreview } from '@/components/preview/data-set-preview';
import { OverlayStage, OverlayStageGrid } from '@/components/preview/overlay-stage';
import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { CommandMenu, type CommandMenuGroup } from '@/registry/kosmos/blocks/command-menu/command-menu';

const stage = 'h-[34rem]';

const worstGroups: CommandMenuGroup[] = [
  {
    value: 'Projects',
    items: [
      {
        value: 'open:long',
        label: 'Fernhill Books Marketplace for Independent Booksellers and Publishers marketplace.independent-booksellers.fernhill.example',
        title: 'Fernhill Books Marketplace for Independent Booksellers and Publishers',
        hint: 'marketplace.independent-booksellers.fernhill.example',
        description: 'Moved from Pro to Scale on October 9 while their engineers move every storefront to the server SDK',
        status: { label: 'Paused for the Europe and Middle East review', state: 'waiting' },
      },
      { value: 'open:emoji', label: '🚀 Launchpad launchpad.example', title: '🚀 Launchpad', hint: 'launchpad.example', status: { label: 'Trial', state: 'pending' } },
      { value: 'open:cjk', label: '山田書店オンラインストア', title: '山田書店オンラインストア', hint: 'yamada-shoten.example' },
      { value: 'open:one', label: 'K k.example', title: 'K', hint: 'k.example' },
      ...Array.from({ length: 200 }, (_, index) => ({
        value: `open:bulk-${index}`,
        label: `Project ${index + 1} bulk-${index + 1}.example`,
        title: `Project ${(index + 1).toLocaleString('en-US')}`,
        hint: `bulk-${index + 1}.example`,
      })),
    ],
  },
  {
    value: 'Actions',
    items: [
      { value: 'a:long', label: 'Create a new roadmap item from the weekly retention cohorts report for every Scale plan project', keys: ['⌘', 'Shift', 'Alt', 'N'] },
      { value: 'a:rtl', label: 'دعم اللغة العربية في لوحة التحكم' },
    ],
  },
];

function Worst() {
  return (
    <PreviewStack>
      <PreviewSection title="Long titles, hints, descriptions and statuses; 200 projects">
        <OverlayStageGrid>
          <OverlayStage label="main list" className={stage}>
            {(container) => (
              <CommandMenu open modal={false} container={container} initialFocus={false} trigger={null} hotkey={false} groups={worstGroups} />
            )}
          </OverlayStage>
          <OverlayStage label="query matches only long rows" className={stage}>
            {(container) => (
              <CommandMenu
                open
                modal={false}
                container={container}
                initialFocus={false}
                trigger={null}
                hotkey={false}
                groups={worstGroups}
                defaultQuery="Fernhill"
              />
            )}
          </OverlayStage>
        </OverlayStageGrid>
      </PreviewSection>
    </PreviewStack>
  );
}

export default function CommandMenuPreview() {
  return <DataSetPreview demo={<Demo />} worst={<Worst />} />;
}

function Demo() {
  return (
    <PreviewStack>
      <PreviewSection title="Live (⌘K or the trigger)">
        <CommandMenu />
      </PreviewSection>

      <PreviewSection title="Open">
        <OverlayStageGrid>
          <OverlayStage label="main list" className={stage}>
            {(container) => (
              <CommandMenu open modal={false} container={container} initialFocus={false} trigger={null} hotkey={false} />
            )}
          </OverlayStage>
          <OverlayStage label="second list: assigned to" className={stage}>
            {(container) => (
              <CommandMenu
                open
                modal={false}
                container={container}
                initialFocus={false}
                trigger={null}
                hotkey={false}
                defaultPage="assignee"
              />
            )}
          </OverlayStage>
          <OverlayStage label="query narrows the list" className={stage}>
            {(container) => (
              <CommandMenu
                open
                modal={false}
                container={container}
                initialFocus={false}
                trigger={null}
                hotkey={false}
                defaultQuery="roadmap"
              />
            )}
          </OverlayStage>
          <OverlayStage label="loading" className={stage}>
            {(container) => (
              <CommandMenu
                open
                loading
                modal={false}
                container={container}
                initialFocus={false}
                trigger={null}
                hotkey={false}
              />
            )}
          </OverlayStage>
          <OverlayStage label="no match" className={stage}>
            {(container) => (
              <CommandMenu
                open
                modal={false}
                container={container}
                initialFocus={false}
                trigger={null}
                hotkey={false}
                defaultQuery="Weekly retention cohorts for every Scale plan project"
              />
            )}
          </OverlayStage>
        </OverlayStageGrid>
      </PreviewSection>
    </PreviewStack>
  );
}
