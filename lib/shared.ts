import { createGetUrl } from 'fumadocs-core/source';

export const appName = 'Kosmos UI';
export const appDescription =
  'Components and blocks for dashboard apps, built on Base UI and installed from the shadcn registry. Free and open source under MIT.';
/** A page's own `openGraph` replaces the layout's instead of merging with it, so a page that sets one spreads this in. */
export const siteOpenGraph = { siteName: appName, type: 'website' } as const;
/** The site's origin, for absolute URLs in metadata, the sitemap and robots.txt. Set `NEXT_PUBLIC_SITE_URL` once the domain is chosen. */
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000');
export const docsRoute = '/docs';
export const docsImageRoute = '/og/docs';
export const docsContentRoute = '/llms.mdx/docs';

/**
 * Where the code and its author live. The only place these URLs are written: the site header and footer,
 * the docs and the star count all read them from here.
 * TODO-confirm: the X account is a placeholder.
 */
export const gitConfig = {
  user: 'ThanosKa',
  repo: 'kosmos-ui',
  /** Where contributions land: edits start here, since pull requests go into `dev`, never `main`. */
  editBranch: 'dev',
};
export const githubUrl = `https://github.com/${gitConfig.user}/${gitConfig.repo}`;
/** A docs page's source file on GitHub: `blob` reads the released file on the default branch, `edit` changes it on `dev`. */
export function docsSourceUrl(path: string, view: 'blob' | 'edit') {
  const ref = view === 'edit' ? gitConfig.editBranch : 'HEAD';
  return `${githubUrl}/${view}/${ref}/content/docs/${path}`;
}
export const licenseUrl = `${githubUrl}/blob/HEAD/LICENSE`;
export const author = {
  name: 'Thanos Kazakis',
  xUrl: 'https://x.com/thanoskazakis',
  githubUrl: 'https://github.com/ThanosKa',
};

const docsSectionTitles: Record<string, string> = {
  components: 'Components',
  blocks: 'Blocks',
  foundations: 'Foundations',
  changelog: 'Changelog',
};

/** The section a docs page belongs to, from its first slug: the eyebrow on its social image and its search results. */
export function docsSectionTitle(slugs: string[]) {
  return docsSectionTitles[slugs[0] ?? ''] ?? 'Docs';
}

const getContentUrl = createGetUrl(docsContentRoute);

export function getPageMarkdownUrl(page: { slugs: string[]; locale?: string }) {
  const segments = [...page.slugs, 'content.md'];

  return { segments, url: getContentUrl(segments, page.locale) };
}

const getImageUrl = createGetUrl(docsImageRoute);

export function getPageImageUrl(page: { slugs: string[]; locale?: string }) {
  const segments = [...page.slugs, 'image.png'];

  return { segments, url: getImageUrl(segments, page.locale) };
}
