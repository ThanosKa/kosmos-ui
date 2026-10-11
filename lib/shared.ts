import { createGetUrl } from 'fumadocs-core/source';

export const appName = 'Kosmos UI';
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
  branch: 'main',
};
export const githubUrl = `https://github.com/${gitConfig.user}/${gitConfig.repo}`;
export const licenseUrl = `${githubUrl}/blob/${gitConfig.branch}/LICENSE`;
export const author = {
  name: 'Thanos Kazakis',
  xUrl: 'https://x.com/thanoskazakis',
  githubUrl: 'https://github.com/ThanosKa',
};

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
