import type { Metadata } from 'next';
import { RootProvider } from 'fumadocs-ui/provider/next';
import { Lab } from '@/components/lab/lab';

export const metadata: Metadata = { title: 'Lab', robots: { index: false } };

const themes = ['light', 'dark'] as const;

/**
 * `/lab`: candidate components and blocks, built in the Kosmos style but not yet in the registry, so the
 * maintainer can pick which ones go through the build cycle. `?theme=light|dark` forces the theme.
 */
export default async function LabPage(props: { searchParams: Promise<{ theme?: string }> }) {
  const { theme } = await props.searchParams;
  const forcedTheme = themes.find((value) => value === theme);
  return (
    <RootProvider search={{ enabled: false }} theme={{ forcedTheme, hotKey: false }}>
      <Lab />
    </RootProvider>
  );
}
