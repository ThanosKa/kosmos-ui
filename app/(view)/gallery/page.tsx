import type { Metadata } from 'next';
import { RootProvider } from 'fumadocs-ui/provider/next';
import { Gallery } from '@/components/gallery/gallery';

// The `(view)` layout already sets `robots: { index: false }`; repeated here so the page stays out of
// search indexes even if it moves out of the group.
export const metadata: Metadata = { title: 'Gallery', robots: { index: false } };

const themes = ['light', 'dark'] as const;

/**
 * `/gallery`: every component in realistic cards, so a token or style change shows everywhere at once.
 * `?theme=light|dark` forces the theme; without it the page follows the stored theme.
 */
export default async function GalleryPage(props: PageProps<'/gallery'>) {
  const { theme } = await props.searchParams;
  const forcedTheme = themes.find((value) => value === theme);
  return (
    <RootProvider search={{ enabled: false }} theme={{ forcedTheme, hotKey: false }}>
      <Gallery />
    </RootProvider>
  );
}
