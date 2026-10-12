import { Suspense } from 'react';
import { gitConfig, githubUrl } from '@/lib/shared';
import { Button } from '@/registry/kosmos/ui/button';
import { GitHubIcon } from './brand-icons';

const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });

/** Below this the count reads as a warning rather than proof, so the link shows only the GitHub mark. */
const minStarsShown = 10;

/**
 * The repo's star count, or `null` when GitHub can't be reached, rate-limits us or the repo doesn't
 * exist yet. Cached for an hour; a build without network renders the link without a count.
 */
async function getStars(): Promise<number | null> {
  try {
    const response = await fetch(`https://api.github.com/repos/${gitConfig.user}/${gitConfig.repo}`, {
      headers: { Accept: 'application/vnd.github+json' },
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(3000),
    });
    if (!response.ok) return null;
    const data = (await response.json()) as { stargazers_count?: unknown };
    return typeof data.stargazers_count === 'number' ? data.stargazers_count : null;
  } catch {
    return null;
  }
}

async function StarCount() {
  const stars = await getStars();
  if (stars === null || stars < minStarsShown) return null;
  return (
    <span data-count className="text-caption text-muted-foreground tabular-nums">
      {compact.format(stars)}
      <span className="sr-only"> stars</span>
    </span>
  );
}

/** The GitHub repo, with its star count once GitHub answers and the count is worth showing. */
export function GitHubLink() {
  return (
    <Button
      variant="secondary"
      href={githubUrl}
      className="w-7.5 px-0 has-[[data-count]]:w-auto has-[[data-count]]:px-2"
    >
      <GitHubIcon className="size-4" />
      <span className="sr-only">GitHub</span>
      <Suspense fallback={null}>
        <StarCount />
      </Suspense>
    </Button>
  );
}
