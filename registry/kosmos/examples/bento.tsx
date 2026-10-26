import { Globe } from 'lucide-react';
import type { ReactNode } from 'react';
import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { Bento, type BentoItem } from '@/registry/kosmos/blocks/bento/bento';

const frame = 'w-full overflow-hidden rounded-xl border border-transparent bg-background p-4 shadow-card sm:p-6';

function Visual({ children }: { children: ReactNode }) {
  return <div className="w-full max-w-sm rounded-xl border border-transparent bg-card p-4 text-body shadow-card">{children}</div>;
}

const threeTiles: BentoItem[] = [
  { id: 'web', title: 'Web', description: 'A script tag or an npm package.', visual: <Visual>acme.track()</Visual>, href: '#web' },
  { id: 'ios', title: 'iOS', description: 'A Swift package.', visual: <Visual>Acme.track()</Visual> },
  { id: 'server', title: 'Server', description: 'Node, Go and Python.', visual: <Visual>acme.track()</Visual> },
];

const longTiles: BentoItem[] = [
  {
    id: 'long',
    title: 'Funnels, retention cohorts and paths for every project, platform and plan you run',
    description:
      'See the exact step where people leave, how many of them come back the week after and which page they open first, without writing a query or waiting on the data team.',
    size: 'wide',
    visual: (
      <Visual>
        <span className="flex items-center gap-2">
          <Globe aria-hidden className="size-4 text-muted-foreground" />
          signup_completed_with_a_very_long_event_name_from_the_web_sdk
        </span>
      </Visual>
    ),
  },
  { id: 'short', title: 'Short', description: 'One word.', visual: <Visual>Short</Visual>, href: '#short', linkLabel: 'Read the guide to every platform Acme supports' },
];

export default function BentoPreview() {
  return (
    <PreviewStack>
      <PreviewSection title="Default, three columns from 896px">
        <div className={frame}>
          <Bento />
        </div>
      </PreviewSection>

      <PreviewSection title="Two columns, 640px">
        <div className={`${frame} max-w-160`}>
          <Bento />
        </div>
      </PreviewSection>

      <PreviewSection title="Three tiles at 640px: the last takes the row">
        <div className={`${frame} max-w-160`}>
          <Bento title="Install it where your users are" description={null} items={threeTiles} />
        </div>
      </PreviewSection>

      <PreviewSection title="Narrow container, 320px">
        <div className={`${frame} max-w-80`}>
          <Bento />
        </div>
      </PreviewSection>

      <PreviewSection title="Long text">
        <div className={frame}>
          <Bento
            title="Everything your team asks about, collected, joined to your users and ready to read before anyone thinks to ask"
            description="Acme collects events from your web, iOS, Android and server apps, keeps them for as long as your plan allows, and turns them into funnels, retention cohorts and answers your whole team can read without writing a query."
            items={longTiles}
          />
        </div>
      </PreviewSection>

      <PreviewSection title="No header">
        <div className={frame}>
          <Bento title={null} description={null} items={threeTiles} />
        </div>
      </PreviewSection>
    </PreviewStack>
  );
}
