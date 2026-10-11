import type * as React from 'react';
import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { StateMatrix } from '@/components/preview/state-matrix';
import { Asset, AssetImage, AssetVideo } from '@/registry/kosmos/ui/asset';

const rows = ['image', 'video'] as const;
const states = ['loading', 'loaded', 'error'] as const;
// Sources that fail to decode, so the error state shows without a 404 in the console.
const brokenImage = 'data:image/webp;base64,AAAA';
const brokenVideo = 'data:video/mp4;base64,AAAA';

function Media({ kind, state }: { kind: (typeof rows)[number]; state: (typeof states)[number] }) {
  // No media inside the frame keeps it loading, so the placeholder can be pinned for the screenshot.
  if (state === 'loading') return <Asset />;
  if (kind === 'image') {
    return (
      <Asset>
        <AssetImage src={state === 'error' ? brokenImage : '/media/landscape.webp'} alt="Abstract violet and teal gradient" />
      </Asset>
    );
  }
  if (state === 'error') {
    return (
      <Asset>
        <AssetVideo src={brokenVideo} />
      </Asset>
    );
  }
  return (
    <Asset>
      <LoopVideo />
    </Asset>
  );
}

/** WebM first, MP4 for browsers without VP9. */
function LoopVideo(props: React.ComponentProps<typeof AssetVideo>) {
  return (
    <AssetVideo poster="/media/loop-poster.webp" {...props}>
      <source src="/media/loop.webm" type="video/webm" />
      <source src="/media/loop.mp4" type="video/mp4" />
    </AssetVideo>
  );
}

const ratios = [
  { label: '16 / 9', ratio: 16 / 9, src: '/media/landscape.webp' },
  { label: '1', ratio: 1, src: '/media/square.webp' },
  { label: '3 / 4', ratio: 3 / 4, src: '/media/portrait.webp' },
  { label: '21 / 9', ratio: 21 / 9, src: '/media/landscape.webp' },
];

export default function AssetPreview() {
  return (
    <PreviewStack>
      <PreviewSection title="Image and video × states">
        <StateMatrix rows={rows} states={states} render={(kind, state) => <Media kind={kind} state={state} />} />
      </PreviewSection>

      <PreviewSection title="Ratios">
        <div className="grid grid-cols-2 items-start gap-4 sm:grid-cols-4">
          {ratios.map(({ label, ratio, src }) => (
            <div key={label} className="flex flex-col gap-2">
              <span className="font-mono text-caption text-muted-foreground">ratio={label}</span>
              <Asset ratio={ratio}>
                <AssetImage src={src} alt="" />
              </Asset>
            </div>
          ))}
        </div>
      </PreviewSection>

      <PreviewSection title="fit: cover and contain">
        <div className="grid grid-cols-2 gap-4 sm:max-w-xl">
          <div className="flex flex-col gap-2">
            <span className="font-mono text-caption text-muted-foreground">cover</span>
            <Asset ratio={16 / 9}>
              <AssetImage src="/media/portrait.webp" alt="" fit="cover" />
            </Asset>
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-mono text-caption text-muted-foreground">contain</span>
            <Asset ratio={16 / 9}>
              <AssetImage src="/media/portrait.webp" alt="" fit="contain" />
            </Asset>
          </div>
        </div>
      </PreviewSection>

      <PreviewSection title="Video: autoplay with a pause button, and with controls">
        <div className="grid gap-4 sm:grid-cols-2">
          <Asset>
            <LoopVideo autoPlay loop />
          </Asset>
          <Asset>
            <LoopVideo controls />
          </Asset>
        </div>
      </PreviewSection>

      <div className="grid gap-10 sm:grid-cols-2">
        <PreviewSection title="Custom fallback">
          <Asset ratio={16 / 9} fallback="This preview isn’t available yet.">
            <AssetImage src={brokenImage} alt="Dashboard preview" />
          </Asset>
        </PreviewSection>

        <PreviewSection title="In a card">
          <div className="flex flex-col gap-3 rounded-2xl border border-transparent bg-card p-1 pb-3 shadow-card">
            <Asset ratio={16 / 9}>
              <AssetImage src="/media/landscape.webp" alt="Abstract violet and teal gradient" />
            </Asset>
            <div className="flex flex-col gap-0.5 px-3">
              <span className="text-title">Release notes</span>
              <span className="text-small text-muted-foreground">What changed in version 2.14.</span>
            </div>
          </div>
        </PreviewSection>
      </div>
    </PreviewStack>
  );
}
