import { gitConfig } from './shared';

export type RepoStats = {
  stars: number;
  /** When anything was last pushed to the repo, as GitHub reports it (ISO 8601). */
  pushedAt: string;
};

/**
 * The repo's star count and last push, or `null` when GitHub can't be reached, rate-limits us or the repo doesn't
 * exist yet. Unauthenticated and cached for an hour, so a page that calls it stays static and a build without
 * network renders the fallback. Every caller in one render shares the same request.
 */
export async function getRepoStats(): Promise<RepoStats | null> {
  try {
    const response = await fetch(`https://api.github.com/repos/${gitConfig.user}/${gitConfig.repo}`, {
      headers: { Accept: 'application/vnd.github+json' },
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(3000),
    });
    if (!response.ok) return null;
    const data = (await response.json()) as { stargazers_count?: unknown; pushed_at?: unknown };
    if (typeof data.stargazers_count !== 'number' || typeof data.pushed_at !== 'string') return null;
    if (Number.isNaN(Date.parse(data.pushed_at))) return null;
    return { stars: data.stargazers_count, pushedAt: data.pushed_at };
  } catch {
    return null;
  }
}

/** Below this a star count reads as a warning rather than proof, so the site shows no number. */
export const minStarsShown = 10;

export const formatStars = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format;
