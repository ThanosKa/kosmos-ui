import { Suspense } from 'react';
import { formatStars, getRepoStats, minStarsShown } from '@/lib/github';
import { githubUrl } from '@/lib/shared';
import { Button } from '@/registry/kosmos/ui/button';
import { GitHubIcon } from './brand-icons';

async function StarCount() {
  const stars = (await getRepoStats())?.stars ?? null;
  if (stars === null || stars < minStarsShown) return null;
  return (
    <span data-count className="text-caption text-muted-foreground tabular-nums">
      {formatStars(stars)}
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
