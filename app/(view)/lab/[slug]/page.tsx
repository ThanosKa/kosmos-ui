import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { RootProvider } from 'fumadocs-ui/provider/next';
import { candidates } from '@/components/lab/candidates';
import { Lab } from '@/components/lab/lab';

export const metadata: Metadata = { title: 'Lab', robots: { index: false } };

const themes = ['light', 'dark'] as const;

/** `/lab/<slug>`: one candidate alone, for screenshots while it is built. `?theme=light|dark` forces the theme. */
export default async function LabCandidatePage(props: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ theme?: string }>;
}) {
  const { slug } = await props.params;
  const { theme } = await props.searchParams;
  if (!candidates.some((candidate) => candidate.slug === slug)) notFound();
  const forcedTheme = themes.find((value) => value === theme);
  return (
    <RootProvider search={{ enabled: false }} theme={{ forcedTheme, hotKey: false }}>
      <Lab only={slug} />
    </RootProvider>
  );
}
