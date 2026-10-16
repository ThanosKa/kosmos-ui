import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { RootProvider } from 'fumadocs-ui/provider/next';
import { StayInPreview } from '@/components/preview/stay-in-preview';
import { loadExample } from '@/lib/examples';

const themes = ['light', 'dark'] as const;

export async function generateMetadata(props: PageProps<'/view/[name]'>): Promise<Metadata> {
  const { name } = await props.params;
  return { title: `${name} preview` };
}

/**
 * `/view/<name>` renders `registry/kosmos/examples/<name>.tsx` alone. `?theme=light|dark`
 * forces the theme (screenshots); without it the page follows the stored theme, so a docs
 * iframe switches along with the docs toggle.
 */
export default async function ViewPage(props: PageProps<'/view/[name]'>) {
  const [{ name }, { theme }] = await Promise.all([props.params, props.searchParams]);
  const Example = await loadExample(name);
  if (!Example) notFound();
  const forcedTheme = themes.find((value) => value === theme);

  return (
    <RootProvider search={{ enabled: false }} theme={{ forcedTheme, hotKey: false }}>
      {/* Not a <main>: blocks and app shells in the preview bring their own. Inside a docs frame (`PreviewFrame` marks
          it) the content sits at the top, so a block that shrinks never moves what is above it, unless it is short enough
          to be centered in the frame's minimum height (`data-centered`). In a frame the padding is small, so a block gets close to
          the width the frame's Desktop, Tablet or Phone button promises. */}
      <div data-preview-root={name} className="flex min-h-dvh items-center justify-center p-6 data-in-frame:p-4 data-in-frame:not-data-centered:items-start sm:p-10">
        <div data-preview-content className="flex w-full justify-center">
          <Example />
        </div>
      </div>
      <StayInPreview />
    </RootProvider>
  );
}
