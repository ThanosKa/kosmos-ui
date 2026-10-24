import type { Metadata } from 'next';
import { PresetsView } from '@/components/site/presets-view';
import { choiceFromParams } from '@/lib/presets';
import { packageRunners, registryAddArgs } from '@/lib/registry';
import { siteOpenGraph } from '@/lib/shared';

const description =
  'Pick a Kosmos preset, its accent, radius and theme, see components, a dashboard and forms take it, and get its CSS, registry command and DESIGN.md.';

export const metadata: Metadata = {
  title: 'Presets',
  description,
  alternates: { canonical: '/presets' },
  openGraph: { ...siteOpenGraph, title: 'Presets', description, url: '/presets' },
};

const themes = ['light', 'dark'] as const;

/** `/presets`: the Presets page. `?preset=&accent=&radius=&theme=` open a choice, so a link shares it. */
export default async function PresetsPage(props: PageProps<'/presets'>) {
  const searchParams = await props.searchParams;
  const params = new URLSearchParams(
    Object.entries(searchParams).flatMap(([key, value]) => (typeof value === 'string' ? [[key, value]] : [])),
  );
  return (
    <PresetsView
      initialChoice={choiceFromParams(params)}
      initialTheme={themes.find((theme) => theme === params.get('theme')) ?? null}
      runners={packageRunners}
      registryAdd={registryAddArgs}
    />
  );
}
